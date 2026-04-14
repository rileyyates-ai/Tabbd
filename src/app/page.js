import Link from 'next/link';
import { Target, Users, Star, Shield, Flame, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-xl font-bold tracking-tight">Family Challenge</div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</Link>
          <Link href="/signup" className="text-sm font-semibold text-white bg-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-700 transition">Get started</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
          The family operating system<br />powered by challenges
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Everyone participates — parents included. Create challenges, earn rewards,
          build streaks, and grow together. Not a chore app. A family culture.
        </p>
        <div className="flex items-center justify-center gap-4 mb-20">
          <Link href="/signup" className="inline-flex items-center gap-2 text-base font-semibold text-white bg-blue-600 px-8 py-3.5 rounded-lg hover:bg-blue-700 transition">
            Create your family <ArrowRight size={18} />
          </Link>
          <Link href="/join" className="inline-flex items-center gap-2 text-base font-semibold text-gray-700 bg-gray-100 px-8 py-3.5 rounded-lg hover:bg-gray-200 transition">
            Join with invite code
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { icon: <Target size={24} />, title: 'Challenge anyone', desc: 'Parents challenge kids. Kids suggest challenges for parents. Everyone negotiates, everyone grows.' },
            { icon: <Star size={24} />, title: 'Earn real rewards', desc: 'Coins and XP for every challenge completed. Redeem for screen time, dinner picks, or savings deposits.' },
            { icon: <Flame size={24} />, title: 'Build family streaks', desc: 'Individual streaks and a family streak that only survives when everyone contributes. Streak shields for grace.' },
          ].map((f, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-6">
              <div className="text-blue-600 mb-3">{f.icon}</div>
              <div className="font-semibold text-lg mb-2">{f.title}</div>
              <div className="text-gray-500 text-sm leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        Family Challenge · Built with behavioral science
      </footer>
    </div>
  );
}
