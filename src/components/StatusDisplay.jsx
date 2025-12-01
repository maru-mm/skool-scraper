import React, { useEffect, useState } from 'react';

function StatusDisplay({ scrapeId, onStatusChange }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scrapeId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/scraper/status/${scrapeId}`);
        const data = await response.json();
        setStatus(data);
        onStatusChange(data.status);
        setLoading(false);

        // Continue polling if still running
        if (data.status === 'running') {
          setTimeout(checkStatus, 3000);
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setLoading(false);
      }
    };

    checkStatus();
  }, [scrapeId]);

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Caricamento stato...</p>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const getStatusIcon = () => {
    switch (status.status) {
      case 'running': return '⏳';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '🔄';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'running': return 'Scraping in corso...';
      case 'completed': return 'Scraping completato!';
      case 'failed': return 'Scraping fallito';
      default: return 'Stato sconosciuto';
    }
  };

  return (
    <div className="card">
      <h3>📊 Stato Scraping</h3>
      
      <div className={`status-box status-${status.status}`}>
        <div className="status-header">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </div>

        <div className="status-details">
          <div className="status-item">
            <span className="label">URL:</span>
            <span className="value">{status.url}</span>
          </div>
          <div className="status-item">
            <span className="label">Sezione:</span>
            <span className="value">{status.tab}</span>
          </div>
          <div className="status-item">
            <span className="label">Elementi trovati:</span>
            <span className="value">{status.items_count || 0}</span>
          </div>
          <div className="status-item">
            <span className="label">Iniziato:</span>
            <span className="value">{new Date(status.created_at).toLocaleString('it-IT')}</span>
          </div>
          {status.completed_at && (
            <div className="status-item">
              <span className="label">Completato:</span>
              <span className="value">{new Date(status.completed_at).toLocaleString('it-IT')}</span>
            </div>
          )}
        </div>

        {status.error && (
          <div className="alert alert-error">
            <strong>Errore:</strong> {status.error}
          </div>
        )}

        {status.status === 'running' && (
          <div className="progress-bar">
            <div className="progress-bar-fill"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusDisplay;

