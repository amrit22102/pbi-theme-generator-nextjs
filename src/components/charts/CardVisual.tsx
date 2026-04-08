'use client';
import { useThemeStore } from '@/store/themeStore';

const cards = [
  { label: 'Total Sales', value: '$2.4M', change: '+8.2%', up: true },
  { label: 'Customers', value: '12,847', change: '+3.1%', up: true },
  { label: 'Avg Order', value: '$186', change: '-1.4%', up: false },
];

export default function CardVisualPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const ff = customization.font.fontFamily;

  return (
    <div style={{
      display: 'flex', gap: 16, height: '100%', alignItems: 'center',
      fontFamily: `'${ff}', sans-serif`, padding: '0 8px',
    }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          flex: 1, padding: '20px 16px', borderRadius: 4,
          background: '#ffffff', border: `1px solid ${c.backgroundLight}`, textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: c.foregroundNeutralSecondary, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {card.label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: c.foreground, marginBottom: 6, letterSpacing: -0.5 }}>
            {card.value}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: card.up ? c.good : c.bad }}>
            {card.up ? '▲' : '▼'} {card.change}
          </div>
        </div>
      ))}
    </div>
  );
}
