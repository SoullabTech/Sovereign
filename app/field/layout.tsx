import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soullab Field',
  description: 'MAIA — presence, session, guidance',
  // No robots — this is a native app shell, not indexable content
  robots: 'noindex, nofollow',
};

/**
 * /field/* layout — Mobile-native shell
 *
 * Intentionally minimal:
 * - No global nav or studio chrome
 * - No dashboard panels
 * - Sets x-maia-platform context for downstream components
 * - Microphone/camera permissions handled at middleware level for this prefix
 *
 * Routes under /field/*:
 *   /field/enter     — entry router (new/returning/active)
 *
 * The actual conversation and session UI lives at /maia (shared with PWA).
 * /field/enter routes there once auth is confirmed.
 * Future: /field/session, /field/check-in, /field/capture as slim mobile views.
 */
export default function FieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-platform="ios-field"
      style={{ minHeight: '100vh', background: '#0b0f1c' }}
    >
      {children}
    </div>
  );
}
