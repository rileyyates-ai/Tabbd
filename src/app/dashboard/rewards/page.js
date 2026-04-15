'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Star, Plus, X } from 'lucide-react';

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', cost: 50, description: '' });
  const [saving, setSaving] = useState(false);
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

  const addReward = async () => {
    if (!form.name || !profile) return;
    setSaving(true);
    const { data, error } = await supabase.from('rewards').insert({
      family_id: profile.family_id,
      name: form.name,
      cost: form.cost,
      description: form.description,
      created_by: profile.id,
    }).select().single();
    if (!error && data) {
      setRewards(prev => [...prev, data]);
      setForm({ name: '', cost: 50, description: '' });
      setShowForm(false);
    }
    setSaving(false);
  };

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
        {profile.role === 'parent' && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5"
          >
            <Plus size={14} /> Add reward
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold">New reward</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reward name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                placeholder="e.g., Extra screen time, Choose dinner, Sleep in Saturday"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cost (coins)</label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => setForm(p => ({ ...p, cost: parseInt(e.target.value) || 0 }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                placeholder="Short description of the reward"
              />
            </div>
            <button
              onClick={addReward}
              disabled={!form.name || saving}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-40"
            >
              {saving ? 'Adding...' : 'Add to shop'}
            </button>
          </div>
        </div>
      )}

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
      {rewards.length === 0 && !showForm && <div className="text-center py-16 text-gray-400 text-sm">No rewards set up yet. Parents can add rewards from this page.</div>}
    </div>
  );
}
