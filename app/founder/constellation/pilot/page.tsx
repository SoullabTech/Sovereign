import type { Metadata } from 'next';
import { requireFounder } from '@/lib/founder/founderAuth';
import PilotPacket from './PilotPacket';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Writer’s Studio pilot packet · Soullab', robots: { index:false, follow:false } };
export default async function WritersPilotPage() {
  const auth = await requireFounder();
  if (!auth.ok) return <section aria-label="Founder access required"><h1>Pilot packet</h1><p>Founder authorization is required to review this draft.</p></section>;
  if (process.env.CAPACITOR_BUILD) return <p>Open the founder pilot packet on the web.</p>;
  return <PilotPacket />;
}
