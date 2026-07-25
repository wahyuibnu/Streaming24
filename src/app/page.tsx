'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Dashboard() {
  const [status, setStatus] = useState<Record<string, string>>({ youtube: 'offline', tiktok: 'offline', twitch: 'offline', kick: 'offline' });
  const [system, setSystem] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [media, setMedia] = useState<{videos: string[], audio: string[], logo: boolean}>({ videos: [], audio: [], logo: false });
  const [config, setConfig] = useState<Record<string, string>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStatus();
    fetchSystem();
    fetchMedia();
    fetchConfig();
    const interval = setInterval(() => {
      fetchStatus();
      fetchSystem();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) setConfig(await res.json());
    } catch(e) {}
  };

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) setMedia(await res.json());
    } catch(e) {}
  };

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
      fetchMedia();
    } catch (err: any) {
      setMessage(`Upload Error: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteMedia = async (type: string, filename: string) => {
    if (!confirm(`Hapus ${filename}?`)) return;
    try {
      const res = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, filename })
      });
      if (res.ok) fetchMedia();
    } catch(e) {}
  };

  const handlePanic = async () => {
    if (!confirm('🛑 EMERGENCY: Hentikan SEMUA siaran secara paksa?')) return;
    setMessage('Menjalankan prosedur darurat...');
    try {
      await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'panic', platform: 'youtube' })
      });
      fetchStatus();
      setMessage('Semua siaran dihentikan paksa.');
    } catch(e) {}
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Menyimpan pengaturan...');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      setMessage(data.message || 'Settings saved!');
      setShowSettings(false);
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
  }  return (
    <div className={styles.container}>
      <header className={`${styles.header} fade-in`}>
        <div className={styles.logo}>StreamAuto 24/7</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-danger" onClick={handlePanic} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            STOP ALL
          </button>
          <button className="btn" onClick={() => setShowSettings(true)} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚙️ Settings
          </button>
          <button className="btn" onClick={() => window.location.href = '/api/backup'} style={{ background: 'var(--primary)', border: '1px solid var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Backup
          </button>
          <button className="btn" onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </header>

      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>⚙️ System Settings (.env)</h2>
            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>YouTube Stream Key</label>
                <input type="password" value={config.YOUTUBE_STREAM_KEY || ''} onChange={(e) => setConfig({...config, YOUTUBE_STREAM_KEY: e.target.value})} className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>TikTok Stream Key</label>
                <input type="password" value={config.TIKTOK_STREAM_KEY || ''} onChange={(e) => setConfig({...config, TIKTOK_STREAM_KEY: e.target.value})} className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Video Bitrate (e.g. 3000k)</label>
                <input type="text" value={config.STREAM_BITRATE || ''} onChange={(e) => setConfig({...config, STREAM_BITRATE: e.target.value})} className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Hardware Encoder</label>
                <select value={config.HARDWARE_ENCODER || 'libx264'} onChange={(e) => setConfig({...config, HARDWARE_ENCODER: e.target.value})} className="input-field" style={{ background: '#111' }}>
                  <option value="libx264">CPU (libx264)</option>
                  <option value="h264_nvenc">NVIDIA GPU (h264_nvenc)</option>
                  <option value="h264_qsv">Intel QuickSync (h264_qsv)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Discord Webhook URL</label>
                <input type="url" value={config.DISCORD_WEBHOOK_URL || ''} onChange={(e) => setConfig({...config, DISCORD_WEBHOOK_URL: e.target.value})} className="input-field" />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" className="btn" onClick={() => setShowSettings(false)} style={{ background: '#333' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            id="file-upload"
          />
          <button className="btn btn-success" onClick={() => fileInputRef.current?.click()} disabled={isUploading} style={{ width: '100%', marginBottom: '20px' }}>
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Media Library</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
              {media.logo && (
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.9rem', color: '#ffc107' }}>🖼️ logo.png (Brand)</span>
                  <button style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleDeleteMedia('logo', 'logo.png')}>&times;</button>
                </li>
              )}
              {media.videos.map(v => (
                <li key={v} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.9rem' }}>🎥 {v}</span>
                  <button style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleDeleteMedia('video', v)}>&times;</button>
                </li>
              ))}
              {media.audio.map(a => (
                <li key={a} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.9rem', color: '#4caf50' }}>🎵 {a}</span>
                  <button style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleDeleteMedia('audio', a)}>&times;</button>
                </li>
              ))}
              {media.videos.length === 0 && !media.logo && media.audio.length === 0 && (
                <li style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Library kosong.</li>
              )}
            </ul>
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
