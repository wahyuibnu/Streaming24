'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Dashboard() {
  const [status, setStatus] = useState<Record<string, string>>({ youtube: 'offline', tiktok: 'offline', twitch: 'offline', kick: 'offline' });
  const [system, setSystem] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStatus();
    fetchSystem();
    const interval = setInterval(() => {
      fetchStatus();
      fetchSystem();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }
  }, [logs]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/stream/status');
      if (res.status === 401) return router.push('/login');
      const data = await res.json();
      setStatus({
        youtube: data.youtube ? 'online' : 'offline',
        tiktok: data.tiktok ? 'online' : 'offline',
        twitch: data.twitch ? 'online' : 'offline',
        kick: data.kick ? 'online' : 'offline',
      });
      if (data.logs) setLogs(data.logs);
    } catch (err) {}
  };

  const fetchSystem = async () => {
    try {
      const res = await fetch('/api/system');
      if (res.ok) setSystem(await res.json());
    } catch (err) {}
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  const handleStreamAction = async (platform: string, action: 'start' | 'stop') => {
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      await fetchStatus();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.mp4')) {
      return setMessage('Error: Only MP4 files are allowed.');
    }

    setIsUploading(true);
    setMessage('Uploading video, please wait...');

    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage(data.message);
    } catch (err: any) {
      setMessage(`Upload Error: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <header className={`${styles.header} fade-in`}>
        <div className={styles.logo}>StreamAuto 24/7</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={() => window.location.href = '/api/backup'} style={{ background: 'var(--primary)', border: '1px solid var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Backup
          </button>
          <button className="btn" onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </header>

      {message && (
        <div style={{ padding: '12px 16px', background: 'var(--glass-bg)', borderLeft: '4px solid var(--primary)', marginBottom: '24px', borderRadius: '6px', fontSize: '0.95rem' }}>
          {message}
        </div>
      )}

      {system && (
        <section className={`glass-panel fade-in`} style={{ marginBottom: '30px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>System Uptime</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{system.uptime}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Memory Usage</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{system.memory.used} GB / {system.memory.total} GB ({system.memory.percent}%)</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Network Diagnostic</div>
            <button className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem', marginTop: '4px', background: 'var(--primary)' }} onClick={async () => {
              setMessage('Testing network latency to ingest servers...');
              try {
                const res = await fetch('/api/network');
                const data = await res.json();
                setMessage(`Network Latency to YouTube RTMP: ${data.ping}`);
              } catch(e) {
                setMessage('Network test failed');
              }
            }}>
              Run Speedtest
            </button>
          </div>
          <div style={{ flexGrow: 1, minWidth: '300px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Live Running Text (Marquee)</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Type here to update live stream text..." 
                id="marqueeInput"
                style={{ padding: '8px 12px' }}
              />
              <button className="btn btn-success" style={{ padding: '8px 16px' }} onClick={async () => {
                const input = document.getElementById('marqueeInput') as HTMLInputElement;
                if (!input) return;
                setMessage('Updating running text...');
                try {
                  const res = await fetch('/api/marquee', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: input.value })
                  });
                  const data = await res.json();
                  setMessage(data.message || 'Updated!');
                } catch(e) {
                  setMessage('Failed to update text');
                }
              }}>Update</button>
            </div>
          </div>
        </section>
      )}

      <main className={styles.dashboardGrid}>
        {['youtube', 'tiktok', 'twitch', 'kick'].map((platform, idx) => (
          <section key={platform} className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: `${0.1 * (idx + 1)}s` }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle} style={{ textTransform: 'capitalize' }}>
                {platform} Live
              </div>
              <span className={`${styles.statusBadge} ${status[platform] === 'online' ? styles.statusOnline : styles.statusOffline}`}>
                {status[platform]}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Broadcasting via RTMP. Hardware Encoding and Auto-Archive available based on .env config.
            </p>
            <div className={styles.actions}>
              {status[platform] === 'offline' ? (
                <button className="btn btn-success" disabled={isLoading} onClick={() => handleStreamAction(platform, 'start')}>
                  Start Stream
                </button>
              ) : (
                <button className="btn btn-danger" disabled={isLoading} onClick={() => handleStreamAction(platform, 'stop')}>
                  Stop Stream
                </button>
              )}
            </div>
          </section>
        ))}

        <section className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: '0.5s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Media Source</div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
            Upload <strong>.mp4</strong> videos to add to the playlist, or upload a <strong>.png</strong> file to set your Brand Logo Watermark!
          </p>
          <input 
            type="file" 
            accept=".mp4, .png" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <div className={styles.uploadArea} onClick={() => !isUploading && fileInputRef.current?.click()} style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h4 style={{ marginBottom: '6px', fontWeight: 500 }}>
              {isUploading ? 'Uploading...' : 'Click to Upload MP4'}
            </h4>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>Live Preview</div>
            <video 
              key={Date.now()} // Force re-render if uploaded (simplified for this scope)
              src={`/stream_video.mp4?v=${Date.now()}`} 
              controls 
              loop 
              muted 
              style={{ width: '100%', display: 'block', maxHeight: '180px', objectFit: 'cover' }} 
            />
          </div>
        </section>
      </main>

      <section className={`glass-panel fade-in`} style={{ marginTop: '30px', animationDelay: '0.4s' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', fontSize: '1.1rem', fontWeight: 600 }}>
          Terminal Logs (Real-time)
        </div>
        <div 
          ref={logsEndRef}
          style={{ 
            height: '200px', 
            overflowY: 'auto', 
            padding: '20px', 
            fontFamily: 'monospace', 
            fontSize: '0.85rem',
            color: '#a3e635',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column-reverse'
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>Waiting for stream data...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ marginBottom: '4px' }}>{log}</div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
