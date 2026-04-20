import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/powerbi/reports?workspaceId=xxx
 *
 * Lists all Power BI reports in the specified workspace.
 */

const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET!;

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
    throw new Error(`Azure AD authentication failed: ${response.status} — ${errorText}`);
  }

  const data = await response.json();
  cachedAzureToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json(
      { error: 'workspaceId query parameter is required.' },
      { status: 400 }
    );
  }

  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Azure credentials are not configured.' },
      { status: 500 }
    );
  }

  try {
    const azureToken = await getAzureADToken();

    const response = await fetch(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports`,
      { headers: { Authorization: `Bearer ${azureToken}` } }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to list reports: ${response.status} — ${errorText}`);
    }

    const data = await response.json();

    const reports = (data.value || []).map(
      (r: { id: string; name: string; reportType: string; embedUrl: string }) => ({
        id: r.id,
        name: r.name,
        reportType: r.reportType,
      })
    );

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Failed to list reports:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list reports' },
      { status: 500 }
    );
  }
}
