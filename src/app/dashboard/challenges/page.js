'use client';
import { useState, useEffect } from 'react';
import { useApp } from '../layout';
import { Card, Badge, TypeDot, Modal, Button, Label, Textarea, C, TYPE_COLORS, TYPE_LABELS, DIFF_COLORS } from '@/components/ui';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function ChallengesPage() {
  const { profile, supabase, members, flash, triggerLoot, refreshProfile } = useApp();
  const [chs, setChs] = useState([]);
  const [tab, setTab] = useState('active');
  const [modal, setModal] = useState(null);
  const [cTxt, setCTxt] = useState('');
  const [dTxt, setDTxt] = useState('');

  useEffect(() => { if (profile) load(); }, [profile]);
  const load = async () => { const { data } = await supabase.from('challenges').select('*').eq('to_user', profile.id).order('created_at', { ascending: false }); setChs(data || []); };
  const getName = (id) => members.find(m => m.id === id)?.name || 'Someone';
  const filtered = chs.filter(c => tab === 'active' ? c.status === 'active' : tab === 'pending' ? c.status === 'negotiate' : c.status === 'completed');
  const counts = { active: chs.filter(c => c.status === 'active').length, pending: chs.filter(c => c.status === 'negotiate').length, done: chs.filter(c => c.status === 'completed').length };

  const complete = async (ch) => {
    await supabase.from('challenges').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', ch.id);
    const nx = profile.xp + ch.xp; const lv = nx >= profile.xp_to_next;
    await supabase.from('profiles').update({ xp: lv ? nx - profile.xp_to_next : nx, coins: profile.coins + ch.coins, level: lv ? profile.level + 1 : profile.level, xp_to_next: lv ? profile.xp_to_next + 100 : profile.xp_to_next, completed_total: profile.completed_total + 1 }).eq('id', profile.id);
    await supabase.from('feed_events').insert({ family_id: profile.family_id, user_id: profile.id, event_type: 'complete', target_text: ch.title });
    triggerLoot(ch.difficulty); flash(lv ? `Level up!` : `+${ch.coins} coins`); setModal(null); await refreshProfile(); load();
  };
  const accept = async (ch) => { await supabase.from('challenges').update({ status: 'active', is_suggestion: false }).eq('id', ch.id); flash('Accepted'); setModal(null); load(); };
  const counter = async (ch) => { await supabase.from('challenges').update({ counter_offer: cTxt || 'Adjusted' }).eq('id', ch.id); flash('Counter sent'); setCTxt(''); setModal(null); load(); };
  const decline = async (ch) => { await supabase.from('challenges').update({ status: 'declined', decline_reason: dTxt }).eq('id', ch.id); flash('Declined'); setDTxt(''); setModal(null); load(); };

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div><h1 className="text-xl md:text-2xl font-bold tracking-tight">Challenges</h1><p className="text-sm mt-0.5" style={{ color: C.sec }}>{counts.active} active · {counts.done} completed</p></div>
        <Link href="/dashboard/create" className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: C.green, color: '#0D0D0D' }}>+ New</Link>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[['active', `Active ${counts.active}`], ['pending', `Pending ${counts.pending}`], ['done', `Done ${counts.done}`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition" style={{ background: tab === k ? C.green : C.card, color: tab === k ? '#0D0D0D' : C.sec, border: tab === k ? 'none' : `1px solid ${C.border}` }}>{l}</button>
        ))}
      </div>
      {filtered.map(ch => (
        <Card key={ch.id} onClick={() => setModal({ t: ch.status === 'negotiate' ? 'neg' : 'det', ch })}>
          <div className="flex items-center gap-2.5"><TypeDot type={ch.type} size={10} /><div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{ch.title}</div><div className="text-[11px] mt-0.5" style={{ color: C.sec }}>{ch.from_user !== profile.id ? `from ${getName(ch.from_user)}` : 'Self'} · {ch.due_date}</div></div>{ch.status === 'negotiate' && <MessageSquare size={14} style={{ color: C.blue }} />}</div>
          <div className="flex gap-1.5 mt-2.5"><Badge color={TYPE_COLORS[ch.type]}>{TYPE_LABELS[ch.type]}</Badge><Badge color={DIFF_COLORS[ch.difficulty]}>{ch.difficulty}</Badge><span className="ml-auto text-sm font-bold font-mono" style={{ color: ch.status === 'completed' ? C.green : C.gold }}>{ch.status === 'completed' ? '✓' : `+${ch.coins}`}</span></div>
        </Card>
      ))}
      {filtered.length === 0 && <div className="text-center py-16 text-sm" style={{ color: C.sec }}>Nothing here yet</div>}

      {modal?.t === 'det' && <Modal onClose={() => setModal(null)}><div className="flex items-center gap-2 mb-3"><TypeDot type={modal.ch.type} size={10} /><span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: C.sec }}>{TYPE_LABELS[modal.ch.type]}</span></div><div className="text-xl font-bold mb-3">{modal.ch.title}</div><div className="flex gap-2 flex-wrap mb-4"><Badge color={C.gold}>+{modal.ch.coins}</Badge><Badge color={C.mint}>+{modal.ch.xp} XP</Badge><Badge color={DIFF_COLORS[modal.ch.difficulty]}>{modal.ch.difficulty}</Badge></div><div className="flex justify-between text-sm py-3 mb-4" style={{ color: C.sec, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}><span>Due: {modal.ch.due_date}</span><span>{modal.ch.from_user !== profile.id ? `From ${getName(modal.ch.from_user)}` : 'Self'}</span></div>{modal.ch.status === 'active' && <Button onClick={() => complete(modal.ch)}>Mark complete</Button>}{modal.ch.status === 'completed' && <div className="text-center font-semibold" style={{ color: C.green }}>Completed</div>}</Modal>}
      {modal?.t === 'neg' && <Modal onClose={() => setModal(null)}><div className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: C.blue }}>Suggestion</div><div className="text-xl font-bold mb-1">{modal.ch.title}</div><div className="text-sm mb-5" style={{ color: C.sec }}>from {getName(modal.ch.from_user)} · +{modal.ch.coins} coins</div>{modal.ch.counter_offer ? <Card accent={C.blue}><div className="text-[11px] font-semibold mb-1" style={{ color: C.blue }}>Counter sent</div><div className="text-sm">{modal.ch.counter_offer}</div></Card> : <div className="flex gap-2"><Button onClick={() => accept(modal.ch)} full={false}>Accept</Button><Button onClick={() => setModal({ t: 'ctr', ch: modal.ch })} variant="accent" full={false}>Counter</Button><Button onClick={() => setModal({ t: 'dec', ch: modal.ch })} variant="ghost-danger" full={false}>Decline</Button></div>}</Modal>}
      {modal?.t === 'ctr' && <Modal onClose={() => setModal(null)}><div className="text-lg font-bold mb-4">Counter-offer</div><Label>Your proposal</Label><Textarea value={cTxt} onChange={e => setCTxt(e.target.value)} placeholder="e.g., How about 4 nights instead of 7?" style={{ minHeight: 100, marginBottom: 16 }} /><div className="flex gap-2"><Button onClick={() => counter(modal.ch)} variant="accent" full={false} disabled={!cTxt}>Send</Button><Button onClick={() => setModal({ t: 'neg', ch: modal.ch })} variant="ghost" full={false}>Back</Button></div></Modal>}
      {modal?.t === 'dec' && <Modal onClose={() => setModal(null)}><div className="text-lg font-bold mb-4">Decline</div><Label>Reason</Label><Textarea value={dTxt} onChange={e => setDTxt(e.target.value)} placeholder="Let them know why" style={{ minHeight: 100, marginBottom: 16 }} /><div className="flex gap-2"><Button onClick={() => decline(modal.ch)} variant="danger" full={false}>Decline</Button><Button onClick={() => setModal({ t: 'neg', ch: modal.ch })} variant="ghost" full={false}>Back</Button></div></Modal>}
    </div>
  );
}
