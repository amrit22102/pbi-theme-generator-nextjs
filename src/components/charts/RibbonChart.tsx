'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiAxisTick, pbiGridlineDash, pbiLegendStyle } from './pbiStyles';

const data = [
  { name: 'Jan', Marketing: 2400, Sales: 1800, Support: 1200 },
  { name: 'Feb', Marketing: 2800, Sales: 2200, Support: 1600 },
  { name: 'Mar', Marketing: 3200, Sales: 2600, Support: 1800 },
  { name: 'Apr', Marketing: 2900, Sales: 3000, Support: 2000 },
  { name: 'May', Marketing: 3600, Sales: 3200, Support: 2400 },
];

export default function RibbonChartPreview() {
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
        <Bar dataKey="Marketing" stackId="a" fill={c.dataColors[4]} radius={0} />
        <Bar dataKey="Sales" stackId="a" fill={c.dataColors[5]} radius={0} />
        <Bar dataKey="Support" stackId="a" fill={c.dataColors[6]} radius={0} />
      </BarChart>
    </ResponsiveContainer>
  );
}
