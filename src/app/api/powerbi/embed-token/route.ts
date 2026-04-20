import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/powerbi/embed-token
 *
 * Server-side only — authenticates with Azure AD using a Service Principal,
 * then calls the Power BI REST API to generate an embed token for the
 * specified report.
 *
 * Body: { workspaceId?: string, reportId?: string }
 *   Falls back to env vars if not provided.
 *
 * Returns: { embedToken, embedUrl, reportId, expiry }
 */

const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET!;

interface AzureTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface PBIReportResponse {
  id: string;
  name: string;
  embedUrl: string;
  datasetId: string;
}

interface PBIEmbedTokenResponse {
  token: string;
  tokenId: string;
  expiration: string;
}

// In-memory cache for the Azure AD token to avoid hitting rate limits
let cachedAzureToken: { token: string; expiresAt: number } | null = null;

/**
 * Step 1: Get an Azure AD access token using the Service Principal.
 */
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

  const data: AzureTokenResponse = await response.json();

  cachedAzureToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Step 2: Get report details (embedUrl) from Power BI REST API.
 */
async function getReportDetails(
  azureToken: string,
  workspaceId: string,
  reportId: string
): Promise<PBIReportResponse> {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${azureToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Power BI report details error:', errorText);
    throw new Error(`Failed to get report details: ${response.status}`);
  }

  return response.json();
}

/**
 * Step 3: Generate an embed token for the report.
 */
async function generateEmbedToken(
  azureToken: string,
  workspaceId: string,
  reportId: string
): Promise<PBIEmbedTokenResponse> {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${azureToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessLevel: 'View' }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Power BI embed token error:', errorText);
    throw new Error(`Failed to generate embed token: ${response.status}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  // Validate Azure credentials
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Azure credentials are not configured in environment variables.' },
      { status: 500 }
    );
  }

  // Read workspace/report IDs from body, fall back to env vars
  let workspaceId = process.env.POWERBI_WORKSPACE_ID || '';
  let reportId = process.env.POWERBI_REPORT_ID || '';

  try {
    const body = await request.json();
    if (body.workspaceId) workspaceId = body.workspaceId;
    if (body.reportId) reportId = body.reportId;
  } catch {
    // Body may be empty — that's fine, use env var defaults
  }

  if (!workspaceId || !reportId) {
    return NextResponse.json(
      {
        error: 'No workspace or report selected. Please select a workspace and report from the sidebar.',
      },
      { status: 400 }
    );
  }

  try {
    const azureToken = await getAzureADToken();
    const report = await getReportDetails(azureToken, workspaceId, reportId);
    const embedToken = await generateEmbedToken(azureToken, workspaceId, reportId);

    return NextResponse.json({
      embedToken: embedToken.token,
      embedUrl: report.embedUrl,
      reportId: report.id,
      expiry: embedToken.expiration,
    });
  } catch (error) {
    console.error('Embed token generation failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate embed token',
      },
      { status: 500 }
    );
  }
}
