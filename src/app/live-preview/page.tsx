'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { HexColorPicker } from 'react-colorful';
import { useThemeStore } from '@/store/themeStore';
import { TEMPLATES } from '@/store/templateStore';
import { exportThemeJSON, exportPBIXPackage } from '@/lib/themeExporter';
import { FONT_FAMILIES } from '@/types/theme';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './live-preview.module.css';

// Dynamic import — powerbi-client uses browser APIs, avoid SSR
const PowerBIEmbed = dynamic(() => import('@/components/PowerBIEmbed'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-secondary)',
        fontSize: 14,
      }}
    >
      Loading Power BI SDK...
    </div>
  ),
});

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

/* ─── JSON Syntax Highlighter ─── */
function highlightJSON(
  jsonStr: string,
  searchTerm: string
): { html: string; matchLines: Set<number> } {
  const matchLines = new Set<number>();
  const lines = jsonStr.split('\n');
  const lowerSearch = searchTerm.toLowerCase();

  const highlightedLines = lines.map((line, lineIdx) => {
    let highlighted = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Keys
    highlighted = highlighted.replace(
      /(&quot;|")((?:[^"\\]|\\.)*)(&quot;|")\s*:/g,
      '<span class="jsonKey">"$2"</span>:'
    );
    // String values
    highlighted = highlighted.replace(
      /:\s*(&quot;|")((?:[^"\\]|\\.)*)(&quot;|")/g,
      ': <span class="jsonString">"$2"</span>'
    );
    // Numbers
    highlighted = highlighted.replace(
      /:\s*(-?\d+\.?\d*)/g,
      ': <span class="jsonNumber">$1</span>'
    );
    // Booleans
    highlighted = highlighted.replace(
      /:\s*(true|false)/g,
      ': <span class="jsonBool">$1</span>'
    );
    // Null
    highlighted = highlighted.replace(
      /:\s*(null)/g,
      ': <span class="jsonNull">$1</span>'
    );

    // Search highlighting
    if (searchTerm && line.toLowerCase().includes(lowerSearch)) {
      matchLines.add(lineIdx);
      const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(`(${escapedSearch})`, 'gi');
      highlighted = highlighted.replace(
        searchRegex,
        '<span class="jsonSearchMatch">$1</span>'
      );
    }

    return highlighted;
  });

  return { html: highlightedLines.join('\n'), matchLines };
}

/* ─── JSON Preview Panel ─── */
function JSONPreviewPanel({
  jsonStr,
  onClose,
}: {
  jsonStr: string;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState(false);

  const { html, matchLines } = useMemo(
    () => highlightJSON(jsonStr, searchTerm),
    [jsonStr, searchTerm]
  );

  const lines = jsonStr.split('\n');
  const lineCount = lines.length;
  const charCount = jsonStr.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = jsonStr;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.jsonPreviewPanel}>
      <div className={styles.jsonPreviewHeader}>
        <div className={styles.jsonPreviewHeaderLeft}>
          <span className={styles.jsonPreviewTitle}>📄 JSON Output</span>
          <span className={styles.jsonPreviewBadge}>LIVE</span>
        </div>
        <div className={styles.jsonPreviewActions}>
          <button
            className={`${styles.jsonActionBtn} ${showSearch ? styles.jsonActionBtnActive : ''}`}
            onClick={() => setShowSearch(!showSearch)}
            title="Search"
          >
            🔍
          </button>
          <button
            className={`${styles.jsonActionBtn} ${copied ? styles.jsonActionBtnActive : ''}`}
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          <button className={styles.jsonCloseBtn} onClick={onClose} title="Close panel">
            ✕
          </button>
        </div>
      </div>

      {showSearch && (
        <div className={styles.jsonSearchBar}>
          <input
            className={styles.jsonSearchInput}
            placeholder="Search in JSON..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div className={styles.jsonPreviewBody}>
        <div className={styles.jsonCodeWrapper}>
          <div className={styles.jsonLineNumbers}>
            {Array.from({ length: lineCount }, (_, i) => (
              <span
                key={i}
                className={`${styles.jsonLineNumber} ${matchLines.has(i) ? styles.jsonLineNumberHighlight : ''}`}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <code
            className={styles.jsonCodeContent}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <div className={styles.jsonPreviewFooter}>
        <span className={styles.jsonStats}>
          {lineCount} lines · {(charCount / 1024).toFixed(1)} KB
        </span>
        {searchTerm && (
          <span className={styles.jsonStats}>
            {matchLines.size} match{matchLines.size !== 1 ? 'es' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Main Live Preview Page ─── */
export default function LivePreviewPage() {
  const router = useRouter();
  const {
    customization,
    setThemeName,
    setForeground,
    setBackground,
    setPrimaryDataColor,
    setTextClass,
    applyTemplate,
    resetToDefault,
    getExportJSON,
  } = useThemeStore();

  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [pbixExporting, setPbixExporting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Generate theme JSON — passed to PowerBIEmbed for real-time application
  const exportJSON = useMemo(() => {
    return getExportJSON();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customization]);

  const jsonStr = useMemo(() => {
    return JSON.stringify(exportJSON, null, 2);
  }, [exportJSON]);

  const handleExport = () => {
    const json = getExportJSON();
    const result = exportThemeJSON(json, customization.name);
    if (result.success) {
      showToast('success', `Theme "${customization.name}" exported successfully!`);
    } else {
      showToast('error', result.error || 'Export failed');
    }
  };

  const handlePBIXExport = async () => {
    setPbixExporting(true);
    try {
      const json = getExportJSON();
      const result = await exportPBIXPackage(json, customization.name);
      if (result.success) {
        showToast('success', `PBIX "${customization.name}" exported with theme applied!`);
      } else {
        showToast('error', result.error || 'PBIX export failed');
      }
    } catch {
      showToast('error', 'Unexpected error during PBIX export');
    } finally {
      setPbixExporting(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    if (!templateId) return;
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      applyTemplate(JSON.parse(JSON.stringify(template.customization)));
    }
  };

  return (
    <div className={styles.previewLayout}>
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
            id="live-preview-theme-name"
          />
        </div>

        {/* Template picker */}
        <div className={styles.templateSection}>
          <div className={styles.templateLabel}>Apply Template</div>
          <select
            className={styles.templateSelect}
            value=""
            onChange={(e) => handleTemplateChange(e.target.value)}
            id="live-preview-template-select"
          >
            <option value="">Choose a template...</option>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.category}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.sidebarScroll}>
          {/* ─── Data Colors ─── */}
          <Panel emoji="🎨" title="Data Colors" defaultOpen>
            <ColorPickerField
              label="Primary Data Color"
              color={customization.colors.dataColors[0]}
              onChange={setPrimaryDataColor}
            />
            <ColorPickerField
              label="Background Color"
              color={customization.colors.background}
              onChange={setBackground}
            />
            <ColorPickerField
              label="Foreground Color"
              color={customization.colors.foreground}
              onChange={setForeground}
            />
          </Panel>

          {/* ─── Text Classes ─── */}
          <Panel emoji="✏️" title="Text Classes">
            {/* Callout */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: 'var(--text-primary)',
                }}
              >
                Callout
              </div>
              <div className={styles.fontRow}>
                <div className={styles.fontLabel}>
                  Font Size ({customization.textClasses.callout.fontSize}pt)
                </div>
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
                    <option key={f} value={f}>
                      {f}
                    </option>
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
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: 'var(--text-primary)',
                }}
              >
                Title
              </div>
              <div className={styles.fontRow}>
                <div className={styles.fontLabel}>
                  Font Size ({customization.textClasses.title.fontSize}pt)
                </div>
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
                    <option key={f} value={f}>
                      {f}
                    </option>
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
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: 'var(--text-primary)',
                }}
              >
                Header
              </div>
              <div className={styles.fontRow}>
                <div className={styles.fontLabel}>
                  Font Size ({customization.textClasses.header.fontSize}pt)
                </div>
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
                    <option key={f} value={f}>
                      {f}
                    </option>
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
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: 'var(--text-primary)',
                }}
              >
                Label
              </div>
              <div className={styles.fontRow}>
                <div className={styles.fontLabel}>
                  Font Size ({customization.textClasses.label.fontSize}pt)
                </div>
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
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <ColorPickerField
                label="Color"
                color={customization.textClasses.label.color}
                onChange={(c) => setTextClass('label', { color: c })}
              />
            </div>
          </Panel>
        </div>

        {/* ─── Export ─── */}
        <div className={styles.exportSection}>
          <div className={styles.exportBtnGroup}>
            <button className={styles.exportBtn} onClick={handleExport} id="live-export-json-btn">
              📥 JSON
            </button>
            <button
              className={styles.exportBtnSecondary}
              onClick={handlePBIXExport}
              disabled={pbixExporting}
              id="live-export-pbix-btn"
            >
              {pbixExporting ? '⏳...' : '📦 PBIX'}
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Panel ─── */}
      <main className={styles.mainPanel}>
        {/* Header bar */}
        <div className={styles.mainPanelHeader}>
          <div className={styles.headerLeftGroup}>
            <button
              className={styles.backBtn}
              onClick={() => router.push('/')}
              id="live-preview-back"
            >
              ← Back
            </button>
            <span className={styles.headerTitle}>Live Report Preview</span>
            <span className={styles.headerBadge}>
              <span className={styles.headerBadgeDot} />
              LIVE
            </span>
          </div>
          <div className={styles.headerActions}>
            <button
              className={`${styles.jsonToggleBtn} ${showJsonPreview ? styles.jsonToggleBtnActive : ''}`}
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              id="live-json-preview-toggle"
            >
              {showJsonPreview ? '◀ Hide' : '▶ Show'} JSON
            </button>
          </div>
        </div>

        {/* Report + optional JSON panel */}
        <div className={styles.reportContainer}>
          <div className={styles.reportEmbed}>
            <PowerBIEmbed themeJson={exportJSON} />
          </div>

          {showJsonPreview && (
            <JSONPreviewPanel
              jsonStr={jsonStr}
              onClose={() => setShowJsonPreview(false)}
            />
          )}
        </div>

        {/* Status bar */}
        <div className={styles.statusBar}>
          <span
            className={`${styles.statusDot} ${styles.statusDotConnected}`}
          />
          Power BI Embedded — Theme changes apply in real-time
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
