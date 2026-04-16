'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../layout';
import { Avatar, Card, XPBar, Badge } from '@/components/ui';
import { Shield, Flame, Star, TrendingUp, Check, Award } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { profile, supabase, refreshProfile, flash, isParent } = useApp();
  const [achievements, setAchievements] = useState([]);
  const [recentCompleted, setRecentCompleted] = useState([]);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data: ach } = await supabase.from('user_achievements').select('*').eq('user_id', profile.id);
      setAchievements(ach || []);
      const { data: recent } = await supabase.from('challenges').select('*').eq('to_user', profile.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(5);
      setRecentCompleted(recent || []);
    };
    load();
  }, [profile]);

  const activateShield = async () => {
    await supabase.from('profiles').update({ shield_used: true }).eq('id', profile.id);
    await refreshProfile();
    flash('Shield activated');
  };

  if (!profile) return null;

  const achievementDefs = [
    { key: 'first_challenge', label: 'First Challenge', desc: 'Completed your first challenge', icon: '🎯' },
    { key: '7_day_streak', label: '7-Day Streak', desc: 'Built a 7-day streak', icon: '🔥' },
    { key: '30_day_streak', label: '30-Day Streak', desc: 'Built a 30-day streak', icon: '💪' },
    { key: 'level_5', label: 'Level 5', desc: 'Reached level 5', icon: '⭐' },
    { key: 'level_10', label: 'Level 10', desc: 'Reached level 10', icon: '🌟' },
    { key: '100_coins', label: 'Coin Collector', desc: 'Earned 100 coins total', icon: '💰' },
    { key: 'shoutout_sent', label: 'Team Player', desc: 'Sent your first shoutout', icon: '🤝' },
    { key: '10_challenges', label: 'Getting Serious', desc: 'Completed 10 challenges', icon: '🏆' },
  ];

  const earnedKeys = achievements.map(a => a.achievement_key);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={profile.name} color={profile.avatar_color} size={56} />
        <div>
          <h1 className="text-xl font-bold tracking-tight">{profile.name}</h1>
          <p className="text-sm text-gray-500">{isParent ? 'Parent' : 'Age ' + profile.age}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
        {[
          { l: 'Level', v: profile.level, c: '#0066FF', icon: <TrendingUp size={14} /> },
          { l: 'Streak', v: `${profile.streak}d`, c: '#DC2626', icon: <Flame size={14} /> },
          { l: 'Coins', v: profile.coins, c: '#D97706', icon: <Star size={14} /> },
          { l: 'Completed', v: profile.completed_total, c: '#059669', icon: <Check size={14} /> },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <span style={{ color: s.c }}>{s.icon}</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{s.l}</span>
            </div>
            <div className="text-xl font-bold" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <Card className="!mb-3">
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">XP Progress</div>
        <div className="flex items-center gap-2 mb-2">
          <XPBar value={profile.xp} max={profile.xp_to_next} height={6} />
          <span className="text-xs text-gray-500 whitespace-nowrap">{profile.xp}/{profile.xp_to_next}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield size={13} className={profile.shield_used ? 'text-gray-300' : 'text-green-600'} />
          <span className={`text-[11px] font-medium ${profile.shield_used ? 'text-gray-400' : 'text-green-600'}`}>
            Streak shield: {profile.shield_used ? 'Used this week' : 'Available'}
          </span>
          {!profile.shield_used && (
            <button onClick={activateShield} className="text-[11px] text-blue-600 font-semibold ml-1">Activate</button>
          )}
        </div>
      </Card>

      {/* Achievements */}
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-5">Achievements</div>
      <div className="grid grid-cols-2 gap-2">
        {achievementDefs.map(a => {
          const earned = earnedKeys.includes(a.key);
          return (
            <div key={a.key} className={`bg-white border rounded-xl p-3.5 ${earned ? 'border-blue-200' : 'border-gray-100 opacity-40'}`}>
              <div className="text-xl mb-1">{a.icon}</div>
              <div className="text-sm font-semibold">{a.label}</div>
              <div className="text-[11px] text-gray-400">{a.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Recent completions */}
      {recentCompleted.length > 0 && (
        <>
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-5">Recently completed</div>
          {recentCompleted.map(ch => (
            <Card key={ch.id} className="!mb-1.5 !p-3">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                <span className="text-sm font-medium flex-1 truncate">{ch.title}</span>
                <span className="text-[11px] text-gray-400">+{ch.coins}</span>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* Quick links for mobile */}
      <div className="md:hidden mt-6 space-y-1.5">
        <Link href="/dashboard/rewards" className="block"><Card className="!mb-0"><div className="text-sm font-semibold">Reward shop</div><div className="text-[11px] text-gray-400">Spend your coins</div></Card></Link>
        {isParent && <Link href="/dashboard/analytics" className="block"><Card className="!mb-0"><div className="text-sm font-semibold">Analytics</div><div className="text-[11px] text-gray-400">Family stats</div></Card></Link>}
        <Link href="/dashboard/settings" className="block"><Card className="!mb-0"><div className="text-sm font-semibold">Settings</div><div className="text-[11px] text-gray-400">Family, invite code, log out</div></Card></Link>
      </div>
    </div>
  );
}
