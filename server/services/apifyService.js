import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

export async function scrapeSkoolGroup(url, options = {}) {
  const {
    tab = 'classroom',
    includeComments = false,
    commentsLimit = 20,
    includeMedia = false,
    maxItems = 10000,
  } = options;

  const input = {
    startUrls: [{ url }],
    tab,
    includeComments,
    commentsLimit,
    includeMedia,
    maxItems,
    maxConcurrency: 100,
    minConcurrency: 1,
    storeName: 'media',
    cookies: [],
    proxy: {
      useApifyProxy: true,
    },
  };

  try {
    // Run the Actor and wait for it to finish
    const run = await client.actor('9cxt3wyGIo5FJFdoa').call(input);

    // Fetch results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return {
      success: true,
      items,
      count: items.length,
      runId: run.id,
    };
  } catch (error) {
    console.error('Apify scraping error:', error);
    throw new Error(`Scraping failed: ${error.message}`);
  }
}

export async function getRunStatus(runId) {
  try {
    const run = await client.run(runId).get();
    return {
      status: run.status,
      finishedAt: run.finishedAt,
      stats: run.stats,
    };
  } catch (error) {
    console.error('Error getting run status:', error);
    throw error;
  }
}

