import { Router } from 'express';
import { askServicesChat } from '../lib/services-gemini.ts';

export const servicesChatRouter = Router();

servicesChatRouter.post('/services-chat', async (req, res) => {
  try {
    const { serviceId, message, history, context } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const answer = await askServicesChat({
      serviceId,
      message,
      history: history || [],
      context: context || '',
    });

    res.json({ answer });
  } catch (error: any) {
    console.error('Error in services-chat route:', error);
    res.status(500).json({ error: error.message });
  }
});
