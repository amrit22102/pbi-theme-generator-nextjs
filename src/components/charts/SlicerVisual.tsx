'use client';
import { useThemeStore } from '@/store/themeStore';

const items = ['All', '2024', '2025', '2026'];

export default function SlicerVisualPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const ff = customization.font.fontFamily;
  const fs = customization.font.fontSize;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', fontFamily: `'${ff}', sans-serif`,
      gap: 2, padding: '0 16px',
    }}>
      <div style={{
        fontSize: fs + 1, fontWeight: 700, color: c.foreground, marginBottom: 8,
        borderBottom: `2px solid ${c.tableAccent}`, paddingBottom: 6,
      }}>
        Year
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          padding: '8px 12px', fontSize: fs + 1,
          color: i === 2 ? c.tableAccent : c.foreground,
          fontWeight: i === 2 ? 700 : 400,
          cursor: 'pointer',
          background: i === 2 ? `${c.tableAccent}12` : 'transparent',
          borderLeft: i === 2 ? `3px solid ${c.tableAccent}` : '3px solid transparent',
          transition: 'all 0.1s ease',
        }}>
          {item}
        </div>
      ))}
    </div>
  );
}
