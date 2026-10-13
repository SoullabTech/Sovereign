import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { ReflectArrivalView } from '@/components/pro-studio/ReflectArrivalView';

/**
 * PRO-STUDIO-01-A-R1b — Reflect-first arrival, candidate only.
 *
 * This page deliberately does NOT inherit /studio's practitioner-only layout.
 * A server-validated member session is required, but there is no practitioner,
 * client, booking, team, or paid-capability dependency.
 *
 * Its one conversational action opens the EXISTING free MAIA encounter.
 * It does not grant paid Reflect features, store reflective work, or silently
 * import knowledge into a professional Wisdom Field.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reflect — Soullab Pro Studio',
  description: 'An invitation to begin with your own professional development, in conversation with MAIA.',
};

export default async function ReflectArrival() {
  const session = await getCurrentSession();
  if (!session) redirect('/signin?next=%2Fpro-studio%2Freflect');

  return <ReflectArrivalView />;
}
