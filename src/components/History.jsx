import React, { useEffect, useState } from 'react';

function History({ onSelectScrape }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError('Errore nel caricamento della cronologia');
    } finally {
      setLoading(false);
    }
  };

  const deleteScrape = async (scrapeId, e) => {
    e.stopPropagation();
    
    if (!confirm('Sei sicuro di voler eliminare questo scraping?')) {
      return;
    }

    try {
      await fetch(`/api/history/${scrapeId}`, { method: 'DELETE' });
      setHistory(history.filter(item => item.id !== scrapeId));
    } catch (err) {
      alert('Errore durante l\'eliminazione');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Caricamento cronologia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <p>📭 Nessuno scraping effettuato ancora</p>
          <p>Inizia il tuo primo scraping dalla tab "Nuovo Scraping"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>📚 Cronologia Scraping</h2>
      
      <div className="history-list">
        {history.map((item) => (
          <div
            key={item.id}
            className={`history-item status-${item.status}`}
            onClick={() => onSelectScrape(item.id)}
          >
            <div className="history-header">
              <span className="history-status">
                {item.status === 'completed' && '✅'}
                {item.status === 'running' && '⏳'}
                {item.status === 'failed' && '❌'}
              </span>
              <span className="history-url">{item.url}</span>
            </div>
            
            <div className="history-details">
              <span>📑 {item.tab}</span>
              <span>📊 {item.items_count || 0} elementi</span>
              {item.summary_count > 0 && <span>🤖 {item.summary_count} riassunti</span>}
              <span>🕒 {new Date(item.created_at).toLocaleDateString('it-IT')}</span>
            </div>

            <button
              className="btn-delete"
              onClick={(e) => deleteScrape(item.id, e)}
              title="Elimina"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;

