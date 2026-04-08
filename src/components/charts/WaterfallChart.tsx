'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiAxisTick, pbiGridlineDash } from './pbiStyles';

const data = [
  { name: 'Start', value: 5000 },
  { name: 'Product', value: 2400 },
  { name: 'Service', value: 1800 },
  { name: 'Costs', value: -3200 },
  { name: 'Tax', value: -800 },
  { name: 'End', value: 5200 },
];

export default function WaterfallChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const tick = pbiAxisTick(customization);
  const gridDash = pbiGridlineDash(customization.xAxis.gridlineStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
        <CartesianGrid stroke={customization.yAxis.gridlineColor} strokeDasharray={gridDash} vertical={false} />
        {customization.xAxis.show && <XAxis dataKey="name" tick={tick} axisLine={{ stroke: c.foregroundNeutralTertiary }} tickLine={false} />}
        {customization.yAxis.show && <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v < -999 ? `${v / 1000}K` : v} />}
        <Tooltip contentStyle={pbiTooltipStyle(customization)} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <ReferenceLine y={0} stroke={c.foregroundNeutralTertiary} strokeWidth={1} />
        <Bar dataKey="value" radius={0} barSize={32}>
          {data.map((entry, i) => (
            <Cell key={i} fill={i === 0 || i === data.length - 1 ? c.dataColors[4] : entry.value >= 0 ? c.dataColors[0] : c.bad} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
