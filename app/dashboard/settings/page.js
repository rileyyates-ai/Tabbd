'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../layout';
import { Card, Avatar, Button, Label, Input } from '@/components/ui';
import { Users, Key, Palette, LogOut, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { profile, supabase, family, members, refreshProfile, flash, isParent } = useApp();
  const [showColors, setShowColors] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const router = useRouter();

  const colors = ['#0066FF', '#8B5CF6', '#059669', '#DC2626', '#D97706', '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#84CC16'];

  const changeColor = async (color) => {
    await supabase.from('profiles').update({ avatar_color: color }).eq('id', profile.id);
    await refreshProfile();
    flash('Color updated');
    setShowColors(false);
  };

  const handlePasswordReset = async () => {
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
    } else {
      flash('Password updated');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    }
    setPasswordLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!profile || !family) return null;

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-5">Settings</h1>
      <div className="max-w-lg">

        {/* Profile */}
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Your profile</div>
        <Card className="!mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={profile.name} color={profile.avatar_color} size={44} />
            <div className="flex-1">
              <div className="text-base font-semibold">{profile.name}</div>
              <div className="text-sm text-gray-500 capitalize">{profile.role}{profile.age ? ` · Age ${profile.age}` : ''}</div>
            </div>
          </div>
        </Card>

        {/* Avatar color */}
        <Card onClick={() => setShowColors(!showColors)} className="!mb-1.5">
          <div className="flex items-center gap-3">
            <Palette size={18} className="text-gray-400" />
            <div className="flex-1">
              <div className="text-sm font-semibold">Avatar color</div>
              <div className="text-[11px] text-gray-400">Choose your color</div>
            </div>
            <div className="w-5 h-5 rounded-full" style={{ background: profile.avatar_color || '#0066FF' }} />
          </div>
        </Card>
        {showColors && (
          <Card className="!mb-1.5 !py-3">
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button key={c} onClick={() => changeColor(c)} className="w-9 h-9 rounded-full transition active:scale-90" style={{ background: c, border: c === profile.avatar_color ? '3px solid #0A0A0A' : '2px solid transparent' }} />
              ))}
            </div>
          </Card>
        )}

        {/* Change password */}
        <Card onClick={showPassword ? undefined : () => setShowPassword(true)} className="!mb-1.5">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-gray-400" />
            <div className="flex-1">
              <div className="text-sm font-semibold">Change password</div>
              <div className="text-[11px] text-gray-400">Update your account password</div>
            </div>
          </div>
        </Card>
        {showPassword && (
          <Card className="!mb-1.5 !py-4" accent="#0066FF">
            <div className="space-y-3">
              <div>
                <Label>New password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                />
              </div>
              <div>
                <Label>Confirm password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Type it again"
                />
              </div>
              {passwordError && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{passwordError}</div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handlePasswordReset}
                  disabled={!newPassword || !confirmPassword || passwordLoading}
                  full={false}
                >
                  {passwordLoading ? 'Updating...' : 'Update password'}
                </Button>
                <Button
                  onClick={() => { setShowPassword(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(null); }}
                  variant="ghost"
                  full={false}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Family */}
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-5">Family</div>
        <Card className="!mb-1.5">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-gray-400" />
            <div className="flex-1">
              <div className="text-sm font-semibold">{family.name}</div>
              <div className="text-[11px] text-gray-400">{members.length} members</div>
            </div>
          </div>
        </Card>

        {/* Invite code */}
        <Card className="!mb-1.5">
          <div className="flex items-center gap-3">
            <Key size={18} className="text-gray-400" />
            <div className="flex-1">
              <div className="text-sm font-semibold">Invite code</div>
              <div className="text-lg font-bold tracking-widest text-blue-600 mt-0.5">{family.invite_code}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Share this with family members to join</div>
            </div>
          </div>
        </Card>

        {/* Members list */}
        <Card className="!mb-1.5">
          {members.map((m, i) => (
            <div key={m.id} className={`flex items-center gap-2.5 py-2.5 ${i < members.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <Avatar name={m.name} color={m.avatar_color} size={28} />
              <div className="flex-1">
                <span className="text-sm font-medium">{m.name}</span>
                {m.id === profile.id && <span className="text-[10px] text-blue-600 font-semibold ml-1.5">You</span>}
              </div>
              <span className="text-[11px] text-gray-400 capitalize">{m.role}</span>
            </div>
          ))}
        </Card>

        {/* Logout */}
        <button onClick={handleLogout} className="mt-5 text-sm text-red-600 font-semibold flex items-center gap-1.5 active:opacity-50 transition">
          <LogOut size={15} /> Log out
        </button>
      </div>
    </div>
  );
}
