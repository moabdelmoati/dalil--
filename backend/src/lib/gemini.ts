import { GoogleGenAI } from '@google/genai';
import type { Content, Part } from '@google/genai';
import type { AnalysisResult, AskMessage } from '../types.ts';
import {
  ANALYZE_RESPONSE_SCHEMA,
  ANALYZE_SYSTEM_INSTRUCTION,
  ASK_SYSTEM_INSTRUCTION,
  buildAnalyzeUserPrompt,
  buildAskUserPrompt,
  sanitizeAnalysisResult,
} from './prompts.ts';

let ai: GoogleGenAI | null = null;

export function initGemini(apiKey: string): void {
  ai = new GoogleGenAI({ apiKey });
}

function model(): string {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

function getClient(): GoogleGenAI {
  if (!ai) {
    throw new Error('Gemini client not initialized. Call initGemini() at startup.');
  }
  return ai;
}

export interface AnalyzeInput {
  fileName: string;
  groundContext: string;
  pageCount: number;
  contentText?: string;
  inlineData?: { mimeType: string; data: string };
}

export async function analyzeDocument(input: AnalyzeInput): Promise<AnalysisResult> {
  const client = getClient();
  const parts: Part[] = [
    { text: buildAnalyzeUserPrompt({
      fileName: input.fileName,
      groundContext: input.groundContext,
      pageCount: input.pageCount,
      contentText: input.contentText,
    }) },
  ];
  if (input.inlineData) {
    parts.push({ inlineData: input.inlineData });
  }

  const contents: Content[] = [{ role: 'user', parts }];

  const response = await client.models.generateContent({
    model: model(),
    contents,
    config: {
      systemInstruction: ANALYZE_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: ANALYZE_RESPONSE_SCHEMA,
      maxOutputTokens: 65536,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned an empty response for document analysis.');
  }

  let parsed: Partial<AnalysisResult>;
  try {
    parsed = JSON.parse(text) as Partial<AnalysisResult>;
  } catch {
    throw new Error('Gemini returned invalid JSON for document analysis.');
  }

  const sanitized = sanitizeAnalysisResult(parsed);
  if (!sanitized) {
    throw new Error('Gemini response could not be parsed into the expected analysis shape.');
  }

  sanitized.pageCount = input.pageCount;
  return sanitized;
}

export interface AskInput {
  documentText: string;
  documentType: string;
  question: string;
  history: AskMessage[];
  groundContext: string;
}

export async function askDocument(input: AskInput): Promise<string> {
  const client = getClient();

  const contents: Content[] = input.history.map((message) => ({
    role: message.role === 'user' ? 'user' : 'model',
    parts: [{ text: message.text }],
  }));

  contents.push({
    role: 'user',
    parts: [
      {
        text: buildAskUserPrompt({
          documentText: input.documentText,
          documentType: input.documentType,
          groundContext: input.groundContext,
          question: input.question,
        }),
      },
    ],
  });

  const response = await client.models.generateContent({
    model: model(),
    contents,
    config: {
      systemInstruction: ASK_SYSTEM_INSTRUCTION,
      maxOutputTokens: 8192,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned an empty answer.');
  }
  return text.trim();
}