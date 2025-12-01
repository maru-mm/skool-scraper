import React, { useState } from 'react';
import Header from './components/Header';
import ScraperForm from './components/ScraperForm';
import StatusDisplay from './components/StatusDisplay';
import SummaryDisplay from './components/SummaryDisplay';
import History from './components/History';

function App() {
  const [currentScrapeId, setCurrentScrapeId] = useState(null);
  const [scrapeStatus, setScrapeStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('scraper');

  return (
    <div className="app">
      <Header />
      
      <nav className="tabs">
        <button
          className={activeTab === 'scraper' ? 'active' : ''}
          onClick={() => setActiveTab('scraper')}
        >
          🔍 Nuovo Scraping
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          📚 Cronologia
        </button>
      </nav>

      <main className="container">
        {activeTab === 'scraper' ? (
          <>
            <ScraperForm
              onScrapeStart={(scrapeId) => {
                setCurrentScrapeId(scrapeId);
                setScrapeStatus('running');
              }}
            />

            {currentScrapeId && (
              <>
                <StatusDisplay
                  scrapeId={currentScrapeId}
                  onStatusChange={setScrapeStatus}
                />

                {scrapeStatus === 'completed' && (
                  <SummaryDisplay scrapeId={currentScrapeId} />
                )}
              </>
            )}
          </>
        ) : (
          <History
            onSelectScrape={(scrapeId) => {
              setCurrentScrapeId(scrapeId);
              setActiveTab('scraper');
            }}
          />
        )}
      </main>

      <footer className="footer">
        <p>Skool Scraper - Powered by Apify & OpenAI</p>
      </footer>
    </div>
  );
}

export default App;

