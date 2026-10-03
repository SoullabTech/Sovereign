import type { ReactNode } from 'react';
import { requireFounder } from '@/lib/founder/founderAuth';

export const dynamic = 'force-dynamic';

/** Whole-subtree guard. A shell navigation exception never grants founder access. */
export default async function ConstellationFounderLayout({ children }: { children: ReactNode }) {
  const auth = await requireFounder();
  if (!auth.ok) return <section aria-label="Founder access required" style={{ padding: 'clamp(24px, 4vw, 40px)', background: '#f6f3e9', color: '#2b352d', borderRadius: 16, fontSize: 16, lineHeight: 1.7 }}>
    <h1 style={{ fontSize: 32, fontFamily: 'Georgia, serif', lineHeight: 1.2, marginBottom: 16 }}>Your founder workspace</h1>
    <p style={{ marginBottom: 18 }}>Sign in with an authorized founder account to open Growth &amp; AI work. No private report is shown here.</p>
    <a href="/signin?next=%2Ffounder%2Fconstellation%2Fwork" style={{ display: 'inline-block', padding: '12px 0', textDecoration: 'underline', color: '#31513e', textUnderlineOffset: 4 }}>Sign in to your workspace</a>
  </section>;
  return <>{children}</>;
}
