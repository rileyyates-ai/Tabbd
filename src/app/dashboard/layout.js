'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { Home, Target, Plus, Rss, Gift, User, BarChart3, Settings, Bell, LogOut, Flame } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [profile, setProfile] = useState(null);
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    // Load profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!prof) {
      // User exists but no profile — needs onboarding
      router.push('/onboarding');
      return;
    }

    setProfile(prof);

    // Load family
    const { data: fam } = await supabase
      .from('families')
      .select('*')
      .eq('id', prof.family_id)
      .single();
    setFamily(fam);

    // Load family members
    const { data: mems } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', prof.family_id)
      .order('role', { ascending: false });
    setMembers(mems || []);

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  const isParent = profile?.role === 'parent';
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/challenges', icon: Target, label: 'Challenges' },
    { href: '/dashboard/create', icon: Plus, label: 'New challenge' },
    { href: '/dashboard/feed', icon: Rss, label: 'Family feed' },
    { href: '/dashboard/rewards', icon: Gift, label: 'Reward shop' },
    ...(isParent ? [{ href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' }] : []),
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const fStreak = members.length > 0 ? Math.min(...members.map(m => m.streak)) : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-10">
        <div className="px-5 pt-6 pb-4">
          <div className="text-lg font-bold tracking-tight">Family Challenge</div>
          <div className="text-xs text-gray-400 mt-0.5">{family?.name}</div>
        </div>

        {/* Current user */}
        <div className="mx-3 mb-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: (profile.avatar_color || '#0066FF') + '15', color: profile.avatar_color || '#0066FF' }}
            >
              {profile.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{profile.name}</div>
              <div className="text-xs text-gray-400">
                {isParent ? 'Parent' : `Age ${profile.age}`} · Lv.{profile.level}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 mx-3 px-3 py-2 rounded-lg text-sm transition ${
                  active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 font-medium'
                }`}
              >
                <item.icon size={18} strokeWidth={active ? 2.2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Family streak */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Family streak</span>
            <span className="text-green-600 font-semibold">Day {fStreak}</span>
          </div>
          <div className="flex gap-1">
            {members.map((m) => (
              <div key={m.id} className="flex-1 h-1 rounded" style={{ background: m.avatar_color || '#0066FF' }} />
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mx-3 mb-4 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition"
        >
          <LogOut size={16} /> Log out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-60 min-h-screen">
        <div className="px-6 md:px-10 py-6 md:py-8 max-w-5xl">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 pb-6 z-20">
        {[
          { href: '/dashboard', icon: Home, label: 'Home' },
          { href: '/dashboard/challenges', icon: Target, label: 'Challenges' },
          { href: '/dashboard/create', icon: Plus, label: 'New' },
          { href: '/dashboard/feed', icon: Rss, label: 'Feed' },
          { href: '/dashboard/profile', icon: User, label: 'More' },
        ].map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 text-xs ${active ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
              {item.label === 'New' ? (
                <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center -mt-3">
                  <Plus size={18} color="white" />
                </div>
              ) : (
                <item.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
