'use client';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { Home, Target, Plus, Rss, Gift, User, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { Toast, LootDrop, C } from '@/components/ui';

const AppContext = createContext(null);
export function useApp() { return useContext(AppContext); }

export default function DashboardLayout({ children }) {
  const [profile, setProfile] = useState(null);
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [loot, setLoot] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const flash = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); }, []);
  const triggerLoot = useCallback((diff) => {
    if (Math.random() > 0.45) { const b = [5,10,15,20,25][Math.floor(Math.random()*5)]; setTimeout(() => { setLoot({ coins: b, msg: diff==='Hard'||diff==='Epic'?'Epic loot!':'Bonus drop!' }); setTimeout(() => setLoot(null), 2500); }, 800); return b; } return 0;
  }, []);

  useEffect(() => { loadUserData(); }, []);
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!prof) { router.push('/login'); return; }
    setProfile(prof);
    const { data: fam } = await supabase.from('families').select('*').eq('id', prof.family_id).single();
    setFamily(fam);
    const { data: mems } = await supabase.from('profiles').select('*').eq('family_id', prof.family_id).order('role', { ascending: false });
    setMembers(mems || []); setLoading(false);
  };

  const refreshProfile = async () => {
    if (!profile) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
    if (data) setProfile(data);
    const { data: mems } = await supabase.from('profiles').select('*').eq('family_id', profile.family_id).order('role', { ascending: false });
    if (mems) setMembers(mems);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}><div className="text-sm" style={{ color: C.sec }}>Loading...</div></div>;

  const isParent = profile?.role === 'parent';
  const fStreak = members.length > 0 ? Math.min(...members.map(m => m.streak)) : 0;

  const allNav = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/challenges', icon: Target, label: 'Challenges' },
    { href: '/dashboard/create', icon: Plus, label: 'New challenge' },
    { href: '/dashboard/feed', icon: Rss, label: 'Family feed' },
    { href: '/dashboard/rewards', icon: Gift, label: 'Reward shop' },
    ...(isParent ? [{ href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' }] : []),
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const mobileNav = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/challenges', icon: Target, label: 'Challenges' },
    { href: '/dashboard/create', icon: Plus, label: 'New', special: true },
    { href: '/dashboard/feed', icon: Rss, label: 'Feed' },
    { id: 'more', icon: Menu, label: 'More' },
  ];

  const ctx = { profile, setProfile, family, members, setMembers, supabase, flash, triggerLoot, refreshProfile, isParent, fStreak };

  return (
    <AppContext.Provider value={ctx}>
      <div className="flex min-h-screen" style={{ background: C.bg, fontFamily: "'DM Sans','Helvetica Neue',system-ui,sans-serif", color: C.white }}>
        <style>{`
          @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
          @keyframes lootPop{0%{transform:scale(0);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
          .animate-fade-in{animation:fadeIn .2s ease}.animate-slide-up{animation:slideUp .25s ease}.animate-loot-pop{animation:lootPop .3s ease}
        `}</style>
        <Toast message={toast} /><LootDrop loot={loot} />

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-60 flex-col fixed left-0 top-0 bottom-0 z-10" style={{ background: C.card, borderRight: `1px solid ${C.border}` }}>
          <div className="px-5 pt-6 pb-4"><div className="text-lg font-bold tracking-tight" style={{ color: C.green }}>TABBD</div><div className="text-[11px] mt-0.5" style={{ color: C.sec }}>{family?.name}</div></div>
          <div className="mx-3 mb-2 px-3 py-2.5 rounded-xl" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: (profile.avatar_color || C.green) + '20', color: profile.avatar_color || C.green }}>{profile.name?.charAt(0)}</div>
              <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{profile.name}</div><div className="text-[11px]" style={{ color: C.sec }}>{isParent ? 'Parent' : `Age ${profile.age}`} · Lv.{profile.level}</div></div>
            </div>
          </div>
          <nav className="flex-1 py-2">
            {allNav.map(item => { const a = pathname === item.href; return (
              <Link key={item.href} href={item.href} className="flex items-center gap-2.5 mx-3 px-3 py-2 rounded-lg text-sm transition" style={{ background: a ? C.green + '15' : 'transparent', color: a ? C.green : C.sec, fontWeight: a ? 600 : 500 }}>
                <item.icon size={18} strokeWidth={a ? 2.2 : 1.5} />{item.label}
              </Link>
            ); })}
          </nav>
          <div className="px-5 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="flex justify-between text-[11px] mb-1.5"><span style={{ color: C.sec }}>Family streak</span><span className="font-semibold" style={{ color: C.mint }}>Day {fStreak}</span></div>
            <div className="flex gap-1">{members.map(m => <div key={m.id} className="flex-1 h-1 rounded" style={{ background: m.avatar_color || C.green }} />)}</div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="mx-3 mb-4 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition" style={{ color: C.coral }}><LogOut size={16} /> Log out</button>
        </aside>

        <main className="flex-1 md:ml-60 min-h-screen pb-24 md:pb-8"><div className="px-4 md:px-10 py-5 md:py-8 max-w-5xl">{children}</div></main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-end pt-2 pb-6 z-20 safe-area-pb" style={{ background: C.card, borderTop: `1px solid ${C.border}` }}>
          {mobileNav.map(item => {
            if (item.special) return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 text-[10px] -mt-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg" style={{ background: C.green }}><Plus size={20} color="#0D0D0D" /></div>
                <span style={{ color: C.sec }} className="mt-0.5">{item.label}</span>
              </Link>
            );
            if (item.id === 'more') return (
              <button key="more" onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-0.5 text-[10px]" style={{ color: C.sec }}><Menu size={22} strokeWidth={1.5} /><span>More</span></button>
            );
            const a = pathname === item.href;
            return <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 text-[10px]" style={{ color: a ? C.green : C.sec }}><item.icon size={22} strokeWidth={a ? 2.5 : 1.5} /><span className={a ? 'font-bold' : ''}>{item.label}</span></Link>;
          })}
        </nav>

        {/* More drawer */}
        {moreOpen && (
          <div className="md:hidden fixed inset-0 z-30" onClick={() => setMoreOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl animate-slide-up" style={{ background: C.card, border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center px-5 pt-5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: (profile.avatar_color || C.green) + '20', color: profile.avatar_color || C.green }}>{profile.name?.charAt(0)}</div>
                  <div><div className="text-sm font-semibold">{profile.name}</div><div className="text-[11px]" style={{ color: C.sec }}>Lv.{profile.level} · <span className="font-mono">{profile.coins}</span> coins</div></div>
                </div>
                <button onClick={() => setMoreOpen(false)} style={{ color: C.sec }}><X size={20} /></button>
              </div>
              <div className="py-2 pb-8" style={{ borderTop: `1px solid ${C.border}` }}>
                {allNav.map(item => { const a = pathname === item.href; return (
                  <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm transition" style={{ color: a ? C.green : C.white, fontWeight: a ? 600 : 400, background: a ? C.green + '10' : 'transparent' }}>
                    <item.icon size={20} strokeWidth={a ? 2.2 : 1.5} />{item.label}
                  </Link>
                ); })}
                <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                  <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="flex items-center gap-3 px-5 py-3 text-sm w-full" style={{ color: C.coral }}><LogOut size={20} strokeWidth={1.5} />Log out</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
