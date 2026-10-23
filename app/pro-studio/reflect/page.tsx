import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isReflectBetaAllowed } from '@/lib/proStudio/reflectBetaAccess';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
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
  // Reflect uses the same server-verified cookie/header authority as the
  // request gate. A cookie-only helper would refuse a legitimate mobile
  // x-session-token after the strict proxy had already authenticated it.
  //
  // Construct a local request ONLY to reuse the existing verifier.
  // No request-origin claims, URL query-token admission, or client tier/role
  // assertions become authority through this bridge.
  const requestHeaders = await headers();
  const request = new NextRequest('https://soullab.invalid/pro-studio/reflect', {
    headers: new Headers(requestHeaders),
  });
  const verified = await deriveVerifiedAccess(request);
  if (!verified.authenticated || !verified.memberId) {
    redirect('/signin?next=%2Fpro-studio%2Freflect');
  }

  // Beta invitations are separate from practitioner role, Field Lab tester status,
  // free MAIA access, and any future paid Reflect entitlement. Default is closed.
  if (!isReflectBetaAllowed(verified.memberId, {
    enabled: process.env.PRO_STUDIO_REFLECT_BETA_ENABLED,
    memberIds: process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS,
  })) notFound();

  return <ReflectArrivalView />;
}
