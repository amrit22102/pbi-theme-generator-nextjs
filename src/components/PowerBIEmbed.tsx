'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as pbi from 'powerbi-client';

interface PowerBIEmbedProps {
  themeJson: object;
}

interface EmbedConfig {
  embedToken: string;
  embedUrl: string;
  reportId: string;
  expiry: string;
}

type EmbedStatus = 'loading' | 'ready' | 'error' | 'configuring';

/**
 * PowerBIEmbed — Embeds a Power BI report and applies theme JSON in real-time.
 *
 * - Fetches embed token from /api/powerbi/embed-token on mount
 * - Renders the report using powerbi-client SDK
 * - Calls report.applyTheme() whenever themeJson changes
 * - Auto-refreshes the embed token before expiry
 */
export default function PowerBIEmbed({ themeJson }: PowerBIEmbedProps) {
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<pbi.Report | null>(null);
  const powerbiServiceRef = useRef<pbi.service.Service | null>(null);
  const tokenRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<EmbedStatus>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [reportName, setReportName] = useState<string>('');

  /**
   * Fetch embed token from our server-side API route.
   */
  const fetchEmbedConfig = useCallback(async (): Promise<EmbedConfig | null> => {
    try {
      const res = await fetch('/api/powerbi/embed-token', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `API error: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch embed configuration';
      setErrorMsg(msg);
      setStatus('error');
      return null;
    }
  }, []);

  /**
   * Schedule token refresh 5 minutes before expiry.
   */
  const scheduleTokenRefresh = useCallback(
    (expiry: string) => {
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
      }

      const expiryTime = new Date(expiry).getTime();
      const refreshIn = Math.max(expiryTime - Date.now() - 5 * 60 * 1000, 60_000); // At least 1 min

      tokenRefreshTimerRef.current = setTimeout(async () => {
        console.log('[PowerBI] Refreshing embed token...');
        const newConfig = await fetchEmbedConfig();
        if (newConfig && reportRef.current) {
          try {
            await reportRef.current.setAccessToken(newConfig.embedToken);
            console.log('[PowerBI] Token refreshed successfully');
            scheduleTokenRefresh(newConfig.expiry);
          } catch (err) {
            console.error('[PowerBI] Token refresh failed:', err);
          }
        }
      }, refreshIn);
    },
    [fetchEmbedConfig]
  );

  /**
   * Initialize: fetch token + embed the report.
   */
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus('loading');

      const config = await fetchEmbedConfig();
      if (cancelled || !config || !embedContainerRef.current) return;

      setStatus('configuring');

      // Initialize powerbi service (singleton)
      if (!powerbiServiceRef.current) {
        powerbiServiceRef.current = new pbi.service.Service(
          pbi.factories.hpmFactory,
          pbi.factories.wpmpFactory,
          pbi.factories.routerFactory
        );
      }

      const embedConfig: pbi.IEmbedConfiguration = {
        type: 'report',
        tokenType: pbi.models.TokenType.Embed,
        accessToken: config.embedToken,
        embedUrl: config.embedUrl,
        id: config.reportId,
        permissions: pbi.models.Permissions.Read,
        settings: {
          filterPaneEnabled: false,
          navContentPaneEnabled: false,
          panes: {
            filters: { visible: false },
            pageNavigation: { visible: true },
          },
          background: pbi.models.BackgroundType.Transparent,
        },
        // Apply initial theme on load
        theme: { themeJson: themeJson },
      };

      // Embed the report
      const report = powerbiServiceRef.current.embed(
        embedContainerRef.current,
        embedConfig
      ) as pbi.Report;

      reportRef.current = report;

      // Listen for loaded event
      report.on('loaded', () => {
        if (!cancelled) {
          setStatus('ready');
          console.log('[PowerBI] Report loaded');
        }
      });

      report.on('rendered', () => {
        console.log('[PowerBI] Report rendered');
      });

      report.on('error', (event) => {
        const detail = event?.detail as Record<string, unknown> | undefined;
        console.error('[PowerBI] Report error:', detail);
        if (!cancelled) {
          setErrorMsg((detail?.message as string) || 'An error occurred while rendering the report');
          setStatus('error');
        }
      });

      // Get report page info for display
      try {
        const pages = await report.getPages();
        if (pages.length > 0) {
          setReportName(pages[0].displayName || 'Power BI Report');
        }
      } catch {
        // Not critical
      }

      // Schedule token refresh
      scheduleTokenRefresh(config.expiry);
    }

    init();

    return () => {
      cancelled = true;
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
      }
      // Reset the container
      if (powerbiServiceRef.current && embedContainerRef.current) {
        powerbiServiceRef.current.reset(embedContainerRef.current);
      }
      reportRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Apply theme whenever themeJson changes (after initial load).
   */
  useEffect(() => {
    if (status !== 'ready' || !reportRef.current) return;

    const applyTheme = async () => {
      try {
        await reportRef.current!.applyTheme({ themeJson: themeJson });
        console.log('[PowerBI] Theme applied');
      } catch (err) {
        console.error('[PowerBI] Failed to apply theme:', err);
      }
    };

    // Debounce theme application to avoid rapid-fire calls
    const timer = setTimeout(applyTheme, 300);
    return () => clearTimeout(timer);
  }, [themeJson, status]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Loading overlay */}
      {(status === 'loading' || status === 'configuring') && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            zIndex: 10,
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: '3px solid var(--border-default)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>
            {status === 'loading' ? 'Connecting to Power BI...' : 'Configuring report...'}
          </div>
          {reportName && (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{reportName}</div>
          )}
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            zIndex: 10,
            padding: 32,
            textAlign: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--md-error-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            ⚠️
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
            Unable to Load Report
          </div>
          <div
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            {errorMsg}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-tertiary)',
              maxWidth: 480,
              lineHeight: 1.5,
              marginTop: 8,
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <strong>Checklist:</strong>
            <br />
            • Verify <code>POWERBI_WORKSPACE_ID</code> and <code>POWERBI_REPORT_ID</code> in{' '}
            <code>.env.local</code>
            <br />
            • Ensure the Service Principal has access to the workspace
            <br />
            • Check that the workspace has an Embedded capacity assigned
            <br />• Confirm the report is published and accessible
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-primary)',
              color: 'var(--text-on-accent)',
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Embed container */}
      <div
        ref={embedContainerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 400,
        }}
      />

      {/* Spinner keyframe animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
