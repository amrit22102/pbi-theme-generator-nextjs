import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/powerbi/export-pbix
 *
 * Downloads a report as a PBIX file from the Power BI REST API.
 *
 * Body: { workspaceId: string, reportId: string }
 *
 * Returns: The raw PBIX binary as an octet-stream response.
 *
 * Note: This requires the report to be on a Premium or Embedded capacity.
 */

const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET!;

// Reuse the same token caching pattern
let cachedAzureToken: { token: string; expiresAt: number } | null = null;

async function getAzureADToken(): Promise<string> {
  if (cachedAzureToken && Date.now() < cachedAzureToken.expiresAt - 120_000) {
    return cachedAzureToken.token;
  }

  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://analysis.windows.net/powerbi/api/.default',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Azure AD token error:', errorText);
    throw new Error(`Azure AD authentication failed: ${response.status}`);
  }

  const data = await response.json();

  cachedAzureToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, reportId } = await request.json();

    if (!workspaceId || !reportId) {
      return NextResponse.json(
        { error: 'workspaceId and reportId are required' },
        { status: 400 }
      );
    }

    // 1. Get Azure AD access token
    const accessToken = await getAzureADToken();

    // 2. Call Power BI REST API to export the report as PBIX
    const exportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/Export`;

    const exportResponse = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!exportResponse.ok) {
      const errorText = await exportResponse.text();
      console.error('Power BI Export error:', exportResponse.status, errorText);

      // Common error cases
      if (exportResponse.status === 403) {
        return NextResponse.json(
          { error: 'Insufficient permissions to export this report. The service principal may need Report.ReadWrite.All permissions.' },
          { status: 403 }
        );
      }
      if (exportResponse.status === 404) {
        return NextResponse.json(
          { error: 'Report not found in the specified workspace.' },
          { status: 404 }
        );
      }
      if (exportResponse.status === 400) {
        return NextResponse.json(
          { error: 'Cannot export this report as PBIX. It may have been created in the Power BI service (not Desktop), or the workspace may not be on Premium/Embedded capacity.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Power BI API error: ${exportResponse.status}` },
        { status: exportResponse.status }
      );
    }

    // 3. Get the PBIX binary data
    const pbixBuffer = await exportResponse.arrayBuffer();

    // 4. Return as binary response
    return new NextResponse(pbixBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="report.pbix"`,
        'Content-Length': pbixBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error('Export PBIX error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
