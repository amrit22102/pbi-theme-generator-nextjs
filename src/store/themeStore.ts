'use client';

import { create } from 'zustand';
import { ThemeCustomization, AxisConfig, LegendConfig, ChartType } from '@/types/theme';
import { DEFAULT_CUSTOMIZATION, buildExportJSON } from '@/lib/baseTheme';

interface ThemeState {
  customization: ThemeCustomization;
  selectedCharts: ChartType[];

  // Actions
  setThemeName: (name: string) => void;
  setDataColor: (index: number, color: string) => void;
  setDataColors: (colors: string[]) => void;
  setForeground: (color: string) => void;
  setForegroundSecondary: (color: string) => void;
  setForegroundTertiary: (color: string) => void;
  setStatusColor: (type: 'good' | 'neutral' | 'bad', color: string) => void;
  setAccentColor: (type: 'tableAccent' | 'maximum' | 'center' | 'minimum', color: string) => void;
  setFont: (font: Partial<ThemeCustomization['font']>) => void;
  setXAxis: (config: Partial<AxisConfig>) => void;
  setYAxis: (config: Partial<AxisConfig>) => void;
  setLegend: (config: Partial<LegendConfig>) => void;
  applyTemplate: (customization: ThemeCustomization) => void;
  resetToDefault: () => void;
  toggleChart: (chart: ChartType) => void;
  setSelectedCharts: (charts: ChartType[]) => void;
  getExportJSON: () => object;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  customization: { ...DEFAULT_CUSTOMIZATION },
  selectedCharts: [
    'columnChart',
    'lineChart',
    'pieChart',
    'barChart',
    'donutChart',
    'kpiCard',
  ],

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

  applyTemplate: (customization) => set({ customization }),

  resetToDefault: () =>
    set({ customization: JSON.parse(JSON.stringify(DEFAULT_CUSTOMIZATION)) }),

  toggleChart: (chart) =>
    set((s) => {
      const idx = s.selectedCharts.indexOf(chart);
      if (idx >= 0) {
        return { selectedCharts: s.selectedCharts.filter((c) => c !== chart) };
      }
      if (s.selectedCharts.length >= 10) return s;
      return { selectedCharts: [...s.selectedCharts, chart] };
    }),

  setSelectedCharts: (charts) => set({ selectedCharts: charts }),

  getExportJSON: () => buildExportJSON(get().customization, get().selectedCharts),
}));
