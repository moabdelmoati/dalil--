import 'dotenv/config';
import cors from 'cors';
import express, { type Express } from 'express';
import { analyzeRouter } from './routes/analyze.ts';
import { askRouter } from './routes/ask.ts';
import { loadKnowledgeBase } from './lib/knowledgeBase.ts';
import { initGemini } from './lib/gemini.ts';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY. Copy backend/.env.example to backend/.env and set your key.');
  process.exit(1);
}

loadKnowledgeBase();
initGemini(apiKey);

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

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Dalil backend listening on http://localhost:${port}`);
});