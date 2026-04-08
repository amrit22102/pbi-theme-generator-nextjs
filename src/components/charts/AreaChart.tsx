'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiAxisTick, pbiGridlineDash } from './pbiStyles';

const data = [
  { name: 'Jan', value: 2400 },
  { name: 'Feb', value: 2800 },
  { name: 'Mar', value: 3200 },
  { name: 'Apr', value: 2600 },
  { name: 'May', value: 3800 },
  { name: 'Jun', value: 4200 },
  { name: 'Jul', value: 3900 },
];

export default function AreaChartPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const tick = pbiAxisTick(customization);
  const gridDash = pbiGridlineDash(customization.xAxis.gridlineStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
        <defs>
          <linearGradient id="pbiAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.dataColors[0]} stopOpacity={0.35} />
            <stop offset="100%" stopColor={c.dataColors[0]} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={customization.yAxis.gridlineColor} strokeDasharray={gridDash} vertical={false} />
        {customization.xAxis.show && <XAxis dataKey="name" tick={tick} axisLine={{ stroke: c.foregroundNeutralTertiary }} tickLine={false} />}
        {customization.yAxis.show && <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />}
        <Tooltip contentStyle={pbiTooltipStyle(customization)} />
        <Area type="linear" dataKey="value" stroke={c.dataColors[0]} strokeWidth={2} fill="url(#pbiAreaGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: c.dataColors[0] }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
