'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Dashboard() {
  const [ytStatus, setYtStatus] = useState('offline');
  const [tiktokStatus, setTiktokStatus] = useState('offline');
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
    }, 3000); // Polling faster for live logs
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
      setYtStatus(data.youtube ? 'online' : 'offline');
      setTiktokStatus(data.tiktok ? 'online' : 'offline');
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
        <button className="btn" onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </button>
      </header>

      {message && (
        <div style={{ padding: '12px 16px', background: 'var(--glass-bg)', borderLeft: '4px solid var(--primary)', marginBottom: '24px', borderRadius: '6px', fontSize: '0.95rem' }}>
          {message}
        </div>
      )}

      {system && (
        <section className={`glass-panel fade-in`} style={{ marginBottom: '30px', padding: '20px', display: 'flex', gap: '40px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>System Uptime</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{system.uptime}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Memory Usage</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{system.memory.used} GB / {system.memory.total} GB ({system.memory.percent}%)</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>CPU</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{system.cpu}</div>
          </div>
        </section>
      )}

      <main className={styles.dashboardGrid}>
        <section className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: '0.1s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>YouTube Live</div>
            <span className={`${styles.statusBadge} ${ytStatus === 'online' ? styles.statusOnline : styles.statusOffline}`}>
              {ytStatus}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Broadcasting via RTMP with live clock watermark overlay.
          </p>
          <div className={styles.actions}>
            {ytStatus === 'offline' ? (
              <button className="btn btn-success" disabled={isLoading} onClick={() => handleStreamAction('youtube', 'start')}>
                Start Stream
              </button>
            ) : (
              <button className="btn btn-danger" disabled={isLoading} onClick={() => handleStreamAction('youtube', 'stop')}>
                Stop Stream
              </button>
            )}
          </div>
        </section>

        <section className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>TikTok Live</div>
            <span className={`${styles.statusBadge} ${tiktokStatus === 'online' ? styles.statusOnline : styles.statusOffline}`}>
              {tiktokStatus}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Custom RTMP connection with auto-reconnect capability.
          </p>
          <div className={styles.actions}>
            {tiktokStatus === 'offline' ? (
              <button className="btn btn-success" disabled={isLoading} onClick={() => handleStreamAction('tiktok', 'start')}>
                Start Stream
              </button>
            ) : (
              <button className="btn btn-danger" disabled={isLoading} onClick={() => handleStreamAction('tiktok', 'stop')}>
                Stop Stream
              </button>
            )}
          </div>
        </section>

        <section className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: '0.3s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Media Upload</div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Upload a new MP4 file directly from your browser.
          </p>
          <input 
            type="file" 
            accept="video/mp4" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <div className={styles.uploadArea} onClick={() => !isUploading && fileInputRef.current?.click()}>
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
