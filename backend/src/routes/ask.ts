import { Router, type Request, type Response } from 'express';
import { buildGroundingContext, detectDocumentType } from '../lib/knowledgeBase.ts';
import { askDocument } from '../lib/gemini.ts';
import type { AskRequest } from '../types.ts';

export const askRouter = Router();

askRouter.post('/ask', async (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<AskRequest>;
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
    const groundContext = buildGroundingContext(documentType);

    const history = Array.isArray(body.history)
      ? body.history
          .filter((message) => message && (message.role === 'user' || message.role === 'model') && typeof message.text === 'string')
          .slice(-20)
          .map((message) => ({ role: message.role, text: message.text }))
      : [];

    const answer = await askDocument({
      documentText,
      documentType,
      question,
      history,
      groundContext,
    });

    res.json({ answer });
  } catch (error) {
    console.error('ask error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء الإجابة على سؤالك. حاول مرة أخرى.' });
  }
});