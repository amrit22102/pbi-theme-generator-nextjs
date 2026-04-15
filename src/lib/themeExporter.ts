import { saveAs } from 'file-saver';
import JSZip from 'jszip';

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

/**
 * Export a PBIX file with the user's theme properly injected.
 *
 * Strategy (matches how Power BI Desktop applies custom themes):
 * 1. Fetch the blank template PBIX from /templates/blank-template.pbix
 * 2. Unzip it using JSZip
 * 3. Create Report/StaticResources/RegisteredResources/<theme>.json
 * 4. Update Report/definition/report.json:
 *    a. Add customTheme entry in themeCollection (after baseTheme)
 *    b. Add RegisteredResources entry in resourcePackages
 * 5. Re-zip all content and download as .pbix
 */
export async function exportPBIXPackage(
  themeJson: object,
  themeName: string,
): Promise<{ success: boolean; error?: string }> {
  const validation = validateThemeJSON(themeJson);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    // 1. Fetch blank PBIX template
    const response = await fetch('/templates/blank-template.pbix');
    if (!response.ok) {
      return { success: false, error: 'Failed to load PBIX template. Please try again.' };
    }
    const templateBuffer = await response.arrayBuffer();

    // 2. Load into JSZip — preserve original compression per entry
    const zip = await JSZip.loadAsync(templateBuffer);

    // 3. Build a safe theme file name matching Power BI's naming convention
    //    e.g. "nature-green026310778554836434.json"
    const safeThemeName = (themeJson as Record<string, unknown>).name as string || themeName;
    const sanitized = safeThemeName.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
    const uniqueSuffix = Date.now().toString() + Math.random().toString().slice(2, 8);
    const themeFileName = `${sanitized}${uniqueSuffix}.json`;

    // 4. Insert the custom theme JSON into RegisteredResources folder
    const themeJsonStr = JSON.stringify(themeJson, null, 2);
    zip.file(
      `Report/StaticResources/RegisteredResources/${themeFileName}`,
      themeJsonStr
    );

    // 5. Read and update report.json
    const reportJsonPath = 'Report/definition/report.json';
    const reportFile = zip.file(reportJsonPath);
    if (!reportFile) {
      return { success: false, error: 'Template is missing report.json — invalid PBIX template.' };
    }

    const reportJsonStr = await reportFile.async('string');
    const reportJson = JSON.parse(reportJsonStr);

    // 5a. Add customTheme to themeCollection (after baseTheme)
    if (!reportJson.themeCollection) {
      reportJson.themeCollection = {};
    }
    reportJson.themeCollection.customTheme = {
      name: themeFileName,
      reportVersionAtImport: {
        visual: '2.7.0',
        report: '3.2.0',
        page: '2.3.1',
      },
      type: 'RegisteredResources',
    };

    // 5b. Add RegisteredResources entry to resourcePackages
    if (!Array.isArray(reportJson.resourcePackages)) {
      reportJson.resourcePackages = [];
    }

    // Remove any existing RegisteredResources package to avoid duplicates
    reportJson.resourcePackages = reportJson.resourcePackages.filter(
      (pkg: { name?: string }) => pkg.name !== 'RegisteredResources'
    );

    reportJson.resourcePackages.push({
      name: 'RegisteredResources',
      type: 'RegisteredResources',
      items: [
        {
          name: themeFileName,
          path: themeFileName,
          type: 'CustomTheme',
        },
      ],
    });

    // Write updated report.json back into the zip
    zip.file(reportJsonPath, JSON.stringify(reportJson, null, 2));

    // 6. Remove SecurityBindings — Power BI regenerates it on open,
    //    and including the original can cause corruption after re-packaging.
    zip.remove('SecurityBindings');

    // 7. Re-zip and download
    //    PBIX files use the OPC (Open Packaging Convention) format.
    //    We must use STORE (no compression) to avoid corrupting binary entries
    //    like DataModel and SecurityBindings, since JSZip's DEFLATE can break
    //    entries that were originally stored uncompressed in the template.
    const pbixBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'STORE',
    });

    const downloadName = sanitized || 'CustomTheme';
    saveAs(pbixBlob, `${downloadName}.pbix`);

    return { success: true };
  } catch (err) {
    console.error('PBIX export error:', err);
    return { success: false, error: 'Failed to generate PBIX file. Please try again.' };
  }
}
