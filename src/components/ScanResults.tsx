import { ScanResult } from '../lib/supabase';

interface ScanResultsProps {
  result: ScanResult;
  onNewScan: () => void;
}

export function ScanResults({ result, onNewScan }: ScanResultsProps) {
  const isSafe = result.malicious_count === 0;

  return (
    <div className="scan-results">
      <div className={`result-header ${isSafe ? 'safe' : 'danger'}`}>
        <div className="result-icon">
          {isSafe ? (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <h2>{isSafe ? 'File is Safe' : 'Threats Detected'}</h2>
        <p className="threat-count">
          {result.malicious_count} / {result.total_engines} security vendors flagged this file
        </p>
      </div>

      <div className="file-info">
        <h3>File Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">File Name</span>
            <span className="value">{result.file_name}</span>
          </div>
          <div className="info-item">
            <span className="label">File Size</span>
            <span className="value">{(result.file_size / 1024).toFixed(2)} KB</span>
          </div>
          <div className="info-item">
            <span className="label">File Type</span>
            <span className="value">{result.file_type}</span>
          </div>
          <div className="info-item">
            <span className="label">SHA-256</span>
            <span className="value hash">{result.file_hash}</span>
          </div>
        </div>
      </div>

      <div className="detection-stats">
        <h3>Detection Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item danger">
            <span className="stat-value">{result.stats.malicious}</span>
            <span className="stat-label">Malicious</span>
          </div>
          <div className="stat-item warning">
            <span className="stat-value">{result.stats.suspicious}</span>
            <span className="stat-label">Suspicious</span>
          </div>
          <div className="stat-item safe">
            <span className="stat-value">{result.stats.undetected}</span>
            <span className="stat-label">Undetected</span>
          </div>
          <div className="stat-item safe">
            <span className="stat-value">{result.stats.harmless}</span>
            <span className="stat-label">Harmless</span>
          </div>
        </div>
      </div>

      <div className="engine-results">
        <h3>Detailed Engine Results</h3>
        <div className="results-list">
          {Object.entries(result.results).map(([key, value]) => (
            <div key={key} className={`engine-result ${value.category}`}>
              <span className="engine-name">{value.engine_name}</span>
              <span className={`engine-status ${value.category}`}>
                {value.category === 'undetected' && 'Clean'}
                {value.category === 'malicious' && value.result}
                {value.category === 'type-unsupported' && 'Unsupported'}
                {value.category === 'suspicious' && value.result}
                {value.category === 'harmless' && 'Clean'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button className="new-scan-btn" onClick={onNewScan}>
        Scan Another File
      </button>
    </div>
  );
}
