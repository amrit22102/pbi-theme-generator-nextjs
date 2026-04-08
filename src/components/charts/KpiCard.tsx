'use client';
import { useThemeStore } from '@/store/themeStore';

export default function KpiCardPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const ff = customization.font.fontFamily;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      justifyContent: 'center', height: '100%',
      fontFamily: `'${ff}', sans-serif`, padding: '0 16px',
    }}>
      <div style={{ fontSize: 11, color: c.foregroundNeutralSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
        Revenue
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontSize: 42, fontWeight: 700, color: c.foreground, letterSpacing: -1 }}>$142K</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: c.good }}>▲ 12.4%</span>
        <span style={{ fontSize: 12, color: c.foregroundNeutralTertiary }}>vs Target</span>
      </div>
      <div style={{ width: '100%', height: 6, borderRadius: 3, background: c.backgroundLight, overflow: 'hidden', marginTop: 16 }}>
        <div style={{ width: '78%', height: '100%', borderRadius: 3, background: c.dataColors[0] }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: c.foregroundNeutralTertiary }}>Actual: $142K</span>
        <span style={{ fontSize: 11, color: c.foregroundNeutralTertiary }}>Target: $182K</span>
      </div>
    </div>
  );
}
