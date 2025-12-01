import express from 'express';
import { getScrapes, deleteScrape, getSummaries } from '../db/storage.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const scrapes = await getScrapes();
    const summaries = await getSummaries();
    
    // Add summary count to each scrape
    const history = scrapes
      .map(scrape => ({
        ...scrape,
        summaryCount: summaries.filter(s => s.scrapeId === scrape.id).length,
        // Don't send items in list
        items: undefined,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);
    
    res.json(history);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:scrapeId', async (req, res) => {
  const { scrapeId } = req.params;

  try {
    await deleteScrape(scrapeId);
    res.json({ success: true, message: 'Scrape deleted' });
  } catch (error) {
    console.error('Error deleting scrape:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
