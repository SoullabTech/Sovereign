/**
 * Field Layout
 *
 * Minimal shell for /field/* routes. Designed for iOS/Capacitor boot performance:
 * no heavy module imports, no studio modules, voice-first focus.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MAIA Field',
  description: 'Voice-first presence with MAIA',
};

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
