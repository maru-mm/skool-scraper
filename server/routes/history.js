import express from 'express';
import db from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        s.id,
        s.url,
        s.tab,
        s.status,
        s.items_count,
        s.created_at,
        s.completed_at,
        COUNT(DISTINCT sum.id) as summary_count
      FROM scrapes s
      LEFT JOIN summaries sum ON s.id = sum.scrape_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 50
    `);
    
    const history = stmt.all();
    res.json(history);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:scrapeId', (req, res) => {
  const { scrapeId } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM scrapes WHERE id = ?');
    const result = stmt.run(scrapeId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Scrape not found' });
    }

    res.json({ success: true, message: 'Scrape deleted' });
  } catch (error) {
    console.error('Error deleting scrape:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

