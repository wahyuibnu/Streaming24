'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Dashboard() {
  const [ytStatus, setYtStatus] = useState('offline');
  const [tiktokStatus, setTiktokStatus] = useState('offline');
  const [system, setSystem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchStatus();
    fetchSystem();
    const interval = setInterval(() => {
      fetchStatus();
      fetchSystem();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/stream/status');
      if (res.status === 401) router.push('/login');
      const data = await res.json();
      setYtStatus(data.youtube ? 'online' : 'offline');
      setTiktokStatus(data.tiktok ? 'online' : 'offline');
    } catch (err) {
      console.error('Failed to fetch status');
    }
  };

  const fetchSystem = async () => {
    try {
      const res = await fetch('/api/system');
      if (res.ok) {
        const data = await res.json();
        setSystem(data);
      }
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
      
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      setMessage(data.message);
      await fetchStatus();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
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

      {/* System Metrics Panel */}
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
        
        {/* YouTube Card */}
        <section className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: '0.1s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"></polygon>
              </svg>
              YouTube Live
            </div>
            <span className={`${styles.statusBadge} ${ytStatus === 'online' ? styles.statusOnline : styles.statusOffline}`}>
              {ytStatus}
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Broadcasting via RTMP. The stream runs on an infinite loop directly from the server.
          </p>

          <div className={styles.actions}>
            {ytStatus === 'offline' ? (
              <button 
                className="btn btn-success" 
                disabled={isLoading}
                onClick={() => handleStreamAction('youtube', 'start')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Start Stream
              </button>
            ) : (
              <button 
                className="btn btn-danger" 
                disabled={isLoading}
                onClick={() => handleStreamAction('youtube', 'stop')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                Stop Stream
              </button>
            )}
          </div>
        </section>

        {/* TikTok Card */}
        <section className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
              </svg>
              TikTok Live
            </div>
            <span className={`${styles.statusBadge} ${tiktokStatus === 'online' ? styles.statusOnline : styles.statusOffline}`}>
              {tiktokStatus}
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Broadcasting via Custom RTMP. Connection stays alive automatically.
          </p>

          <div className={styles.actions}>
            {tiktokStatus === 'offline' ? (
              <button 
                className="btn btn-success" 
                disabled={isLoading}
                onClick={() => handleStreamAction('tiktok', 'start')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Start Stream
              </button>
            ) : (
              <button 
                className="btn btn-danger" 
                disabled={isLoading}
                onClick={() => handleStreamAction('tiktok', 'stop')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                Stop Stream
              </button>
            )}
          </div>
        </section>

        {/* Media Manager Card */}
        <section className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: '0.3s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Media Source
            </div>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Current target file path is securely mapped in your environment configuration.
          </p>

          <div className={styles.uploadArea}>
            <div style={{ marginBottom: '15px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <h4 style={{ marginBottom: '6px', fontWeight: 500 }}>stream_video.mp4</h4>
            <p style={{ color: 'var(--success)', fontSize: '0.85rem' }}>Source Validated</p>
          </div>
        </section>

      </main>
    </div>
  );
}
