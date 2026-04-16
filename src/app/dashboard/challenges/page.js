'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../layout';
import { Card, Badge, TypeDot, Modal, Button, Label, Textarea, TYPE_COLORS, TYPE_LABELS, DIFF_COLORS } from '@/components/ui';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function ChallengesPage() {
  const { profile, supabase, members, flash, triggerLoot, refreshProfile } = useApp();
  const [challenges, setChallenges] = useState([]);
  const [tab, setTab] = useState('active');
  const [modal, setModal] = useState(null);
  const [counterText, setCounterText] = useState('');
  const [declineText, setDeclineText] = useState('');

  useEffect(() => { if (profile) loadData(); }, [profile]);

  const loadData = async () => {
    const { data } = await supabase.from('challenges').select('*').eq('to_user', profile.id).order('created_at', { ascending: false });
    setChallenges(data || []);
  };

  const getName = (id) => members.find(m => m.id === id)?.name || 'Someone';

  const filtered = challenges.filter(c =>
    tab === 'active' ? c.status === 'active' :
    tab === 'pending' ? c.status === 'negotiate' :
    c.status === 'completed'
  );

  const counts = {
    active: challenges.filter(c => c.status === 'active').length,
    pending: challenges.filter(c => c.status === 'negotiate').length,
    done: challenges.filter(c => c.status === 'completed').length,
  };

  const complete = async (ch) => {
    await supabase.from('challenges').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', ch.id);
    const newXp = profile.xp + ch.xp;
    const leveledUp = newXp >= profile.xp_to_next;
    await supabase.from('profiles').update({
      xp: leveledUp ? newXp - profile.xp_to_next : newXp,
      coins: profile.coins + ch.coins,
      level: leveledUp ? profile.level + 1 : profile.level,
      xp_to_next: leveledUp ? profile.xp_to_next + 100 : profile.xp_to_next,
      completed_total: profile.completed_total + 1,
    }).eq('id', profile.id);
    await supabase.from('feed_events').insert({ family_id: profile.family_id, user_id: profile.id, event_type: 'complete', target_text: ch.title });
    triggerLoot(ch.difficulty);
    flash(leveledUp ? `Level up! Level ${profile.level + 1}` : `+${ch.coins} coins, +${ch.xp} XP`);
    setModal(null);
    await refreshProfile();
    loadData();
  };

  const accept = async (ch) => {
    await supabase.from('challenges').update({ status: 'active', is_suggestion: false }).eq('id', ch.id);
    flash('Accepted'); setModal(null); loadData();
  };

  const counter = async (ch) => {
    await supabase.from('challenges').update({ counter_offer: counterText || 'Adjusted terms' }).eq('id', ch.id);
    flash('Counter sent'); setCounterText(''); setModal(null); loadData();
  };

  const decline = async (ch) => {
    await supabase.from('challenges').update({ status: 'declined', decline_reason: declineText }).eq('id', ch.id);
    flash('Declined'); setDeclineText(''); setModal(null); loadData();
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Challenges</h1>
          <p className="text-sm text-gray-500 mt-0.5">{counts.active} active · {counts.done} completed</p>
        </div>
        <Link href="/dashboard/create" className="text-sm font-semibold text-white bg-[#0A0A0A] px-4 py-2 rounded-lg">+ New</Link>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[['active', `Active ${counts.active}`], ['pending', `Pending ${counts.pending}`], ['done', `Done ${counts.done}`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${tab === k ? 'bg-[#0A0A0A] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>{l}</button>
        ))}
      </div>

      {filtered.map(ch => (
        <Card key={ch.id} onClick={() => setModal({ type: ch.status === 'negotiate' ? 'negotiate' : 'detail', ch })}>
          <div className="flex items-center gap-2.5">
            <TypeDot type={ch.type} size={10} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{ch.title}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{ch.from_user !== profile.id ? `from ${getName(ch.from_user)}` : 'Self'} · {ch.due_date}</div>
            </div>
            {ch.status === 'negotiate' && <MessageSquare size={14} className="text-blue-500" />}
          </div>
          <div className="flex gap-1.5 mt-2.5">
            <Badge color={TYPE_COLORS[ch.type]}>{TYPE_LABELS[ch.type]}</Badge>
            <Badge color={DIFF_COLORS[ch.difficulty]}>{ch.difficulty}</Badge>
            <span className="ml-auto text-sm font-bold">{ch.status === 'completed' ? '✓' : `+${ch.coins}`}</span>
          </div>
        </Card>
      ))}
      {filtered.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">Nothing here yet</div>}

      {/* Detail modal */}
      {modal?.type === 'detail' && (
        <Modal onClose={() => setModal(null)}>
          <div className="flex items-center gap-2 mb-3">
            <TypeDot type={modal.ch.type} size={10} />
            <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{TYPE_LABELS[modal.ch.type]} challenge</span>
            {modal.ch.recurring && <Badge color="#0066FF">Recurring</Badge>}
          </div>
          <div className="text-xl font-bold mb-3">{modal.ch.title}</div>
          <div className="flex gap-2 flex-wrap mb-4">
            <Badge color="#D97706">+{modal.ch.coins} coins</Badge>
            <Badge color="#059669">+{modal.ch.xp} XP</Badge>
            <Badge color={DIFF_COLORS[modal.ch.difficulty]}>{modal.ch.difficulty}</Badge>
          </div>
          <div className="flex justify-between text-sm text-gray-500 py-3 border-t border-b border-gray-100 mb-4">
            <span>Due: {modal.ch.due_date}</span>
            <span>{modal.ch.from_user !== profile.id ? `From ${getName(modal.ch.from_user)}` : 'Self'}</span>
          </div>
          {modal.ch.status === 'active' && <Button onClick={() => complete(modal.ch)} variant="success">Mark complete</Button>}
          {modal.ch.status === 'completed' && <div className="text-center text-green-600 font-semibold py-2">Completed</div>}
        </Modal>
      )}

      {/* Negotiate modal */}
      {modal?.type === 'negotiate' && (
        <Modal onClose={() => setModal(null)}>
          <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold mb-2">Challenge suggestion</div>
          <div className="text-xl font-bold mb-1">{modal.ch.title}</div>
          <div className="text-sm text-gray-500 mb-5">from {getName(modal.ch.from_user)} · {modal.ch.due_date} · +{modal.ch.coins} coins</div>
          {modal.ch.counter_offer ? (
            <Card accent="#0066FF" className="!mb-4">
              <div className="text-[11px] font-semibold text-blue-600 mb-1">Counter sent</div>
              <div className="text-sm">{modal.ch.counter_offer}</div>
            </Card>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => accept(modal.ch)} variant="success" full={false}>Accept</Button>
              <Button onClick={() => setModal({ type: 'counter', ch: modal.ch })} variant="accent" full={false}>Counter</Button>
              <Button onClick={() => setModal({ type: 'decline', ch: modal.ch })} variant="ghost-danger" full={false}>Decline</Button>
            </div>
          )}
        </Modal>
      )}

      {/* Counter modal */}
      {modal?.type === 'counter' && (
        <Modal onClose={() => setModal(null)}>
          <div className="text-lg font-bold mb-4">Counter-offer</div>
          <Label>Your proposal</Label>
          <Textarea value={counterText} onChange={e => setCounterText(e.target.value)} placeholder="e.g., How about 4 nights instead of 7?" style={{ minHeight: 100, marginBottom: 16 }} />
          <div className="flex gap-2">
            <Button onClick={() => counter(modal.ch)} variant="accent" full={false} disabled={!counterText}>Send counter</Button>
            <Button onClick={() => setModal({ type: 'negotiate', ch: modal.ch })} variant="ghost" full={false}>Back</Button>
          </div>
        </Modal>
      )}

      {/* Decline modal */}
      {modal?.type === 'decline' && (
        <Modal onClose={() => setModal(null)}>
          <div className="text-lg font-bold mb-4">Decline challenge</div>
          <Label>Reason</Label>
          <Textarea value={declineText} onChange={e => setDeclineText(e.target.value)} placeholder="Let them know why" style={{ minHeight: 100, marginBottom: 16 }} />
          <div className="flex gap-2">
            <Button onClick={() => decline(modal.ch)} variant="danger" full={false}>Decline</Button>
            <Button onClick={() => setModal({ type: 'negotiate', ch: modal.ch })} variant="ghost" full={false}>Back</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
