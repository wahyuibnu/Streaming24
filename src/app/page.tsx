'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Dashboard() {
  const [ytStatus, setYtStatus] = useState('offline');
  const [tiktokStatus, setTiktokStatus] = useState('offline');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/stream/status');
      const data = await res.json();
      setYtStatus(data.youtube ? 'online' : 'offline');
      setTiktokStatus(data.tiktok ? 'online' : 'offline');
    } catch (err) {
      console.error('Failed to fetch status');
    }
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
      </header>

      {message && (
        <div style={{ padding: '10px 15px', background: 'var(--glass-bg)', borderLeft: '4px solid var(--primary)', marginBottom: '20px', borderRadius: '4px' }}>
          {message}
        </div>
      )}

      <main className={styles.dashboardGrid}>
        
        {/* YouTube Card */}
        <section className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: '0.1s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"></polygon>
              </svg>
              YouTube Live
            </div>
            <span className={`${styles.statusBadge} ${ytStatus === 'online' ? styles.statusOnline : styles.statusOffline}`}>
              {ytStatus}
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Credentials are securely loaded from your server environment (.env).
          </p>

          <div className={styles.actions}>
            {ytStatus === 'offline' ? (
              <button 
                className="btn btn-success" 
                disabled={isLoading}
                onClick={() => handleStreamAction('youtube', 'start')}
              >
                Start Stream
              </button>
            ) : (
              <button 
                className="btn btn-danger" 
                disabled={isLoading}
                onClick={() => handleStreamAction('youtube', 'stop')}
              >
                Stop Stream
              </button>
            )}
          </div>
        </section>

        {/* TikTok Card */}
        <section className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#000" stroke="#fff" strokeWidth="1">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
              </svg>
              TikTok Live
            </div>
            <span className={`${styles.statusBadge} ${tiktokStatus === 'online' ? styles.statusOnline : styles.statusOffline}`}>
              {tiktokStatus}
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Credentials are securely loaded from your server environment (.env).
          </p>

          <div className={styles.actions}>
            {tiktokStatus === 'offline' ? (
              <button 
                className="btn btn-success" 
                disabled={isLoading}
                onClick={() => handleStreamAction('tiktok', 'start')}
              >
                Start Stream
              </button>
            ) : (
              <button 
                className="btn btn-danger" 
                disabled={isLoading}
                onClick={() => handleStreamAction('tiktok', 'stop')}
              >
                Stop Stream
              </button>
            )}
          </div>
        </section>

        {/* Media Manager Card */}
        <section className={`glass-panel ${styles.card} fade-in`} style={{ animationDelay: '0.3s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              Media Source
            </div>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            To change the stream content, replace the file at <code>{process.env.NEXT_PUBLIC_VIDEO_PATH || './public/stream_video.mp4'}</code> or update your .env file.
          </p>

          <div className={styles.uploadArea}>
            <div className={styles.uploadIcon}>📁</div>
            <h4 style={{ marginBottom: '8px' }}>stream_video.mp4</h4>
            <p style={{ color: 'var(--success)', fontSize: '0.85rem' }}>Ready to stream</p>
          </div>
        </section>

      </main>
    </div>
  );
}
