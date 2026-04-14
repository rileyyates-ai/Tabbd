'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [tab, setTab] = useState('active');
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      const { data } = await supabase.from('challenges').select('*').eq('to_user', user.id).order('created_at', { ascending: false });
      setChallenges(data || []);
    };
    load();
  }, []);

  const filtered = challenges.filter(c => tab === 'active' ? c.status === 'active' : tab === 'pending' ? c.status === 'negotiate' : c.status === 'completed');
  const typeColor = { home: '#D97706', growth: '#059669', personal: '#0066FF' };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Challenges</h1>
          <p className="text-sm text-gray-500 mt-1">{challenges.filter(c => c.status === 'active').length} active · {challenges.filter(c => c.status === 'completed').length} completed</p>
        </div>
        <Link href="/dashboard/create" className="text-sm font-semibold text-white bg-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-800 transition">+ New challenge</Link>
      </div>
      <div className="flex gap-2 mb-6">
        {['active', 'pending', 'completed'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)} {challenges.filter(c => t === 'active' ? c.status === 'active' : t === 'pending' ? c.status === 'negotiate' : c.status === 'completed').length}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(ch => (
          <div key={ch.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full" style={{ background: typeColor[ch.type] }} />
              <div className="flex-1">
                <div className="text-sm font-semibold">{ch.title}</div>
                <div className="text-xs text-gray-400 mt-1">{ch.due_date} · {ch.difficulty}</div>
              </div>
              <span className="text-sm font-bold">{ch.status === 'completed' ? '✓' : '+' + ch.coins}</span>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">Nothing here yet</div>}
    </div>
  );
}
