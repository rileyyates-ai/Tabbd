'use client';

import { useState, useEffect } from 'react';
import { useApp } from './layout';
import { Avatar, Card, Badge, TypeDot, XPBar, StatCard, Modal, Button, TYPE_COLORS, DIFF_COLORS } from '@/components/ui';
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
    const { data: active } = await supabase.from('challenges').select('*').eq('to_user', profile.id).eq('status', 'active').order('created_at', { ascending: false });
    setChallenges(active || []);
    const { data: pen } = await supabase.from('challenges').select('*').eq('to_user', profile.id).eq('status', 'negotiate');
    setPending(pen || []);
    if (isParent) {
      const { data: appr } = await supabase.from('challenges').select('*').eq('family_id', profile.family_id).eq('status', 'pending_approval');
      setApprovals(appr || []);
    }
    const { data: fd } = await supabase.from('feed_events').select('*').eq('family_id', profile.family_id).order('created_at', { ascending: false }).limit(5);
    setFeed(fd || []);
  };

  const complete = async (ch) => {
    await supabase.from('challenges').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', ch.id);
    const newXp = profile.xp + ch.xp;
    const leveledUp = newXp >= profile.xp_to_next;
    await supabase.from('profiles').update({
      xp: leveledUp ? newXp - profile.xp_to_next : newXp,
      coins: profile.coins + ch.coins,
      level: leveledUp ? profile.level + 1 : profile.level,
      xp_to_next: leveledUp ? profile.xp_to_next + 100 : profile.xp_to_next,
      completed_total: profile.completed_total + 1,
    }).eq('id', profile.id);
    await supabase.from('feed_events').insert({ family_id: profile.family_id, user_id: profile.id, event_type: 'complete', target_text: ch.title });
    const bonus = triggerLoot(ch.difficulty);
    if (bonus > 0) {
      await supabase.from('profiles').update({ coins: profile.coins + ch.coins + bonus }).eq('id', profile.id);
    }
    flash(leveledUp ? `Level up! Level ${profile.level + 1}` : `+${ch.coins} coins, +${ch.xp} XP`);
    setModal(null);
    await refreshProfile();
    loadData();
  };

  const acceptChallenge = async (ch) => {
    await supabase.from('challenges').update({ status: 'active', is_suggestion: false }).eq('id', ch.id);
    flash('Challenge accepted');
    setModal(null);
    loadData();
  };

  const approveChallenge = async (ch) => {
    await supabase.from('challenges').update({ status: 'active', needs_parent_approval: false }).eq('id', ch.id);
    flash('Approved');
    setModal(null);
    loadData();
  };

  const activateShield = async () => {
    await supabase.from('profiles').update({ shield_used: true }).eq('id', profile.id);
    await refreshProfile();
    flash('Shield activated');
  };

  const getName = (id) => members.find(m => m.id === id)?.name || 'Someone';

  if (!profile) return null;

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Welcome back, {profile.name}</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">{isParent ? 'Parent' : 'Age ' + profile.age} · Level {profile.level} · {profile.streak}-day streak</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
        <StatCard label="Streak" value={profile.streak} unit="days" icon={<Flame size={14} />} color="#DC2626" />
        <StatCard label="Coins" value={profile.coins} unit="" icon={<Star size={14} />} color="#D97706" />
        <StatCard label="Level" value={profile.level} unit="" icon={<TrendingUp size={14} />} color="#0066FF" />
        <StatCard label="Done" value={profile.completed_total} unit="total" icon={<Check size={14} />} color="#059669" />
      </div>

      {/* XP Bar */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] text-gray-400 w-16">{profile.xp}/{profile.xp_to_next} XP</span>
        <XPBar value={profile.xp} max={profile.xp_to_next} height={5} />
        <span className="text-[11px] text-blue-600 font-semibold">Lv.{profile.level}</span>
      </div>

      {/* Shield */}
      <div className="flex items-center gap-1.5 mb-6">
        <Shield size={13} className={profile.shield_used ? 'text-gray-300' : 'text-green-600'} />
        <span className={`text-[11px] font-medium ${profile.shield_used ? 'text-gray-400' : 'text-green-600'}`}>
          Shield: {profile.shield_used ? 'Used' : 'Available'}
        </span>
        {!profile.shield_used && (
          <button onClick={activateShield} className="text-[11px] text-blue-600 font-semibold ml-1">Activate</button>
        )}
      </div>

      {/* Pending / Approvals */}
      {pending.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Incoming suggestions</h2>
          {pending.map(ch => (
            <Card key={ch.id} onClick={() => setModal({ type: 'negotiate', ch })} accent="#0066FF">
              <div className="flex items-center gap-2.5">
                <MessageSquare size={16} className="text-blue-500" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{ch.title}</div>
                  <div className="text-[11px] text-gray-400">{ch.due_date}</div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {isParent && approvals.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Needs approval</h2>
          {approvals.map(ch => (
            <Card key={ch.id} onClick={() => setModal({ type: 'approve', ch })} accent="#D97706">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-amber-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{getName(ch.from_user)} wants to challenge {getName(ch.to_user)}</div>
                  <div className="text-[11px] text-gray-400">{ch.title}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Active challenges */}
      <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Active challenges ({challenges.length})
      </h2>
      {challenges.map(ch => (
        <Card key={ch.id} onClick={() => setModal({ type: 'detail', ch })}>
          <div className="flex items-center gap-2.5">
            <TypeDot type={ch.type} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{ch.title}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{ch.due_date} · {ch.difficulty}</div>
            </div>
            <span className="text-sm font-bold">+{ch.coins}</span>
          </div>
        </Card>
      ))}
      {challenges.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Check size={28} strokeWidth={1.5} className="mx-auto mb-2" />
          <div className="text-sm font-semibold text-gray-900">All clear</div>
          <div className="text-[11px] mt-1">No active challenges right now</div>
        </div>
      )}

      {/* Family status */}
      <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Family</h2>
      <Card>
        {members.map((m, i) => (
          <div key={m.id} className={`flex items-center gap-2.5 py-2 ${i < members.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <Avatar name={m.name} color={m.avatar_color} size={28} />
            <span className="text-sm font-medium flex-1 truncate">{m.name}</span>
            <span className="text-[11px] text-gray-400">{m.streak}d</span>
            <XPBar value={m.xp} max={m.xp_to_next} color={m.avatar_color} height={3} />
            <span className="text-xs font-semibold ml-2">Lv.{m.level}</span>
          </div>
        ))}
      </Card>

      {/* Recent activity */}
      {feed.length > 0 && (
        <>
          <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Recent</h2>
          {feed.slice(0, 4).map(f => {
            const m = members.find(mb => mb.id === f.user_id);
            return (
              <Card key={f.id} className="!mb-1.5 !p-3">
                <div className="flex gap-2 items-center">
                  <Avatar name={m?.name} color={m?.avatar_color} size={24} />
                  <div className="text-[12px] flex-1 truncate">
                    <span className="font-semibold">{m?.name}</span>{' '}
                    <span className="text-gray-500">{f.event_type}</span>{' '}
                    {f.target_text && <span className="font-semibold">{f.target_text}</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </>
      )}

      {/* Modals */}
      {modal?.type === 'detail' && (
        <Modal onClose={() => setModal(null)}>
          <div className="flex items-center gap-2 mb-3">
            <TypeDot type={modal.ch.type} size={10} />
            <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{modal.ch.type} challenge</span>
            {modal.ch.recurring && <Badge color="#0066FF">Recurring</Badge>}
          </div>
          <div className="text-xl font-bold mb-3">{modal.ch.title}</div>
          <div className="flex gap-2 flex-wrap mb-4">
            <Badge color="#D97706">+{modal.ch.coins} coins</Badge>
            <Badge color="#059669">+{modal.ch.xp} XP</Badge>
            <Badge color={DIFF_COLORS[modal.ch.difficulty]}>{modal.ch.difficulty}</Badge>
          </div>
          <div className="flex justify-between text-sm text-gray-500 py-3 border-t border-b border-gray-100 mb-4">
            <span>Due: {modal.ch.due_date}</span>
            <span>{modal.ch.from_user !== profile.id ? `From ${getName(modal.ch.from_user)}` : 'Self-challenge'}</span>
          </div>
          {modal.ch.status === 'active' && <Button onClick={() => complete(modal.ch)} variant="success">Mark complete</Button>}
          {modal.ch.status === 'completed' && <div className="text-center text-green-600 font-semibold">Completed</div>}
        </Modal>
      )}

      {modal?.type === 'negotiate' && (
        <Modal onClose={() => setModal(null)}>
          <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold mb-2">Challenge suggestion</div>
          <div className="text-xl font-bold mb-1">{modal.ch.title}</div>
          <div className="text-sm text-gray-500 mb-5">from {getName(modal.ch.from_user)} · {modal.ch.due_date} · +{modal.ch.coins} coins</div>
          <div className="flex gap-2">
            <Button onClick={() => acceptChallenge(modal.ch)} variant="success" full={false}>Accept</Button>
            <Button onClick={() => setModal(null)} variant="ghost" full={false}>Later</Button>
          </div>
        </Modal>
      )}

      {modal?.type === 'approve' && (
        <Modal onClose={() => setModal(null)}>
          <div className="text-[11px] uppercase tracking-wider text-amber-600 font-semibold mb-2">Needs approval</div>
          <div className="text-xl font-bold mb-1">{modal.ch.title}</div>
          <div className="text-sm text-gray-500 mb-5">{getName(modal.ch.from_user)} wants to challenge {getName(modal.ch.to_user)}</div>
          <div className="flex gap-2">
            <Button onClick={() => approveChallenge(modal.ch)} variant="success" full={false}>Approve</Button>
            <Button onClick={async () => {
              await supabase.from('challenges').update({ status: 'declined' }).eq('id', modal.ch.id);
              setModal(null); flash('Rejected'); loadData();
            }} variant="ghost-danger" full={false}>Reject</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
