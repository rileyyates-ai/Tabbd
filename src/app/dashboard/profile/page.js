'use client';
import { useState, useEffect } from 'react';
import { useApp } from '../layout';
import { Avatar, Card, XPBar, C } from '@/components/ui';
import { Shield, Flame, Star, TrendingUp, Check } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { profile, supabase, refreshProfile, flash, isParent } = useApp();
  const [achievements, setAchievements] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data: a } = await supabase.from('user_achievements').select('*').eq('user_id', profile.id); setAchievements(a || []);
      const { data: r } = await supabase.from('challenges').select('*').eq('to_user', profile.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(5); setRecent(r || []);
    };
    load();
  }, [profile]);

  const activateShield = async () => { await supabase.from('profiles').update({ shield_used: true }).eq('id', profile.id); await refreshProfile(); flash('Shield activated'); };

  if (!profile) return null;

  const achDefs = [
    { key: 'first_challenge', label: 'First Challenge', desc: 'Completed your first challenge', icon: '🎯' },
    { key: '7_day_streak', label: '7-Day Streak', desc: 'Built a 7-day streak', icon: '🔥' },
    { key: '30_day_streak', label: '30-Day Streak', desc: 'Built a 30-day streak', icon: '💪' },
    { key: 'level_5', label: 'Level 5', desc: 'Reached level 5', icon: '⭐' },
    { key: 'level_10', label: 'Level 10', desc: 'Reached level 10', icon: '🌟' },
    { key: '100_coins', label: 'Coin Collector', desc: 'Earned 100 coins total', icon: '💰' },
    { key: 'shoutout_sent', label: 'Team Player', desc: 'Sent your first shoutout', icon: '🤝' },
    { key: '10_challenges', label: 'Getting Serious', desc: 'Completed 10 challenges', icon: '🏆' },
  ];
  const earned = achievements.map(a => a.achievement_key);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6"><Avatar name={profile.name} color={profile.avatar_color} size={56} /><div><h1 className="text-xl font-bold tracking-tight">{profile.name}</h1><p className="text-sm" style={{ color: C.sec }}>{isParent ? 'Parent' : 'Age ' + profile.age}</p></div></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
        {[{ l: 'Level', v: profile.level, c: C.green, i: <TrendingUp size={14} /> }, { l: 'Streak', v: `${profile.streak}d`, c: C.coral, i: <Flame size={14} /> }, { l: 'Coins', v: profile.coins, c: C.gold, i: <Star size={14} /> }, { l: 'Completed', v: profile.completed_total, c: C.mint, i: <Check size={14} /> }].map((s, idx) => (
          <div key={idx} className="rounded-[10px] p-3.5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-1.5 mb-1"><span style={{ color: s.c }}>{s.i}</span><span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: C.sec }}>{s.l}</span></div>
            <div className="text-xl font-bold font-mono" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <Card className="!mb-3"><div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.sec }}>XP Progress</div><div className="flex items-center gap-2 mb-2"><XPBar value={profile.xp} max={profile.xp_to_next} height={6} /><span className="text-xs font-mono" style={{ color: C.sec }}>{profile.xp}/{profile.xp_to_next}</span></div><div className="flex items-center gap-1.5"><Shield size={13} style={{ color: profile.shield_used ? C.sec : C.mint }} /><span className="text-[11px] font-medium" style={{ color: profile.shield_used ? C.sec : C.mint }}>Shield: {profile.shield_used ? 'Used' : 'Available'}</span>{!profile.shield_used && <button onClick={activateShield} className="text-[11px] font-semibold ml-1" style={{ color: C.green }}>Activate</button>}</div></Card>

      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2 mt-5" style={{ color: C.sec }}>Achievements</div>
      <div className="grid grid-cols-2 gap-2">
        {achDefs.map(a => { const e = earned.includes(a.key); return (
          <div key={a.key} className="rounded-[10px] p-3.5" style={{ background: C.card, border: `1px solid ${e ? C.green + '40' : C.border}`, opacity: e ? 1 : 0.35 }}>
            <div className="text-xl mb-1">{a.icon}</div><div className="text-sm font-semibold">{a.label}</div><div className="text-[11px]" style={{ color: C.sec }}>{a.desc}</div>
          </div>
        ); })}
      </div>

      {recent.length > 0 && <><div className="text-[11px] font-semibold uppercase tracking-wider mb-2 mt-5" style={{ color: C.sec }}>Recently completed</div>{recent.map(ch => <Card key={ch.id} className="!mb-1.5 !p-3"><div className="flex items-center gap-2"><Check size={14} style={{ color: C.green }} /><span className="text-sm font-medium flex-1 truncate">{ch.title}</span><span className="text-[11px] font-mono" style={{ color: C.gold }}>+{ch.coins}</span></div></Card>)}</>}

      <div className="md:hidden mt-6 space-y-1.5">
        <Link href="/dashboard/rewards" className="block"><Card className="!mb-0"><div className="text-sm font-semibold">Reward shop</div><div className="text-[11px]" style={{ color: C.sec }}>Spend your coins</div></Card></Link>
        {isParent && <Link href="/dashboard/analytics" className="block"><Card className="!mb-0"><div className="text-sm font-semibold">Analytics</div><div className="text-[11px]" style={{ color: C.sec }}>Family stats</div></Card></Link>}
        <Link href="/dashboard/settings" className="block"><Card className="!mb-0"><div className="text-sm font-semibold">Settings</div><div className="text-[11px]" style={{ color: C.sec }}>Family, invite code, log out</div></Card></Link>
      </div>
    </div>
  );
}
