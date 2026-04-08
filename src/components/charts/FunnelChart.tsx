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
  const ff = customization.font.fontFamily;
  const max = data[0].value;

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
                background: c.dataColors[i % c.dataColors.length],
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
