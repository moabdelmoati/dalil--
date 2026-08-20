import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import { analyzeRouter } from './routes/analyze';
import { askRouter } from './routes/ask';
import { initGemini } from './lib/gemini';
import { GEMINI_API_KEY } from './config';

export function createApp(): Express {
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    initGemini(GEMINI_API_KEY);
  }

  const app: Express = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.status(200).json({ ok: true, status: 'up' });
  };

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  app.use('/', analyzeRouter);
  app.use('/api', analyzeRouter);
  app.use('/', askRouter);
  app.use('/api', askRouter);

  return app;
}
