/* ─── Base Power BI Theme JSON ─── */
/* This is the full base JSON that gets modified by user customizations and exported */

import { ThemeCustomization, ChartType } from '@/types/theme';

/**
 * Maps our internal ChartType identifiers to the Power BI visualStyles keys.
 * Some chart types map to the same PBI visual (e.g. kpiCard -> kpi).
 * Some map to multiple keys (e.g. slicerVisual -> slicer + advancedSlicerVisual).
 */
const CHART_TO_VISUAL_KEYS: Record<ChartType, string[]> = {
  columnChart:          ['columnChart'],
  clusteredColumnChart: ['clusteredColumnChart'],
  barChart:             ['barChart'],
  clusteredBarChart:    ['clusteredBarChart'],
  lineChart:            ['lineChart'],
  areaChart:            ['areaChart'],
  stackedAreaChart:     ['stackedAreaChart'],
  pieChart:             ['pieChart'],
  donutChart:           ['donutChart'],
  scatterPlot:          ['scatterChart'],
  kpiCard:              ['kpi'],
  cardVisual:           ['cardVisual'],
  matrixTable:          ['pivotTable'],
  slicerVisual:         ['slicer', 'advancedSlicerVisual'],
  waterfallChart:       ['waterfallChart'],
  ribbonChart:          ['ribbonChart'],
  treemapChart:         ['treemapChart'],
  funnelChart:          ['funnelChart'],
  gaugeChart:           ['gaugeChart'],
};

export const DEFAULT_CUSTOMIZATION: ThemeCustomization = {
  name: 'CY26SU02',
  colors: {
    dataColors: [
      '#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7',
      '#744EC2', '#D9B300', '#D64550', '#197278', '#1AAB40',
    ],
    foreground: '#252423',
    foregroundNeutralSecondary: '#605E5C',
    foregroundNeutralTertiary: '#B3B0AD',
    background: '#FFFFFF',
    backgroundLight: '#F3F2F1',
    backgroundNeutral: '#C8C6C4',
    tableAccent: '#118DFF',
    good: '#1AAB40',
    neutral: '#D9B300',
    bad: '#D64554',
    maximum: '#118DFF',
    center: '#D9B300',
    minimum: '#DEEFFF',
  },
  font: {
    fontFamily: 'Segoe UI',
    fontSize: 10,
    fontColor: '#252423',
  },
  textClasses: {
    callout: {
      fontSize: 24,
      fontFace: 'DIN',
      color: '#252423',
    },
    title: {
      fontSize: 12,
      fontFace: 'DIN',
      color: '#252423',
    },
    header: {
      fontSize: 12,
      fontFace: 'Segoe UI Semibold',
      color: '#252423',
    },
    label: {
      fontSize: 10,
      fontFace: 'Segoe UI',
      color: '#252423',
    },
  },
  xAxis: {
    show: true,
    showAxisTitle: true,
    titleText: '',
    gridlineStyle: 'dotted',
    gridlineColor: '#C8C6C4',
  },
  yAxis: {
    show: true,
    showAxisTitle: true,
    titleText: '',
    gridlineStyle: 'dotted',
    gridlineColor: '#C8C6C4',
  },
  legend: {
    show: true,
    position: 'RightCenter',
    fontSize: 10,
  },
  visualCustomizations: {
    scatterPlot: {
      bubbleSize: -10,
      markerRangeType: 'auto',
      fillPoint: true,
      showLegend: true,
      legendPosition: 'RightCenter',
    },
    lineChart: {
      responsive: true,
      matchSeriesInterpolation: true,
      showLegend: true,
      legendPosition: 'RightCenter',
    },
    pieChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
      labelStyle: 'Data value, percent of total',
    },
    donutChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
      labelStyle: 'Data value, percent of total',
    },
    columnChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
      responsive: true,
      showGradientLegend: true,
    },
    clusteredColumnChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
      responsive: true,
    },
    barChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
      responsive: true,
    },
    clusteredBarChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
      responsive: true,
    },
    areaChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
      responsive: true,
    },
    stackedAreaChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
      responsive: true,
    },
    waterfallChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
      responsive: true,
    },
    ribbonChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
    },
    treemapChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
    },
    funnelChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
    },
    gaugeChart: {
      showLegend: true,
      legendPosition: 'RightCenter',
    },
    kpiCard: {
      trendlineTransparency: 20,
    },
    cardVisual: {
      maxTiles: 3,
      cellPadding: 12,
      backgroundShow: true,
    },
    matrixTable: {
      showExpandCollapseButtons: true,
      legacyStyleDisabled: true,
    },
    slicerVisual: {
      responsive: true,
      hideDatePickerButton: false,
      itemPadding: 4,
    },
  },
};

export function buildExportJSON(customization: ThemeCustomization, selectedCharts: ChartType[]): object {
  const fullDataColors = [
    ...customization.colors.dataColors,
    '#15C6F4', '#4092FF', '#FFA058', '#BE5DC9', '#F472D0',
    '#B5A1FF', '#C4A200', '#FF8080', '#00DBBC', '#5BD667',
    '#0091D5', '#4668C5', '#FF6300', '#99008A', '#EC008C',
    '#533285', '#99700A', '#FF4141', '#1F9A85', '#25891C',
    '#0057A2', '#002050', '#C94F0F', '#450F54', '#B60064',
    '#34124F', '#6A5A29', '#1AAB40', '#BA141A', '#0C3D37',
    '#0B511F',
  ];

  return {
    name: customization.name,
    dataColors: fullDataColors,
    foreground: customization.colors.foreground,
    foregroundNeutralSecondary: customization.colors.foregroundNeutralSecondary,
    foregroundNeutralTertiary: customization.colors.foregroundNeutralTertiary,
    background: customization.colors.background,
    backgroundLight: customization.colors.backgroundLight,
    backgroundNeutral: customization.colors.backgroundNeutral,
    tableAccent: customization.colors.tableAccent,
    good: customization.colors.good,
    neutral: customization.colors.neutral,
    bad: customization.colors.bad,
    maximum: customization.colors.maximum,
    center: customization.colors.center,
    minimum: customization.colors.minimum,
    null: '#FF7F48',
    hyperlink: '#0078d4',
    visitedHyperlink: '#0078d4',
    textClasses: {
      callout: customization.textClasses.callout,
      title: customization.textClasses.title,
      header: customization.textClasses.header,
      label: customization.textClasses.label,
    },
    visualStyles: buildVisualStyles(customization, selectedCharts),
  };
}

/* ─── Visual Styles Builder (filters by selected charts) ─── */
function buildVisualStyles(customization: ThemeCustomization, selectedCharts: ChartType[]): Record<string, unknown> {
  const selectedVisualKeys = new Set<string>();
  for (const chart of selectedCharts) {
    const keys = CHART_TO_VISUAL_KEYS[chart];
    if (keys) keys.forEach((k) => selectedVisualKeys.add(k));
  }

  const allVisualStyles: Record<string, unknown> = {
    scatterChart: { '*': { bubbles: [{ bubbleSize: -10, markerRangeType: 'auto' }], general: [{ responsive: true }], fillPoint: [{ show: true }], legend: [{ showGradientLegend: true }] } },
    lineChart: { '*': { general: [{ responsive: true }], smallMultiplesLayout: [{ backgroundTransparency: 0, gridLineType: 'inner' }], forecast: [{ matchSeriesInterpolation: true }] } },
    pieChart: { '*': { legend: [{ show: customization.legend.show, position: customization.legend.position }], labels: [{ labelStyle: 'Data value, percent of total' }] } },
    donutChart: { '*': { legend: [{ show: customization.legend.show, position: customization.legend.position }], labels: [{ labelStyle: 'Data value, percent of total' }] } },
    pivotTable: { '*': { rowHeaders: [{ showExpandCollapseButtons: true, legacyStyleDisabled: true }] } },
    multiRowCard: { '*': { card: [{ outlineWeight: 2, barShow: true, barWeight: 2 }] } },
    kpi: { '*': { trendline: [{ transparency: 20 }] } },
    cardVisual: { '*': {
      layout: [{ maxTiles: 3 }, { $id: 'default', cellPadding: 12, paddingIndividual: false, paddingUniform: 12, backgroundShow: true }],
      overflow: [{ type: 0 }],
      image: [{ $id: 'default', position: 'Left', imageAreaSize: 20, padding: 12, rectangleRoundedCurve: 4, fit: 'Normal', fixedSize: false }],
      referenceLabel: [{ $id: 'default', backgroundColor: { solid: { color: 'backgroundLight' } }, paddingUniform: 12, rectangleRoundedCurveCustomStyle: true, rectangleRoundedCurveLeftBottom: 4, rectangleRoundedCurveRightBottom: 4 }],
      value: [{ $id: 'default', fontFamily: "'Segoe UI Semibold', wf_segoe-ui_semibold, helvetica, arial, sans-serif" }],
      label: [{ $id: 'default', position: 'belowValue', fontColor: { solid: { color: 'foregroundNeutralSecondary' } } }],
      spacing: [{ $id: 'default', verticalSpacing: 2 }],
      padding: [{ $id: 'default', paddingUniform: 12, paddingIndividual: false }],
    } },
    advancedSlicerVisual: { '*': { layout: [{ maxTiles: 3 }], shapeCustomRectangle: [{ $id: 'default', tileShape: 'rectangleRoundedByPixel', rectangleRoundedCurve: 4 }], selectionIcon: [{ $id: 'default', size: 12 }] } },
    slicer: { '*': { general: [{ responsive: true }], date: [{ hideDatePickerButton: false }], items: [{ padding: 4, accessibilityContrastProperties: true }] } },
    waterfallChart: { '*': { general: [{ responsive: true }] } },
    columnChart: { '*': { general: [{ responsive: true }], legend: [{ showGradientLegend: true }], smallMultiplesLayout: [{ backgroundTransparency: 0, gridLineType: 'inner' }] } },
    clusteredColumnChart: { '*': { general: [{ responsive: true }], legend: [{ showGradientLegend: true }], smallMultiplesLayout: [{ backgroundTransparency: 0, gridLineType: 'inner' }] } },
    barChart: { '*': { general: [{ responsive: true }], legend: [{ showGradientLegend: true }], smallMultiplesLayout: [{ backgroundTransparency: 0, gridLineType: 'inner' }] } },
    clusteredBarChart: { '*': { general: [{ responsive: true }], legend: [{ showGradientLegend: true }], smallMultiplesLayout: [{ backgroundTransparency: 0, gridLineType: 'inner' }] } },
    areaChart: { '*': { general: [{ responsive: true }], smallMultiplesLayout: [{ backgroundTransparency: 0, gridLineType: 'inner' }] } },
    stackedAreaChart: { '*': { general: [{ responsive: true }], smallMultiplesLayout: [{ backgroundTransparency: 0, gridLineType: 'inner' }] } },
    ribbonChart: { '*': { general: [{ responsive: true }], smallMultiplesLayout: [{ backgroundTransparency: 0, gridLineType: 'inner' }], valueAxis: [{ show: true }] } },
    treemapChart: { '*': { general: [{ responsive: true }] } },
    funnelChart: { '*': { general: [{ responsive: true }] } },
    gaugeChart: { '*': { general: [{ responsive: true }] } },
  };

  const alwaysInclude: Record<string, unknown> = {
    map: { '*': { bubbles: [{ bubbleSize: -10, markerRangeType: 'auto' }] } },
    azureMap: { '*': { bubbleLayer: [{ bubbleRadius: 8, minBubbleRadius: 8, maxRadius: 40 }], barChart: [{ barHeight: 3, thickness: 3 }] } },
    group: { '*': { background: [{ show: false }] } },
    basicShape: { '*': { background: [{ show: false }], general: [{ keepLayerOrder: true }], visualHeader: [{ show: false }] } },
    shape: { '*': { background: [{ show: false }], general: [{ keepLayerOrder: true }], visualHeader: [{ show: false }] } },
    image: { '*': { background: [{ show: false }], general: [{ keepLayerOrder: true }], visualHeader: [{ show: false }], padding: [{ left: 0, top: 0, right: 0, bottom: 0 }] } },
    actionButton: { '*': { background: [{ show: false }], visualHeader: [{ show: false }] } },
    pageNavigator: { '*': { background: [{ show: false }], visualHeader: [{ show: false }] } },
    bookmarkNavigator: { '*': { background: [{ show: false }], visualHeader: [{ show: false }] } },
    textbox: { '*': { general: [{ keepLayerOrder: true }], visualHeader: [{ show: false }] } },
    page: { '*': { outspace: [{ color: { solid: { color: '#FFFFFF' } } }], background: [{ transparency: 100 }] } },
  };

  const result: Record<string, unknown> = {
    '*': {
      '*': {
        '*': [{ wordWrap: true }],
        line: [{ transparency: 0 }],
        outline: [{ transparency: 0 }],
        plotArea: [{ transparency: 0 }],
        categoryAxis: [{ showAxisTitle: customization.xAxis.showAxisTitle, gridlineStyle: customization.xAxis.gridlineStyle === 'none' ? 'dotted' : customization.xAxis.gridlineStyle, concatenateLabels: false }],
        valueAxis: [{ showAxisTitle: customization.yAxis.showAxisTitle, gridlineStyle: customization.yAxis.gridlineStyle === 'none' ? 'dotted' : customization.yAxis.gridlineStyle }],
        y2Axis: [{ show: true }],
        title: [{ titleWrap: true }],
        lineStyles: [{ strokeWidth: 3 }],
        wordWrap: [{ show: true }],
        background: [{ show: true, transparency: 0 }],
        border: [{ width: 1 }],
        outspacePane: [{ backgroundColor: { solid: { color: '#ffffff' } }, transparency: 0, border: true, borderColor: { solid: { color: customization.colors.foregroundNeutralTertiary } } }],
        filterCard: [
          { $id: 'Applied', transparency: 0, foregroundColor: { solid: { color: customization.colors.foreground } }, border: true },
          { $id: 'Available', transparency: 0, foregroundColor: { solid: { color: customization.colors.foreground } }, border: true },
        ],
      },
    },
  };

  /* Merge per-visual appearance overrides (primaryColor, secondaryColor, fontSize, fontFamily, fontColor)
     into each visual's style sections when the user has customized them */
  for (const chart of selectedCharts) {
    const visualConfig = customization.visualCustomizations[chart];
    if (!visualConfig) continue;

    const { primaryColor, secondaryColor, fontSize, fontFamily, fontColor } = visualConfig as {
      primaryColor?: string;
      secondaryColor?: string;
      fontSize?: number;
      fontFamily?: string;
      fontColor?: string;
    };

    const hasAppearanceOverride = primaryColor || secondaryColor || fontSize || fontFamily || fontColor;
    if (!hasAppearanceOverride) continue;

    const pbiKeys = CHART_TO_VISUAL_KEYS[chart];
    if (!pbiKeys) continue;

    for (const pbiKey of pbiKeys) {
      // Get or create the visual style entry
      const existingStyle = allVisualStyles[pbiKey] as { '*': Record<string, unknown[]> } | undefined;
      const starSection: Record<string, unknown[]> = existingStyle ? { ...existingStyle['*'] } : {};

      // Inject data point colors
      if (primaryColor || secondaryColor) {
        const dataPointOverrides: Record<string, unknown> = {};
        if (primaryColor) {
          dataPointOverrides.fill = { solid: { color: primaryColor } };
        }
        if (secondaryColor) {
          dataPointOverrides.fill2 = { solid: { color: secondaryColor } };
        }
        starSection.dataPoint = [dataPointOverrides];
      }

      // Inject font overrides into labels section
      if (fontSize || fontFamily || fontColor) {
        const labelOverrides: Record<string, unknown> = {};
        if (fontSize) labelOverrides.fontSize = fontSize;
        if (fontFamily) labelOverrides.fontFamily = fontFamily;
        if (fontColor) labelOverrides.color = { solid: { color: fontColor } };

        // Merge with existing labels if present
        const existingLabels = starSection.labels;
        if (existingLabels && Array.isArray(existingLabels) && existingLabels.length > 0) {
          starSection.labels = [{ ...(existingLabels[0] as object), ...labelOverrides }];
        } else {
          starSection.labels = [labelOverrides];
        }

        // Also apply to title section for font settings
        const titleOverrides: Record<string, unknown> = {};
        if (fontFamily) titleOverrides.fontFamily = fontFamily;
        if (fontColor) titleOverrides.color = { solid: { color: fontColor } };
        if (fontSize) titleOverrides.fontSize = fontSize;

        const existingTitle = starSection.title;
        if (existingTitle && Array.isArray(existingTitle) && existingTitle.length > 0) {
          starSection.title = [{ ...(existingTitle[0] as object), ...titleOverrides }];
        } else {
          starSection.title = [titleOverrides];
        }
      }

      allVisualStyles[pbiKey] = { '*': starSection };
    }
  }

  for (const key of selectedVisualKeys) {
    if (allVisualStyles[key]) {
      result[key] = allVisualStyles[key];
    }
  }

  for (const [key, val] of Object.entries(alwaysInclude)) {
    result[key] = val;
  }

  return result;
}

