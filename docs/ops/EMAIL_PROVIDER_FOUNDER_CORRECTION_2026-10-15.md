# EMAIL PROVIDER — FOUNDER CORRECTION (2026-10-15)

**Founder instruction — authoritative for ongoing development and support:**
> "The API key is in the build. We stopped using Resend. Put that in the notes."

## Current operational direction

- **Resend has been retired by Soullab. Do not recommend, reactivate, rotate, renew, or request Resend credentials as a remedy.**
- **The necessary email API credential already exists in the build/configuration according to the founder. Do not ask the founder for another API key.** Confirm the active production transport from deployment evidence without reading, logging, copying, or exposing secrets.
- The actual replacement provider and exact deployed configuration are **not yet independently identified in this record**. Do not infer them from historical Resend-specific source files, comments, runbooks, or dormant environment entries.
- Prior documentation describing Resend as the current default is **historical implementation evidence, not authorization to use it**. Fix stale documentation/configuration after establishing deployed reality.

## Trigger: Soul Portrait email failure

On 2026-10-15, the Soul Portrait send UI displayed **"The email failed to send: API key is invalid."** The portrait private link had already been generated. Do not treat this as evidence of a missing or invalid replacement-provider key.

Source review in a local MAIA-SOVEREIGN checkout found a *legacy code path*:
- `app/api/soul-portrait/[slug]/send/route.ts` constructs `new EmailRouter(memberId)`.
- `lib/comms/emailRouter.ts` constructs `ResendProvider` for managed/BYO sends and expects a practitioner ID.
- `lib/email/providers/index.ts` includes an SMTP adapter, but its presence alone does not establish the live production provider.
- Local `.env.production` includes an old `RESEND_API_KEY` entry; **do not conclude this is the authorized live transport** from that fact.

## Required next engineering sequence (NOT yet executed)

1. Determine the actual deployed mail provider and credential *reference* through configuration metadata/build ownership (no secret-value access).
2. Trace the running Soul Portrait send path; compare source versus the currently deployed artifact and check for legacy bypass of the live mail transport.
3. Correct routing to the authorized transport, and validate member/practitioner identity mapping; do not automatically fall back to Resend.
4. Preserve recorded recipient consent, the published portrait/link, and truthful accepted-versus-delivered reporting.
5. Test with an explicitly authorized test recipient and inspect the provider's non-sensitive acceptance/delivery evidence before declaring the fix released.
6. Deploy only through existing authorization, testing, and release gates. No production change is authorized by this note.

**Scope:** This is a founder correction and engineering handoff, NOT a verified production fix, provider migration, or authorization to inspect credential values.

**Canonical engineering/release tracking:** https://github.com/SoullabTech/Sovereign/issues/1803 (independent MAIL-R1 review; HOLD). A mistakenly created cross-repository issue (#1 in Soullab--Your-World-Your-Way) was closed with a pointer to the canonical issue. All production release decisions remain with Sovereign issue #1803 and the approved review gates.

## Verified follow-up — 2026-10-15

- Approved candidate transport: Proton SMTP. The October 12 cutover record documents the founder-approved noreply sender and prior SPF/DKIM/DMARC checks.
- Live maia-sovereign application remains at Oct 2 revision c9e4f7f7e, with EMAIL_PROVIDER unset, no SMTP connection settings in that container, and a legacy Resend key still configured (presence only; no secret values read).
- The protected Proton SMTP token file already exists on the verified production host at /home/soullab/.config/soullab-mail/noreply.smtp-token with UID/GID 1000 and mode 0600. Its contents were NOT read. It is not yet mounted into the running application.
- The Oct 12 SMTP-only mail remediation candidate synthesized a zero-conflict merge with the Oct 13 canonical origin/clean-main-no-secrets. The result has been staged in the T7 worktree fix/soullab-mail-trunk-integration-20261015 for testing.
- Existing human security-review, additive migration, independent recovery and production-delivery gates remain open. No credentials, production data or active deployment were altered.
