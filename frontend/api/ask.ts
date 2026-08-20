import { detectDocumentType, buildGroundingContext } from '../server/lib/knowledgeBase.ts';
import { askDocument } from '../server/lib/gemini.ts';
import { askDocumentLocal } from '../server/lib/ruleEngine.ts';
import { GEMINI_API_KEY } from '../server/config.ts';

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
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const documentText = typeof body.documentText === 'string' ? body.documentText : '';
    const question = typeof body.question === 'string' ? body.question.trim() : '';

    if (!documentText.trim()) {
      res.status(400).json({ error: 'لا يوجد محتوى مستند للاستعلام عنه. ابدأ بتحليل مستند أولاً.' });
      return;
    }
    if (!question) {
      res.status(400).json({ error: 'اكتب سؤالاً عن المستند أولاً.' });
      return;
    }

    const documentType = detectDocumentType(documentText);

    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const groundContext = buildGroundingContext(documentType);
        const history = Array.isArray(body.history)
          ? body.history
              .filter((m: any) => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string')
              .slice(-20)
              .map((m: any) => ({ role: m.role, text: m.text }))
          : [];

        const answer = await askDocument({
          documentText,
          documentType,
          question,
          history,
          groundContext,
        });

        res.status(200).json({ answer });
        return;
      } catch (geminiError) {
        console.warn('Gemini failed, using local QA:', geminiError);
      }
    }

    const localAnswer = askDocumentLocal({
      documentText,
      documentType,
      question,
    });

    res.status(200).json({ answer: localAnswer });
  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء الإجابة على سؤالك. حاول مرة أخرى.' });
  }
}
