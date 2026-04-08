'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiAxisTick, pbiGridlineDash } from './pbiStyles';

const data = [
  { name: 'Jan', value: 4200 },
  { name: 'Feb', value: 3800 },
  { name: 'Mar', value: 5100 },
  { name: 'Apr', value: 4700 },
  { name: 'May', value: 5800 },
  { name: 'Jun', value: 6200 },
];

export default function ColumnChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const tick = pbiAxisTick(customization);
  const gridDash = pbiGridlineDash(customization.xAxis.gridlineStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
        <CartesianGrid stroke={customization.yAxis.gridlineColor} strokeDasharray={gridDash} vertical={false} />
        {customization.xAxis.show && (
          <XAxis dataKey="name" tick={tick} axisLine={{ stroke: c.foregroundNeutralTertiary }} tickLine={false} />
        )}
        {customization.yAxis.show && (
          <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />
        )}
        <Tooltip contentStyle={pbiTooltipStyle(customization)} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Bar dataKey="value" fill={c.dataColors[0]} radius={0} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
