import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import { analyzeRouter } from './routes/analyze.ts';
import { askRouter } from './routes/ask.ts';
import { initGemini } from './lib/gemini.ts';
import { GEMINI_API_KEY } from './config.ts';

export function createApp(): Express {
  if (GEMINI_API_KEY) {
    initGemini(GEMINI_API_KEY);
  } else {
    console.error('Missing GEMINI_API_KEY. Set it in frontend/server/config.ts or via environment variables.');
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
