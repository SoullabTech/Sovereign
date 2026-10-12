import type { Metadata } from 'next';
import { requireFounder } from '@/lib/founder/founderAuth';
import GrowthWork from './GrowthWork';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Growth & AI work · Soullab', robots: { index: false, follow: false } };

export default async function GrowthWorkPage() {
  const auth = await requireFounder();
  if (!auth.ok) return <section aria-label="Founder access required">
    <h1>Growth &amp; AI work</h1><p>Sign in with an authorized founder account to open this workspace.</p>
    <a href="/signin?next=%2Ffounder%2Fconstellation%2Fwork">Sign in to continue</a>
  </section>;
  if (process.env.CAPACITOR_BUILD) return <p>Open the founder workspace on the web.</p>;
  return <GrowthWork />;
}
