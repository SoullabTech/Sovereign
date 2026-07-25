'use client';

/**
 * Client renderer for the /diag diagnostics surface. Access is gated by the
 * server component in ./page.tsx (NEXT_PUBLIC_MOBILE_FAST_LANE=1); this file
 * only reports build identity + environment. It carries NO product behavior.
 *
 * Spec: docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md §2.1, §3
 */

import { useEffect, useState } from 'react';
import { BUILD_STAMP, apiBaseUrl } from '@/lib/http/apiBase';

type Env = { label: string; danger: boolean };

// Classify from the build-time-declared target first (authoritative), then
// cross-check against the runtime-resolved base. Production or an unset target
// is treated as dangerous — the tester must never be unsure which they are in.
function classify(declared: string, resolved: string): Env {
  const d = (declared || '').toLowerCase();
  const r = (resolved || '').toLowerCase();
  const isLan = (s: string) =>
    s.includes('localhost') ||
    /(^|[^0-9])(127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01]))/.test(s);

  if (!declared || declared === 'UNSET') {
    if (r.includes('soullab.life')) return { label: 'UNSET → PRODUCTION (UNSAFE)', danger: true };
    return { label: 'API TARGET UNSET', danger: true };
  }
  if (d.includes('soullab.life') || r.includes('soullab.life')) return { label: 'PRODUCTION TEST', danger: true };
  if (d.includes('staging')) return { label: 'STAGING', danger: false };
  if (isLan(d) || r === '' || r === '(relative same-origin)') return { label: 'LOCAL DEV', danger: false };
  return { label: declared, danger: false };
}

// The captured timestamp means different things per mode. In a dev server it is
// when the server started (config eval), NOT a build artifact — label honestly.
function timestampLabel(mode: string): string {
  if (mode === 'capacitor-dev') return 'launch timestamp';
  if (mode === 'beta' || mode === 'prod' || mode === 'capacitor') return 'build timestamp';
  return 'build/launch timestamp';
}

export default function DiagClient() {
  const [resolved, setResolved] = useState<string>('(resolving…)');
  const [platform, setPlatform] = useState<string>('(unknown)');
  const [viewedAt, setViewedAt] = useState<string>('');

  useEffect(() => {
    try {
      setResolved(apiBaseUrl() || '(relative same-origin)');
    } catch {
      setResolved('(error)');
    }
    setViewedAt(new Date().toISOString());
    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        setPlatform(Capacitor?.getPlatform?.() ?? 'web');
      } catch {
        setPlatform('web');
      }
    })();
  }, []);

  const declared = BUILD_STAMP.apiTargetDeclared;
  const env = classify(declared, resolved);

  const rows: Array<[string, string]> = [
    ['env label', env.label],
    ['commit (SHA)', BUILD_STAMP.commit],
    ['branch', BUILD_STAMP.branch],
    ['build mode', BUILD_STAMP.buildMode],
    [`${timestampLabel(BUILD_STAMP.buildMode)} (NOT per-request)`, BUILD_STAMP.timestamp],
    ['API target (declared)', declared],
    ['API target (resolved)', resolved],
    ['platform', platform],
    ['version', BUILD_STAMP.version],
    ['viewed at (now, NOT build/launch)', viewedAt],
  ];

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#0a0a0a',
        color: '#e6e6e6',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        padding: 16,
      }}
    >
      <div
        style={{
          background: env.danger ? '#7f1d1d' : '#14532d',
          color: '#ffffff',
          fontWeight: 700,
          textAlign: 'center',
          padding: '14px 8px',
          borderRadius: 8,
          letterSpacing: 1,
          fontSize: 18,
        }}
      >
        {env.danger ? '⚠ ' : ''}
        {env.label}
      </div>
      <p style={{ opacity: 0.6, fontSize: 12, margin: '10px 2px' }}>
        Verification-loop diagnostics · test-only surface · reports build identity only
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} style={{ borderBottom: '1px solid #222222' }}>
              <td
                style={{
                  padding: '8px 6px',
                  opacity: 0.7,
                  whiteSpace: 'nowrap',
                  verticalAlign: 'top',
                }}
              >
                {k}
              </td>
              <td style={{ padding: '8px 6px', wordBreak: 'break-all' }}>{v || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
