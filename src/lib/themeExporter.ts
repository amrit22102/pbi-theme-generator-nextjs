import { saveAs } from 'file-saver';

export function validateThemeJSON(json: object): { valid: boolean; error?: string } {
  try {
    const str = JSON.stringify(json, null, 2);
    JSON.parse(str);

    const theme = json as Record<string, unknown>;
    if (!theme.name || typeof theme.name !== 'string') {
      return { valid: false, error: 'Theme must have a "name" property.' };
    }
    if (!Array.isArray(theme.dataColors) || theme.dataColors.length < 6) {
      return { valid: false, error: 'Theme must have at least 6 data colors.' };
    }
    if (!theme.visualStyles) {
      return { valid: false, error: 'Theme must include visualStyles.' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid JSON structure.' };
  }
}

export function exportThemeJSON(json: object, filename: string): { success: boolean; error?: string } {
  const validation = validateThemeJSON(json);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const str = JSON.stringify(json, null, 2);
    const blob = new Blob([str], { type: 'application/json;charset=utf-8' });
    const safeName = filename.replace(/[^a-zA-Z0-9_-]/g, '_') || 'powerbi-theme';
    saveAs(blob, `${safeName}.json`);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to download file.' };
  }
}
