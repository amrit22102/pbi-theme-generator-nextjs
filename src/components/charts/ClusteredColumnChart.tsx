'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiAxisTick, pbiGridlineDash, pbiLegendStyle } from './pbiStyles';

const data = [
  { name: 'Q1', Product: 4200, Service: 3100, Support: 2400 },
  { name: 'Q2', Product: 3800, Service: 4200, Support: 2800 },
  { name: 'Q3', Product: 5100, Service: 3600, Support: 3200 },
  { name: 'Q4', Product: 4700, Service: 5000, Support: 3800 },
];

export default function ClusteredColumnChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const tick = pbiAxisTick(customization);
  const gridDash = pbiGridlineDash(customization.xAxis.gridlineStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
        <CartesianGrid stroke={customization.yAxis.gridlineColor} strokeDasharray={gridDash} vertical={false} />
        {customization.xAxis.show && <XAxis dataKey="name" tick={tick} axisLine={{ stroke: c.foregroundNeutralTertiary }} tickLine={false} />}
        {customization.yAxis.show && <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />}
        <Tooltip contentStyle={pbiTooltipStyle(customization)} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        {customization.legend.show && <Legend wrapperStyle={pbiLegendStyle(customization)} iconType="square" iconSize={10} />}
        <Bar dataKey="Product" fill={c.dataColors[0]} radius={0} barSize={20} />
        <Bar dataKey="Service" fill={c.dataColors[1]} radius={0} barSize={20} />
        <Bar dataKey="Support" fill={c.dataColors[2]} radius={0} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
