'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HexColorPicker } from 'react-colorful';
import { useThemeStore } from '@/store/themeStore';
import { exportThemeJSON } from '@/lib/themeExporter';
import {
  ChartType,
  CHART_TYPE_LABELS,
  FONT_FAMILIES,
} from '@/types/theme';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './editor.module.css';

/* ─── Color Picker Field ─── */
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
      let top = rect.bottom + 8;
      let left = rect.right - 252;
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
  const {
    customization,
    selectedVisual,
    setThemeName,
    setForeground,
    setBackground,
    setPrimaryDataColor,
    setTextClass,
    setVisualConfig,
    selectVisual,
    resetToDefault,
    getExportJSON,
  } = useThemeStore();

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

  return (
    <div className={styles.editorLayout}>
      {/* ─── Sidebar: Global Customizations Only ─── */}
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
          {/* ─── Global Customizations ─── */}
          <Panel emoji="🌍" title="Global Customizations" defaultOpen>
            {/* Primary Data Color */}
            <ColorPickerField
              label="Primary Data Color"
              color={customization.colors.dataColors[0]}
              onChange={setPrimaryDataColor}
            />

            {/* Background Color */}
            <ColorPickerField
              label="Background Color"
              color={customization.colors.background}
              onChange={setBackground}
            />

            {/* Foreground/Text Color */}
            <ColorPickerField
              label="Foreground Color"
              color={customization.colors.foreground}
              onChange={setForeground}
            />

            {/* Text Classes */}
            <div style={{ marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
              <h4 style={{ fontSize: 21, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                Text Classes
              </h4>

              {/* Callout */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  Callout
                </div>
                <div className={styles.fontRow}>
                  <div className={styles.fontLabel}>Font Size ({customization.textClasses.callout.fontSize}pt)</div>
                  <div className={styles.sliderRow}>
                    <span className={styles.sliderValue}>14</span>
                    <input
                      type="range"
                      className={styles.slider}
                      min={14}
                      max={32}
                      value={customization.textClasses.callout.fontSize}
                      onChange={(e) =>
                        setTextClass('callout', { fontSize: Number(e.target.value) })
                      }
                    />
                    <span className={styles.sliderValue}>32</span>
                  </div>
                </div>
                <div className={styles.fontRow}>
                  <div className={styles.fontLabel}>Font Family</div>
                  <select
                    className={styles.fontSelect}
                    value={customization.textClasses.callout.fontFace}
                    onChange={(e) =>
                      setTextClass('callout', { fontFace: e.target.value })
                    }
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <ColorPickerField
                  label="Color"
                  color={customization.textClasses.callout.color}
                  onChange={(c) => setTextClass('callout', { color: c })}
                />
              </div>

              {/* Title */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  Title
                </div>
                <div className={styles.fontRow}>
                  <div className={styles.fontLabel}>Font Size ({customization.textClasses.title.fontSize}pt)</div>
                  <div className={styles.sliderRow}>
                    <span className={styles.sliderValue}>8</span>
                    <input
                      type="range"
                      className={styles.slider}
                      min={8}
                      max={24}
                      value={customization.textClasses.title.fontSize}
                      onChange={(e) =>
                        setTextClass('title', { fontSize: Number(e.target.value) })
                      }
                    />
                    <span className={styles.sliderValue}>24</span>
                  </div>
                </div>
                <div className={styles.fontRow}>
                  <div className={styles.fontLabel}>Font Family</div>
                  <select
                    className={styles.fontSelect}
                    value={customization.textClasses.title.fontFace}
                    onChange={(e) =>
                      setTextClass('title', { fontFace: e.target.value })
                    }
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <ColorPickerField
                  label="Color"
                  color={customization.textClasses.title.color}
                  onChange={(c) => setTextClass('title', { color: c })}
                />
              </div>

              {/* Header */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  Header
                </div>
                <div className={styles.fontRow}>
                  <div className={styles.fontLabel}>Font Size ({customization.textClasses.header.fontSize}pt)</div>
                  <div className={styles.sliderRow}>
                    <span className={styles.sliderValue}>8</span>
                    <input
                      type="range"
                      className={styles.slider}
                      min={8}
                      max={24}
                      value={customization.textClasses.header.fontSize}
                      onChange={(e) =>
                        setTextClass('header', { fontSize: Number(e.target.value) })
                      }
                    />
                    <span className={styles.sliderValue}>24</span>
                  </div>
                </div>
                <div className={styles.fontRow}>
                  <div className={styles.fontLabel}>Font Family</div>
                  <select
                    className={styles.fontSelect}
                    value={customization.textClasses.header.fontFace}
                    onChange={(e) =>
                      setTextClass('header', { fontFace: e.target.value })
                    }
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <ColorPickerField
                  label="Color"
                  color={customization.textClasses.header.color}
                  onChange={(c) => setTextClass('header', { color: c })}
                />
              </div>

              {/* Label */}
              <div style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  Label
                </div>
                <div className={styles.fontRow}>
                  <div className={styles.fontLabel}>Font Size ({customization.textClasses.label.fontSize}pt)</div>
                  <div className={styles.sliderRow}>
                    <span className={styles.sliderValue}>7</span>
                    <input
                      type="range"
                      className={styles.slider}
                      min={7}
                      max={16}
                      value={customization.textClasses.label.fontSize}
                      onChange={(e) =>
                        setTextClass('label', { fontSize: Number(e.target.value) })
                      }
                    />
                    <span className={styles.sliderValue}>16</span>
                  </div>
                </div>
                <div className={styles.fontRow}>
                  <div className={styles.fontLabel}>Font Family</div>
                  <select
                    className={styles.fontSelect}
                    value={customization.textClasses.label.fontFace}
                    onChange={(e) =>
                      setTextClass('label', { fontFace: e.target.value })
                    }
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <ColorPickerField
                  label="Color"
                  color={customization.textClasses.label.color}
                  onChange={(c) => setTextClass('label', { color: c })}
                />
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

      {/* ─── Main Panel ─── */}
      <main className={styles.mainPanel}>
        {!selectedVisual ? (
          <>
            {/* Visual Selector Grid */}
            <div className={styles.visualCustomizationScroll}>
              <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                Visual Settings
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 40 }}>
                Configure fonts and colors for different visual types
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {allCharts.map((chartType) => (
                  <div
                    key={chartType}
                    onClick={() => selectVisual(chartType)}
                    style={{
                      padding: 20,
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'var(--bg-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-color)';
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)';
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-secondary)';
                    }}
                  >
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                      {CHART_TYPE_LABELS[chartType]}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, marginBottom: 0 }}>
                      Click to customize
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Visual Customization Pane */}
            <div className={styles.visualCustomizationScroll}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
                <button
                  onClick={() => selectVisual(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    marginRight: 12,
                  }}
                >
                  ←
                </button>
                <h2 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>
                  {CHART_TYPE_LABELS[selectedVisual]}
                </h2>
              </div>

              <VisualCustomizationPanel
                visual={selectedVisual}
                customization={customization}
                setVisualConfig={setVisualConfig}
              />
            </div>
          </>
        )}
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

/* ─── Visual Customization Panel ─── */
function VisualCustomizationPanel({
  visual,
  customization,
  setVisualConfig,
}: {
  visual: ChartType;
  customization: any;
  setVisualConfig: (visual: ChartType, config: any) => void;
}) {
  const visualConfig = customization.visualCustomizations[visual] || {};

  /* ── Common Appearance Controls ── */
  const renderAppearance = () => (
    <div style={{ marginBottom: 24 }}>
      <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>🎨</span> Appearance
      </h4>

      <ColorPickerField
        label="Primary Data Color"
        color={visualConfig.primaryColor || customization.colors.dataColors[0]}
        onChange={(c) => setVisualConfig(visual, { primaryColor: c })}
      />
      <ColorPickerField
        label="Secondary Data Color"
        color={visualConfig.secondaryColor || customization.colors.dataColors[1]}
        onChange={(c) => setVisualConfig(visual, { secondaryColor: c })}
      />
      <ColorPickerField
        label="Font Color"
        color={visualConfig.fontColor || customization.colors.foreground}
        onChange={(c) => setVisualConfig(visual, { fontColor: c })}
      />

      <div className={styles.fontRow}>
        <div className={styles.fontLabel}>Font Size ({visualConfig.fontSize || customization.font.fontSize}pt)</div>
        <div className={styles.sliderRow}>
          <span className={styles.sliderValue}>6</span>
          <input
            type="range"
            className={styles.slider}
            min={6}
            max={28}
            value={visualConfig.fontSize || customization.font.fontSize}
            onChange={(e) => setVisualConfig(visual, { fontSize: Number(e.target.value) })}
          />
          <span className={styles.sliderValue}>28</span>
        </div>
      </div>

      <div className={styles.fontRow}>
        <div className={styles.fontLabel}>Font Family</div>
        <select
          className={styles.fontSelect}
          value={visualConfig.fontFamily || customization.font.fontFamily}
          onChange={(e) => setVisualConfig(visual, { fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
    </div>
  );

  /* ── Visual-Specific Controls ── */
  const renderSpecificControls = () => {
    switch (visual) {
      case 'scatterPlot':
        return (
          <>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Bubble Size</div>
              <input
                type="number"
                className={styles.fontSelect}
                value={visualConfig.bubbleSize || 0}
                onChange={(e) => setVisualConfig(visual, { bubbleSize: Number(e.target.value) })}
              />
            </div>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Marker Range Type</div>
              <select
                className={styles.fontSelect}
                value={visualConfig.markerRangeType || 'auto'}
                onChange={(e) => setVisualConfig(visual, { markerRangeType: e.target.value as 'auto' | 'custom' })}
              >
                <option value="auto">Auto</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Fill Point</span>
              <div
                className={`${styles.toggle} ${visualConfig.fillPoint ? styles.toggleActive : ''}`}
                onClick={() => setVisualConfig(visual, { fillPoint: !visualConfig.fillPoint })}
              />
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Show Legend</span>
              <div
                className={`${styles.toggle} ${visualConfig.showLegend ? styles.toggleActive : ''}`}
                onClick={() => setVisualConfig(visual, { showLegend: !visualConfig.showLegend })}
              />
            </div>
          </>
        );

      case 'pieChart':
      case 'donutChart':
        return (
          <>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Show Legend</span>
              <div
                className={`${styles.toggle} ${visualConfig.showLegend ? styles.toggleActive : ''}`}
                onClick={() => setVisualConfig(visual, { showLegend: !visualConfig.showLegend })}
              />
            </div>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Label Style</div>
              <select
                className={styles.fontSelect}
                value={visualConfig.labelStyle || ''}
                onChange={(e) => setVisualConfig(visual, { labelStyle: e.target.value })}
              >
                <option value="">Select Style</option>
                <option value="Data value">Data value</option>
                <option value="Data value, percent of total">Data value, percent of total</option>
                <option value="Percent of total">Percent of total</option>
              </select>
            </div>
          </>
        );

      case 'columnChart':
      case 'clusteredColumnChart':
      case 'barChart':
      case 'clusteredBarChart':
      case 'lineChart':
      case 'areaChart':
      case 'stackedAreaChart':
        return (
          <>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Show Legend</span>
              <div
                className={`${styles.toggle} ${visualConfig.showLegend ? styles.toggleActive : ''}`}
                onClick={() => setVisualConfig(visual, { showLegend: !visualConfig.showLegend })}
              />
            </div>
            {(visual === 'columnChart' || visual === 'clusteredColumnChart') && (
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Show Gradient Legend</span>
                <div
                  className={`${styles.toggle} ${visualConfig.showGradientLegend ? styles.toggleActive : ''}`}
                  onClick={() => setVisualConfig(visual, { showGradientLegend: !visualConfig.showGradientLegend })}
                />
              </div>
            )}
            {(visual === 'lineChart' || visual === 'areaChart' || visual === 'stackedAreaChart') && (
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Match Series Interpolation</span>
                <div
                  className={`${styles.toggle} ${visualConfig.matchSeriesInterpolation ? styles.toggleActive : ''}`}
                  onClick={() => setVisualConfig(visual, { matchSeriesInterpolation: !visualConfig.matchSeriesInterpolation })}
                />
              </div>
            )}
          </>
        );

      case 'kpiCard':
        return (
          <div className={styles.fontRow}>
            <div className={styles.fontLabel}>Trendline Transparency</div>
            <div className={styles.sliderRow}>
              <span className={styles.sliderValue}>0</span>
              <input
                type="range"
                className={styles.slider}
                min={0}
                max={100}
                value={visualConfig.trendlineTransparency || 0}
                onChange={(e) => setVisualConfig(visual, { trendlineTransparency: Number(e.target.value) })}
              />
              <span className={styles.sliderValue}>100</span>
            </div>
          </div>
        );

      case 'cardVisual':
        return (
          <>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Max Tiles</div>
              <input
                type="number"
                className={styles.fontSelect}
                min={1}
                max={10}
                value={visualConfig.maxTiles || 3}
                onChange={(e) => setVisualConfig(visual, { maxTiles: Number(e.target.value) })}
              />
            </div>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Cell Padding</div>
              <input
                type="number"
                className={styles.fontSelect}
                min={0}
                max={50}
                value={visualConfig.cellPadding || 12}
                onChange={(e) => setVisualConfig(visual, { cellPadding: Number(e.target.value) })}
              />
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Background Show</span>
              <div
                className={`${styles.toggle} ${visualConfig.backgroundShow ? styles.toggleActive : ''}`}
                onClick={() => setVisualConfig(visual, { backgroundShow: !visualConfig.backgroundShow })}
              />
            </div>
          </>
        );

      case 'matrixTable':
        return (
          <>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Show Expand/Collapse Buttons</span>
              <div
                className={`${styles.toggle} ${visualConfig.showExpandCollapseButtons ? styles.toggleActive : ''}`}
                onClick={() => setVisualConfig(visual, { showExpandCollapseButtons: !visualConfig.showExpandCollapseButtons })}
              />
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Legacy Style Disabled</span>
              <div
                className={`${styles.toggle} ${visualConfig.legacyStyleDisabled ? styles.toggleActive : ''}`}
                onClick={() => setVisualConfig(visual, { legacyStyleDisabled: !visualConfig.legacyStyleDisabled })}
              />
            </div>
          </>
        );

      case 'slicerVisual':
        return (
          <>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Responsive</span>
              <div
                className={`${styles.toggle} ${visualConfig.responsive ? styles.toggleActive : ''}`}
                onClick={() => setVisualConfig(visual, { responsive: !visualConfig.responsive })}
              />
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Hide Date Picker Button</span>
              <div
                className={`${styles.toggle} ${visualConfig.hideDatePickerButton ? styles.toggleActive : ''}`}
                onClick={() => setVisualConfig(visual, { hideDatePickerButton: !visualConfig.hideDatePickerButton })}
              />
            </div>
            <div className={styles.fontRow}>
              <div className={styles.fontLabel}>Item Padding</div>
              <input
                type="number"
                className={styles.fontSelect}
                min={0}
                max={20}
                value={visualConfig.itemPadding || 4}
                onChange={(e) => setVisualConfig(visual, { itemPadding: Number(e.target.value) })}
              />
            </div>
          </>
        );

      default:
        return (
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>Show Legend</span>
            <div
              className={`${styles.toggle} ${visualConfig.showLegend ? styles.toggleActive : ''}`}
              onClick={() => setVisualConfig(visual, { showLegend: !visualConfig.showLegend })}
            />
          </div>
        );
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 24, borderRadius: 8 }}>
      {/* Common appearance controls */}
      {renderAppearance()}

      {/* Visual-specific controls */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚙️</span> Visual-Specific Options
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {renderSpecificControls()}
        </div>
      </div>
    </div>
  );
}

