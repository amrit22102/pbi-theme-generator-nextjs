'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HexColorPicker } from 'react-colorful';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { exportThemeJSON } from '@/lib/themeExporter';
import {
  ChartType,
  CHART_TYPE_LABELS,
  FONT_FAMILIES,
  GRIDLINE_STYLES,
  LEGEND_POSITIONS,
} from '@/types/theme';
import ColumnChartPreview from '@/components/charts/ColumnChart';
import ClusteredColumnPreview from '@/components/charts/ClusteredColumnChart';
import BarChartPreview from '@/components/charts/BarChart';
import ClusteredBarPreview from '@/components/charts/ClusteredBarChart';
import LineChartPreview from '@/components/charts/LineChart';
import AreaChartPreview from '@/components/charts/AreaChart';
import StackedAreaPreview from '@/components/charts/StackedAreaChart';
import PieChartPreview from '@/components/charts/PieChart';
import DonutChartPreview from '@/components/charts/DonutChart';
import ScatterPlotPreview from '@/components/charts/ScatterPlot';
import KpiCardPreview from '@/components/charts/KpiCard';
import CardVisualPreview from '@/components/charts/CardVisual';
import MatrixTablePreview from '@/components/charts/MatrixTable';
import SlicerVisualPreview from '@/components/charts/SlicerVisual';
import WaterfallPreview from '@/components/charts/WaterfallChart';
import RibbonChartPreview from '@/components/charts/RibbonChart';
import TreemapPreview from '@/components/charts/TreemapChart';
import FunnelPreview from '@/components/charts/FunnelChart';
import GaugePreview from '@/components/charts/GaugeChart';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './editor.module.css';

/* ─── Chart component map ─── */
const CHART_COMPONENTS: Record<ChartType, React.FC> = {
  columnChart: ColumnChartPreview,
  clusteredColumnChart: ClusteredColumnPreview,
  barChart: BarChartPreview,
  clusteredBarChart: ClusteredBarPreview,
  lineChart: LineChartPreview,
  areaChart: AreaChartPreview,
  stackedAreaChart: StackedAreaPreview,
  pieChart: PieChartPreview,
  donutChart: DonutChartPreview,
  scatterPlot: ScatterPlotPreview,
  kpiCard: KpiCardPreview,
  cardVisual: CardVisualPreview,
  matrixTable: MatrixTablePreview,
  slicerVisual: SlicerVisualPreview,
  waterfallChart: WaterfallPreview,
  ribbonChart: RibbonChartPreview,
  treemapChart: TreemapPreview,
  funnelChart: FunnelPreview,
  gaugeChart: GaugePreview,
};

/* ─── Color picker with fixed-position popover ─── */
function ColorPickerField({
  color,
  onChange,
  label,
}: {
  color: string;
  onChange: (c: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const swatchRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (!open && swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      // Position the picker to the left of the swatch, below it
      let top = rect.bottom + 8;
      let left = rect.right - 252; // 220px picker + 32px padding roughly
      // Clamp so it doesn't go off-screen
      if (left < 8) left = 8;
      if (top + 240 > window.innerHeight) top = rect.top - 248;
      setPos({ top, left });
    }
    setOpen(!open);
  };

  return (
    <div className={styles.colorRow}>
      {label && <span className={styles.colorRowLabel}>{label}</span>}
      <div style={{ position: 'relative' }}>
        <div
          ref={swatchRef}
          className={styles.colorRowSwatch}
          style={{ backgroundColor: color }}
          onClick={handleOpen}
        />
        {open && pos && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 999 }}
              onClick={() => setOpen(false)}
            />
            <div
              className={styles.colorPickerPopover}
              style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 1000 }}
            >
              <HexColorPicker color={color} onChange={onChange} />
              <input
                className={styles.colorHexInput}
                value={color}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Accordion Panel ─── */
function Panel({
  emoji,
  title,
  children,
  defaultOpen = false,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader} onClick={() => setOpen(!open)}>
        <div className={styles.panelHeaderLeft}>
          <span className={styles.panelEmoji}>{emoji}</span>
          <span className={styles.panelTitle}>{title}</span>
        </div>
        <span className={`${styles.panelChevron} ${open ? styles.panelChevronOpen : ''}`}>
          ▾
        </span>
      </div>
      {open && <div className={styles.panelBody}>{children}</div>}
    </div>
  );
}

/* ─── Main Editor Page ─── */
export default function EditorPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    customization,
    selectedCharts,
    setThemeName,
    setDataColor,
    setForeground,
    setForegroundSecondary,
    setForegroundTertiary,
    setStatusColor,
    setAccentColor,
    setFont,
    setXAxis,
    setYAxis,
    setLegend,
    toggleChart,
    resetToDefault,
    getExportJSON,
  } = useThemeStore();

  const [activeColorIdx, setActiveColorIdx] = useState<number | null>(null);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleExport = () => {
    const json = getExportJSON();
    const result = exportThemeJSON(json, customization.name);
    if (result.success) {
      showToast('success', `Theme "${customization.name}" exported successfully!`);
    } else {
      showToast('error', result.error || 'Export failed');
    }
  };

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/auth/signin');
    }
    return null;
  }

  return (
    <div className={styles.editorLayout}>
      {/* ─── Sidebar ─── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo} onClick={() => router.push('/')}>
            <div className={styles.sidebarLogoIcon}>⚡</div>
            <span className="gradient-text">Theme Studio</span>
          </div>
          <div className={styles.sidebarHeaderActions}>
            <ThemeToggle />
            <button className={styles.headerBtn} onClick={resetToDefault}>
              Reset
            </button>
          </div>
        </div>

        {/* Theme name */}
        <div className={styles.themeNameSection}>
          <div className={styles.themeNameLabel}>Theme Name</div>
          <input
            className={styles.themeNameInput}
            value={customization.name}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="My Theme"
            id="theme-name-input"
          />
        </div>

        <div className={styles.sidebarScroll}>
          {/* ─── Data Colors ─── */}
          <Panel emoji="🎨" title="Data Colors (10)" defaultOpen>
            <div className={styles.colorGrid}>
              {customization.colors.dataColors.map((c, i) => (
                <div
                  key={i}
                  className={`${styles.colorSwatch} ${activeColorIdx === i ? styles.colorSwatchActive : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setActiveColorIdx(activeColorIdx === i ? null : i)}
                >
                  <span className={styles.colorSwatchIndex}>{i + 1}</span>
                </div>
              ))}
            </div>
            {activeColorIdx !== null && (
              <div style={{ marginTop: 12 }}>
                <HexColorPicker
                  color={customization.colors.dataColors[activeColorIdx]}
                  onChange={(c) => setDataColor(activeColorIdx, c)}
                />
                <input
                  className={styles.colorHexInput}
                  value={customization.colors.dataColors[activeColorIdx]}
                  onChange={(e) => {
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value))
                      setDataColor(activeColorIdx, e.target.value);
                  }}
                  style={{ marginTop: 8 }}
                />
              </div>
            )}
          </Panel>

          {/* ─── Foreground Colors ─── */}
          <Panel emoji="🔤" title="Foreground Colors">
            <ColorPickerField
              label="Primary Text"
              color={customization.colors.foreground}
              onChange={setForeground}
            />
            <ColorPickerField
              label="Secondary Text"
              color={customization.colors.foregroundNeutralSecondary}
              onChange={setForegroundSecondary}
            />
            <ColorPickerField
              label="Tertiary Text"
              color={customization.colors.foregroundNeutralTertiary}
              onChange={setForegroundTertiary}
            />
          </Panel>

          {/* ─── Status Colors ─── */}
          <Panel emoji="🚦" title="Status Colors">
            <ColorPickerField
              label="Good"
              color={customization.colors.good}
              onChange={(c) => setStatusColor('good', c)}
            />
            <ColorPickerField
              label="Neutral"
              color={customization.colors.neutral}
              onChange={(c) => setStatusColor('neutral', c)}
            />
            <ColorPickerField
              label="Bad"
              color={customization.colors.bad}
              onChange={(c) => setStatusColor('bad', c)}
            />
          </Panel>

          {/* ─── Accent Colors ─── */}
          <Panel emoji="✨" title="Accent Colors">
            <ColorPickerField
              label="Table Accent"
              color={customization.colors.tableAccent}
              onChange={(c) => setAccentColor('tableAccent', c)}
            />
            <ColorPickerField
              label="Maximum"
              color={customization.colors.maximum}
              onChange={(c) => setAccentColor('maximum', c)}
            />
            <ColorPickerField
              label="Center"
              color={customization.colors.center}
              onChange={(c) => setAccentColor('center', c)}
            />
            <ColorPickerField
              label="Minimum"
              color={customization.colors.minimum}
              onChange={(c) => setAccentColor('minimum', c)}
            />
          </Panel>

          {/* ─── Typography ─── */}
          <Panel emoji="🔠" title="Typography">
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Font Family</div>
              <select
                className={styles.fontSelect}
                value={customization.font.fontFamily}
                onChange={(e) => setFont({ fontFamily: e.target.value })}
                id="font-family-select"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Font Size ({customization.font.fontSize}pt)</div>
              <div className={styles.sliderRow}>
                <span className={styles.sliderValue}>7</span>
                <input
                  type="range"
                  className={styles.slider}
                  min={7}
                  max={20}
                  value={customization.font.fontSize}
                  onChange={(e) => setFont({ fontSize: Number(e.target.value) })}
                  id="font-size-slider"
                />
                <span className={styles.sliderValue}>20</span>
              </div>
            </div>
            <ColorPickerField
              label="Font Color"
              color={customization.font.fontColor}
              onChange={(c) => setFont({ fontColor: c })}
            />
          </Panel>

          {/* ─── X-Axis ─── */}
          <Panel emoji="📏" title="X-Axis">
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Show Axis</span>
              <div
                className={`${styles.toggle} ${customization.xAxis.show ? styles.toggleActive : ''}`}
                onClick={() => setXAxis({ show: !customization.xAxis.show })}
              />
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Show Title</span>
              <div
                className={`${styles.toggle} ${customization.xAxis.showAxisTitle ? styles.toggleActive : ''}`}
                onClick={() => setXAxis({ showAxisTitle: !customization.xAxis.showAxisTitle })}
              />
            </div>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Gridline Style</div>
              <select
                className={styles.fontSelect}
                value={customization.xAxis.gridlineStyle}
                onChange={(e) =>
                  setXAxis({ gridlineStyle: e.target.value as typeof customization.xAxis.gridlineStyle })
                }
              >
                {GRIDLINE_STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <ColorPickerField
              label="Gridline Color"
              color={customization.xAxis.gridlineColor}
              onChange={(c) => setXAxis({ gridlineColor: c })}
            />
          </Panel>

          {/* ─── Y-Axis ─── */}
          <Panel emoji="📐" title="Y-Axis">
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Show Axis</span>
              <div
                className={`${styles.toggle} ${customization.yAxis.show ? styles.toggleActive : ''}`}
                onClick={() => setYAxis({ show: !customization.yAxis.show })}
              />
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Show Title</span>
              <div
                className={`${styles.toggle} ${customization.yAxis.showAxisTitle ? styles.toggleActive : ''}`}
                onClick={() => setYAxis({ showAxisTitle: !customization.yAxis.showAxisTitle })}
              />
            </div>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Gridline Style</div>
              <select
                className={styles.fontSelect}
                value={customization.yAxis.gridlineStyle}
                onChange={(e) =>
                  setYAxis({ gridlineStyle: e.target.value as typeof customization.yAxis.gridlineStyle })
                }
              >
                {GRIDLINE_STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <ColorPickerField
              label="Gridline Color"
              color={customization.yAxis.gridlineColor}
              onChange={(c) => setYAxis({ gridlineColor: c })}
            />
          </Panel>

          {/* ─── Legend ─── */}
          <Panel emoji="📋" title="Legend">
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Show Legend</span>
              <div
                className={`${styles.toggle} ${customization.legend.show ? styles.toggleActive : ''}`}
                onClick={() => setLegend({ show: !customization.legend.show })}
              />
            </div>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Position</div>
              <select
                className={styles.fontSelect}
                value={customization.legend.position}
                onChange={(e) =>
                  setLegend({ position: e.target.value as typeof customization.legend.position })
                }
              >
                {LEGEND_POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Font Size ({customization.legend.fontSize}pt)</div>
              <div className={styles.sliderRow}>
                <span className={styles.sliderValue}>7</span>
                <input
                  type="range"
                  className={styles.slider}
                  min={7}
                  max={20}
                  value={customization.legend.fontSize}
                  onChange={(e) => setLegend({ fontSize: Number(e.target.value) })}
                />
                <span className={styles.sliderValue}>20</span>
              </div>
            </div>
          </Panel>
        </div>

        {/* ─── Export ─── */}
        <div className={styles.exportSection}>
          <button className={styles.exportBtn} onClick={handleExport} id="export-btn">
            📥 Export Theme JSON
          </button>
          <div className={styles.exportPreview}>
            <span
              className={styles.exportPreviewToggle}
              onClick={() => setShowExportPreview(!showExportPreview)}
            >
              {showExportPreview ? '▾ Hide' : '▸ Preview'} JSON
            </span>
            {showExportPreview && (
              <pre className={styles.exportPreviewCode}>
                {JSON.stringify(getExportJSON(), null, 2).slice(0, 2000)}
                {JSON.stringify(getExportJSON(), null, 2).length > 2000 ? '\n...' : ''}
              </pre>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Main Preview Panel ─── */}
      <main className={styles.mainPanel}>
        {/* Chart selector chips */}
        <div className={styles.chartSelectorBar}>
          {(Object.keys(CHART_TYPE_LABELS) as ChartType[]).map((chartType) => (
            <button
              key={chartType}
              className={`${styles.chartChip} ${selectedCharts.includes(chartType) ? styles.chartChipActive : ''}`}
              onClick={() => toggleChart(chartType)}
              id={`chip-${chartType}`}
            >
              {CHART_TYPE_LABELS[chartType]}
            </button>
          ))}
        </div>

        {/* Preview grid */}
        <div className={styles.previewBody}>
          <div className={styles.previewGrid}>
            {selectedCharts.map((chartType) => {
              const ChartComp = CHART_COMPONENTS[chartType];
              return (
                <div key={chartType} className={styles.chartCard}>
                  <div className={styles.chartCardTitle}>
                    {CHART_TYPE_LABELS[chartType]}
                  </div>
                  <div className={styles.chartContainer}>
                    <ChartComp />
                  </div>
                </div>
              );
            })}
          </div>
          {selectedCharts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>📊</p>
              <p style={{ fontSize: 16, fontWeight: 500 }}>Select chart types above to preview your theme</p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Toast ─── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
