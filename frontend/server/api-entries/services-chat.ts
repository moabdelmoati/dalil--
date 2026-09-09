import { askServicesChat } from '../lib/services-gemini';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(200).json({ ok: true, message: 'Dalil Services Chat Endpoint Ready' });
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

    const { serviceId, message, history, context } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const answer = await askServicesChat({
      serviceId,
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      context: context || '',
    });

    res.status(200).json({ answer });
  } catch (error: any) {
    console.error('Error in services-chat endpoint:', error);
    res.status(500).json({ error: error?.message || 'Error processing request' });
  }
}
