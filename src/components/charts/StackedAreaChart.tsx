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
  const vc = customization.visualCustomizations?.stackedAreaChart || {};
  const tick = pbiAxisTick(customization);
  const gridDash = pbiGridlineDash(customization.xAxis.gridlineStyle);

  const color0 = vc.primaryColor || c.dataColors[0];
  const color1 = vc.secondaryColor || c.dataColors[1];
  const color2 = c.dataColors[2];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
        <CartesianGrid stroke={customization.yAxis.gridlineColor} strokeDasharray={gridDash} vertical={false} />
        {customization.xAxis.show && <XAxis dataKey="name" tick={tick} axisLine={{ stroke: c.foregroundNeutralTertiary }} tickLine={false} />}
        {customization.yAxis.show && <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />}
        <Tooltip contentStyle={pbiTooltipStyle(customization)} />
        {customization.legend.show && <Legend wrapperStyle={pbiLegendStyle(customization)} iconType="square" iconSize={10} />}
        <Area type="linear" dataKey="Online" stackId="1" stroke={color0} fill={color0} fillOpacity={0.7} />
        <Area type="linear" dataKey="Store" stackId="1" stroke={color1} fill={color1} fillOpacity={0.7} />
        <Area type="linear" dataKey="Wholesale" stackId="1" stroke={color2} fill={color2} fillOpacity={0.7} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
