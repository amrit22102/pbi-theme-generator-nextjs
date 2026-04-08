'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiLegendStyle } from './pbiStyles';

const data = [
  { name: 'Technology', value: 35 },
  { name: 'Finance', value: 25 },
  { name: 'Healthcare', value: 20 },
  { name: 'Retail', value: 12 },
  { name: 'Energy', value: 8 },
];

export default function PieChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="48%" outerRadius={85} dataKey="value" strokeWidth={2} stroke="#ffffff">
          {data.map((_, i) => (
            <Cell key={i} fill={c.dataColors[i % c.dataColors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={pbiTooltipStyle(customization)} />
        {customization.legend.show && (
          <Legend wrapperStyle={pbiLegendStyle(customization)} iconType="square" iconSize={10} layout="vertical" align="right" verticalAlign="middle" />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
