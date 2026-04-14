'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Heart, Send } from 'lucide-react';

export default function FeedPage() {
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: mems } = await supabase.from('profiles').select('*').eq('family_id', prof.family_id);
      setMembers(mems || []);
      const { data: feed } = await supabase.from('feed_events').select('*').eq('family_id', prof.family_id).order('created_at', { ascending: false }).limit(30);
      setEvents(feed || []);
    };
    load();

    // Real-time subscription
    const channel = supabase.channel('feed').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_events' }, (payload) => {
      setEvents(prev => [payload.new, ...prev]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getName = (id) => members.find(m => m.id === id)?.name || 'Someone';
  const getColor = (id) => members.find(m => m.id === id)?.avatar_color || '#0066FF';
  const getInitial = (id) => members.find(m => m.id === id)?.name?.charAt(0) || '?';

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Family feed</h1>
        <button className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition flex items-center gap-1.5">
          <Send size={13} /> Send shoutout
        </button>
      </div>
      <div className="max-w-xl">
        {events.map(e => (
          <div key={e.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: getColor(e.user_id) + '15', color: getColor(e.user_id) }}>
                {getInitial(e.user_id)}
              </div>
              <div className="flex-1">
                <div className="text-sm"><span className="font-semibold">{getName(e.user_id)}</span> <span className="text-gray-500">{e.event_type}</span> {e.target_text && <span className="font-semibold">{e.target_text}</span>}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(e.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">No activity yet. Complete a challenge to get started!</div>}
      </div>
    </div>
  );
}
