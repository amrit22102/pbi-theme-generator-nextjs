const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) process.env[key.trim()] = value.trim();
});
const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const WORKSPACE_ID = process.env.POWERBI_WORKSPACE_ID;
const REPORT_ID = process.env.POWERBI_REPORT_ID;

fetch('https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://analysis.windows.net/powerbi/api/.default'
  })
}).then(res => res.json()).then(async (data) => {
  if (!data.access_token) { console.error('No token:', data); return; }
  console.log('Got Azure Token');
  const res = await fetch('https://api.powerbi.com/v1.0/myorg/groups/' + WORKSPACE_ID + '/reports/' + REPORT_ID, {
    headers: { 'Authorization': 'Bearer ' + data.access_token }
  });
  const body = await res.text();
  console.log('Report API status:', res.status);
  console.log('Report API body:', body);
});
