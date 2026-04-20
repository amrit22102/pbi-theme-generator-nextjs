'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as pbi from 'powerbi-client';

interface PowerBIEmbedProps {
  themeJson: object;
  workspaceId: string;
  reportId: string;
}

interface EmbedConfig {
  embedToken: string;
  embedUrl: string;
  reportId: string;
  expiry: string;
}

type EmbedStatus = 'idle' | 'loading' | 'ready' | 'error' | 'configuring';

/**
 * PowerBIEmbed — Embeds a Power BI report and applies theme JSON in real-time.
 *
 * - Accepts workspaceId + reportId to dynamically embed any report
 * - Fetches embed token from /api/powerbi/embed-token on mount
 * - Uses powerbi-client SDK to embed the report
 * - Calls report.applyTheme() whenever themeJson changes
 * - Auto-refreshes the embed token before expiry
 * - Re-embeds when workspaceId or reportId change
 */
export default function PowerBIEmbed({ themeJson, workspaceId, reportId }: PowerBIEmbedProps) {
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<pbi.Report | null>(null);
  const powerbiServiceRef = useRef<pbi.service.Service | null>(null);
  const tokenRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<EmbedStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [reportName, setReportName] = useState<string>('');

  /**
   * Fetch embed token from our server-side API route.
   */
  const fetchEmbedConfig = useCallback(
    async (wsId: string, rptId: string): Promise<EmbedConfig | null> => {
      try {
        const res = await fetch('/api/powerbi/embed-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: wsId, reportId: rptId }),
        });
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
    },
    []
  );

  /**
   * Schedule token refresh 5 minutes before expiry.
   */
  const scheduleTokenRefresh = useCallback(
    (expiry: string, wsId: string, rptId: string) => {
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
      }

      const expiryTime = new Date(expiry).getTime();
      const refreshIn = Math.max(expiryTime - Date.now() - 5 * 60 * 1000, 60_000);

      tokenRefreshTimerRef.current = setTimeout(async () => {
        console.log('[PowerBI] Refreshing embed token...');
        const newConfig = await fetchEmbedConfig(wsId, rptId);
        if (newConfig && reportRef.current) {
          try {
            await reportRef.current.setAccessToken(newConfig.embedToken);
            console.log('[PowerBI] Token refreshed successfully');
            scheduleTokenRefresh(newConfig.expiry, wsId, rptId);
          } catch (err) {
            console.error('[PowerBI] Token refresh failed:', err);
          }
        }
      }, refreshIn);
    },
    [fetchEmbedConfig]
  );

  /**
   * Cleanup helper — reset embed container & timers.
   */
  const cleanup = useCallback(() => {
    if (tokenRefreshTimerRef.current) {
      clearTimeout(tokenRefreshTimerRef.current);
      tokenRefreshTimerRef.current = null;
    }
    if (powerbiServiceRef.current && embedContainerRef.current) {
      powerbiServiceRef.current.reset(embedContainerRef.current);
    }
    reportRef.current = null;
  }, []);

  /**
   * Initialize: fetch token + embed the report.
   * Re-runs when workspaceId or reportId change.
   */
  useEffect(() => {
    // Don't embed if no workspace/report selected
    if (!workspaceId || !reportId) {
      setStatus('idle');
      cleanup();
      return;
    }

    let cancelled = false;

    async function init() {
      setStatus('loading');
      setErrorMsg('');
      setReportName('');

      // Reset any existing embed
      cleanup();

      const config = await fetchEmbedConfig(workspaceId, reportId);
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
        theme: { themeJson: themeJson },
      };

      // Embed the report
      const report = powerbiServiceRef.current.embed(
        embedContainerRef.current,
        embedConfig
      ) as pbi.Report;

      reportRef.current = report;

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
          setErrorMsg(
            (detail?.message as string) || 'An error occurred while rendering the report'
          );
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

      scheduleTokenRefresh(config.expiry, workspaceId, reportId);
    }

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, reportId]);

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

    const timer = setTimeout(applyTheme, 300);
    return () => clearTimeout(timer);
  }, [themeJson, status]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Idle state — no report selected */}
      {status === 'idle' && (
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
            textAlign: 'center',
            padding: 32,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--md-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            📊
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
            Select a Report
          </div>
          <div
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            Choose a workspace and report from the sidebar to embed it here. Your theme
            customizations will be applied in real-time.
          </div>
        </div>
      )}

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
            • Ensure the Service Principal has access to this workspace
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
