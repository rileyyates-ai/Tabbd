'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../layout';
import { Card, Avatar, Button, Label, Input, C } from '@/components/ui';
import { Users, Key, Palette, LogOut, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { profile, supabase, family, members, refreshProfile, flash, isParent } = useApp();
  const [showColors, setShowColors] = useState(false);
  const [showPW, setShowPW] = useState(false);
  const [newPW, setNewPW] = useState('');
  const [confirmPW, setConfirmPW] = useState('');
  const [pwErr, setPwErr] = useState(null);
  const [pwLoad, setPwLoad] = useState(false);
  const router = useRouter();

  const colors = ['#39FF14', '#00D4FF', '#FFD700', '#FF6B6B', '#00E5A0', '#A855F7', '#EC4899', '#F97316', '#14B8A6', '#6366F1'];

  const changeColor = async (c) => { await supabase.from('profiles').update({ avatar_color: c }).eq('id', profile.id); await refreshProfile(); flash('Color updated'); setShowColors(false); };

  const resetPW = async () => {
    setPwErr(null);
    if (newPW.length < 8) { setPwErr('Min 8 characters'); return; }
    if (newPW !== confirmPW) { setPwErr('Passwords don\'t match'); return; }
    setPwLoad(true);
    const { error } = await supabase.auth.updateUser({ password: newPW });
    if (error) setPwErr(error.message); else { flash('Password updated'); setNewPW(''); setConfirmPW(''); setShowPW(false); }
    setPwLoad(false);
  };

  if (!profile || !family) return null;

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-5">Settings</h1>
      <div className="max-w-lg">
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.sec }}>Your profile</div>
        <Card className="!mb-4"><div className="flex items-center gap-3"><Avatar name={profile.name} color={profile.avatar_color} size={44} /><div className="flex-1"><div className="text-base font-semibold">{profile.name}</div><div className="text-sm capitalize" style={{ color: C.sec }}>{profile.role}{profile.age ? ` · Age ${profile.age}` : ''}</div></div></div></Card>

        <Card onClick={showColors ? undefined : () => setShowColors(true)} className="!mb-1.5"><div className="flex items-center gap-3"><Palette size={18} style={{ color: C.sec }} /><div className="flex-1"><div className="text-sm font-semibold">Avatar color</div><div className="text-[11px]" style={{ color: C.sec }}>Choose your color</div></div><div className="w-5 h-5 rounded-full" style={{ background: profile.avatar_color || C.green }} /></div></Card>
        {showColors && <Card className="!mb-1.5 !py-3"><div className="flex gap-2 flex-wrap">{colors.map(c => <button key={c} onClick={() => changeColor(c)} className="w-9 h-9 rounded-full transition active:scale-90" style={{ background: c, border: c === profile.avatar_color ? `3px solid ${C.white}` : '2px solid transparent' }} />)}</div></Card>}

        <Card onClick={showPW ? undefined : () => setShowPW(true)} className="!mb-1.5"><div className="flex items-center gap-3"><Lock size={18} style={{ color: C.sec }} /><div className="flex-1"><div className="text-sm font-semibold">Change password</div><div className="text-[11px]" style={{ color: C.sec }}>Update your password</div></div></div></Card>
        {showPW && <Card className="!mb-1.5 !py-4" accent={C.green}><div className="space-y-3"><div><Label>New password</Label><Input type="password" value={newPW} onChange={e => setNewPW(e.target.value)} placeholder="At least 8 characters" /></div><div><Label>Confirm</Label><Input type="password" value={confirmPW} onChange={e => setConfirmPW(e.target.value)} placeholder="Type it again" /></div>{pwErr && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#FF6B6B20', color: C.coral }}>{pwErr}</div>}<div className="flex gap-2"><Button onClick={resetPW} disabled={!newPW || !confirmPW || pwLoad} full={false}>{pwLoad ? 'Updating...' : 'Update'}</Button><Button onClick={() => { setShowPW(false); setNewPW(''); setConfirmPW(''); setPwErr(null); }} variant="ghost" full={false}>Cancel</Button></div></div></Card>}

        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2 mt-5" style={{ color: C.sec }}>Family</div>
        <Card className="!mb-1.5"><div className="flex items-center gap-3"><Users size={18} style={{ color: C.sec }} /><div className="flex-1"><div className="text-sm font-semibold">{family.name}</div><div className="text-[11px]" style={{ color: C.sec }}>{members.length} members</div></div></div></Card>

        <Card className="!mb-1.5"><div className="flex items-center gap-3"><Key size={18} style={{ color: C.sec }} /><div className="flex-1"><div className="text-sm font-semibold">Invite code</div><div className="text-lg font-bold tracking-widest font-mono mt-0.5" style={{ color: C.green }}>{family.invite_code}</div><div className="text-[11px] mt-0.5" style={{ color: C.sec }}>Share with family members to join</div></div></div></Card>

        <Card className="!mb-1.5">{members.map((m, i) => <div key={m.id} className="flex items-center gap-2.5 py-2.5" style={{ borderBottom: i < members.length - 1 ? `1px solid ${C.border}` : 'none' }}><Avatar name={m.name} color={m.avatar_color} size={28} /><div className="flex-1"><span className="text-sm font-medium">{m.name}</span>{m.id === profile.id && <span className="text-[10px] font-semibold ml-1.5" style={{ color: C.green }}>You</span>}</div><span className="text-[11px] capitalize" style={{ color: C.sec }}>{m.role}</span></div>)}</Card>

        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="mt-5 text-sm font-semibold flex items-center gap-1.5 transition" style={{ color: C.coral }}><LogOut size={15} /> Log out</button>
      </div>
    </div>
  );
}
