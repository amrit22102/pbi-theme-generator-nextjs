/* ─── Power BI Theme JSON Type Definitions ─── */

export interface SolidColor {
  solid: {
    color: string;
  };
}

export interface TextClass {
  fontSize: number;
  fontFace: string;
  color: string;
}

export interface TextClasses {
  callout: TextClass;
  title: TextClass;
  header: TextClass;
  label: TextClass;
}

export interface AxisConfig {
  show: boolean;
  showAxisTitle: boolean;
  titleText: string;
  gridlineStyle: 'dotted' | 'dashed' | 'solid' | 'none';
  gridlineColor: string;
}

export interface LegendConfig {
  show: boolean;
  position: 'Bottom' | 'Top' | 'Right' | 'Left' | 'RightCenter' | 'TopCenter' | 'BottomCenter' | 'TopLeft';
  fontSize: number;
}

export interface ThemeColors {
  dataColors: string[];
  foreground: string;
  foregroundNeutralSecondary: string;
  foregroundNeutralTertiary: string;
  background: string;
  backgroundLight: string;
  backgroundNeutral: string;
  tableAccent: string;
  good: string;
  neutral: string;
  bad: string;
  maximum: string;
  center: string;
  minimum: string;
}

export interface FontConfig {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
}

export interface ThemeCustomization {
  name: string;
  colors: ThemeColors;
  font: FontConfig;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  legend: LegendConfig;
}

export interface TemplateTheme {
  id: string;
  name: string;
  description: string;
  category: string;
  previewColors: string[];
  customization: ThemeCustomization;
}

export type ChartType =
  | 'columnChart'
  | 'clusteredColumnChart'
  | 'barChart'
  | 'clusteredBarChart'
  | 'lineChart'
  | 'areaChart'
  | 'stackedAreaChart'
  | 'pieChart'
  | 'donutChart'
  | 'scatterPlot'
  | 'kpiCard'
  | 'cardVisual'
  | 'matrixTable'
  | 'slicerVisual'
  | 'waterfallChart'
  | 'ribbonChart'
  | 'treemapChart'
  | 'funnelChart'
  | 'gaugeChart';

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  columnChart: 'Column Chart',
  clusteredColumnChart: 'Clustered Column',
  barChart: 'Bar Chart',
  clusteredBarChart: 'Clustered Bar',
  lineChart: 'Line Chart',
  areaChart: 'Area Chart',
  stackedAreaChart: 'Stacked Area',
  pieChart: 'Pie Chart',
  donutChart: 'Donut Chart',
  scatterPlot: 'Scatter Plot',
  kpiCard: 'KPI Card',
  cardVisual: 'Card Visual',
  matrixTable: 'Matrix / Table',
  slicerVisual: 'Slicer',
  waterfallChart: 'Waterfall',
  ribbonChart: 'Ribbon Chart',
  treemapChart: 'Treemap',
  funnelChart: 'Funnel',
  gaugeChart: 'Gauge',
};

export const FONT_FAMILIES = [
  'Segoe UI',
  'Segoe UI Semibold',
  'Calibri',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'DIN',
  'Arial',
  'Tahoma',
];

export const GRIDLINE_STYLES = ['dotted', 'dashed', 'solid', 'none'] as const;

export const LEGEND_POSITIONS = [
  'Bottom', 'Top', 'Right', 'Left',
  'RightCenter', 'TopCenter', 'BottomCenter', 'TopLeft',
] as const;
