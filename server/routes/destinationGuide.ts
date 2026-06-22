import { Router, Request, Response } from 'express';
import { getDestinationById } from '../../services/destinationService';
import { getGeminiRecommendations } from '../services/geminiDestinationService';
import { getWeatherByDestination } from '../../services/weatherService';
import { chatWithGemini } from '../../services/chatService';

const router = Router();

// GET destination details
router.get('/api/destination-guide/:destId', async (req: Request, res: Response) => {
  const destId = req.params.destId as string;
  try {
    const data = await getDestinationById(destId);
    if (!data) return res.status(404).json({ error: 'Destination not found' });
    res.json(data);
  } catch (err) {
    console.error('Error fetching destination', err);
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

// POST Gemini recommendations
router.post('/api/destination-guide/:destId/recommendations', async (req: Request, res: Response) => {
  const destId = req.params.destId as string;
  try {
    const recs = await getGeminiRecommendations(destId);
    res.json({ recommendations: recs });
  } catch (err) {
    console.error('Gemini recommendation error', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// GET weather info
router.get('/api/destination-guide/:destId/weather', async (req: Request, res: Response) => {
  const destId = req.params.destId as string;
  try {
    const weather = await getWeatherByDestination(destId);
    res.json(weather);
  } catch (err) {
    console.error('Weather fetch error', err);
    res.status(500).json({ error: 'Failed to get weather' });
  }
});

// POST chat endpoint
router.post('/api/destination-guide/:destId/chat', async (req: Request, res: Response) => {
  const destId = req.params.destId as string;
  const { messages } = req.body; // expecting array of {role, content}
  try {
    const reply = await chatWithGemini(destId, messages);
    res.json({ reply });
  } catch (err) {
    console.error('Chat error', err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

export default router;
