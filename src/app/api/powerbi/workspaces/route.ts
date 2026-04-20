import { NextResponse } from 'next/server';

/**
 * GET /api/powerbi/workspaces
 *
 * Lists all Power BI workspaces the Service Principal has access to.
 */

const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET!;

// Shared Azure AD token cache
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

export async function GET() {
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Azure credentials are not configured.' },
      { status: 500 }
    );
  }

  try {
    const azureToken = await getAzureADToken();

    const response = await fetch('https://api.powerbi.com/v1.0/myorg/groups', {
      headers: { Authorization: `Bearer ${azureToken}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to list workspaces: ${response.status} — ${errorText}`);
    }

    const data = await response.json();

    // Return a clean list of workspaces
    const workspaces = (data.value || []).map(
      (ws: { id: string; name: string; type: string; state: string }) => ({
        id: ws.id,
        name: ws.name,
        type: ws.type,
        state: ws.state,
      })
    );

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error('Failed to list workspaces:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list workspaces' },
      { status: 500 }
    );
  }
}
