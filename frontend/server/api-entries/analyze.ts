import Busboy from 'busboy';
import { Readable } from 'stream';
import path from 'node:path';
import mammoth from 'mammoth';
import { detectDocumentType, buildGroundingContext } from '../lib/knowledgeBase';
import { analyzeDocument } from '../lib/gemini';
import { analyzeDocumentLocal } from '../lib/ruleEngine';
import { GEMINI_API_KEY } from '../config';

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 300,
};

const MAX_SIZE = 10 * 1024 * 1024;

const EXT_TO_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

const ALLOWED_EXTENSIONS = new Set(Object.keys(EXT_TO_MIME).concat(['.docx']));

interface ParsedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

function parseMultipartRequest(req: any): Promise<{ file: ParsedFile | null; error?: string }> {
  return new Promise((resolve) => {
    let busboy: any;
    try {
      busboy = Busboy({ headers: req.headers, limits: { fileSize: MAX_SIZE } });
    } catch (err: any) {
      return resolve({ file: null, error: err?.message || 'Failed to initialize parser' });
    }

    let parsedFile: ParsedFile | null = null;
    let limitExceeded = false;

    // Safety timeout: if upload takes longer than 20 seconds, resolve with error
    const timer = setTimeout(() => {
      resolve({ file: null, error: 'TIMEOUT' });
    }, 20000);

    busboy.on('file', (_fieldname: string, fileStream: any, fileInfo: any) => {
      const { filename, mimeType } = fileInfo;
      const chunks: Buffer[] = [];

      fileStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      fileStream.on('limit', () => {
        limitExceeded = true;
      });

      fileStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        parsedFile = {
          originalname: filename || 'document',
          mimetype: mimeType || 'application/octet-stream',
          buffer,
          size: buffer.length,
        };
      });
    });

    busboy.on('finish', () => {
      clearTimeout(timer);
      if (limitExceeded) {
        return resolve({ file: null, error: 'LIMIT_FILE_SIZE' });
      }
      resolve({ file: parsedFile });
    });

    busboy.on('error', (err: any) => {
      clearTimeout(timer);
      resolve({ file: null, error: err?.message || 'Error parsing upload' });
    });

    // Check if req.body was pre-parsed into a Buffer or string by Vercel serverless runtime
    if (req.body && (Buffer.isBuffer(req.body) || typeof req.body === 'string')) {
      const buf = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
      Readable.from(buf).pipe(busboy);
    } else {
      req.pipe(busboy);
    }
  });
}

function resolveMimeType(file: ParsedFile): string | null {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return EXT_TO_MIME[ext] ?? null;
}

function estimatePageCount(buffer: Buffer, mimeType: string, text?: string): number {
  if (mimeType === 'application/pdf') {
    const raw = buffer.toString('latin1');
    const matches = raw.match(/\/Type\s*\/Page\b/gi);
    return matches && matches.length > 0 ? matches.length : 1;
  }
  if (mimeType.startsWith('image/')) {
    return 1;
  }
  const words = (text ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 500));
}

function isAllowedType(file: ParsedFile): boolean {
  const ext = path.extname(file.originalname).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(200).json({ ok: true, message: 'Dalil Analyze Endpoint Ready' });
    return;
  }

  const { file, error: parseError } = await parseMultipartRequest(req);

  if (parseError === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'حجم الملف أكبر من ١٠ ميجابايت المسموح بها. ارجع ملفاً أصغر.' });
    return;
  }

  if (parseError === 'TIMEOUT') {
    res.status(408).json({ error: 'استغرق استقبال الملف وقتاً طويلاً. يرجى المحاولة مرة أخرى بملف أصغر.' });
    return;
  }

  if (!file || !file.buffer || file.buffer.length === 0) {
    res.status(400).json({ error: 'لم يتم رفع أي ملف. اختر ملفاً أولاً.' });
    return;
  }

  if (!isAllowedType(file)) {
    res.status(400).json({
      error: 'نوع الملف غير مدعوم. الأنواع المسموحة: PDF، JPG، PNG أو DOCX.',
    });
    return;
  }

  const mimeType = resolveMimeType(file);
  if (!mimeType) {
    res.status(400).json({
      error: 'تعذّر تحديد نوع الملف. الأنواع المسموحة: PDF، JPG، PNG أو DOCX.',
    });
    return;
  }

  try {
    let contentText: string | undefined;
    let pageCount: number;

    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      pageCount = estimatePageCount(file.buffer, mimeType);
      if (mimeType === 'application/pdf') {
        const rawString = file.buffer.toString('utf-8');
        const cleanText = rawString.replace(/[^\u0621-\u064A\s\d\.,]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleanText.length > 50) {
          contentText = cleanText;
        }
      }
    } else {
      const extracted = await mammoth.extractRawText({ buffer: file.buffer });
      contentText = extracted.value;
      if (!contentText || contentText.trim().length === 0) {
        res.status(400).json({ error: 'تعذّر استخراج نص من ملف DOCX. تأكد من أن الملف يحتوي على نص فعلي.' });
        return;
      }
      pageCount = estimatePageCount(file.buffer, mimeType, contentText);
    }

    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const documentTextPreview = contentText ?? '';
        const documentType = detectDocumentType(`${file.originalname} ${documentTextPreview}`);
        const groundContext = buildGroundingContext(documentType);

        // Run Gemini with a 35-second hard timeout so the request never hangs
        const geminiPromise = analyzeDocument({
          fileName: file.originalname,
          groundContext,
          pageCount,
          contentText,
          inlineData:
            contentText === undefined
              ? { mimeType, data: file.buffer.toString('base64') }
              : undefined,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out')), 35000)
        );

        const result: any = await Promise.race([geminiPromise, timeoutPromise]);
        res.status(200).json(result);
        return;
      } catch (geminiError) {
        console.warn('Gemini analyze failed or timed out, falling back to local rule engine:', geminiError);
      }
    }

    // Fallback: fast local legal rule engine
    const textToAnalyze = contentText || `مستند: ${file.originalname}`;
    const localResult = analyzeDocumentLocal({
      text: textToAnalyze,
      fileName: file.originalname,
      pageCount,
    });

    res.status(200).json(localResult);
  } catch (error: any) {
    console.error('analyze error:', error);
    res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء تحليل المستند. حاول مرة أخرى بعد قليل.',
    });
  }
}
