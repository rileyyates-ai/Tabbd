'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { TabbdLogo } from '@/components/Logo';

const C = { bg: '#0D0D0D', card: '#1A1A2E', green: '#39FF14', white: '#F0F0F5', sec: '#9CA3AF', border: 'rgba(255,255,255,0.08)' };

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [inviteCode, setInviteCode] = useState('');
  const [familyData, setFamilyData] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, color: C.white };

  const lookupCode = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { data, error } = await supabase.from('families').select('id, name').eq('invite_code', inviteCode.toUpperCase().trim()).single();
    if (error || !data) { setError('Invite code not found.'); setLoading(false); return; }
    setFamilyData(data); setStep(2); setLoading(false);
  };

  const handleJoin = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const parsedAge = parseInt(age);
      const role = !age ? 'parent' : parsedAge >= 13 ? 'teen' : 'kid';
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (authErr) throw authErr;
      const { error: profErr } = await supabase.from('profiles').insert({ id: authData.user.id, family_id: familyData.id, name, role, age: parsedAge || null });
      if (profErr) throw profErr;
      router.push('/dashboard'); router.refresh();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><Link href="/"><TabbdLogo size="default" /></Link><p className="text-sm mt-2" style={{ color: C.sec }}>{step === 1 ? 'Enter your family invite code' : `Joining ${familyData?.name}`}</p></div>
        <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          {step === 1 && (
            <form onSubmit={lookupCode} className="space-y-4">
              <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Invite code</label><input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} className="w-full px-3.5 py-3 rounded-lg text-center text-lg font-bold tracking-widest font-mono focus:outline-none" style={{ ...inputStyle, color: C.green }} placeholder="XXXXXX" maxLength={6} required /><p className="text-xs mt-2" style={{ color: C.sec }}>Ask a parent in your family for this code</p></div>
              {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#FF6B6B20', color: '#FF6B6B' }}>{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-2.5 text-sm font-bold rounded-lg disabled:opacity-50" style={{ background: C.green, color: '#0D0D0D' }}>{loading ? 'Looking up...' : 'Find my family'}</button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="rounded-lg p-3 text-center mb-2" style={{ background: C.green + '15', border: `1px solid ${C.green}30` }}><div className="text-sm font-semibold" style={{ color: C.green }}>Joining: {familyData?.name}</div></div>
              <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Your name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="Your first name" required /></div>
              <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="you@email.com" required /></div>
              <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="At least 8 characters" required minLength={8} /></div>
              <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Age (leave blank if parent)</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="Optional" min={1} max={99} /></div>
              {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#FF6B6B20', color: '#FF6B6B' }}>{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-2.5 text-sm font-bold rounded-lg disabled:opacity-50" style={{ background: C.green, color: '#0D0D0D' }}>{loading ? 'Joining...' : 'Join family'}</button>
            </form>
          )}
        </div>
        <div className="text-center mt-6 text-sm" style={{ color: C.sec }}>Want to create a new family? <Link href="/signup" className="font-semibold" style={{ color: C.green }}>Sign up</Link></div>
      </div>
    </div>
  );
}
