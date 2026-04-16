'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { TabbdLogo } from '@/components/Logo';

const C = { bg: '#0D0D0D', card: '#1A1A2E', green: '#39FF14', white: '#F0F0F5', sec: '#9CA3AF', border: 'rgba(255,255,255,0.08)' };

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const genCode = () => { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let r = ''; for (let i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)]; return r; };
  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, color: C.white };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true); setError(null);
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (authErr) throw authErr;
      const code = genCode();
      const { data: family, error: famErr } = await supabase.from('families').insert({ name: familyName, invite_code: code }).select().single();
      if (famErr) throw famErr;
      const { error: profErr } = await supabase.from('profiles').insert({ id: authData.user.id, family_id: family.id, name, role: 'parent' });
      if (profErr) throw profErr;
      setInviteCode(code); setStep(3);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (step === 3) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: C.white }}>Family created!</h1>
        <p className="text-sm mb-8" style={{ color: C.sec }}>Share this invite code with your family:</p>
        <div className="rounded-xl p-6 mb-6 animate-glow" style={{ background: C.card, border: `2px solid ${C.green}` }}>
          <div className="text-3xl font-bold tracking-widest font-mono" style={{ color: C.green }}>{inviteCode}</div>
        </div>
        <p className="text-xs mb-8" style={{ color: C.sec }}>Text it, say it out loud, or write it on the fridge</p>
        <button onClick={() => { router.push('/dashboard'); router.refresh(); }} className="w-full py-2.5 text-sm font-bold rounded-lg" style={{ background: C.green, color: '#0D0D0D' }}>Go to dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><Link href="/"><TabbdLogo size="default" /></Link><p className="text-sm mt-2" style={{ color: C.sec }}>{step === 1 ? 'Create your account' : 'Name your family'}</p></div>
        <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <form onSubmit={handleSignup} className="space-y-4">
            {step === 1 && (<>
              <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Your name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="Your first name" required /></div>
              <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="you@email.com" required /></div>
              <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="At least 8 characters" required minLength={8} /></div>
            </>)}
            {step === 2 && (
              <div><label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>Family name</label><input type="text" value={familyName} onChange={e => setFamilyName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder='e.g., "The Johnsons"' required /><p className="text-xs mt-2" style={{ color: C.sec }}>This is what your family sees in the app</p></div>
            )}
            {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#FF6B6B20', color: '#FF6B6B' }}>{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-2.5 text-sm font-bold rounded-lg disabled:opacity-50" style={{ background: C.green, color: '#0D0D0D' }}>{loading ? 'Creating...' : step === 1 ? 'Next' : 'Create family'}</button>
          </form>
        </div>
        <div className="text-center mt-6 text-sm" style={{ color: C.sec }}>Already have an account? <Link href="/login" className="font-semibold" style={{ color: C.green }}>Log in</Link></div>
      </div>
    </div>
  );
}
