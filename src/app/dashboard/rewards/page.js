'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../layout';
import { Card, Badge, Modal, Button, Label, Input } from '@/components/ui';
import { Plus, X } from 'lucide-react';

export default function RewardsPage() {
  const { profile, supabase, flash, refreshProfile, isParent } = useApp();
  const [rewards, setRewards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', cost: 50, description: '' });
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile) loadRewards(); }, [profile]);

  const loadRewards = async () => {
    const { data } = await supabase.from('rewards').select('*').eq('family_id', profile.family_id).eq('is_active', true);
    setRewards(data || []);
  };

  const addReward = async () => {
    if (!form.name) return;
    setSaving(true);
    const { data, error } = await supabase.from('rewards').insert({
      family_id: profile.family_id, name: form.name,
      cost: form.cost, description: form.description, created_by: profile.id,
    }).select().single();
    if (!error && data) {
      setRewards(prev => [...prev, data]);
      setForm({ name: '', cost: 50, description: '' });
      setShowForm(false);
      flash('Reward added');
    }
    setSaving(false);
  };

  const redeem = async (r) => {
    if (profile.coins < r.cost) return;
    await supabase.from('profiles').update({ coins: profile.coins - r.cost }).eq('id', profile.id);
    await supabase.from('redemptions').insert({ reward_id: r.id, redeemed_by: profile.id, family_id: profile.family_id, coins_spent: r.cost });
    await supabase.from('feed_events').insert({ family_id: profile.family_id, user_id: profile.id, event_type: 'redeem', target_text: r.name });
    flash(`Redeemed: ${r.name}`);
    setModal(null);
    await refreshProfile();
  };

  if (!profile) return null;

  return (
    <div>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Reward shop</h1>
          <p className="text-sm text-gray-500 mt-0.5">Balance: {profile.coins} coins</p>
        </div>
        {isParent && (
          <button onClick={() => setShowForm(!showForm)} className="text-sm font-semibold text-[#0A0A0A] bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-1.5 active:bg-gray-50 transition">
            <Plus size={14} /> Add reward
          </button>
        )}
      </div>

      {showForm && (
        <Card accent="#0066FF" className="!mb-5 !p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold">New reward</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400"><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Extra screen time, Choose dinner" /></div>
            <div><Label>Cost (coins)</Label><Input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: parseInt(e.target.value) || 0 }))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional" /></div>
            <Button onClick={addReward} disabled={!form.name || saving} full={false}>{saving ? 'Adding...' : 'Add to shop'}</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {rewards.map(r => {
          const affordable = profile.coins >= r.cost;
          return (
            <Card key={r.id} onClick={() => setModal(r)}>
              <div className="text-sm font-semibold mb-1">{r.name}</div>
              <div className="text-[11px] text-gray-400 mb-3">{r.description || r.category}</div>
              <div className="flex justify-between items-center">
                <span className={`text-lg font-bold ${affordable ? '' : 'text-gray-300'}`}>{r.cost} <span className="text-sm font-normal text-gray-400">coins</span></span>
                {affordable && <Badge color="#059669">Available</Badge>}
              </div>
            </Card>
          );
        })}
      </div>
      {rewards.length === 0 && !showForm && <div className="text-center py-16 text-gray-400 text-sm">No rewards yet. Parents can add rewards from this page.</div>}

      {modal && (
        <Modal onClose={() => setModal(null)}>
          <div className="text-xl font-bold mb-1">{modal.name}</div>
          {modal.description && <div className="text-sm text-gray-500 mb-4">{modal.description}</div>}
          <div className="flex justify-between text-sm py-3 border-t border-b border-gray-100 mb-5">
            <span className="text-gray-500">Cost: <span className="font-bold text-[#0A0A0A]">{modal.cost} coins</span></span>
            <span className="text-gray-500">Balance: <span className={`font-bold ${profile.coins >= modal.cost ? 'text-green-600' : 'text-red-600'}`}>{profile.coins}</span></span>
          </div>
          <Button onClick={() => redeem(modal)} disabled={profile.coins < modal.cost} variant={profile.coins >= modal.cost ? 'success' : 'primary'}>
            {profile.coins >= modal.cost ? 'Redeem now' : `Need ${modal.cost - profile.coins} more coins`}
          </Button>
        </Modal>
      )}
    </div>
  );
}
