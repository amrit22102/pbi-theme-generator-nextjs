'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiAxisTick, pbiGridlineDash, pbiLegendStyle } from './pbiStyles';

const data = [
  { name: 'East', Online: 4200, Retail: 3600, Partner: 2800 },
  { name: 'West', Online: 3800, Retail: 5100, Partner: 3200 },
  { name: 'North', Online: 5600, Retail: 4000, Partner: 4100 },
  { name: 'South', Online: 4100, Retail: 4800, Partner: 3500 },
];

export default function ClusteredBarChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const tick = pbiAxisTick(customization);
  const gridDash = pbiGridlineDash(customization.yAxis.gridlineStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 4 }}>
        <CartesianGrid stroke={customization.xAxis.gridlineColor} strokeDasharray={gridDash} horizontal={false} />
        {customization.xAxis.show && <XAxis type="number" tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />}
        {customization.yAxis.show && <YAxis dataKey="name" type="category" tick={tick} axisLine={false} tickLine={false} width={48} />}
        <Tooltip contentStyle={pbiTooltipStyle(customization)} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        {customization.legend.show && <Legend wrapperStyle={pbiLegendStyle(customization)} iconType="square" iconSize={10} />}
        <Bar dataKey="Online" fill={c.dataColors[0]} radius={0} barSize={14} />
        <Bar dataKey="Retail" fill={c.dataColors[1]} radius={0} barSize={14} />
        <Bar dataKey="Partner" fill={c.dataColors[2]} radius={0} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}
