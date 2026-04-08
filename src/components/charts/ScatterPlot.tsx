'use client';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle, pbiAxisTick, pbiGridlineDash } from './pbiStyles';

const data = [
  { x: 100, y: 200 }, { x: 120, y: 100 }, { x: 170, y: 300 },
  { x: 140, y: 250 }, { x: 150, y: 400 }, { x: 110, y: 280 },
  { x: 200, y: 150 }, { x: 180, y: 350 }, { x: 220, y: 180 },
  { x: 250, y: 420 }, { x: 300, y: 200 }, { x: 280, y: 320 },
];

export default function ScatterPlotPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;
  const tick = pbiAxisTick(customization);
  const gridDash = pbiGridlineDash(customization.xAxis.gridlineStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
        <CartesianGrid stroke={customization.yAxis.gridlineColor} strokeDasharray={gridDash} />
        {customization.xAxis.show && <XAxis dataKey="x" type="number" tick={tick} axisLine={{ stroke: c.foregroundNeutralTertiary }} tickLine={false} name="X" />}
        {customization.yAxis.show && <YAxis dataKey="y" type="number" tick={tick} axisLine={false} tickLine={false} name="Y" />}
        <ZAxis range={[40, 40]} />
        <Tooltip contentStyle={pbiTooltipStyle(customization)} cursor={{ strokeDasharray: '3 3', stroke: '#ccc' }} />
        <Scatter data={data} fill={c.dataColors[3]} fillOpacity={0.75} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
