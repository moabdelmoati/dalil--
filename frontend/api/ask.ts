import { detectDocumentType, buildGroundingContext } from './_lib/lib/knowledgeBase';
import { askDocumentLocal } from './_lib/lib/ruleEngine';
import { GEMINI_API_KEY } from './_lib/config';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(200).json({ ok: true, message: 'Dalil Ask Endpoint Ready' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body) {
      body = {};
    }

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
        const { askDocument } = await import('./_lib/lib/gemini');
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
  } catch (error: any) {
    console.error('Ask error:', error);
    res.status(500).json({ error: error?.message || 'حدث خطأ أثناء الإجابة على سؤالك.' });
  }
}
