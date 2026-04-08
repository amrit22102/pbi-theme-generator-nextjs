'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiAxisTick, pbiGridlineDash, pbiLegendStyle } from './pbiStyles';

const data = [
  { name: 'Jan', Revenue: 2400, Costs: 1800, Profit: 600 },
  { name: 'Feb', Revenue: 2800, Costs: 2200, Profit: 600 },
  { name: 'Mar', Revenue: 3200, Costs: 2600, Profit: 600 },
  { name: 'Apr', Revenue: 2900, Costs: 2300, Profit: 600 },
  { name: 'May', Revenue: 3600, Costs: 2800, Profit: 800 },
  { name: 'Jun', Revenue: 4100, Costs: 3000, Profit: 1100 },
  { name: 'Jul', Revenue: 3800, Costs: 2700, Profit: 1100 },
];

export default function LineChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const tick = pbiAxisTick(customization);
  const gridDash = pbiGridlineDash(customization.xAxis.gridlineStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
        <CartesianGrid stroke={customization.yAxis.gridlineColor} strokeDasharray={gridDash} vertical={false} />
        {customization.xAxis.show && <XAxis dataKey="name" tick={tick} axisLine={{ stroke: c.foregroundNeutralTertiary }} tickLine={false} />}
        {customization.yAxis.show && <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />}
        <Tooltip contentStyle={pbiTooltipStyle(customization)} />
        {customization.legend.show && <Legend wrapperStyle={pbiLegendStyle(customization)} iconType="plainline" iconSize={16} />}
        <Line type="linear" dataKey="Revenue" stroke={c.dataColors[0]} strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        <Line type="linear" dataKey="Costs" stroke={c.dataColors[1]} strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        <Line type="linear" dataKey="Profit" stroke={c.dataColors[2]} strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
