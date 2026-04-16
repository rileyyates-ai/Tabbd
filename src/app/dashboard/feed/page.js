'use client';
import { useState, useEffect } from 'react';
import { useApp } from '../layout';
import { Avatar, Card, Modal, Button, Label, C } from '@/components/ui';
import { Send } from 'lucide-react';

export default function FeedPage() {
  const { profile, supabase, members, flash, refreshProfile, fStreak } = useApp();
  const [events, setEvents] = useState([]);
  const [showSO, setShowSO] = useState(false);
  const [soT, setSoT] = useState(null);
  const [soC, setSoC] = useState(5);

  useEffect(() => { if (profile) loadFeed(); }, [profile]);
  useEffect(() => {
    if (!profile) return;
    const ch = supabase.channel('feed-rt').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_events', filter: `family_id=eq.${profile.family_id}` }, p => setEvents(prev => [p.new, ...prev])).subscribe();
    return () => supabase.removeChannel(ch);
  }, [profile]);

  const loadFeed = async () => { const { data } = await supabase.from('feed_events').select('*').eq('family_id', profile.family_id).order('created_at', { ascending: false }).limit(50); setEvents(data || []); };

  const sendSO = async () => {
    if (!soT || profile.coins < soC) return;
    await supabase.from('profiles').update({ coins: profile.coins - soC }).eq('id', profile.id);
    const t = members.find(m => m.id === soT);
    if (t) await supabase.from('profiles').update({ coins: t.coins + soC }).eq('id', soT);
    await supabase.from('feed_events').insert({ family_id: profile.family_id, user_id: profile.id, event_type: 'shoutout', target_text: getName(soT), target_user: soT, coins_amount: soC });
    flash(`Sent ${soC} coins!`); setSoT(null); setSoC(5); setShowSO(false); await refreshProfile();
  };

  const getName = (id) => members.find(m => m.id === id)?.name || 'Someone';
  const timeAgo = (d) => { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return 'Just now'; if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; };
  const icons = { complete: '✓', levelup: '⬆', streak: '🔥', redeem: '🎁', shoutout: '💰', suggest: '💬' };

  return (
    <div>
      <div className="flex justify-between items-start mb-5">
        <div><h1 className="text-xl md:text-2xl font-bold tracking-tight">Family feed</h1><p className="text-sm font-semibold mt-0.5" style={{ color: C.mint }}>Family streak: Day {fStreak}</p></div>
        <button onClick={() => setShowSO(true)} className="rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition" style={{ background: C.green + '15', color: C.green, border: `1px solid ${C.green}30` }}><Send size={13} /> Shoutout</button>
      </div>
      <div className="max-w-xl">
        {events.map(e => { const m = members.find(mb => mb.id === e.user_id); const accents = { levelup: C.blue, streak: C.coral, shoutout: C.gold };
          return <Card key={e.id} accent={accents[e.event_type]} className="!mb-2.5"><div className="flex gap-3 items-start"><Avatar name={m?.name} color={m?.avatar_color} size={36} /><div className="flex-1 min-w-0"><div className="text-sm leading-relaxed"><span className="font-semibold">{m?.name}</span>{' '}<span style={{ color: C.sec }}>{e.event_type === 'shoutout' ? `gave ${e.coins_amount} coins to` : e.event_type}</span>{' '}{e.target_text && <span className="font-semibold" style={{ color: C.green }}>{e.target_text}</span>}</div><div className="text-[11px] mt-1 font-mono" style={{ color: C.sec }}>{timeAgo(e.created_at)}</div></div><span className="text-lg">{icons[e.event_type] || ''}</span></div></Card>;
        })}
        {events.length === 0 && <div className="text-center py-16 text-sm" style={{ color: C.sec }}>No activity yet.</div>}
      </div>
      {showSO && <Modal onClose={() => setShowSO(false)}><div className="text-lg font-bold mb-4">Send a shoutout</div><Label>Who?</Label><div className="flex gap-2 flex-wrap mb-5">{members.filter(m => m.id !== profile.id).map(m => <button key={m.id} onClick={() => setSoT(m.id)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition" style={{ border: soT === m.id ? `2px solid ${C.green}` : `1px solid ${C.border}`, background: soT === m.id ? C.green + '15' : C.card, color: C.white }}><Avatar name={m.name} color={m.avatar_color} size={22} />{m.name}</button>)}</div><Label>How many coins?</Label><div className="flex gap-2 mb-4">{[5, 10, 15, 25].map(v => <button key={v} onClick={() => setSoC(v)} className="flex-1 py-2.5 rounded-lg text-base font-bold font-mono transition" style={{ border: soC === v ? `2px solid ${C.green}` : `1px solid ${C.border}`, background: soC === v ? C.green + '15' : C.card, color: soC === v ? C.green : C.sec }}>{v}</button>)}</div>{soT && <div className="text-[11px] mb-3 font-mono" style={{ color: C.sec }}>Balance after: {profile.coins - soC}</div>}<Button onClick={sendSO} disabled={!soT || profile.coins < soC} full={false}>Send {soC} coins</Button></Modal>}
    </div>
  );
}
