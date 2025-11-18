import { useEffect, useState } from 'react';
import { supabase, ScanHistory as ScanHistoryType } from '../lib/supabase';

export function ScanHistory() {
  const [history, setHistory] = useState<ScanHistoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .order('scan_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="scan-history">
        <h3>Recent Scans</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="scan-history">
        <h3>Recent Scans</h3>
        <p className="empty-state">No scans yet</p>
      </div>
    );
  }

  return (
    <div className="scan-history">
      <h3>Recent Scans</h3>
      <div className="history-list">
        {history.map((scan) => (
          <div key={scan.id} className={`history-item ${scan.is_malicious ? 'malicious' : 'safe'}`}>
            <div className="history-icon">
              {scan.is_malicious ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div className="history-info">
              <div className="history-name">{scan.file_name}</div>
              <div className="history-meta">
                {new Date(scan.scan_date).toLocaleString()} • {scan.malicious_count}/{scan.total_engines} detections
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
