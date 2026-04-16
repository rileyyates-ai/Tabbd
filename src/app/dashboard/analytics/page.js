'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../layout';
import { Avatar, Card, XPBar } from '@/components/ui';

export default function AnalyticsPage() {
  const { profile, supabase, members, isParent } = useApp();
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    if (!profile || !isParent) return;
    const load = async () => {
      const { data } = await supabase.from('challenges').select('*').eq('family_id', profile.family_id);
      setChallenges(data || []);
    };
    load();
  }, [profile]);

  if (!isParent) return <div className="text-center py-20 text-gray-400 text-sm">Parent-only section</div>;

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-5">Family analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {members.map(m => {
          const active = challenges.filter(c => c.to_user === m.id && c.status === 'active').length;
          const done = challenges.filter(c => c.to_user === m.id && c.status === 'completed').length;
          const rate = Math.round((done / Math.max(done + active, 1)) * 100);
          return (
            <Card key={m.id}>
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={m.name} color={m.avatar_color} size={40} />
                <div className="flex-1">
                  <div className="text-base font-semibold">{m.name}</div>
                  <div className="text-[11px] text-gray-400">{m.role === 'parent' ? 'Parent' : 'Age ' + m.age} · Level {m.level}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: m.streak >= 7 ? '#059669' : '#D97706' }}>{m.streak}d</div>
                  <div className="text-[10px] text-gray-400">streak</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {[
                  { l: 'Active', v: active },
                  { l: 'Done', v: done, c: '#059669' },
                  { l: 'Rate', v: rate + '%', c: rate > 70 ? '#059669' : '#D97706' },
                  { l: 'Coins', v: m.coins, c: '#D97706' },
                ].map((s, i) => (
                  <div key={i} className="text-center bg-[#F8F9FA] rounded-lg py-2">
                    <div className="text-sm font-bold" style={{ color: s.c || '#0A0A0A' }}>{s.v}</div>
                    <div className="text-[9px] text-gray-400 uppercase mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
              <XPBar value={m.xp} max={m.xp_to_next} color={m.avatar_color} height={4} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
