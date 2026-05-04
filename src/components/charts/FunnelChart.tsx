'use client';
import { useThemeStore } from '@/store/themeStore';

const data = [
  { label: 'Awareness', value: 8500 },
  { label: 'Interest', value: 6200 },
  { label: 'Consideration', value: 4100 },
  { label: 'Intent', value: 2800 },
  { label: 'Purchase', value: 1600 },
];

export default function FunnelChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const vc = customization.visualCustomizations?.funnelChart || {};
  const ff = customization.font.fontFamily;
  const max = data[0].value;

  // Build colors with visual overrides
  const colors = [...c.dataColors];
  if (vc.primaryColor) colors[0] = vc.primaryColor;
  if (vc.secondaryColor) colors[1] = vc.secondaryColor;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', gap: 4, padding: '0 16px',
      fontFamily: `'${ff}', sans-serif`,
    }}>
      {data.map((item, i) => {
        const pct = (item.value / max) * 100;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <span style={{
              fontSize: 11, color: c.foregroundNeutralSecondary, width: 90, textAlign: 'right',
              fontWeight: 500, paddingRight: 12, flexShrink: 0,
            }}>
              {item.label}
            </span>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: `${pct}%`, height: 32,
                background: colors[i % colors.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 60,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  {item.value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
