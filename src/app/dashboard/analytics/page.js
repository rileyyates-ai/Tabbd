'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function AnalyticsPage() {
  const [members, setMembers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof?.role !== 'parent') return;
      const { data: mems } = await supabase.from('profiles').select('*').eq('family_id', prof.family_id).order('role');
      setMembers(mems || []);
      const { data: chs } = await supabase.from('challenges').select('*').eq('family_id', prof.family_id);
      setChallenges(chs || []);
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Family analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map(m => {
          const active = challenges.filter(c => c.to_user === m.id && c.status === 'active').length;
          const done = challenges.filter(c => c.to_user === m.id && c.status === 'completed').length;
          const rate = Math.round((done / Math.max(done + active, 1)) * 100);
          return (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: (m.avatar_color || '#0066FF') + '15', color: m.avatar_color || '#0066FF' }}>{m.name?.charAt(0)}</div>
                <div className="flex-1"><div className="font-semibold">{m.name}</div><div className="text-xs text-gray-400">{m.role === 'parent' ? 'Parent' : 'Age ' + m.age} · Level {m.level}</div></div>
                <div className="text-right"><div className="text-xl font-bold" style={{ color: m.streak >= 7 ? '#059669' : '#D97706' }}>{m.streak}d</div><div className="text-xs text-gray-400">streak</div></div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[{ l: 'Active', v: active }, { l: 'Done', v: done, c: '#059669' }, { l: 'Rate', v: rate + '%', c: rate > 70 ? '#059669' : '#D97706' }, { l: 'Coins', v: m.coins, c: '#D97706' }].map((s, i) => (
                  <div key={i} className="text-center bg-gray-50 rounded-lg py-2"><div className="text-base font-bold" style={{ color: s.c || '#0A0A0A' }}>{s.v}</div><div className="text-xs text-gray-400 uppercase mt-0.5">{s.l}</div></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
