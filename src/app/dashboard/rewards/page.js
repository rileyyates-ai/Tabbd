'use client';
import { useState, useEffect } from 'react';
import { useApp } from '../layout';
import { Card, Badge, Modal, Button, Label, Input, C } from '@/components/ui';
import { Plus, X } from 'lucide-react';

export default function RewardsPage() {
  const { profile, supabase, flash, refreshProfile, isParent } = useApp();
  const [rewards, setRewards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', cost: 50, description: '' });
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile) load(); }, [profile]);
  const load = async () => { const { data } = await supabase.from('rewards').select('*').eq('family_id', profile.family_id).eq('is_active', true); setRewards(data || []); };

  const addReward = async () => {
    if (!form.name) return; setSaving(true);
    const { data, error } = await supabase.from('rewards').insert({ family_id: profile.family_id, name: form.name, cost: form.cost, description: form.description, created_by: profile.id }).select().single();
    if (!error && data) { setRewards(p => [...p, data]); setForm({ name: '', cost: 50, description: '' }); setShowForm(false); flash('Reward added'); }
    setSaving(false);
  };

  const redeem = async (r) => {
    if (profile.coins < r.cost) return;
    await supabase.from('profiles').update({ coins: profile.coins - r.cost }).eq('id', profile.id);
    await supabase.from('redemptions').insert({ reward_id: r.id, redeemed_by: profile.id, family_id: profile.family_id, coins_spent: r.cost });
    await supabase.from('feed_events').insert({ family_id: profile.family_id, user_id: profile.id, event_type: 'redeem', target_text: r.name });
    flash(`Redeemed: ${r.name}`); setModal(null); await refreshProfile();
  };

  if (!profile) return null;

  return (
    <div>
      <div className="flex justify-between items-start mb-5">
        <div><h1 className="text-xl md:text-2xl font-bold tracking-tight">Reward shop</h1><p className="text-sm mt-0.5" style={{ color: C.sec }}>Balance: <span className="font-mono font-bold" style={{ color: C.gold }}>{profile.coins}</span> coins</p></div>
        {isParent && <button onClick={() => setShowForm(!showForm)} className="text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition" style={{ background: C.card, color: C.white, border: `1px solid ${C.border}` }}><Plus size={14} /> Add</button>}
      </div>

      {showForm && <Card accent={C.green} className="!mb-5 !p-5"><div className="flex justify-between items-center mb-3"><h2 className="text-base font-semibold">New reward</h2><button onClick={() => setShowForm(false)} style={{ color: C.sec }}><X size={18} /></button></div><div className="space-y-3"><div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Extra screen time" /></div><div><Label>Cost (coins)</Label><Input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: parseInt(e.target.value) || 0 }))} /></div><div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional" /></div><Button onClick={addReward} disabled={!form.name || saving} full={false}>{saving ? 'Adding...' : 'Add to shop'}</Button></div></Card>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {rewards.map(r => { const ok = profile.coins >= r.cost; return (
          <Card key={r.id} onClick={() => setModal(r)}>
            <div className="text-sm font-semibold mb-1">{r.name}</div>
            <div className="text-[11px] mb-3" style={{ color: C.sec }}>{r.description || r.category}</div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold font-mono" style={{ color: ok ? C.gold : C.sec }}>{r.cost} <span className="text-sm font-normal" style={{ color: C.sec }}>pts</span></span>
              {ok && <Badge color={C.green}>CLAIM NOW</Badge>}
              {!ok && <span className="text-[11px]" style={{ color: C.sec }}>Need {r.cost - profile.coins} more</span>}
            </div>
          </Card>
        ); })}
      </div>
      {rewards.length === 0 && !showForm && <div className="text-center py-16 text-sm" style={{ color: C.sec }}>No rewards yet.</div>}

      {modal && <Modal onClose={() => setModal(null)}><div className="text-xl font-bold mb-1">{modal.name}</div>{modal.description && <div className="text-sm mb-4" style={{ color: C.sec }}>{modal.description}</div>}<div className="flex justify-between text-sm py-3 mb-5" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}><span style={{ color: C.sec }}>Cost: <span className="font-bold font-mono" style={{ color: C.gold }}>{modal.cost}</span></span><span style={{ color: C.sec }}>Balance: <span className="font-bold font-mono" style={{ color: profile.coins >= modal.cost ? C.green : C.coral }}>{profile.coins}</span></span></div><Button onClick={() => redeem(modal)} disabled={profile.coins < modal.cost}>{profile.coins >= modal.cost ? 'Redeem now' : `Need ${modal.cost - profile.coins} more`}</Button></Modal>}
    </div>
  );
}
