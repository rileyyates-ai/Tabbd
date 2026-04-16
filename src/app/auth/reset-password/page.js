'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

const C = { bg: '#0D0D0D', card: '#1A1A2E', green: '#39FF14', white: '#F0F0F5', sec: '#9CA3AF', border: 'rgba(255,255,255,0.08)' };

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, color: C.white };

  const handleReset = async (e) => {
    e.preventDefault(); setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message); else { setSuccess(true); setTimeout(() => router.push('/dashboard'), 2000); }
    setLoading(false);
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <div className="w-full max-w-sm text-center"><div className="text-3xl mb-4">✓</div><h1 className="text-xl font-bold mb-2" style={{ color: C.white }}>Password updated</h1><p className="text-sm" style={{ color: C.sec }}>Redirecting...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><Link href="/" className="text-xl font-bold tracking-tight" style={{ color: C.white }}>TABBD</Link><p className="text-sm mt-2" style={{ color: C.sec }}>Set your new password</p></div>
        <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <form onSubmit={handleReset} className="space-y-4">
            <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>New password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="At least 8 characters" required minLength={8} /></div>
            <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Confirm</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="Type it again" required /></div>
            {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#FF6B6B20', color: '#FF6B6B' }}>{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-2.5 text-sm font-bold rounded-lg disabled:opacity-50" style={{ background: C.green, color: '#0D0D0D' }}>{loading ? 'Updating...' : 'Update password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
