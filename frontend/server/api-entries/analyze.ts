import path from 'node:path';
import zlib from 'node:zlib';
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

function extractTextFromPdf(buffer: Buffer): string {
  const chunks: string[] = [];
  let pos = 0;

  while (pos < buffer.length) {
    const streamStart = buffer.indexOf('stream', pos);
    if (streamStart === -1) break;

    let dataStart = streamStart + 6;
    if (buffer[dataStart] === 0x0d && buffer[dataStart + 1] === 0x0a) {
      dataStart += 2;
    } else if (buffer[dataStart] === 0x0a) {
      dataStart += 1;
    }

    const streamEnd = buffer.indexOf('endstream', dataStart);
    if (streamEnd === -1) break;

    const streamBuf = buffer.subarray(dataStart, streamEnd);
    let decompressed: Buffer | null = null;

    try {
      decompressed = zlib.inflateSync(streamBuf);
    } catch {
      try {
        decompressed = zlib.inflateRawSync(streamBuf);
      } catch {
        decompressed = streamBuf;
      }
    }

    if (decompressed) {
      chunks.push(decompressed.toString('utf-8'));
      chunks.push(decompressed.toString('latin1'));
    }

    pos = streamEnd + 9;
  }

  const allText = chunks.join(' ');
  const matches = allText.match(/\(([^)]{2,})\)/g) || [];
  const extracted = matches
    .map((m) => m.slice(1, -1))
    .join(' ')
    .replace(/[^\u0600-\u06FF\w\s\d.,\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (extracted.length > 20) return extracted;

  const arabicWords = allText.match(/[\u0600-\u06FF]{2,}/g) || [];
  return arabicWords.join(' ').trim();
}

function extractFilename(headerString: string): string {
  const fnStar = headerString.match(/filename\*=utf-8''([^;\r\n]+)/i);
  if (fnStar) {
    try {
      return decodeURIComponent(fnStar[1]);
    } catch {}
  }
  const fnMatch = headerString.match(/filename="([^"]+)"/i) || headerString.match(/filename=([^\s;]+)/i);
  return fnMatch ? fnMatch[1] : 'document.pdf';
}

async function getRawBody(req: any): Promise<Buffer> {
  if (req.body && Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (req.body && typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf-8');
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseMultipartBuffer(rawBuffer: Buffer, contentType: string): ParsedFile | null {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!match) return null;
  const boundary = match[1] || match[2];
  const boundaryBuffer = Buffer.from(`--${boundary}`);

  const startIndex = rawBuffer.indexOf(boundaryBuffer);
  if (startIndex === -1) return null;

  const headerStart = startIndex + boundaryBuffer.length + 2; // skip \r\n
  const headerEnd = rawBuffer.indexOf(Buffer.from('\r\n\r\n'), headerStart);
  if (headerEnd === -1) return null;

  const headerString = rawBuffer.slice(headerStart, headerEnd).toString('utf8');
  const originalname = extractFilename(headerString);

  const ctMatch = headerString.match(/content-type:\s*([^\r\n;]+)/i);
  const mimetype = ctMatch ? ctMatch[1].trim() : 'application/octet-stream';

  const bodyStart = headerEnd + 4; // skip \r\n\r\n
  const nextBoundary = rawBuffer.indexOf(boundaryBuffer, bodyStart);
  if (nextBoundary === -1) return null;

  // File buffer is between bodyStart and (nextBoundary - 2) to skip trailing \r\n
  const fileBuffer = rawBuffer.slice(bodyStart, nextBoundary - 2);

  return {
    originalname,
    mimetype,
    buffer: fileBuffer,
    size: fileBuffer.length,
  };
}

function resolveMimeType(file: ParsedFile): string | null {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return EXT_TO_MIME[ext] ?? (file.mimetype && file.mimetype !== 'application/octet-stream' ? file.mimetype : null);
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
  if (ALLOWED_EXTENSIONS.has(ext)) return true;
  if (file.mimetype === 'application/pdf') return true;
  if (file.mimetype.startsWith('image/')) return true;
  return false;
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

  try {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      res.status(400).json({ error: 'نوع الطلب غير صالح. يجب رفع ملف.' });
      return;
    }

    const rawBody = await getRawBody(req);
    if (!rawBody || rawBody.length === 0) {
      res.status(400).json({ error: 'لم يتم استلام أي بيانات للملف.' });
      return;
    }

    if (rawBody.length > MAX_SIZE) {
      res.status(400).json({ error: 'حجم الملف أكبر من ١٠ ميجابايت المسموح بها. ارجع ملفاً أصغر.' });
      return;
    }

    const file = parseMultipartBuffer(rawBody, contentType);
    if (!file || !file.buffer || file.buffer.length === 0) {
      res.status(400).json({ error: 'تعذّر استخراج محتوى الملف. حاول مرة أخرى.' });
      return;
    }

    if (!isAllowedType(file)) {
      res.status(400).json({
        error: 'نوع الملف غير مدعوم. الأنواع المسموحة: PDF، JPG، PNG أو DOCX.',
      });
      return;
    }

    const mimeType = resolveMimeType(file) || 'application/pdf';

    let contentText: string | undefined;
    let pageCount = 1;

    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      pageCount = estimatePageCount(file.buffer, mimeType);
      if (mimeType === 'application/pdf') {
        try {
          const pdfText = extractTextFromPdf(file.buffer);
          if (pdfText && pdfText.length > 15) {
            contentText = pdfText;
          }
        } catch (pdfErr) {
          console.warn('PDF stream extraction error:', pdfErr);
        }
      }
    } else {
      try {
        const extracted = await mammoth.extractRawText({ buffer: file.buffer });
        contentText = extracted.value;
      } catch (mammothErr) {
        console.warn('Mammoth text extract failed:', mammothErr);
      }
      pageCount = estimatePageCount(file.buffer, mimeType, contentText);
    }

    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const documentTextPreview = contentText ?? '';
        const documentType = detectDocumentType(`${file.originalname} ${documentTextPreview}`);
        const groundContext = buildGroundingContext(documentType);

        // Only pass binary inlineData when plain text was not extractable (e.g. scanned images)
        const needsInlineData = !contentText && (mimeType === 'application/pdf' || mimeType.startsWith('image/'));
        const geminiPromise = analyzeDocument({
          fileName: file.originalname,
          groundContext,
          pageCount,
          contentText,
          inlineData: needsInlineData
            ? { mimeType, data: file.buffer.toString('base64') }
            : undefined,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 40000)
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
