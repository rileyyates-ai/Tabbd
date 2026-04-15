'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

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

  const lookupCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('families')
      .select('id, name')
      .eq('invite_code', inviteCode.toUpperCase().trim())
      .single();

    if (error || !data) {
      setError('Invite code not found. Check the code and try again.');
      setLoading(false);
      return;
    }

    setFamilyData(data);
    setStep(2);
    setLoading(false);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parsedAge = parseInt(age);
      const role = !age ? 'parent' : parsedAge >= 13 ? 'teen' : 'kid';

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (authError) throw authError;

      // 2. Create profile linked to the family
      const { error: profError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          family_id: familyData.id,
          name,
          role,
          age: parsedAge || null,
        });
      if (profError) throw profError;

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold tracking-tight">Tabbd</Link>
          <p className="text-gray-500 text-sm mt-2">
            {step === 1 ? 'Enter your family invite code' : `Joining ${familyData?.name}`}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {step === 1 && (
            <form onSubmit={lookupCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Invite code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-center text-lg font-bold tracking-widest focus:outline-none focus:border-blue-500"
                  placeholder="XXXXXX"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-400 mt-2">Ask a parent in your family for this code</p>
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? 'Looking up...' : 'Find my family'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center mb-2">
                <div className="text-sm font-semibold text-blue-700">Joining: {familyData?.name}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Your name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Your first name" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="you@email.com" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="At least 8 characters" required minLength={8} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Age (leave blank if parent)</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Optional" min={1} max={99} />
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? 'Joining...' : 'Join family'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          Want to create a new family? <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
