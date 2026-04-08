'use client';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { pbiTooltipStyle } from './pbiStyles';

const data = [
  { name: 'Technology', size: 4500 },
  { name: 'Finance', size: 3800 },
  { name: 'Healthcare', size: 3200 },
  { name: 'Energy', size: 2800 },
  { name: 'Retail', size: 2200 },
  { name: 'Manufacturing', size: 1800 },
  { name: 'Education', size: 1200 },
  { name: 'Transport', size: 900 },
];

interface ContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  index: number;
  colors: string[];
}

function CustomContent(props: ContentProps) {
  const { x, y, width, height, name, index, colors } = props;
  const fill = colors[index % colors.length];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#ffffff" strokeWidth={2} />
      {width > 60 && height > 28 && (
        <text x={x + 6} y={y + 16} fill="#ffffff" fontSize={11} fontWeight={600} fontFamily="'Segoe UI', sans-serif">
          {name}
        </text>
      )}
    </g>
  );
}

export default function TreemapPreview() {
  const { customization } = useThemeStore();
  const c = customization.colors;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey="size"
        nameKey="name"
        stroke="none"
        content={<CustomContent x={0} y={0} width={0} height={0} name="" index={0} colors={c.dataColors} />}
      >
        <Tooltip contentStyle={pbiTooltipStyle(customization)} />
      </Treemap>
    </ResponsiveContainer>
  );
}
