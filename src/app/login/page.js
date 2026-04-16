'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

const C = { bg: '#0D0D0D', card: '#1A1A2E', green: '#39FF14', white: '#F0F0F5', sec: '#9CA3AF', border: 'rgba(255,255,255,0.08)' };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); } else { router.push('/dashboard'); router.refresh(); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) { setError('Enter your email'); return; }
    setLoading(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` });
    if (error) setError(error.message); else setResetSent(true);
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) setError(error.message);
  };

  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, color: C.white };

  if (resetSent) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <div className="w-full max-w-sm text-center">
        <div className="text-3xl mb-4">📧</div>
        <h1 className="text-xl font-bold mb-2" style={{ color: C.white }}>Check your email</h1>
        <p className="text-sm mb-6" style={{ color: C.sec }}>We sent a reset link to <strong>{email}</strong>.</p>
        <button onClick={() => { setMode('login'); setResetSent(false); }} className="text-sm font-semibold" style={{ color: C.green }}>Back to login</button>
      </div>
    </div>
  );

  if (mode === 'forgot') return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><Link href="/" className="text-xl font-bold tracking-tight" style={{ color: C.white }}>TABBD</Link><p className="text-sm mt-2" style={{ color: C.sec }}>Reset your password</p></div>
        <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-sm mb-4" style={{ color: C.sec }}>Enter your email and we'll send you a reset link.</p>
          <form onSubmit={handleForgot} className="space-y-4">
            <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="you@email.com" required /></div>
            {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#FF6B6B20', color: '#FF6B6B' }}>{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-2.5 text-sm font-bold rounded-lg disabled:opacity-50" style={{ background: C.green, color: '#0D0D0D' }}>{loading ? 'Sending...' : 'Send reset link'}</button>
          </form>
        </div>
        <div className="text-center mt-6"><button onClick={() => { setMode('login'); setError(null); }} className="text-sm font-semibold" style={{ color: C.green }}>Back to login</button></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><Link href="/" className="text-xl font-bold tracking-tight" style={{ color: C.white }}>TABBD</Link><p className="text-sm mt-2" style={{ color: C.sec }}>Welcome back</p></div>
        <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="you@email.com" required /></div>
            <div>
              <div className="flex justify-between items-center mb-1.5"><label className="block text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.sec }}>Password</label><button type="button" onClick={() => { setMode('forgot'); setError(null); }} className="text-[11px] font-medium" style={{ color: C.green }}>Forgot password?</button></div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="••••••••" required minLength={8} />
            </div>
            {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#FF6B6B20', color: '#FF6B6B' }}>{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-2.5 text-sm font-bold rounded-lg disabled:opacity-50" style={{ background: C.green, color: '#0D0D0D' }}>{loading ? 'Logging in...' : 'Log in'}</button>
          </form>
          <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px" style={{ background: C.border }} /><span className="text-xs" style={{ color: C.sec }}>or</span><div className="flex-1 h-px" style={{ background: C.border }} /></div>
          <button onClick={handleGoogle} className="w-full py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2" style={{ border: `1px solid ${C.border}`, color: C.white }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>
        <div className="text-center mt-6 text-sm" style={{ color: C.sec }}>
          Don't have an account? <Link href="/signup" className="font-semibold" style={{ color: C.green }}>Create a family</Link><br />
          <Link href="/join" className="font-semibold mt-1 inline-block" style={{ color: C.green }}>Join with invite code</Link>
        </div>
      </div>
    </div>
  );
}
