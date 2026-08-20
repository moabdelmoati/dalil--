import multer from 'multer';
import path from 'node:path';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

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

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

function resolveMimeType(file: any): string | null {
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

function isAllowedType(file: any): boolean {
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
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    await runMiddleware(req, res, upload.single('file'));
  } catch (error: any) {
    if (error && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'حجم الملف أكبر من ١٠ ميجابايت المسموح بها. ارجع ملفاً أصغر.' });
      return;
    }
    res.status(400).json({ error: 'تعذّر استقبال الملف. حاول مرة أخرى.' });
    return;
  }

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

  try {
    const { detectDocumentType, buildGroundingContext } = await import('../server/lib/knowledgeBase');
    const { analyzeDocumentLocal } = await import('../server/lib/ruleEngine');
    const { GEMINI_API_KEY } = await import('../server/config');

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
        const { analyzeDocument } = await import('../server/lib/gemini');
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

        res.status(200).json(result);
        return;
      } catch (geminiError) {
        console.warn('Gemini analyze failed, using local rule engine:', geminiError);
      }
    }

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
