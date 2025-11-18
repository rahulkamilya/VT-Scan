interface ScanProgressProps {
  fileName: string;
}

export function ScanProgress({ fileName }: ScanProgressProps) {
  return (
    <div className="scan-progress">
      <div className="spinner"></div>
      <h3>Scanning {fileName}</h3>
      <p>Analyzing file with VirusTotal engines...</p>
      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>
    </div>
  );
}
