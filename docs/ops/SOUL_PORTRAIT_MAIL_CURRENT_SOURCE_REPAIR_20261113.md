# Soul Portrait managed Proton SMTP — current-source repair candidate

**Owner:** existing Soullab Mail MAIL-R1 #1803, linked Astrology #1893; continuity #1982.
**Source intake:** canonical `c9283f4a6813f692e33ea2141c8d8c028b152320`, November 13, 2026.
**Running reader at intake:** `faac1d482`; **NOT** an ancestor of this branch.
**Classification:** Class A privacy/consent, Class B database/transport.
**Disposition:** REVIEW ONLY / FEATURE DEFAULT OFF / DO NOT MERGE OR DEPLOY without independent verdict and founder exact-image GO.

## Why

The serving Soul Portrait route sends via `EmailRouter` which, in the served source, still uses practitioner BYO Resend or managed Resend. The application displayed `API key is invalid` after minting a private link. The precise credential branch for that request was not inspected.

The current shared provider barrel defaults to managed Proton SMTP but `SmtpProvider` and `reserveManagedAuthSend` restrict it to `auth:email-code`. Blindly rerouting portraits to that existing transport cannot work and would violate identity capacity controls.

The historical held [Proton Mail PR #1830](https://github.com/SoullabTech/Sovereign/pull/1830) contains compatible recipient-attestation design, but its broad, diverged changes cannot be merged wholesale.

## Bounded change

- Soul Portrait send route uses central `sendEmail` with `soul-portrait:delivery`, the managed noreply sender and a server-derived owner/portrait proof; **no practitioner BYO Resend selection on this route**.
- Validates recipient and separately checks explicit recipient acceptance + the subject's authorization before publishing or attempting mail.
- Blocks minors, nonowners and published portraits with revoked governing consent. An email attempt is reserved only if the owner, current subject-consent event, sender and exact one-recipient scope are admissible.
- New `portraitCapacity` authorizes P2 sends with a separate PG transaction/advisory lock and conservative global, owner and keyed-recipient ceilings. Uses the existing HMAC key; never stores raw email in the attestation table. Every reserved attempt consumes capacity, including uncertain SMTP outcomes. Auth-code P0 reservation logic stays byte-identical.
- SMTP adapter allows only its existing email-code purpose and the explicitly flagged Soul Portrait purpose. Other purposes remain rejected. Central mail ledger still records acceptance/refusal.
- The UI requires fresh sharing acknowledgement on every send/retry; error copy is privacy-safe. An SMTP acceptance is not labelled recipient inbox delivery. Link creation is explicitly described as publication even when email fails.
- `SOUL_PORTRAIT_SMTP_ENABLED` **must be exactly `true`** for this P2 path to operate; undefined/default refuses. No environment or credential change included.

## Schema / rollback

Additive `20261113000090_soul_portrait_delivery_attestations.sql` stores actor/portrait IDs, versioned HMAC recipient fingerprint, consent attestations and timestamp; indexes for capacity. Foreign keys cascade on member/portrait deletion. No plaintext recipient, portrait text, link or message body. Rollback **refuses** to drop a nonempty audit table; feature may be disabled without dropping evidence.

The migration is **NOT** in live production. Exact old-reader/migration-prefix/recovery review is required, including privacy deletion-vs-restore and actual Postgres migration execution. Source-only and mocked tests do not qualify it.

## Known independent review questions / holds

1. Evaluate recipient/subject consent attestations, governing ledger order, revocation race between reservation and SMTP delivery, replay and unknown outcomes. Do not represent current implementation as independent Class A PASS.
2. Validate source-only P2 budget versus physical SMTP account/provider capacity: separate logical reservation does not prove P0 physical isolation. Confirm an actual capacity reserve for auth.
3. Independently verify per-owner/other-account/minor negative cases, HMAC key custody/rotation, retention and R20 restore nonresurrection.
4. Verify actual `SMTP_PASSWORD_FILE`/provider activation by boolean/metadata only. Never read or print tokens, add Resend credentials, send live mail or change live env as a workaround.
5. Compare the **exact** current source descendant to live `faac1d482`; reconcile ancestry and any newer canonical source, code owner/lease, migrations, rollback and the existing single release train.
6. Obtain an attributable independent human security/migration review, current-source tests, a signed full build, authenticated fictional production journey, desktop/mobile Safari and separately consented owned-inbox witness before founder production GO.

## Initial test boundary

Jest route + capacity tests use fictional identities and mocked Postgres/provider; no external network or actual recipient. Baseline 61 SMTP/helper/auth tests pass; new route 8/8 and capacity 7/7. Full TypeScript in this large repository reports historical broader diagnostics and needs changed-source/baseline reconciliation. No independent security sign-off, migration or live provider proof claimed.
