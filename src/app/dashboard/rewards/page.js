'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Star, Plus } from 'lucide-react';

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      const { data } = await supabase.from('rewards').select('*').eq('family_id', prof.family_id).eq('is_active', true);
      setRewards(data || []);
    };
    load();
  }, []);

  const redeem = async (reward) => {
    if (!profile || profile.coins < reward.cost) return;
    await supabase.from('profiles').update({ coins: profile.coins - reward.cost }).eq('id', profile.id);
    await supabase.from('redemptions').insert({ reward_id: reward.id, redeemed_by: profile.id, family_id: profile.family_id, coins_spent: reward.cost });
    await supabase.from('feed_events').insert({ family_id: profile.family_id, user_id: profile.id, event_type: 'redeem', target_text: reward.name });
    setProfile(p => ({ ...p, coins: p.coins - reward.cost }));
  };

  if (!profile) return <div className="text-gray-400 text-sm py-20 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reward shop</h1>
          <p className="text-sm text-gray-500 mt-1">Balance: {profile.coins} coins</p>
        </div>
        {profile.role === 'parent' && <button className="text-sm font-semibold text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5"><Plus size={14} /> Add reward</button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rewards.map(r => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-base font-semibold mb-1">{r.name}</div>
            <div className="text-xs text-gray-400 mb-4">{r.description || r.category}</div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">{r.cost} <span className="text-sm font-normal text-gray-400">coins</span></span>
              <button onClick={() => redeem(r)} disabled={profile.coins < r.cost} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-40 bg-green-50 text-green-700 hover:bg-green-100">
                {profile.coins >= r.cost ? 'Redeem' : 'Not enough'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {rewards.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">No rewards set up yet. Parents can add rewards from this page.</div>}
    </div>
  );
}
