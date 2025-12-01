import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const SCRAPES_FILE = path.join(DATA_DIR, 'scrapes.json');
const SUMMARIES_FILE = path.join(DATA_DIR, 'summaries.json');

// Initialize storage
export async function initStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Create files if they don't exist
    try {
      await fs.access(SCRAPES_FILE);
    } catch {
      await fs.writeFile(SCRAPES_FILE, JSON.stringify([], null, 2));
    }
    
    try {
      await fs.access(SUMMARIES_FILE);
    } catch {
      await fs.writeFile(SUMMARIES_FILE, JSON.stringify([], null, 2));
    }
    
    console.log('✅ Storage initialized');
  } catch (error) {
    console.error('Storage initialization error:', error);
  }
}

// Scrapes operations
export async function getScrapes() {
  try {
    const data = await fs.readFile(SCRAPES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getScrapeById(id) {
  const scrapes = await getScrapes();
  return scrapes.find(s => s.id === id);
}

export async function saveScrape(scrape) {
  const scrapes = await getScrapes();
  const index = scrapes.findIndex(s => s.id === scrape.id);
  
  if (index >= 0) {
    scrapes[index] = { ...scrapes[index], ...scrape };
  } else {
    scrapes.push(scrape);
  }
  
  await fs.writeFile(SCRAPES_FILE, JSON.stringify(scrapes, null, 2));
  return scrape;
}

export async function deleteScrape(id) {
  const scrapes = await getScrapes();
  const filtered = scrapes.filter(s => s.id !== id);
  await fs.writeFile(SCRAPES_FILE, JSON.stringify(filtered, null, 2));
  
  // Also delete associated summaries
  const summaries = await getSummaries();
  const filteredSummaries = summaries.filter(s => s.scrapeId !== id);
  await fs.writeFile(SUMMARIES_FILE, JSON.stringify(filteredSummaries, null, 2));
}

// Summaries operations
export async function getSummaries() {
  try {
    const data = await fs.readFile(SUMMARIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getSummaryById(id) {
  const summaries = await getSummaries();
  return summaries.find(s => s.id === id);
}

export async function getSummariesByScrapeId(scrapeId) {
  const summaries = await getSummaries();
  return summaries.filter(s => s.scrapeId === scrapeId);
}

export async function saveSummary(summary) {
  const summaries = await getSummaries();
  const index = summaries.findIndex(s => s.id === summary.id);
  
  if (index >= 0) {
    summaries[index] = { ...summaries[index], ...summary };
  } else {
    summaries.push(summary);
  }
  
  await fs.writeFile(SUMMARIES_FILE, JSON.stringify(summaries, null, 2));
  return summary;
}

