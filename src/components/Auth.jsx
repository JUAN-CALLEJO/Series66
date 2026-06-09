import { useState } from 'react';
import { X, Mail, Lock, User, LogIn, Cloud, CloudOff } from 'lucide-react';
import { useApp } from '../context/AppData.jsx';

export function AuthModal({ open, onClose }) {
  const { login, register, online } = useApp();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, name);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        <div className="auth-head">
          <div className="mark">66</div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="muted">
            {mode === 'login'
              ? 'Sign in to sync your progress and exam results across devices.'
              : 'Save your progress, results, and study plan to the cloud.'}
          </p>
        </div>

        {!online && (
          <div className="auth-offline">
            <CloudOff size={15} /> Backend not detected — accounts are unavailable right now. You can still study; progress is saved on this device.
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <label className="field">
              <User size={15} />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" autoComplete="name" />
            </label>
          )}
          <label className="field">
            <Mail size={15} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required />
          </label>
          <label className="field">
            <Lock size={15} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (6+ chars)" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn" type="submit" disabled={busy || !online} style={{ width: '100%', marginTop: 4 }}>
            <LogIn size={15} /> {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>New here? <button onClick={() => { setMode('register'); setError(''); }}>Create an account</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          )}
        </div>

        <div className="auth-foot"><Cloud size={13} /> Your data is stored privately and never shared.</div>
      </div>
    </div>
  );
}
