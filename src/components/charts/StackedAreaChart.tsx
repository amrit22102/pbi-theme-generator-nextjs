'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiAxisTick, pbiGridlineDash, pbiLegendStyle } from './pbiStyles';

const data = [
  { name: 'Jan', Online: 2400, Store: 1800, Wholesale: 1200 },
  { name: 'Feb', Online: 2800, Store: 2200, Wholesale: 1600 },
  { name: 'Mar', Online: 3200, Store: 2600, Wholesale: 1800 },
  { name: 'Apr', Online: 2900, Store: 3000, Wholesale: 2000 },
  { name: 'May', Online: 3600, Store: 3200, Wholesale: 2400 },
  { name: 'Jun', Online: 4100, Store: 3800, Wholesale: 2800 },
];

export default function StackedAreaChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const tick = pbiAxisTick(customization);
  const gridDash = pbiGridlineDash(customization.xAxis.gridlineStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
        <CartesianGrid stroke={customization.yAxis.gridlineColor} strokeDasharray={gridDash} vertical={false} />
        {customization.xAxis.show && <XAxis dataKey="name" tick={tick} axisLine={{ stroke: c.foregroundNeutralTertiary }} tickLine={false} />}
        {customization.yAxis.show && <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />}
        <Tooltip contentStyle={pbiTooltipStyle(customization)} />
        {customization.legend.show && <Legend wrapperStyle={pbiLegendStyle(customization)} iconType="square" iconSize={10} />}
        <Area type="linear" dataKey="Online" stackId="1" stroke={c.dataColors[0]} fill={c.dataColors[0]} fillOpacity={0.7} />
        <Area type="linear" dataKey="Store" stackId="1" stroke={c.dataColors[1]} fill={c.dataColors[1]} fillOpacity={0.7} />
        <Area type="linear" dataKey="Wholesale" stackId="1" stroke={c.dataColors[2]} fill={c.dataColors[2]} fillOpacity={0.7} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
