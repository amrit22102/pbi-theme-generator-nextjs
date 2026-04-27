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

    // 4b. Update [Content_Types].xml to register the .json extension
    const contentTypesFile = zip.file('[Content_Types].xml');
    if (contentTypesFile) {
      let contentTypesXml = await contentTypesFile.async('string');
      if (!contentTypesXml.includes('Extension="json"')) {
        contentTypesXml = contentTypesXml.replace(
          '</Types>',
          '  <Default Extension="json" ContentType="application/json" />\n</Types>'
        );
        zip.file('[Content_Types].xml', contentTypesXml);
      }
    }

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

/**
 * Export the live Power BI report as a PBIX with the custom theme injected.
 *
 * Flow:
 * 1. Call our server-side API to download the report PBIX from Power BI
 * 2. Unzip the PBIX using JSZip
 * 3. Inject the theme JSON into RegisteredResources
 * 4. Update report.json to reference the custom theme
 * 5. Re-zip and download
 */
export async function exportLiveReportPBIX(
  themeJson: object,
  themeName: string,
  workspaceId: string,
  reportId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Download the report PBIX from our API
    const response = await fetch('/api/powerbi/export-pbix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, reportId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
      return { success: false, error: errorData.error || `Failed to download report (${response.status})` };
    }

    const pbixBuffer = await response.arrayBuffer();

    // 2. Load into JSZip
    const zip = await JSZip.loadAsync(pbixBuffer);

    // 3. Build a safe theme file name
    const safeThemeName = (themeJson as Record<string, unknown>).name as string || themeName;
    const sanitized = safeThemeName.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
    const uniqueSuffix = Date.now().toString() + Math.random().toString().slice(2, 8);
    const themeFileName = `${sanitized}${uniqueSuffix}.json`;

    // 4. Insert the custom theme JSON into RegisteredResources
    const themeJsonStr = JSON.stringify(themeJson, null, 2);
    zip.file(
      `Report/StaticResources/RegisteredResources/${themeFileName}`,
      themeJsonStr
    );

    // 5. Update [Content_Types].xml to register the .json extension
    //    OPC format requires every file extension to be listed in this manifest.
    //    Without this entry, Power BI Desktop rejects the package as corrupted.
    const contentTypesFile = zip.file('[Content_Types].xml');
    if (contentTypesFile) {
      let contentTypesXml = await contentTypesFile.async('string');
      if (!contentTypesXml.includes('Extension="json"')) {
        contentTypesXml = contentTypesXml.replace(
          '</Types>',
          '  <Default Extension="json" ContentType="application/json" />\n</Types>'
        );
        zip.file('[Content_Types].xml', contentTypesXml);
      }
    }

    // 6. Register the theme in the report definition
    //    Power BI PBIXes use different internal paths and encodings:
    //    - V3 (Desktop-created): Report/definition/report.json (UTF-8)
    //    - V4: definition/report.json (UTF-8)
    //    - Older/Service: Report/Layout (UTF-16 LE encoded)
    const reportPaths = [
      'Report/definition/report.json',
      'definition/report.json',
      'Report/Layout',
    ];

    for (const path of reportPaths) {
      const reportFile = zip.file(path);
      if (!reportFile) continue;

      try {
        // Read as raw bytes to detect encoding
        const rawBytes = await reportFile.async('uint8array');

        // Detect UTF-16 LE by checking for BOM (FF FE) or null-byte pattern
        const isUtf16LE =
          (rawBytes[0] === 0xff && rawBytes[1] === 0xfe) ||
          (rawBytes.length > 3 && rawBytes[1] === 0x00 && rawBytes[3] === 0x00);

        let reportJsonStr: string;
        if (isUtf16LE) {
          const decoder = new TextDecoder('utf-16le');
          reportJsonStr = decoder.decode(rawBytes);
          // Strip BOM if present
          if (reportJsonStr.charCodeAt(0) === 0xfeff) {
            reportJsonStr = reportJsonStr.slice(1);
          }
        } else {
          const decoder = new TextDecoder('utf-8');
          reportJsonStr = decoder.decode(rawBytes);
          if (reportJsonStr.charCodeAt(0) === 0xfeff) {
            reportJsonStr = reportJsonStr.slice(1);
          }
        }

        const reportJson = JSON.parse(reportJsonStr);

        // Add customTheme to themeCollection
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

        // Add RegisteredResources entry to resourcePackages
        if (!Array.isArray(reportJson.resourcePackages)) {
          reportJson.resourcePackages = [];
        }
        reportJson.resourcePackages = (reportJson.resourcePackages as { name?: string }[]).filter(
          (pkg) => pkg.name !== 'RegisteredResources'
        );
        (reportJson.resourcePackages as unknown[]).push({
          name: 'RegisteredResources',
          type: 'RegisteredResources',
          items: [{ name: themeFileName, path: themeFileName, type: 'CustomTheme' }],
        });

        // Write back in the same encoding as the original
        const updatedJsonStr = JSON.stringify(reportJson);
        if (isUtf16LE) {
          // Re-encode as UTF-16 LE with BOM
          const encoder = new TextEncoder();
          const utf8Bytes = encoder.encode(updatedJsonStr);
          // Build UTF-16 LE buffer: 2 bytes BOM + 2 bytes per char
          const utf16Bytes = new Uint8Array(2 + updatedJsonStr.length * 2);
          utf16Bytes[0] = 0xff; // BOM
          utf16Bytes[1] = 0xfe;
          for (let i = 0; i < updatedJsonStr.length; i++) {
            const code = updatedJsonStr.charCodeAt(i);
            utf16Bytes[2 + i * 2] = code & 0xff;
            utf16Bytes[2 + i * 2 + 1] = (code >> 8) & 0xff;
          }
          zip.file(path, utf16Bytes, { binary: true });
        } else {
          zip.file(path, updatedJsonStr);
        }
      } catch (err) {
        // If we can't parse this report file, skip it.
        console.warn(`Could not parse ${path} — skipping layout modification`, err);
      }
      break;
    }

    // 7. Remove SecurityBindings — contains integrity checksums that
    //    won't match after we've modified the archive contents.
    zip.remove('SecurityBindings');

    // 8. Re-zip and download
    //    MUST use STORE (no re-compression) to preserve binary entries
    //    like DataModel. JSZip's DEFLATE corrupts these binary blobs,
    //    causing Power BI Desktop to reject the file as corrupted.
    const pbixBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'STORE',
    });

    const downloadName = sanitized || 'report-themed';
    saveAs(pbixBlob, `${downloadName}.pbix`);

    return { success: true };
  } catch (err) {
    console.error('Live report PBIX export error:', err);
    return { success: false, error: 'Failed to export report with theme. The report may not support PBIX export.' };
  }
}
