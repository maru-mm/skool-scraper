import React, { useState } from 'react';

function SummaryDisplay({ scrapeId }) {
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('summary');

  const generateSummary = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/summary/generate/${scrapeId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la generazione del riassunto');
      }

      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/summary/report/${scrapeId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la generazione del report');
      }

      setReport(data);
      setActiveView('report');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>🤖 Analisi AI</h3>

      {!summary && !loading && (
        <div className="empty-state">
          <p>Genera un riassunto intelligente del contenuto scrapato usando l'AI</p>
          <button
            onClick={generateSummary}
            className="btn btn-primary"
            disabled={loading}
          >
            ✨ Genera Riassunto
          </button>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Generazione in corso... Questo potrebbe richiedere qualche secondo</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {summary && (
        <>
          <div className="view-tabs">
            <button
              className={activeView === 'summary' ? 'active' : ''}
              onClick={() => setActiveView('summary')}
            >
              📝 Riassunto
            </button>
            <button
              className={activeView === 'report' ? 'active' : ''}
              onClick={() => {
                if (!report) {
                  generateReport();
                } else {
                  setActiveView('report');
                }
              }}
            >
              📊 Report Completo
            </button>
          </div>

          {activeView === 'summary' && (
            <div className="summary-content">
              <div className="summary-section">
                <h4>📄 Riassunto Completo</h4>
                <div className="summary-text">{summary.summary}</div>
              </div>

              {summary.key_points && summary.key_points.length > 0 && (
                <div className="summary-section">
                  <h4>🔑 Punti Chiave</h4>
                  <ul className="key-points">
                    {summary.key_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.topics && summary.topics.length > 0 && (
                <div className="summary-section">
                  <h4>🏷️ Topics Principali</h4>
                  <div className="topics">
                    {summary.topics.map((topic, index) => (
                      <span key={index} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                </div>
              )}

              {summary.practical_insights && summary.practical_insights.length > 0 && (
                <div className="summary-section">
                  <h4>💡 Insights Pratici</h4>
                  <ul className="insights">
                    {summary.practical_insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="summary-meta">
                <small>🪙 Token utilizzati: {summary.tokens_used}</small>
              </div>
            </div>
          )}

          {activeView === 'report' && report && (
            <div className="report-content">
              <div className="report-text">
                {report.report.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="summary-meta">
                <small>🪙 Token utilizzati: {report.tokens_used}</small>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SummaryDisplay;

