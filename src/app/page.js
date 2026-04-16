import { TabbdLogo } from '@/components/Logo';
import Link from 'next/link';
import { Target, Users, Flame, ArrowRight, Star, MessageSquare, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0D0D0D', color: '#F0F0F5' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <TabbdLogo size="sm" />
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Log in</Link>
          <Link href="/signup" className="text-sm font-bold px-5 py-2.5 rounded-lg" style={{ background: '#39FF14', color: '#0D0D0D' }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-16 md:pt-24 pb-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Your family, <span style={{ color: '#39FF14' }}>challenged.</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#9CA3AF' }}>
          Tabbd turns household chaos into a game everyone actually plays — parents included. 
          Create challenges, earn coins, build streaks, and stop being the family nag.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-24">
          <Link href="/signup" className="inline-flex items-center gap-2 text-base font-bold px-8 py-3.5 rounded-lg w-full sm:w-auto justify-center" style={{ background: '#39FF14', color: '#0D0D0D' }}>
            Start your family <ArrowRight size={18} />
          </Link>
          <Link href="/join" className="inline-flex items-center gap-2 text-base font-semibold px-8 py-3.5 rounded-lg w-full sm:w-auto justify-center" style={{ background: '#1A1A2E', color: '#F0F0F5', border: '1px solid rgba(255,255,255,0.08)' }}>
            Join with invite code
          </Link>
        </div>

        {/* Tension */}
        <div className="text-left max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#FF6B6B' }}>Chore apps are broken.</h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: '#9CA3AF' }}>
            They put parents in charge and kids underneath. One person assigns, everyone else groans. 
            That's not a system — that's a power struggle.
          </p>
          <p className="text-base leading-relaxed" style={{ color: '#9CA3AF' }}>
            Tabbd is different. Everyone's a player. Dad has a streak to protect. Your 13-year-old can 
            challenge you to put your phone down at dinner. And when someone disagrees? They negotiate — right in the app.
          </p>
        </div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-20">
          {[
            { 
              icon: <Users size={24} />, color: '#39FF14',
              title: 'Everyone plays.',
              desc: "Parents don't just manage — they participate. Mom gets challenged too. Dad has coins to earn. When the whole family has skin in the game, everything changes."
            },
            { 
              icon: <Target size={24} />, color: '#00D4FF',
              title: 'Challenges, not chores.',
              desc: "Nobody wants to do chores. But challenges? Those hit different. Same responsibilities, completely different energy. Borrowed from the culture your kids already live in."
            },
            { 
              icon: <MessageSquare size={24} />, color: '#FFD700',
              title: "Negotiate, don't dictate.",
              desc: "Kids can suggest challenges for parents. Parents can counter. Everyone can accept or decline with a reason. It mirrors how real families actually communicate — just with structure."
            },
          ].map((f, i) => (
            <div key={i} className="rounded-[10px] p-6" style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="mb-3" style={{ color: f.color }}>{f.icon}</div>
              <div className="font-bold text-lg mb-2" style={{ color: '#F0F0F5' }}>{f.title}</div>
              <div className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: '#F0F0F5' }}>Up and running in 2 minutes.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {[
              { step: '01', text: 'One parent creates the family and gets an invite code.' },
              { step: '02', text: 'Share the code. Everyone joins from their phone.' },
              { step: '03', text: 'Start creating challenges, earning coins, and building streaks.' },
            ].map((s, i) => (
              <div key={i} className="rounded-[10px] p-5" style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-2xl font-bold font-mono mb-2" style={{ color: '#39FF14' }}>{s.step}</div>
                <div className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="text-left max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ color: '#F0F0F5' }}>The system.</h2>
          {[
            { title: 'XP + Coins', color: '#39FF14', icon: <Star size={20} />,
              desc: "Every challenge completed earns XP (permanent progress) and coins (spendable in the reward shop). Level up. Watch your kids do math voluntarily to figure out if they can afford movie night pick." },
            { title: 'Streaks + Shields', color: '#00E5A0', icon: <Flame size={20} />,
              desc: "Consecutive days build streaks. Miss a day, lose your streak — unless you've earned a shield. The family streak only survives when everyone contributes. Built-in accountability without the lecture." },
            { title: 'Reward Shop', color: '#FFD700', icon: <Star size={20} />,
              desc: "Coins buy real rewards: extra screen time, choosing dinner, sleeping in Saturday, skipping a chore. Parents set the menu. Kids spend strategically." },
            { title: 'Negotiation', color: '#00D4FF', icon: <MessageSquare size={20} />,
              desc: 'Someone disagrees with a challenge? They counter-offer. "How about 4 nights instead of 7?" Real conversation, built into the flow. No more arguments — just proposals.' },
            { title: 'Shoutouts', color: '#FF6B6B', icon: <Users size={20} />,
              desc: "Send coins to a family member for doing something great. Public recognition in the family feed. The dopamine hit of getting noticed by people who matter." },
          ].map((f, i) => (
            <div key={i} className="rounded-[10px] p-5 mb-3" style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `3px solid ${f.color}` }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: f.color }}>{f.icon}</span>
                <span className="font-bold" style={{ color: '#F0F0F5' }}>{f.title}</span>
              </div>
              <div className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Origin */}
        <div className="rounded-[10px] p-8 mb-20 text-left max-w-2xl mx-auto receipt-tear" style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: '#39FF14' }}>Built by a family of 6 in Idaho.</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>
            Tabbd started because we needed it. Two parents, four kids, and zero systems that treated us 
            like a team instead of a hierarchy. So we built one.
          </p>
        </div>

        {/* Final CTA */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#F0F0F5' }}>Your family's operating system is ready.</h2>
          <p className="text-base mb-8" style={{ color: '#9CA3AF' }}>Free to start. No credit card. Takes 2 minutes.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 text-base font-bold px-8 py-3.5 rounded-lg w-full sm:w-auto justify-center" style={{ background: '#39FF14', color: '#0D0D0D' }}>
              Start your family <ArrowRight size={18} />
            </Link>
            <Link href="/join" className="inline-flex items-center gap-2 text-base font-semibold px-8 py-3.5 rounded-lg w-full sm:w-auto justify-center" style={{ background: '#1A1A2E', color: '#F0F0F5', border: '1px solid rgba(255,255,255,0.08)' }}>
              Join with invite code
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#6B7280' }}>
        Tabbd · Built for families who show up.
      </footer>
    </div>
  );
}
