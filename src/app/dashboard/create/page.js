'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Eye, EyeOff } from 'lucide-react';

export default function CreateChallengePage() {
  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'home', to: '', diff: 'Medium', coins: 15, due: '', visible: true, recurring: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      const { data: mems } = await supabase.from('profiles').select('*').eq('family_id', prof.family_id);
      setMembers(mems || []);
    };
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.to) return;
    setLoading(true);
    setError(null);

    const isP = profile.role === 'parent';
    const isSelf = form.to === profile.id;
    const targetMember = members.find(m => m.id === form.to);
    const isSp = isP && targetMember?.role === 'parent' && form.to !== profile.id;
    const isSugg = !isP && !isSelf;
    const needsApproval = !isP && !isSelf && targetMember?.role !== 'parent';
    const status = needsApproval ? 'pending_approval' : (isSugg || isSp) ? 'negotiate' : 'active';

    const { error: err } = await supabase.from('challenges').insert({
      family_id: profile.family_id,
      title: form.title,
      type: form.type,
      from_user: profile.id,
      to_user: form.to,
      difficulty: form.diff,
      coins: form.coins,
      xp: Math.round(form.coins * 1.3),
      status,
      due_date: form.due || 'This week',
      is_suggestion: isSugg || isSp,
      visible_to_kids: form.visible,
      recurring: form.recurring,
      needs_parent_approval: needsApproval,
    });

    if (err) { setError(err.message); setLoading(false); return; }

    await supabase.from('feed_events').insert({
      family_id: profile.family_id,
      user_id: profile.id,
      event_type: 'suggest',
      target_text: form.title,
      target_user: form.to,
    });

    router.push('/dashboard/challenges');
  };

  if (!profile) return <div className="text-gray-400 text-sm py-20 text-center">Loading...</div>;

  const isP = profile.role === 'parent';
  const isSelf = form.to === profile.id;
  const targetMember = members.find(m => m.id === form.to);
  const isSp = isP && targetMember?.role === 'parent' && form.to !== profile.id;
  const isAssign = isP && form.to && !isSelf && !isSp;
  const needsA = !isP && form.to && !isSelf && targetMember?.role !== 'parent';
  const isSugg = !isP && form.to && !isSelf && targetMember?.role === 'parent';
  const typeColor = { home: '#D97706', growth: '#059669', personal: '#0066FF' };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">New challenge</h1>
      <div className="max-w-lg">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">What's the challenge?</label>
        <input className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 mb-5" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Clean the garage, Read 2 chapters" />

        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Challenge for</label>
        <div className="flex gap-2 flex-wrap mb-1">
          {members.map(m => (
            <button key={m.id} onClick={() => setForm(p => ({ ...p, to: m.id }))} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${form.to === m.id ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200 bg-white'}`}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: (m.avatar_color || '#0066FF') + '15', color: m.avatar_color || '#0066FF' }}>{m.name?.charAt(0)}</div>
              {m.id === profile.id ? 'Myself' : m.name}
            </button>
          ))}
        </div>
        {needsA && <p className="text-xs text-amber-600 font-medium mb-4">Requires parent approval before assignment</p>}
        {isSugg && <p className="text-xs text-blue-600 font-medium mb-4">Sent as a suggestion with negotiation</p>}
        {isSp && <p className="text-xs text-blue-600 font-medium mb-4">They can accept, counter, or decline</p>}
        {isAssign && <p className="text-xs text-green-600 font-medium mb-4">Will be directly assigned</p>}
        {!form.to && <div className="h-5 mb-4" />}

        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
        <div className="flex gap-2 mb-5">
          {[['home', 'Home'], ['growth', 'Growth'], ['personal', 'Personal']].map(([k, v]) => (
            <button key={k} onClick={() => setForm(p => ({ ...p, type: k }))} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5" style={{ background: form.type === k ? typeColor[k] : 'white', color: form.type === k ? 'white' : '#6B7280', border: form.type === k ? 'none' : '1px solid #E5E7EB' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: form.type === k ? 'white' : typeColor[k] }} />{v}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Difficulty</label>
            <select value={form.diff} onChange={e => setForm(p => ({ ...p, diff: e.target.value, coins: { Easy: 10, Medium: 15, Hard: 25, Epic: 40 }[e.target.value] }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
              <option>Easy</option><option>Medium</option><option>Hard</option><option>Epic</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Coins</label>
            <input type="number" value={form.coins} onChange={e => setForm(p => ({ ...p, coins: parseInt(e.target.value) || 0 }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Due</label>
            <input value={form.due} onChange={e => setForm(p => ({ ...p, due: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="Friday..." />
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
            <input type="checkbox" checked={form.recurring} onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))} className="accent-blue-600" /> Recurring
          </label>
          {isP && isSp && (
            <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
              <input type="checkbox" checked={form.visible} onChange={e => setForm(p => ({ ...p, visible: e.target.checked }))} className="accent-blue-600" />
              {form.visible ? <><Eye size={13} /> Visible to kids</> : <><EyeOff size={13} /> Private</>}
            </label>
          )}
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</div>}

        <button onClick={handleCreate} disabled={!form.title || !form.to || loading} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-40">
          {loading ? 'Creating...' : isAssign ? 'Assign challenge' : isSelf ? 'Set self-challenge' : needsA ? 'Send for approval' : 'Send suggestion'}
        </button>
      </div>
    </div>
  );
}
