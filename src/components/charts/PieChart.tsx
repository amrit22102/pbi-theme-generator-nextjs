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
  const vc = customization.visualCustomizations?.pieChart || {};

  // Build color array with visual-level overrides for first two slots
  const colors = [...c.dataColors];
  if (vc.primaryColor) colors[0] = vc.primaryColor;
  if (vc.secondaryColor) colors[1] = vc.secondaryColor;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="48%" outerRadius={85} dataKey="value" strokeWidth={2} stroke="#ffffff">
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
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
