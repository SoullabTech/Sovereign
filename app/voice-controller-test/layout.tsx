import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import GateScreen from '@/components/access/FounderGateScreen';

/**
 * VoiceController smoke-test harness — founder only, enforced.
 *
 * The page's own header has said "Internal diagnostic" since it was written, and
 * lib/mobile/mobileAllowlist.ts annotates it "Kelly only". Neither was enforcement:
 * the route had no accessMatrix rule, and `checkAccess()` returns
 * { allowed: true } for unmapped routes because ACCESS_CONTROL_MODE defaults to
 * 'permissive' and is set nowhere. Confirmed against production 2026-07-24 — an
 * unauthenticated GET returned 200 and 30,896 bytes.
 *
 * This layout makes "Kelly only" behaviour rather than a comment. Identity comes
 * from the server session via requireFounder(); a client cannot assert it. The
 * founder allowlist fails closed: if FOUNDER_MEMBER_IDS is unset, nobody passes.
 *
 * The refusal screen used to be Book Studio's, which announced this diagnostic
 * harness as Soullab Press's editorial workspace. It now names itself (founder
 * ruling 2026-09-04); authorization is unchanged.
 *
 * This gate does NOT address the permissive unmapped-route default itself — that
 * is the systemic half of #717 and needs the unmapped-route inventory before a
 * ruling. Deleting this harness is a separate decision, deliberately not taken
 * here: whether the route is safe to expose and whether the harness is still
 * needed are two different questions, and native voice work is still active.
 */
export default async function VoiceControllerTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/voice-controller-test');
    }
    return (
      <GateScreen
        eyebrow="Soullab"
        title="Internal diagnostic"
        description="This is a VoiceController smoke-test harness, not a product surface."
        reason="Founder access is required."
      />
    );
  }
  return <>{children}</>;
}
