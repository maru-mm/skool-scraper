import express from 'express';
import { nanoid } from 'nanoid';
import { scrapeSkoolGroup } from '../services/apifyService.js';
import { getScrapes, getScrapeById, saveScrape } from '../db/storage.js';

const router = express.Router();

router.post('/start', async (req, res) => {
  const { url, tab, includeComments, maxItems } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!url.includes('skool.com')) {
    return res.status(400).json({ error: 'Invalid Skool URL' });
  }

  const scrapeId = nanoid();

  try {
    // Save initial scrape record
    await saveScrape({
      id: scrapeId,
      url,
      tab: tab || 'classroom',
      status: 'running',
      itemsCount: 0,
      items: [],
      createdAt: new Date().toISOString(),
    });

    // Start scraping in background
    scrapeSkoolGroup(url, { tab, includeComments, maxItems })
      .then(async (result) => {
        await saveScrape({
          id: scrapeId,
          status: 'completed',
          itemsCount: result.count,
          items: result.items,
          completedAt: new Date().toISOString(),
        });
      })
      .catch(async (error) => {
        await saveScrape({
          id: scrapeId,
          status: 'failed',
          error: error.message,
          completedAt: new Date().toISOString(),
        });
      });

    res.json({
      success: true,
      scrapeId,
      message: 'Scraping started',
    });
  } catch (error) {
    console.error('Error starting scrape:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:scrapeId', async (req, res) => {
  const { scrapeId } = req.params;

  try {
    const scrape = await getScrapeById(scrapeId);

    if (!scrape) {
      return res.status(404).json({ error: 'Scrape not found' });
    }

    // Don't send all items in status, just metadata
    const { items, ...metadata } = scrape;
    
    res.json({
      ...metadata,
      itemsCount: items?.length || 0,
    });
  } catch (error) {
    console.error('Error getting scrape status:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/items/:scrapeId', async (req, res) => {
  const { scrapeId } = req.params;

  try {
    const scrape = await getScrapeById(scrapeId);

    if (!scrape) {
      return res.status(404).json({ error: 'Scrape not found' });
    }

    res.json({
      count: scrape.items?.length || 0,
      items: scrape.items || [],
    });
  } catch (error) {
    console.error('Error getting scrape items:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
