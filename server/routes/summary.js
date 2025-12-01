import express from 'express';
import { nanoid } from 'nanoid';
import { generateSummary, generateReport } from '../services/aiService.js';
import db from '../db/database.js';

const router = express.Router();

router.post('/generate/:scrapeId', async (req, res) => {
  const { scrapeId } = req.params;

  try {
    // Check if scrape exists and is completed
    const scrapeStmt = db.prepare('SELECT * FROM scrapes WHERE id = ?');
    const scrape = scrapeStmt.get(scrapeId);

    if (!scrape) {
      return res.status(404).json({ error: 'Scrape not found' });
    }

    if (scrape.status !== 'completed') {
      return res.status(400).json({ error: 'Scrape is not completed yet' });
    }

    // Get scraped items
    const itemsStmt = db.prepare('SELECT content FROM scrape_items WHERE scrape_id = ?');
    const items = itemsStmt.all(scrapeId);

    if (items.length === 0) {
      return res.status(400).json({ error: 'No items to summarize' });
    }

    const parsedItems = items.map(item => JSON.parse(item.content));

    // Generate summary
    const summaryResult = await generateSummary(parsedItems);

    // Save summary to database
    const summaryId = nanoid();
    const insertStmt = db.prepare(`
      INSERT INTO summaries (id, scrape_id, summary, key_points)
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(
      summaryId,
      scrapeId,
      summaryResult.summary,
      JSON.stringify(summaryResult.key_points || [])
    );

    res.json({
      success: true,
      summaryId,
      summary: summaryResult.summary,
      key_points: summaryResult.key_points,
      topics: summaryResult.topics,
      practical_insights: summaryResult.practical_insights,
      tokens_used: summaryResult.tokens_used,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:summaryId', (req, res) => {
  const { summaryId } = req.params;

  try {
    const stmt = db.prepare(`
      SELECT s.*, sc.url, sc.tab
      FROM summaries s
      JOIN scrapes sc ON s.scrape_id = sc.id
      WHERE s.id = ?
    `);
    const summary = stmt.get(summaryId);

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({
      ...summary,
      key_points: JSON.parse(summary.key_points),
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/report/:scrapeId', async (req, res) => {
  const { scrapeId } = req.params;

  try {
    // Get scrape data
    const scrapeStmt = db.prepare('SELECT * FROM scrapes WHERE id = ?');
    const scrape = scrapeStmt.get(scrapeId);

    if (!scrape || scrape.status !== 'completed') {
      return res.status(400).json({ error: 'Invalid scrape' });
    }

    // Get items
    const itemsStmt = db.prepare('SELECT content FROM scrape_items WHERE scrape_id = ?');
    const items = itemsStmt.all(scrapeId).map(item => JSON.parse(item.content));

    // Get summary if exists
    const summaryStmt = db.prepare('SELECT * FROM summaries WHERE scrape_id = ? ORDER BY created_at DESC LIMIT 1');
    const summary = summaryStmt.get(scrapeId);

    let summaryData;
    if (summary) {
      summaryData = {
        summary: summary.summary,
        key_points: JSON.parse(summary.key_points),
      };
    } else {
      // Generate summary first
      summaryData = await generateSummary(items);
    }

    // Generate report
    const reportResult = await generateReport(items, summaryData);

    res.json({
      success: true,
      report: reportResult.report,
      tokens_used: reportResult.tokens_used,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

