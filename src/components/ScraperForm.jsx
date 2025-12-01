import React, { useState } from 'react';

function ScraperForm({ onScrapeStart }) {
  const [url, setUrl] = useState('');
  const [tab, setTab] = useState('classroom');
  const [includeComments, setIncludeComments] = useState(false);
  const [maxItems, setMaxItems] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/scraper/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, tab, includeComments, maxItems }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante lo scraping');
      }

      onScrapeStart(data.scrapeId);
      setUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>✨ Inizia un Nuovo Scraping</h2>
      
      <form onSubmit={handleSubmit} className="scraper-form">
        <div className="form-group">
          <label htmlFor="url">URL del Gruppo Skool *</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.skool.com/ai-automation-mastery"
            required
            disabled={loading}
          />
          <small>Inserisci l'URL completo del gruppo Skool che vuoi analizzare</small>
        </div>

        <div className="form-group">
          <label htmlFor="tab">Sezione da Scrapare</label>
          <select
            id="tab"
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            disabled={loading}
          >
            <option value="classroom">🎓 Classroom (Lezioni)</option>
            <option value="community">💬 Community (Post)</option>
            <option value="calendar">📅 Calendar (Eventi)</option>
            <option value="about">ℹ️ About (Info)</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="maxItems">Massimo Elementi</label>
            <input
              id="maxItems"
              type="number"
              value={maxItems}
              onChange={(e) => setMaxItems(parseInt(e.target.value))}
              min="1"
              max="50000"
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                disabled={loading}
              />
              <span>Includi Commenti</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !url}
        >
          {loading ? '⏳ Avvio in corso...' : '🚀 Inizia Scraping'}
        </button>
      </form>
    </div>
  );
}

export default ScraperForm;

