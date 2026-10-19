import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext';

// One component serves both /login and /signup, since they are almost the same form.
export default function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { user, loading, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={from} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && !name.trim()) return setError('Please enter your name.');
    if (!email.trim()) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setBusy(true);
    try {
      if (mode === 'signup') await signup(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-side">
        <h1>Retain</h1>
        <p>Know where your money went this month, and keep what you planned to keep.</p>
      </div>
      <form className="auth-form form" onSubmit={handleSubmit} noValidate>
        <h2>{mode === 'login' ? 'Sign in' : 'Create your account'}</h2>
        {error && <p className="notice notice-error" role="alert">{error}</p>}

        {mode === 'signup' && (
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="switch">
          {mode === 'login' ? (
            <>New here? <Link to="/signup">Create an account</Link></>
          ) : (
            <>Already have an account? <Link to="/login">Sign in</Link></>
          )}
        </p>
      </form>
    </div>
  );
}
