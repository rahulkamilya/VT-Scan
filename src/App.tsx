import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ScanProgress } from './components/ScanProgress';
import { ScanResults } from './components/ScanResults';
import { ScanHistory } from './components/ScanHistory';
import { supabase, ScanResult } from './lib/supabase';

type AppState = 'upload' | 'scanning' | 'results';

function App() {
  const [state, setState] = useState<AppState>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setState('scanning');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-file`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scan file');
      }

      const result: ScanResult = await response.json();
      setScanResult(result);

      const { error: dbError } = await supabase
        .from('scan_history')
        .insert({
          file_name: result.file_name,
          file_size: result.file_size,
          file_hash: result.file_hash,
          file_type: result.file_type,
          malicious_count: result.malicious_count,
          total_engines: result.total_engines,
          is_malicious: result.is_malicious,
          scan_results: result.results,
        });

      if (dbError) {
        console.error('Error saving to database:', dbError);
      }

      setState('results');
    } catch (err) {
      console.error('Scan error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during scanning');
      setState('upload');
    }
  };

  const handleNewScan = () => {
    setState('upload');
    setSelectedFile(null);
    setScanResult(null);
    setError(null);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1>VirusTotal Scanner</h1>
          <p className="subtitle">Secure file scanning powered by VirusTotal</p>
        </header>

        <main className="main-content">
          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {state === 'upload' && (
            <FileUpload onFileSelect={handleFileSelect} isScanning={false} />
          )}

          {state === 'scanning' && selectedFile && (
            <ScanProgress fileName={selectedFile.name} />
          )}

          {state === 'results' && scanResult && (
            <ScanResults result={scanResult} onNewScan={handleNewScan} />
          )}
        </main>

        <aside className="sidebar">
          <ScanHistory key={state === 'results' ? 'refresh' : 'normal'} />
        </aside>
      </div>
    </div>
  );
}

export default App;
