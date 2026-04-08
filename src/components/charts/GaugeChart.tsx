'use client';
import { useThemeStore } from '@/store/themeStore';

export default function GaugeChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const ff = customization.font.fontFamily;
  const value = 72;
  const angle = (value / 100) * 180;

  const cx = 120; const cy = 100; const r = 72; const thickness = 20;

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 180) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const bgStart = polarToCartesian(cx, cy, r, 0);
  const bgEnd = polarToCartesian(cx, cy, r, 180);
  const valEnd = polarToCartesian(cx, cy, r, angle);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%',
      fontFamily: `'${ff}', sans-serif`,
    }}>
      <svg width={240} height={130} viewBox="0 0 240 130">
        <path d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`} fill="none" stroke={c.backgroundLight} strokeWidth={thickness} />
        <path d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArc} 1 ${valEnd.x} ${valEnd.y}`} fill="none" stroke={c.dataColors[0]} strokeWidth={thickness} />
        {(() => {
          const inner = polarToCartesian(cx, cy, r - thickness / 2 - 2, (85 / 100) * 180);
          const outer = polarToCartesian(cx, cy, r + thickness / 2 + 2, (85 / 100) * 180);
          return <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={c.foreground} strokeWidth={2} />;
        })()}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={28} fontWeight={700} fill={c.foreground} fontFamily={`'${ff}', sans-serif`}>
          {value}%
        </text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: 180, marginTop: -4 }}>
        <span style={{ fontSize: 10, color: c.foregroundNeutralTertiary }}>0</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: c.foregroundNeutralSecondary }}>Target: 85%</span>
        <span style={{ fontSize: 10, color: c.foregroundNeutralTertiary }}>100</span>
      </div>
    </div>
  );
}
