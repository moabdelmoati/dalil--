import { Router, type Request, type Response } from 'express';
import { buildGroundingContext, detectDocumentType } from '../lib/knowledgeBase.ts';
import { askDocument } from '../lib/gemini.ts';
import { askDocumentLocal } from '../lib/ruleEngine.ts';
import { GEMINI_API_KEY } from '../config.ts';
import type { AskRequest } from '../types.ts';

export const askRouter = Router();

function isGeminiEnabled(): boolean {
  const key = GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim() !== '' && key !== 'YOUR_GEMINI_API_KEY_HERE');
}

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

    // 1. Try Gemini AI if enabled
    if (isGeminiEnabled()) {
      try {
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
        return;
      } catch (geminiError) {
        console.warn('Gemini ask failed, falling back to local QA engine:', geminiError);
      }
    }

    // 2. Fallback to Local Rule-Based QA Engine (Works 100% offline & without Gemini)
    const localAnswer = askDocumentLocal({
      documentText,
      documentType,
      question,
    });

    res.json({ answer: localAnswer });
  } catch (error) {
    console.error('ask error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء الإجابة على سؤالك. حاول مرة أخرى.' });
  }
});
