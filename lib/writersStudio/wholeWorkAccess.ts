/**
 * Client side of `writing.wholeWork` (see lib/auth/wholeWorkEntitlement.ts for who holds it).
 *
 * The server is the authority: the attention-map route refuses the whole-book synthesis with WHOLE_WORK_REFUSAL. This module
 * only lets a room avoid starting a pass the server will refuse, so a Free writer is not sent through nine readings first.
 *
 * It is presentation, so it fails OPEN: only an explicit answer that the entitlement is absent stops a pass here. Signed out,
 * offline, or a session the entitlements endpoint cannot see (it reads the cookie session, so the iOS app's header identity is
 * not seen) all answer `null`, and the pass proceeds to the server, which decides.
 */
import { apiFetch } from '@/lib/http/apiBase';

export const WHOLE_WORK_REFUSAL = 'whole_work_entitlement_required';

/** What the writer reads when the pass is not part of their membership. States the fact; promises nothing; changes nothing. */
export const WHOLE_WORK_MESSAGE =
  'The whole-book editorial pass is part of Writer’s Studio Pro, so MAIA did not begin it. Nothing in your manuscript changed.';

/** true = entitled, false = explicitly not entitled, null = unknown (proceed; the server decides). */
export async function wholeWorkAllowed(): Promise<boolean | null> {
  try {
    const res = await apiFetch('/api/members/entitlements', { cache: 'no-store' });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as { entitlements?: unknown; wholeWorkTaste?: unknown } | null;
    if (!Array.isArray(body?.entitlements)) return null;
    // A Free writer's one complimentary pass (founder ruling 2026-11-13) counts as allowed here; the server decides.
    return body.entitlements.includes('writing.wholeWork') || body.wholeWorkTaste === 'available';
  } catch {
    return null;
  }
}
