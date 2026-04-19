import { NextResponse } from 'next/server';

/**
 * POST /api/powerbi/embed-token
 *
 * Server-side only — authenticates with Azure AD using a Service Principal,
 * then calls the Power BI REST API to generate an embed token for the
 * configured report.
 *
 * Returns: { embedToken, embedUrl, reportId, expiry }
 */

const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET!;
const WORKSPACE_ID = process.env.POWERBI_WORKSPACE_ID!;
const REPORT_ID = process.env.POWERBI_REPORT_ID!;

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
  // Return cached token if still valid (with 2 minute buffer)
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

  // Cache the token
  cachedAzureToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Step 2: Get report details (embedUrl) from Power BI REST API.
 */
async function getReportDetails(azureToken: string): Promise<PBIReportResponse> {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports/${REPORT_ID}`;

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
async function generateEmbedToken(azureToken: string): Promise<PBIEmbedTokenResponse> {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports/${REPORT_ID}/GenerateToken`;

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

export async function POST() {
  // Validate environment variables
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !WORKSPACE_ID || !REPORT_ID) {
    return NextResponse.json(
      {
        error: 'Power BI configuration is incomplete. Please set all required environment variables.',
        missingVars: {
          AZURE_TENANT_ID: !TENANT_ID,
          AZURE_CLIENT_ID: !CLIENT_ID,
          AZURE_CLIENT_SECRET: !CLIENT_SECRET,
          POWERBI_WORKSPACE_ID: !WORKSPACE_ID,
          POWERBI_REPORT_ID: !REPORT_ID,
        },
      },
      { status: 500 }
    );
  }

  try {
    // 1. Authenticate with Azure AD
    const azureToken = await getAzureADToken();

    // 2. Get report details (for embedUrl)
    const report = await getReportDetails(azureToken);

    // 3. Generate embed token
    const embedToken = await generateEmbedToken(azureToken);

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
