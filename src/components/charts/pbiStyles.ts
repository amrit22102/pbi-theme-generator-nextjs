/**
 * Shared Power BI visual styling utilities.
 * Provides helpers that generate styles from the live theme customization.
 */

import { ThemeCustomization } from '@/types/theme';

/** Generate tooltip style from current customization */
export function pbiTooltipStyle(c: ThemeCustomization): React.CSSProperties {
  return {
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    color: c.font.fontColor,
    fontSize: c.font.fontSize,
    fontFamily: `'${c.font.fontFamily}', sans-serif`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    padding: '8px 12px',
  };
}

/** Generate axis tick style from current customization */
export function pbiAxisTick(c: ThemeCustomization) {
  return {
    fill: c.colors.foregroundNeutralSecondary,
    fontSize: c.font.fontSize,
    fontFamily: `'${c.font.fontFamily}', sans-serif`,
  };
}

/** Map gridline style to SVG strokeDasharray */
export function pbiGridlineDash(style: string): string {
  switch (style) {
    case 'dashed': return '5 3';
    case 'dotted': return '2 2';
    case 'none':   return '0';
    default:       return 'none';  // solid
  }
}

/** Legend wrapper style from current customization */
export function pbiLegendStyle(c: ThemeCustomization): React.CSSProperties {
  return {
    fontSize: c.legend.fontSize,
    fontFamily: `'${c.font.fontFamily}', sans-serif`,
    color: c.colors.foregroundNeutralSecondary,
    paddingTop: 8,
  };
}
