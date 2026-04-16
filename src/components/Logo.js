'use client';

export function TabbdLogo({ size = 'default', onDark = true }) {
  const sizes = {
    sm: { fontSize: 20, barWidth: 46, barHeight: 2, gap: 3 },
    default: { fontSize: 24, barWidth: 56, barHeight: 2.5, gap: 4 },
    lg: { fontSize: 36, barWidth: 84, barHeight: 3, gap: 5 },
    xl: { fontSize: 48, barWidth: 112, barHeight: 4, gap: 6 },
  };
  const s = sizes[size] || sizes.default;
  const baseColor = onDark ? '#F0F0F5' : '#0D0D0D';
  const green = '#39FF14';

  return (
    <div className="inline-flex flex-col" style={{ lineHeight: 1 }}>
      <div style={{ fontSize: s.fontSize, fontWeight: 900, letterSpacing: '-0.02em', fontFamily: "'DM Sans', 'Helvetica Neue', system-ui, sans-serif" }}>
        <span style={{ color: baseColor }}>ta</span>
        <span style={{ color: green }}>bb</span>
        <span style={{ color: baseColor }}>d</span>
      </div>
      <div style={{ width: s.barWidth, height: s.barHeight, background: green, borderRadius: 1, marginTop: s.gap }} />
    </div>
  );
}
