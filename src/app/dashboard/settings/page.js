'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [family, setFamily] = useState(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      const { data: fam } = await supabase.from('families').select('*').eq('id', prof.family_id).single();
      setFamily(fam);
    };
    load();
  }, []);

  if (!profile || !family) return <div className="text-gray-400 text-sm py-20 text-center">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>
      <div className="max-w-lg">
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-3">
          <div className="text-sm font-semibold mb-1">Family name</div>
          <div className="text-sm text-gray-500">{family.name}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-3">
          <div className="text-sm font-semibold mb-1">Invite code</div>
          <div className="text-lg font-bold tracking-widest text-blue-600">{family.invite_code}</div>
          <p className="text-xs text-gray-400 mt-1">Share this with family members so they can join</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-3">
          <div className="text-sm font-semibold mb-1">Your role</div>
          <div className="text-sm text-gray-500 capitalize">{profile.role}</div>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="mt-4 text-sm text-red-600 font-semibold hover:underline">Log out</button>
      </div>
    </div>
  );
}
