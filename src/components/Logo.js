'use client';

// Primary Wordmark (Logo A) from Tabbd Brand Style Guide v1.0
// "ta" in white/dark with green underline + "bbd" in Cash Green (#39FF14)
// On dark backgrounds: "ta" is white, "bbd" is green
// On light backgrounds: "ta" is Void Black, "bbd" is green (per brand guide)

export function TabbdLogo({ size = 'default', onDark = true }) {
  // size options: 'sm' (nav), 'default' (sidebar), 'lg' (landing hero)
  const sizes = {
    sm: { fontSize: 20, barWidth: 22, barHeight: 2, gap: 3 },
    default: { fontSize: 24, barWidth: 26, barHeight: 2.5, gap: 4 },
    lg: { fontSize: 36, barWidth: 40, barHeight: 3, gap: 5 },
    xl: { fontSize: 48, barWidth: 52, barHeight: 4, gap: 6 },
  };
  const s = sizes[size] || sizes.default;
  const baseColor = onDark ? '#F0F0F5' : '#0D0D0D';
  const green = '#39FF14';

  return (
    <div className="inline-flex flex-col" style={{ lineHeight: 1 }}>
      <div style={{ fontSize: s.fontSize, fontWeight: 900, letterSpacing: '-0.02em', fontFamily: "'DM Sans', 'Helvetica Neue', system-ui, sans-serif" }}>
        <span style={{ color: baseColor }}>ta</span>
        <span style={{ color: baseColor, marginRight: 2 }}> </span>
        <span style={{ color: green }}>bbd</span>
      </div>
      <div style={{ width: s.barWidth, height: s.barHeight, background: green, borderRadius: 1, marginTop: s.gap }} />
    </div>
  );
}

// App icon version (Logo B) - receipt shape with T
export function TabhdIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="26" rx="4" fill="#39FF14" />
      <path d="M4 26L8 22L12 26L16 22L20 26L24 22L28 26V28C28 30.2091 26.2091 32 24 32H8C5.79086 32 4 30.2091 4 28V26Z" fill="#39FF14" />
      <text x="16" y="18" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="18" fontWeight="900" fill="#0D0D0D">T</text>
    </svg>
  );
}
