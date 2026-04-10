'use client';

import { create } from 'zustand';
import { ThemeCustomization, AxisConfig, LegendConfig, ChartType, TextClass, VisualConfig } from '@/types/theme';
import { DEFAULT_CUSTOMIZATION, buildExportJSON } from '@/lib/baseTheme';

interface ThemeState {
  customization: ThemeCustomization;
  selectedVisual: ChartType | null;

  // Actions
  setThemeName: (name: string) => void;
  setDataColor: (index: number, color: string) => void;
  setDataColors: (colors: string[]) => void;
  setForeground: (color: string) => void;
  setForegroundSecondary: (color: string) => void;
  setForegroundTertiary: (color: string) => void;
  setBackground: (color: string) => void;
  setPrimaryDataColor: (color: string) => void;
  setStatusColor: (type: 'good' | 'neutral' | 'bad', color: string) => void;
  setAccentColor: (type: 'tableAccent' | 'maximum' | 'center' | 'minimum', color: string) => void;
  setFont: (font: Partial<ThemeCustomization['font']>) => void;
  setTextClass: (textClass: 'callout' | 'title' | 'header' | 'label', config: Partial<TextClass>) => void;
  setVisualConfig: (visual: ChartType, config: Partial<VisualConfig>) => void;
  setXAxis: (config: Partial<AxisConfig>) => void;
  setYAxis: (config: Partial<AxisConfig>) => void;
  setLegend: (config: Partial<LegendConfig>) => void;
  selectVisual: (visual: ChartType | null) => void;
  applyTemplate: (customization: ThemeCustomization) => void;
  resetToDefault: () => void;
  getExportJSON: () => object;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  customization: { ...DEFAULT_CUSTOMIZATION },
  selectedVisual: null,

  setThemeName: (name) =>
    set((s) => ({ customization: { ...s.customization, name } })),

  setDataColor: (index, color) =>
    set((s) => {
      const newColors = [...s.customization.colors.dataColors];
      newColors[index] = color;
      return {
        customization: {
          ...s.customization,
          colors: { ...s.customization.colors, dataColors: newColors },
        },
      };
    }),

  setDataColors: (colors) =>
    set((s) => ({
      customization: {
        ...s.customization,
        colors: { ...s.customization.colors, dataColors: colors },
      },
    })),

  setForeground: (color) =>
    set((s) => ({
      customization: {
        ...s.customization,
        colors: { ...s.customization.colors, foreground: color },
      },
    })),

  setForegroundSecondary: (color) =>
    set((s) => ({
      customization: {
        ...s.customization,
        colors: { ...s.customization.colors, foregroundNeutralSecondary: color },
      },
    })),

  setForegroundTertiary: (color) =>
    set((s) => ({
      customization: {
        ...s.customization,
        colors: { ...s.customization.colors, foregroundNeutralTertiary: color },
      },
    })),

  setBackground: (color) =>
    set((s) => ({
      customization: {
        ...s.customization,
        colors: { ...s.customization.colors, background: color },
      },
    })),

  setPrimaryDataColor: (color) =>
    set((s) => {
      const newColors = [...s.customization.colors.dataColors];
      newColors[0] = color;
      return {
        customization: {
          ...s.customization,
          colors: { ...s.customization.colors, dataColors: newColors },
        },
      };
    }),

  setStatusColor: (type, color) =>
    set((s) => ({
      customization: {
        ...s.customization,
        colors: { ...s.customization.colors, [type]: color },
      },
    })),

  setAccentColor: (type, color) =>
    set((s) => ({
      customization: {
        ...s.customization,
        colors: { ...s.customization.colors, [type]: color },
      },
    })),

  setFont: (font) =>
    set((s) => ({
      customization: {
        ...s.customization,
        font: { ...s.customization.font, ...font },
      },
    })),

  setTextClass: (textClass, config) =>
    set((s) => ({
      customization: {
        ...s.customization,
        textClasses: {
          ...s.customization.textClasses,
          [textClass]: { ...s.customization.textClasses[textClass], ...config },
        },
      },
    })),

  setVisualConfig: (visual, config) =>
    set((s) => ({
      customization: {
        ...s.customization,
        visualCustomizations: {
          ...s.customization.visualCustomizations,
          [visual]: { ...s.customization.visualCustomizations[visual], ...config },
        },
      },
    })),

  setXAxis: (config) =>
    set((s) => ({
      customization: {
        ...s.customization,
        xAxis: { ...s.customization.xAxis, ...config },
      },
    })),

  setYAxis: (config) =>
    set((s) => ({
      customization: {
        ...s.customization,
        yAxis: { ...s.customization.yAxis, ...config },
      },
    })),

  setLegend: (config) =>
    set((s) => ({
      customization: {
        ...s.customization,
        legend: { ...s.customization.legend, ...config },
      },
    })),

  selectVisual: (visual) => set({ selectedVisual: visual }),

  applyTemplate: (customization) => set({ customization }),

  resetToDefault: () =>
    set({ customization: JSON.parse(JSON.stringify(DEFAULT_CUSTOMIZATION)) }),

  getExportJSON: () => {
    const allCharts: ChartType[] = [
      'columnChart',
      'clusteredColumnChart',
      'barChart',
      'clusteredBarChart',
      'lineChart',
      'areaChart',
      'stackedAreaChart',
      'pieChart',
      'donutChart',
      'scatterPlot',
      'kpiCard',
      'cardVisual',
      'matrixTable',
      'slicerVisual',
      'waterfallChart',
      'ribbonChart',
      'treemapChart',
      'funnelChart',
      'gaugeChart',
    ];
    return buildExportJSON(get().customization, allCharts);
  },
}));
