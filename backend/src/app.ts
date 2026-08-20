import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import { analyzeRouter } from './routes/analyze.ts';
import { askRouter } from './routes/ask.ts';
import { loadKnowledgeBase } from './lib/knowledgeBase.ts';
import { initGemini } from './lib/gemini.ts';

export function createApp(): Express {
  loadKnowledgeBase();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY. Set it via backend/.env or the platform environment.');
  } else {
    initGemini(apiKey);
  }

  const app: Express = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true, status: 'up' });
  });

  app.use('/api', analyzeRouter);
  app.use('/api', askRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'الرابط غير موجود.' });
  });

  return app;
}