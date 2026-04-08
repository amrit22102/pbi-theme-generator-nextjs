'use client';
import { useThemeStore } from '@/store/themeStore';

const headers = ['Region', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'];
const rows = [
  ['North', '$45K', '$52K', '$48K', '$61K', '$206K'],
  ['South', '$38K', '$41K', '$45K', '$50K', '$174K'],
  ['East', '$52K', '$48K', '$55K', '$58K', '$213K'],
  ['West', '$41K', '$46K', '$42K', '$55K', '$184K'],
];

export default function MatrixTablePreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const ff = customization.font.fontFamily;
  const fs = customization.font.fontSize;

  return (
    <div style={{ height: '100%', overflow: 'auto', fontFamily: `'${ff}', sans-serif` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fs }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '8px 12px',
                textAlign: i === 0 ? 'left' : 'right',
                fontWeight: 700,
                color: c.foreground,
                borderBottom: `2px solid ${c.tableAccent}`,
                fontSize: fs,
                whiteSpace: 'nowrap',
                background: c.backgroundLight,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '7px 12px',
                  textAlign: ci === 0 ? 'left' : 'right',
                  color: ci === 0 ? c.foreground : c.foregroundNeutralSecondary,
                  fontWeight: ci === 0 || ci === row.length - 1 ? 600 : 400,
                  borderBottom: `1px solid ${c.backgroundLight}`,
                  fontSize: fs,
                  background: ri % 2 === 1 ? c.backgroundLight : '#ffffff',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
