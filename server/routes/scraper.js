import express from 'express';
import { nanoid } from 'nanoid';
import { scrapeSkoolGroup } from '../services/apifyService.js';
import db from '../db/database.js';

const router = express.Router();

router.post('/start', async (req, res) => {
  const { url, tab, includeComments, maxItems } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate Skool URL
  if (!url.includes('skool.com')) {
    return res.status(400).json({ error: 'Invalid Skool URL' });
  }

  const scrapeId = nanoid();

  try {
    // Insert initial scrape record
    const stmt = db.prepare(`
      INSERT INTO scrapes (id, url, tab, status)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(scrapeId, url, tab || 'classroom', 'running');

    // Start scraping in background
    scrapeSkoolGroup(url, { tab, includeComments, maxItems })
      .then(async (result) => {
        // Update scrape status
        const updateStmt = db.prepare(`
          UPDATE scrapes 
          SET status = ?, items_count = ?, completed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        updateStmt.run('completed', result.count, scrapeId);

        // Save scraped items
        const insertItemStmt = db.prepare(`
          INSERT INTO scrape_items (scrape_id, content, type)
          VALUES (?, ?, ?)
        `);

        const insertMany = db.transaction((items) => {
          for (const item of items) {
            const content = JSON.stringify(item);
            insertItemStmt.run(scrapeId, content, item.type || 'unknown');
          }
        });

        insertMany(result.items);
      })
      .catch((error) => {
        // Update scrape with error
        const errorStmt = db.prepare(`
          UPDATE scrapes 
          SET status = ?, error = ?, completed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        errorStmt.run('failed', error.message, scrapeId);
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

router.get('/status/:scrapeId', (req, res) => {
  const { scrapeId } = req.params;

  try {
    const stmt = db.prepare(`
      SELECT id, url, tab, status, items_count, created_at, completed_at, error
      FROM scrapes
      WHERE id = ?
    `);
    const scrape = stmt.get(scrapeId);

    if (!scrape) {
      return res.status(404).json({ error: 'Scrape not found' });
    }

    res.json(scrape);
  } catch (error) {
    console.error('Error getting scrape status:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/items/:scrapeId', (req, res) => {
  const { scrapeId } = req.params;

  try {
    const stmt = db.prepare(`
      SELECT content, type, created_at
      FROM scrape_items
      WHERE scrape_id = ?
      ORDER BY id
    `);
    const items = stmt.all(scrapeId);

    const parsedItems = items.map(item => ({
      ...JSON.parse(item.content),
      type: item.type,
      scraped_at: item.created_at,
    }));

    res.json({
      count: parsedItems.length,
      items: parsedItems,
    });
  } catch (error) {
    console.error('Error getting scrape items:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

