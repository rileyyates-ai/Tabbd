'use client';

// Brand colors from Tabbd Brand Style Guide v1.0
export const C = {
  bg: '#0D0D0D',        // Void Black
  card: '#1A1A2E',      // Deep Charcoal
  cardHover: '#222240',
  green: '#39FF14',      // Cash Green (hero)
  white: '#F0F0F5',      // Soft White
  sec: '#9CA3AF',        // Secondary text
  tri: '#6B7280',        // Tertiary text
  blue: '#00D4FF',       // Electric Blue
  gold: '#FFD700',       // Reward Gold
  coral: '#FF6B6B',      // Alert Coral
  mint: '#00E5A0',       // Bonus Mint
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)',
};

export const TYPE_COLORS = { home: C.gold, growth: C.mint, personal: C.blue };
export const TYPE_LABELS = { home: 'Home', growth: 'Growth', personal: 'Personal' };
export const DIFF_COLORS = { Easy: C.mint, Medium: C.gold, Hard: C.coral, Epic: '#A855F7' };

export function Avatar({ name, color = C.green, size = 32 }) {
  const s = typeof size === 'number' ? size : 32;
  return (
    <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{ width: s, height: s, fontSize: s * 0.4, background: color + '20', color }}>
      {name?.charAt(0) || '?'}
    </div>
  );
}

export function Badge({ children, color = C.sec }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded font-semibold inline-block"
      style={{ background: color + '20', color }}>
      {children}
    </span>
  );
}

export function TypeDot({ type, size = 8 }) {
  return (
    <span className="inline-block rounded-full flex-shrink-0"
      style={{ width: size, height: size, background: TYPE_COLORS[type] || C.sec }} />
  );
}

export function XPBar({ value, max, color = C.green, height = 4 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', height }}>
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Card({ children, onClick, accent, className = '' }) {
  return (
    <div onClick={onClick}
      className={`rounded-[10px] p-4 mb-2 transition ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      style={{ background: C.card, border: `1px solid ${accent || C.border}` }}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', disabled, full = true, className = '' }) {
  const styles = {
    primary: `bg-[${C.green}] text-[#0D0D0D] font-bold`,
    success: `bg-[#059669] text-white`,
    danger: `bg-[${C.coral}] text-white`,
    accent: `bg-[${C.blue}] text-[#0D0D0D]`,
    gold: `bg-[${C.gold}] text-[#0D0D0D]`,
    ghost: `bg-transparent text-[${C.sec}]`,
    'ghost-danger': `bg-transparent text-[${C.coral}]`,
  };
  // Using inline styles for dynamic colors since Tailwind can't compile these
  const variantStyles = {
    primary: { background: C.green, color: '#0D0D0D' },
    success: { background: '#059669', color: '#fff' },
    danger: { background: C.coral, color: '#fff' },
    accent: { background: C.blue, color: '#0D0D0D' },
    gold: { background: C.gold, color: '#0D0D0D' },
    ghost: { background: 'transparent', color: C.sec },
    'ghost-danger': { background: 'transparent', color: C.coral },
  };
  const s = variantStyles[variant] || variantStyles.primary;
  return (
    <button onClick={disabled ? undefined : onClick}
      className={`${full ? 'w-full' : ''} px-5 py-2.5 rounded-lg text-sm font-bold transition ${disabled ? 'opacity-40 cursor-default' : ''} ${className}`}
      style={{ ...s, opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  );
}

export function Label({ children }) {
  return <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.sec }}>{children}</label>;
}

export function Input({ ...props }) {
  return (
    <input {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none bg-[#0D0D0D] ${props.className || ''}`}
      style={{ border: `1px solid ${C.border}`, color: C.white, ...props.style }}
    />
  );
}

export function Textarea({ ...props }) {
  return (
    <textarea {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg text-sm focus:outline-none resize-vertical bg-[#0D0D0D] ${props.className || ''}`}
      style={{ border: `1px solid ${C.border}`, color: C.white, ...props.style }}
    />
  );
}

export function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div onClick={e => e.stopPropagation()}
        className="w-full md:max-w-md md:rounded-2xl rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up"
        style={{ background: C.card, border: `1px solid ${C.border}` }}>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-lg text-sm font-bold z-[200] animate-fade-in shadow-lg"
      style={{ background: C.green, color: '#0D0D0D' }}>
      {message}
    </div>
  );
}

export function LootDrop({ loot }) {
  if (!loot) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center">
      <div className="rounded-2xl px-10 py-8 text-center animate-loot-pop shadow-2xl"
        style={{ background: C.card, border: `2px solid ${C.green}` }}>
        <div className="text-3xl mb-2">⚡</div>
        <div className="text-lg font-bold" style={{ color: C.white }}>{loot.msg}</div>
        <div className="text-3xl font-extrabold mt-2 font-mono" style={{ color: C.gold }}>+{loot.coins} bonus</div>
        <div className="text-xs mt-2" style={{ color: C.sec }}>Lucky drop from your challenge!</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, unit, icon, color }) {
  return (
    <div className="rounded-[10px] p-3.5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: C.sec }}>{label}</span>
      </div>
      <div className="text-xl font-bold tracking-tight font-mono" style={{ color: C.white }}>
        {value}<span className="text-xs font-normal ml-1" style={{ color: C.tri }}>{unit}</span>
      </div>
    </div>
  );
}
