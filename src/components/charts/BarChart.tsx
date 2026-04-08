'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiAxisTick, pbiGridlineDash } from './pbiStyles';

const data = [
  { name: 'Product A', value: 5800 },
  { name: 'Product B', value: 4200 },
  { name: 'Product C', value: 7100 },
  { name: 'Product D', value: 3600 },
  { name: 'Product E', value: 6400 },
];

export default function BarChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const tick = pbiAxisTick(customization);
  const gridDash = pbiGridlineDash(customization.yAxis.gridlineStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 4 }}>
        <CartesianGrid stroke={customization.xAxis.gridlineColor} strokeDasharray={gridDash} horizontal={false} />
        {customization.xAxis.show && <XAxis type="number" tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />}
        {customization.yAxis.show && <YAxis dataKey="name" type="category" tick={tick} axisLine={false} tickLine={false} width={72} />}
        <Tooltip contentStyle={pbiTooltipStyle(customization)} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Bar dataKey="value" fill={c.dataColors[2]} radius={0} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
