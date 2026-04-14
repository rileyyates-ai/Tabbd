'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';
import { Flame, Star, TrendingUp, Check, Shield, MessageSquare, ChevronRight, ShieldCheck } from 'lucide-react';

export default function DashboardHome() {
  const [profile, setProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(prof);

    const { data: myChs } = await supabase
      .from('challenges')
      .select('*')
      .eq('to_user', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setChallenges(myChs || []);

    const { data: myPen } = await supabase
      .from('challenges')
      .select('*')
      .eq('to_user', user.id)
      .eq('status', 'negotiate');
    setPending(myPen || []);

    if (prof?.role === 'parent') {
      const { data: appr } = await supabase
        .from('challenges')
        .select('*')
        .eq('family_id', prof.family_id)
        .eq('status', 'pending_approval');
      setApprovals(appr || []);
    }

    const { data: mems } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', prof.family_id)
      .order('role');
    setMembers(mems || []);
  };

  const completeChallenge = async (id) => {
    const ch = challenges.find(c => c.id === id);
    if (!ch) return;

    await supabase.from('challenges').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id);

    const newXp = profile.xp + ch.xp;
    const leveledUp = newXp >= profile.xp_to_next;
    await supabase.from('profiles').update({
      xp: leveledUp ? newXp - profile.xp_to_next : newXp,
      coins: profile.coins + ch.coins,
      level: leveledUp ? profile.level + 1 : profile.level,
      xp_to_next: leveledUp ? profile.xp_to_next + 100 : profile.xp_to_next,
      completed_total: profile.completed_total + 1,
    }).eq('id', profile.id);

    await supabase.from('feed_events').insert({
      family_id: profile.family_id,
      user_id: profile.id,
      event_type: 'complete',
      target_text: ch.title,
    });

    loadData();
  };

  if (!profile) return <div className="text-gray-400 text-sm py-20 text-center">Loading...</div>;

  const typeColor = { home: '#D97706', growth: '#059669', personal: '#0066FF' };

  return (
    <div>
      <div className="mb-1">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {profile.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{profile.role === 'parent' ? 'Parent' : 'Age ' + profile.age} · Level {profile.level} · {profile.streak}-day streak</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 mb-8">
        {[
          { label: 'Streak', value: profile.streak, unit: 'days', icon: <Flame size={16} />, color: '#DC2626' },
          { label: 'Coins', value: profile.coins, unit: '', icon: <Star size={16} />, color: '#D97706' },
          { label: 'Level', value: profile.level, unit: '', icon: <TrendingUp size={16} />, color: '#0066FF' },
          { label: 'Done', value: profile.completed_total, unit: 'total', icon: <Check size={16} />, color: '#059669' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</span>
            </div>
            <div className="text-2xl font-bold tracking-tight">{s.value}<span className="text-sm text-gray-400 font-normal ml-1">{s.unit}</span></div>
          </div>
        ))}
      </div>

      {/* XP bar */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-400 w-16">{profile.xp}/{profile.xp_to_next} XP</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(profile.xp / profile.xp_to_next) * 100}%` }} />
        </div>
        <span className="text-xs text-blue-600 font-semibold">Lv.{profile.level}</span>
      </div>

      <div className="flex items-center gap-1.5 mb-8">
        <Shield size={13} className={profile.shield_used ? 'text-gray-300' : 'text-green-600'} />
        <span className={`text-xs font-medium ${profile.shield_used ? 'text-gray-400' : 'text-green-600'}`}>
          Streak shield: {profile.shield_used ? 'Used this week' : 'Available'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div>
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Incoming suggestions</h2>
              {pending.map(ch => (
                <div key={ch.id} className="bg-white border border-blue-200 rounded-xl p-4 mb-2 cursor-pointer hover:border-blue-400 transition">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare size={16} className="text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{ch.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{ch.due_date}</div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Active challenges ({challenges.length})
          </h2>
          {challenges.map(ch => (
            <div key={ch.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-2">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ background: typeColor[ch.type] }} />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{ch.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{ch.due_date} · {ch.difficulty}</div>
                </div>
                <button
                  onClick={() => completeChallenge(ch.id)}
                  className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition"
                >
                  Complete
                </button>
              </div>
            </div>
          ))}
          {challenges.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Check size={28} strokeWidth={1.5} className="mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">All clear</div>
              <div className="text-xs mt-1">No active challenges right now</div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Family</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            {members.map((m, i) => (
              <div key={m.id} className={`flex items-center gap-2.5 py-2 ${i < members.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: (m.avatar_color || '#0066FF') + '15', color: m.avatar_color || '#0066FF' }}>
                  {m.name?.charAt(0)}
                </div>
                <span className="text-sm font-medium flex-1">{m.name}</span>
                <span className="text-xs text-gray-400">{m.streak}d</span>
                <span className="text-xs font-semibold">Lv.{m.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
