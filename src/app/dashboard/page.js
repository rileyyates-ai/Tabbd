'use client';
import { useState, useEffect } from 'react';
import { useApp } from './layout';
import { Avatar, Card, Badge, TypeDot, XPBar, StatCard, Modal, Button, C, TYPE_COLORS, DIFF_COLORS } from '@/components/ui';
import { Flame, Star, TrendingUp, Check, Shield, MessageSquare, ChevronRight, ShieldCheck } from 'lucide-react';

export default function DashboardHome() {
  const { profile, supabase, members, flash, triggerLoot, refreshProfile, isParent, fStreak } = useApp();
  const [challenges, setChallenges] = useState([]);
  const [pending, setPending] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [feed, setFeed] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => { if (profile) loadData(); }, [profile]);

  const loadData = async () => {
    const { data: a } = await supabase.from('challenges').select('*').eq('to_user', profile.id).eq('status', 'active').order('created_at', { ascending: false });
    setChallenges(a || []);
    const { data: p } = await supabase.from('challenges').select('*').eq('to_user', profile.id).eq('status', 'negotiate');
    setPending(p || []);
    if (isParent) { const { data: ap } = await supabase.from('challenges').select('*').eq('family_id', profile.family_id).eq('status', 'pending_approval'); setApprovals(ap || []); }
    const { data: f } = await supabase.from('feed_events').select('*').eq('family_id', profile.family_id).order('created_at', { ascending: false }).limit(5);
    setFeed(f || []);
  };

  const complete = async (ch) => {
    await supabase.from('challenges').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', ch.id);
    const nx = profile.xp + ch.xp; const lv = nx >= profile.xp_to_next;
    await supabase.from('profiles').update({ xp: lv ? nx - profile.xp_to_next : nx, coins: profile.coins + ch.coins, level: lv ? profile.level + 1 : profile.level, xp_to_next: lv ? profile.xp_to_next + 100 : profile.xp_to_next, completed_total: profile.completed_total + 1 }).eq('id', profile.id);
    await supabase.from('feed_events').insert({ family_id: profile.family_id, user_id: profile.id, event_type: 'complete', target_text: ch.title });
    const bonus = triggerLoot(ch.difficulty);
    if (bonus > 0) await supabase.from('profiles').update({ coins: profile.coins + ch.coins + bonus }).eq('id', profile.id);
    flash(lv ? `Level up! Level ${profile.level + 1}` : `+${ch.coins} coins, +${ch.xp} XP`);
    setModal(null); await refreshProfile(); loadData();
  };

  const acceptCh = async (ch) => { await supabase.from('challenges').update({ status: 'active', is_suggestion: false }).eq('id', ch.id); flash('Accepted'); setModal(null); loadData(); };
  const approveCh = async (ch) => { await supabase.from('challenges').update({ status: 'active', needs_parent_approval: false }).eq('id', ch.id); flash('Approved'); setModal(null); loadData(); };
  const activateShield = async () => { await supabase.from('profiles').update({ shield_used: true }).eq('id', profile.id); await refreshProfile(); flash('Shield activated'); };
  const getName = (id) => members.find(m => m.id === id)?.name || 'Someone';

  if (!profile) return null;

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Welcome back, {profile.name}</h1>
      <p className="text-sm mt-0.5 mb-5" style={{ color: C.sec }}>{isParent ? 'Parent' : 'Age ' + profile.age} · Level {profile.level} · {profile.streak}-day streak</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
        <StatCard label="Streak" value={profile.streak} unit="days" icon={<Flame size={14} />} color={C.coral} />
        <StatCard label="Coins" value={profile.coins} unit="" icon={<Star size={14} />} color={C.gold} />
        <StatCard label="Level" value={profile.level} unit="" icon={<TrendingUp size={14} />} color={C.green} />
        <StatCard label="Done" value={profile.completed_total} unit="total" icon={<Check size={14} />} color={C.mint} />
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] w-16 font-mono" style={{ color: C.sec }}>{profile.xp}/{profile.xp_to_next}</span>
        <XPBar value={profile.xp} max={profile.xp_to_next} height={5} />
        <span className="text-[11px] font-semibold" style={{ color: C.green }}>Lv.{profile.level}</span>
      </div>
      <div className="flex items-center gap-1.5 mb-6">
        <Shield size={13} style={{ color: profile.shield_used ? C.sec : C.mint }} />
        <span className="text-[11px] font-medium" style={{ color: profile.shield_used ? C.sec : C.mint }}>Shield: {profile.shield_used ? 'Used' : 'Available'}</span>
        {!profile.shield_used && <button onClick={activateShield} className="text-[11px] font-semibold ml-1" style={{ color: C.green }}>Activate</button>}
      </div>

      {pending.length > 0 && <><h2 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.sec }}>Incoming</h2>{pending.map(ch => <Card key={ch.id} onClick={() => setModal({ t: 'neg', ch })} accent={C.blue}><div className="flex items-center gap-2.5"><MessageSquare size={16} style={{ color: C.blue }} /><div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{ch.title}</div><div className="text-[11px]" style={{ color: C.sec }}>{ch.due_date}</div></div><ChevronRight size={16} style={{ color: C.sec }} /></div></Card>)}</>}

      {isParent && approvals.length > 0 && <>{approvals.map(ch => <Card key={ch.id} onClick={() => setModal({ t: 'appr', ch })} accent={C.gold}><div className="flex items-center gap-2.5"><ShieldCheck size={16} style={{ color: C.gold }} /><div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{getName(ch.from_user)} → {getName(ch.to_user)}</div><div className="text-[11px]" style={{ color: C.sec }}>{ch.title}</div></div></div></Card>)}</>}

      <h2 className="text-[11px] font-semibold uppercase tracking-wider mb-2 mt-4" style={{ color: C.sec }}>Active ({challenges.length})</h2>
      {challenges.map(ch => <Card key={ch.id} onClick={() => setModal({ t: 'det', ch })}><div className="flex items-center gap-2.5"><TypeDot type={ch.type} /><div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{ch.title}</div><div className="text-[11px] mt-0.5" style={{ color: C.sec }}>{ch.due_date} · {ch.difficulty}</div></div><span className="text-sm font-bold font-mono" style={{ color: C.green }}>+{ch.coins}</span></div></Card>)}
      {challenges.length === 0 && <div className="text-center py-12" style={{ color: C.sec }}><Check size={28} strokeWidth={1.5} className="mx-auto mb-2" /><div className="text-sm font-semibold" style={{ color: C.white }}>All clear</div></div>}

      <h2 className="text-[11px] font-semibold uppercase tracking-wider mb-2 mt-6" style={{ color: C.sec }}>Family</h2>
      <Card>{members.map((m, i) => <div key={m.id} className="flex items-center gap-2.5 py-2" style={{ borderBottom: i < members.length - 1 ? `1px solid ${C.border}` : 'none' }}><Avatar name={m.name} color={m.avatar_color} size={28} /><span className="text-sm font-medium flex-1 truncate">{m.name}</span><span className="text-[11px] font-mono" style={{ color: C.sec }}>{m.streak}d</span><XPBar value={m.xp} max={m.xp_to_next} color={m.avatar_color} height={3} /><span className="text-xs font-semibold ml-2">Lv.{m.level}</span></div>)}</Card>

      {modal?.t === 'det' && <Modal onClose={() => setModal(null)}><div className="flex items-center gap-2 mb-3"><TypeDot type={modal.ch.type} size={10} /><span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: C.sec }}>{modal.ch.type} challenge</span></div><div className="text-xl font-bold mb-3">{modal.ch.title}</div><div className="flex gap-2 flex-wrap mb-4"><Badge color={C.gold}>+{modal.ch.coins}</Badge><Badge color={C.mint}>+{modal.ch.xp} XP</Badge><Badge color={DIFF_COLORS[modal.ch.difficulty]}>{modal.ch.difficulty}</Badge></div><div className="flex justify-between text-sm py-3 mb-4" style={{ color: C.sec, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}><span>Due: {modal.ch.due_date}</span><span>{modal.ch.from_user !== profile.id ? `From ${getName(modal.ch.from_user)}` : 'Self'}</span></div>{modal.ch.status === 'active' && <Button onClick={() => complete(modal.ch)} variant="primary">Mark complete</Button>}{modal.ch.status === 'completed' && <div className="text-center font-semibold" style={{ color: C.green }}>Completed</div>}</Modal>}
      {modal?.t === 'neg' && <Modal onClose={() => setModal(null)}><div className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: C.blue }}>Suggestion</div><div className="text-xl font-bold mb-1">{modal.ch.title}</div><div className="text-sm mb-5" style={{ color: C.sec }}>from {getName(modal.ch.from_user)} · +{modal.ch.coins} coins</div><div className="flex gap-2"><Button onClick={() => acceptCh(modal.ch)} variant="primary" full={false}>Accept</Button><Button onClick={() => setModal(null)} variant="ghost" full={false}>Later</Button></div></Modal>}
      {modal?.t === 'appr' && <Modal onClose={() => setModal(null)}><div className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: C.gold }}>Needs approval</div><div className="text-xl font-bold mb-1">{modal.ch.title}</div><div className="text-sm mb-5" style={{ color: C.sec }}>{getName(modal.ch.from_user)} → {getName(modal.ch.to_user)}</div><div className="flex gap-2"><Button onClick={() => approveCh(modal.ch)} variant="primary" full={false}>Approve</Button><Button onClick={async () => { await supabase.from('challenges').update({ status: 'declined' }).eq('id', modal.ch.id); setModal(null); flash('Rejected'); loadData(); }} variant="ghost-danger" full={false}>Reject</Button></div></Modal>}
    </div>
  );
}
