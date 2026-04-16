'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../layout';
import { Avatar, Label, Input, Button, TypeDot, C, TYPE_COLORS } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';

export default function CreateChallengePage() {
  const { profile, supabase, members, flash, isParent } = useApp();
  const [form, setForm] = useState({ title: '', type: 'home', to: '', diff: 'Medium', coins: 15, due: '', visible: true, recurring: false });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!form.title || !form.to) return; setLoading(true);
    const isSelf = form.to === profile.id;
    const target = members.find(m => m.id === form.to);
    const isSp = isParent && target?.role === 'parent' && !isSelf;
    const isSugg = !isParent && !isSelf;
    const needsA = !isParent && !isSelf && target?.role !== 'parent';
    const status = needsA ? 'pending_approval' : (isSugg || isSp) ? 'negotiate' : 'active';
    await supabase.from('challenges').insert({ family_id: profile.family_id, title: form.title, type: form.type, from_user: profile.id, to_user: form.to, difficulty: form.diff, coins: form.coins, xp: Math.round(form.coins * 1.3), status, due_date: form.due || 'This week', is_suggestion: isSugg || isSp, visible_to_kids: form.visible, recurring: form.recurring, needs_parent_approval: needsA });
    await supabase.from('feed_events').insert({ family_id: profile.family_id, user_id: profile.id, event_type: 'suggest', target_text: form.title, target_user: form.to });
    flash(needsA ? 'Sent for approval' : isSugg || isSp ? 'Suggestion sent' : 'Assigned');
    router.push('/dashboard/challenges');
  };

  if (!profile) return null;
  const isSelf = form.to === profile.id;
  const target = members.find(m => m.id === form.to);
  const isSp = isParent && target?.role === 'parent' && !isSelf;
  const isAsgn = isParent && form.to && !isSelf && !isSp;
  const needsA = !isParent && form.to && !isSelf && target?.role !== 'parent';
  const isSugg = !isParent && form.to && !isSelf && target?.role === 'parent';

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-5">New challenge</h1>
      <div className="max-w-lg">
        <Label>What's the challenge?</Label>
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Clean the garage, Read 2 chapters" className="mb-5" />
        <Label>Challenge for</Label>
        <div className="flex gap-2 flex-wrap mb-1">
          {members.map(m => <button key={m.id} onClick={() => setForm(p => ({ ...p, to: m.id }))} className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition" style={{ border: form.to === m.id ? `2px solid ${C.green}` : `1px solid ${C.border}`, background: form.to === m.id ? C.green + '15' : C.card, color: C.white }}><Avatar name={m.name} color={m.avatar_color} size={22} />{m.id === profile.id ? 'Myself' : m.name}</button>)}
        </div>
        <div className="h-5 mb-3">
          {needsA && <p className="text-[11px] font-medium" style={{ color: C.gold }}>Requires parent approval</p>}
          {isSugg && <p className="text-[11px] font-medium" style={{ color: C.blue }}>Sent as a suggestion</p>}
          {isSp && <p className="text-[11px] font-medium" style={{ color: C.blue }}>They can accept, counter, or decline</p>}
          {isAsgn && <p className="text-[11px] font-medium" style={{ color: C.green }}>Directly assigned</p>}
        </div>
        <Label>Type</Label>
        <div className="flex gap-2 mb-5">
          {[['home', 'Home'], ['growth', 'Growth'], ['personal', 'Personal']].map(([k, v]) => <button key={k} onClick={() => setForm(p => ({ ...p, type: k }))} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5" style={{ background: form.type === k ? TYPE_COLORS[k] : C.card, color: form.type === k ? '#0D0D0D' : C.sec, border: form.type === k ? 'none' : `1px solid ${C.border}` }}><TypeDot type={k} size={6} />{v}</button>)}
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div><Label>Difficulty</Label><select value={form.diff} onChange={e => setForm(p => ({ ...p, diff: e.target.value, coins: { Easy: 10, Medium: 15, Hard: 25, Epic: 40 }[e.target.value] }))} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"><option>Easy</option><option>Medium</option><option>Hard</option><option>Epic</option></select></div>
          <div><Label>Coins</Label><Input type="number" value={form.coins} onChange={e => setForm(p => ({ ...p, coins: parseInt(e.target.value) || 0 }))} /></div>
          <div><Label>Due</Label><Input value={form.due} onChange={e => setForm(p => ({ ...p, due: e.target.value }))} placeholder="Friday..." /></div>
        </div>
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: C.sec }}><input type="checkbox" checked={form.recurring} onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))} style={{ accentColor: C.green }} /> Recurring</label>
          {isParent && isSp && <label className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: C.sec }}><input type="checkbox" checked={form.visible} onChange={e => setForm(p => ({ ...p, visible: e.target.checked }))} style={{ accentColor: C.green }} />{form.visible ? <><Eye size={13} /> Visible</> : <><EyeOff size={13} /> Private</>}</label>}
        </div>
        <Button onClick={handleCreate} disabled={!form.title || !form.to || loading} full={false}>{loading ? 'Creating...' : isAsgn ? 'Assign challenge' : isSelf ? 'Set self-challenge' : needsA ? 'Send for approval' : 'Send suggestion'}</Button>
      </div>
    </div>
  );
}
