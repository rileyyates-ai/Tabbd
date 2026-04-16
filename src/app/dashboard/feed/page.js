'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../layout';
import { Avatar, Card, Modal, Button, Label } from '@/components/ui';
import { Heart, Send } from 'lucide-react';

export default function FeedPage() {
  const { profile, supabase, members, flash, refreshProfile, fStreak } = useApp();
  const [events, setEvents] = useState([]);
  const [showShoutout, setShowShoutout] = useState(false);
  const [soTarget, setSoTarget] = useState(null);
  const [soCoins, setSoCoins] = useState(5);

  useEffect(() => { if (profile) loadFeed(); }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const channel = supabase.channel('feed-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_events', filter: `family_id=eq.${profile.family_id}` }, (payload) => {
        setEvents(prev => [payload.new, ...prev]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const loadFeed = async () => {
    const { data } = await supabase.from('feed_events').select('*').eq('family_id', profile.family_id).order('created_at', { ascending: false }).limit(50);
    setEvents(data || []);
  };

  const sendShoutout = async () => {
    if (!soTarget || profile.coins < soCoins) return;
    await supabase.from('profiles').update({ coins: profile.coins - soCoins }).eq('id', profile.id);
    const target = members.find(m => m.id === soTarget);
    if (target) {
      await supabase.from('profiles').update({ coins: target.coins + soCoins }).eq('id', soTarget);
    }
    await supabase.from('feed_events').insert({
      family_id: profile.family_id, user_id: profile.id,
      event_type: 'shoutout', target_text: getName(soTarget),
      target_user: soTarget, coins_amount: soCoins,
    });
    flash(`Sent ${soCoins} coins!`);
    setSoTarget(null); setSoCoins(5); setShowShoutout(false);
    await refreshProfile();
  };

  const getName = (id) => members.find(m => m.id === id)?.name || 'Someone';
  const getColor = (id) => members.find(m => m.id === id)?.avatar_color || '#0066FF';
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const eventIcon = { complete: '✓', levelup: '⬆', streak: '🔥', redeem: '🎁', shoutout: '💰', suggest: '💬' };

  return (
    <div>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Family feed</h1>
          <p className="text-sm text-green-600 font-semibold mt-0.5">Family streak: Day {fStreak}</p>
        </div>
        <button onClick={() => setShowShoutout(true)} className="bg-blue-50 border-none rounded-lg px-4 py-2 text-sm text-blue-600 font-semibold flex items-center gap-1.5 active:bg-blue-100 transition">
          <Send size={13} /> Shoutout
        </button>
      </div>

      <div className="max-w-xl">
        {events.map(e => {
          const m = members.find(mb => mb.id === e.user_id);
          const accentMap = { levelup: '#0066FF', streak: '#DC2626', shoutout: '#D97706' };
          return (
            <Card key={e.id} accent={accentMap[e.event_type]} className="!mb-2.5">
              <div className="flex gap-3 items-start">
                <Avatar name={m?.name} color={m?.avatar_color} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm leading-relaxed">
                    <span className="font-semibold">{m?.name}</span>{' '}
                    <span className="text-gray-500">{e.event_type === 'shoutout' ? `gave ${e.coins_amount} coins to` : e.event_type}</span>{' '}
                    {e.target_text && <span className="font-semibold">{e.target_text}</span>}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">{timeAgo(e.created_at)}</div>
                </div>
                <span className="text-lg">{eventIcon[e.event_type] || ''}</span>
              </div>
            </Card>
          );
        })}
        {events.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">No activity yet. Complete a challenge to get started!</div>}
      </div>

      {/* Shoutout modal */}
      {showShoutout && (
        <Modal onClose={() => setShowShoutout(false)}>
          <div className="text-lg font-bold mb-4">Send a shoutout</div>
          <Label>Who?</Label>
          <div className="flex gap-2 flex-wrap mb-5">
            {members.filter(m => m.id !== profile.id).map(m => (
              <button key={m.id} onClick={() => setSoTarget(m.id)} className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${soTarget === m.id ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200 bg-white'}`}>
                <Avatar name={m.name} color={m.avatar_color} size={22} />{m.name}
              </button>
            ))}
          </div>
          <Label>How many coins?</Label>
          <div className="flex gap-2 mb-4">
            {[5, 10, 15, 25].map(v => (
              <button key={v} onClick={() => setSoCoins(v)} className={`flex-1 py-2.5 rounded-lg text-base font-bold transition ${soCoins === v ? 'border-2 border-blue-500 bg-blue-50 text-blue-600' : 'border border-gray-200 bg-white text-gray-500'}`}>{v}</button>
            ))}
          </div>
          {soTarget && <div className="text-[11px] text-gray-400 mb-3">Balance after: {profile.coins - soCoins} coins</div>}
          <Button onClick={sendShoutout} disabled={!soTarget || profile.coins < soCoins} variant="accent" full={false}>Send {soCoins} coins</Button>
        </Modal>
      )}
    </div>
  );
}
