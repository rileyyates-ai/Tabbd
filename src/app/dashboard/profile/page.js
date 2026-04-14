'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Shield } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
    };
    load();
  }, []);

  if (!profile) return <div className="text-gray-400 text-sm py-20 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: (profile.avatar_color || '#0066FF') + '15', color: profile.avatar_color || '#0066FF' }}>{profile.name?.charAt(0)}</div>
        <div><h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1><p className="text-sm text-gray-500">{profile.role === 'parent' ? 'Parent' : 'Age ' + profile.age}</p></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[{ l: 'Level', v: profile.level, c: '#0066FF' }, { l: 'Streak', v: profile.streak + 'd', c: '#DC2626' }, { l: 'Coins', v: profile.coins, c: '#D97706' }, { l: 'Completed', v: profile.completed_total, c: '#059669' }].map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4"><div className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</div><div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{s.l}</div></div>
        ))}
      </div>
      <div className="max-w-md">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">XP Progress</label>
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(profile.xp / profile.xp_to_next) * 100}%` }} /></div>
          <span className="text-xs text-gray-500">{profile.xp}/{profile.xp_to_next}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className={profile.shield_used ? 'text-gray-300' : 'text-green-600'} />
          <span className="text-sm text-gray-600">Streak shield: {profile.shield_used ? 'Used this week' : 'Available'}</span>
        </div>
      </div>
    </div>
  );
}
