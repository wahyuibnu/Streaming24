'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className={`glass-panel ${styles.card} fade-in`} style={{ maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h1 className={styles.logo} style={{ fontSize: '1.8rem', justifyContent: 'center' }}>HANTHU STREAM24</h1>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Admin Authentication</p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.formGroup}>
            <label>Master Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
