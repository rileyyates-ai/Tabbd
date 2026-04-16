'use client';

export function Avatar({ name, color = '#0066FF', size = 32 }) {
  const s = typeof size === 'number' ? size : 32;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: s, height: s, fontSize: s * 0.4,
        background: color + '15', color: color,
      }}
    >
      {name?.charAt(0) || '?'}
    </div>
  );
}

export function Badge({ children, color = '#6B7280' }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded font-semibold inline-block"
      style={{ background: color + '18', color }}
    >
      {children}
    </span>
  );
}

export function TypeDot({ type, size = 8 }) {
  const colors = { home: '#D97706', growth: '#059669', personal: '#0066FF' };
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: size, height: size, background: colors[type] || '#6B7280' }}
    />
  );
}

export function XPBar({ value, max, color = '#0066FF', height = 4 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex-1 rounded-full overflow-hidden" style={{ background: '#F3F4F6', height }}>
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Card({ children, onClick, accent, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 mb-2 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      style={{ border: `1px solid ${accent || '#E5E7EB'}` }}
    >
      {children}
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', disabled, full = true, className = '' }) {
  const styles = {
    primary: 'bg-[#0A0A0A] text-white hover:bg-[#1a1a1a]',
    success: 'bg-[#059669] text-white hover:bg-[#047857]',
    danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
    accent: 'bg-[#0066FF] text-white hover:bg-[#0052CC]',
    ghost: 'bg-transparent text-[#6B7280] hover:bg-gray-50',
    'ghost-danger': 'bg-transparent text-[#DC2626] hover:bg-red-50',
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${full ? 'w-full' : ''} px-5 py-2.5 rounded-lg text-sm font-semibold transition ${styles[variant] || styles.primary} ${disabled ? 'opacity-40 cursor-default' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function Label({ children }) {
  return <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{children}</label>;
}

export function Input({ ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white ${props.className || ''}`}
    />
  );
}

export function Textarea({ ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white resize-vertical ${props.className || ''}`}
    />
  );
}

export function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up"
      >
        {children}
      </div>
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#0A0A0A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold z-[200] animate-fade-in shadow-lg">
      {message}
    </div>
  );
}

export function LootDrop({ loot }) {
  if (!loot) return null;
  return (
    <div className="fixed inset-0 bg-black/30 z-[150] flex items-center justify-center">
      <div className="bg-white rounded-2xl px-10 py-8 text-center animate-loot-pop border-2 border-[#0066FF] shadow-2xl">
        <div className="text-3xl mb-2">&#10024;</div>
        <div className="text-lg font-bold">{loot.msg}</div>
        <div className="text-3xl font-extrabold text-[#D97706] mt-2">+{loot.coins} bonus coins</div>
        <div className="text-xs text-gray-400 mt-2">Lucky drop from your challenge!</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, unit, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-bold tracking-tight">
        {value}<span className="text-xs text-gray-400 font-normal ml-1">{unit}</span>
      </div>
    </div>
  );
}

export const TYPE_COLORS = { home: '#D97706', growth: '#059669', personal: '#0066FF' };
export const TYPE_LABELS = { home: 'Home', growth: 'Growth', personal: 'Personal' };
export const DIFF_COLORS = { Easy: '#059669', Medium: '#D97706', Hard: '#DC2626', Epic: '#7C3AED' };
