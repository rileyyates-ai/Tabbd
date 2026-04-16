'use client';
import { useState, useEffect } from 'react';
import { useApp } from '../layout';
import { Avatar, Card, XPBar, C } from '@/components/ui';

export default function AnalyticsPage() {
  const { profile, supabase, members, isParent } = useApp();
  const [chs, setChs] = useState([]);

  useEffect(() => {
    if (!profile || !isParent) return;
    const load = async () => { const { data } = await supabase.from('challenges').select('*').eq('family_id', profile.family_id); setChs(data || []); };
    load();
  }, [profile]);

  if (!isParent) return <div className="text-center py-20 text-sm" style={{ color: C.sec }}>Parent-only section</div>;

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-5">Family analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {members.map(m => {
          const active = chs.filter(c => c.to_user === m.id && c.status === 'active').length;
          const done = chs.filter(c => c.to_user === m.id && c.status === 'completed').length;
          const rate = Math.round((done / Math.max(done + active, 1)) * 100);
          return (
            <Card key={m.id}>
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={m.name} color={m.avatar_color} size={40} />
                <div className="flex-1"><div className="text-base font-semibold">{m.name}</div><div className="text-[11px]" style={{ color: C.sec }}>{m.role === 'parent' ? 'Parent' : 'Age ' + m.age} · Lv.{m.level}</div></div>
                <div className="text-right"><div className="text-xl font-bold font-mono" style={{ color: m.streak >= 7 ? C.mint : C.gold }}>{m.streak}d</div><div className="text-[10px]" style={{ color: C.sec }}>streak</div></div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {[{ l: 'Active', v: active }, { l: 'Done', v: done, c: C.mint }, { l: 'Rate', v: rate + '%', c: rate > 70 ? C.mint : C.gold }, { l: 'Coins', v: m.coins, c: C.gold }].map((s, i) => (
                  <div key={i} className="text-center rounded-lg py-2" style={{ background: C.bg }}>
                    <div className="text-sm font-bold font-mono" style={{ color: s.c || C.white }}>{s.v}</div>
                    <div className="text-[9px] uppercase mt-0.5" style={{ color: C.sec }}>{s.l}</div>
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
