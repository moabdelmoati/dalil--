import { Router, type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import mammoth from 'mammoth';
import { buildGroundingContext, detectDocumentType } from '../lib/knowledgeBase.ts';
import { analyzeDocument } from '../lib/gemini.ts';

export const analyzeRouter = Router();

const MAX_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
});

const EXT_TO_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

const ALLOWED_EXTENSIONS = new Set(Object.keys(EXT_TO_MIME).concat(['.docx']));

function resolveMimeType(file: Express.Multer.File): string | null {
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

function isAllowedType(file: Express.Multer.File): boolean {
  const ext = path.extname(file.originalname).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

function handleUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (error: unknown) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'حجم الملف أكبر من ١٠ ميجابايت المسموح بها. ارجع ملفاً أصغر.' });
        return;
      }
      res.status(400).json({ error: 'تعذّر استقبال الملف. حاول مرة أخرى.' });
      return;
    }
    next();
  });
}

analyzeRouter.post('/analyze', handleUpload, async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
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

    let contentText: string | undefined;
    let pageCount: number;

    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      pageCount = estimatePageCount(file.buffer, mimeType);
    } else {
      const extracted = await mammoth.extractRawText({ buffer: file.buffer });
      contentText = extracted.value;
      if (!contentText || contentText.trim().length === 0) {
        res.status(400).json({ error: 'تعذّر استخراج نص من ملف DOCX. تأكد من أن الملف يحتوي على نص فعلي.' });
        return;
      }
      pageCount = estimatePageCount(file.buffer, mimeType, contentText);
    }

    const documentTextPreview = contentText ?? '';
    const documentType = detectDocumentType(`${file.originalname} ${documentTextPreview}`);
    const groundContext = buildGroundingContext(documentType);

    const result = await analyzeDocument({
      fileName: file.originalname,
      groundContext,
      pageCount,
      contentText,
      inlineData:
        contentText === undefined
          ? { mimeType, data: file.buffer.toString('base64') }
          : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error('analyze error:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء تحليل المستند. حاول مرة أخرى بعد قليل.',
    });
  }
});