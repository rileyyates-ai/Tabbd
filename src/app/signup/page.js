'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

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

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }

    setLoading(true);
    setError(null);

    try {
      // 1. Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (authError) throw authError;

      // 2. Create the family
      const code = generateInviteCode();
      const { data: family, error: famError } = await supabase
        .from('families')
        .insert({ name: familyName, invite_code: code })
        .select()
        .single();
      if (famError) throw famError;

      // 3. Create the profile
      const { error: profError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          family_id: family.id,
          name,
          role: 'parent',
        });
      if (profError) throw profError;

      setInviteCode(code);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">Family created!</h1>
          <p className="text-gray-500 text-sm mb-8">Share this invite code with your family so they can join:</p>
          <div className="bg-white border-2 border-blue-500 rounded-xl p-6 mb-6">
            <div className="text-3xl font-bold tracking-widest text-blue-600">{inviteCode}</div>
          </div>
          <p className="text-xs text-gray-400 mb-8">Text it, say it out loud, or write it on the fridge</p>
          <button
            onClick={() => { router.push('/dashboard'); router.refresh(); }}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold tracking-tight">Tabbd</Link>
          <p className="text-gray-500 text-sm mt-2">{step === 1 ? 'Create your account' : 'Name your family'}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSignup} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Your name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Marcus" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="you@email.com" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="At least 8 characters" required minLength={8} />
                </div>
              </>
            )}
            {step === 2 && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Family name</label>
                <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder='e.g., "The Johnsons"' required />
                <p className="text-xs text-gray-400 mt-2">This is what your family sees in the app</p>
              </div>
            )}

            {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Creating...' : step === 1 ? 'Next' : 'Create family'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
