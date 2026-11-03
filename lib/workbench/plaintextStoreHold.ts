/**
 * The workbench upload store is NOT envelope-encrypted, and must not quietly become the open door when member
 * original-file intake is released.
 *
 * `POST /api/book-studio/workbench/uploads` writes the original with a plain filesystem write and the extracted text into
 * plaintext columns. It is founder-only today. The plan for lifting member intake (F2) records the hazard: the runbook
 * removes the Caddy edge hold on this route at the same moment the release manifest is flipped, and the edge rule is an
 * unversioned server file. If that rule is the only thing standing in front of the route, releasing encrypted member
 * intake would also, silently, open a plaintext store that sits outside the envelope the release promised.
 *
 * So the route carries its own hold, expressed against the release manifest:
 *
 *   held  =  manifest says member intake is released  AND  this store is not known to be envelope-encrypted
 *
 * Why that shape and not an unconditional refusal: while the manifest holds member intake (today), this route behaves
 * exactly as it does now. The live Caddy matchers are unread by this lane, and an unconditional 423 could disable a
 * founder's working tool for no gain. The hold engages precisely at the moment the hazard appears, and from then on no
 * edge-rule change can reopen it.
 *
 * Fail closed: anything other than a literal `false` from the manifest counts as "released" here, so a malformed or
 * missing value holds rather than opens.
 *
 * To open this route after release, the store must first be moved onto the envelope (see lib/manuscript/source), and only
 * then may the constant below change, together with its pinned test, as a deliberate reviewed act.
 */
import type { WriterReleaseAuthority } from '@/lib/writersStudio/releaseAuthority';

export const WORKBENCH_STORE_IS_ENVELOPE_ENCRYPTED = false;

export function workbenchPlaintextStoreHeld(
  authority: Pick<WriterReleaseAuthority, 'sourceIntakeReleased'>,
  envelopeEncrypted: boolean = WORKBENCH_STORE_IS_ENVELOPE_ENCRYPTED,
): boolean {
  return authority.sourceIntakeReleased !== false && envelopeEncrypted !== true;
}
