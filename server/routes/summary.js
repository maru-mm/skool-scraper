import express from 'express';
import { nanoid } from 'nanoid';
import { generateSummary, generateReport } from '../services/aiService.js';
import { getScrapeById, saveSummary, getSummaryById } from '../db/storage.js';

const router = express.Router();

router.post('/generate/:scrapeId', async (req, res) => {
  const { scrapeId } = req.params;

  try {
    const scrape = await getScrapeById(scrapeId);

    if (!scrape) {
      return res.status(404).json({ error: 'Scrape not found' });
    }

    if (scrape.status !== 'completed') {
      return res.status(400).json({ error: 'Scrape is not completed yet' });
    }

    if (!scrape.items || scrape.items.length === 0) {
      return res.status(400).json({ error: 'No items to summarize' });
    }

    // Generate summary
    const summaryResult = await generateSummary(scrape.items);

    // Save summary
    const summaryId = nanoid();
    await saveSummary({
      id: summaryId,
      scrapeId,
      summary: summaryResult.summary,
      keyPoints: summaryResult.key_points || [],
      topics: summaryResult.topics || [],
      practicalInsights: summaryResult.practical_insights || [],
      tokensUsed: summaryResult.tokens_used,
      createdAt: new Date().toISOString(),
    });

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

router.get('/:summaryId', async (req, res) => {
  const { summaryId } = req.params;

  try {
    const summary = await getSummaryById(summaryId);

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    const scrape = await getScrapeById(summary.scrapeId);

    res.json({
      ...summary,
      url: scrape?.url,
      tab: scrape?.tab,
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/report/:scrapeId', async (req, res) => {
  const { scrapeId } = req.params;

  try {
    const scrape = await getScrapeById(scrapeId);

    if (!scrape || scrape.status !== 'completed') {
      return res.status(400).json({ error: 'Invalid scrape' });
    }

    if (!scrape.items || scrape.items.length === 0) {
      return res.status(400).json({ error: 'No items to generate report' });
    }

    // Check if summary exists
    const summaries = await getSummaries();
    let summaryData = summaries.find(s => s.scrapeId === scrapeId);

    if (!summaryData) {
      // Generate summary first
      const result = await generateSummary(scrape.items);
      summaryData = {
        summary: result.summary,
        keyPoints: result.key_points,
      };
    }

    // Generate report
    const reportResult = await generateReport(scrape.items, {
      summary: summaryData.summary,
      key_points: summaryData.keyPoints,
    });

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
