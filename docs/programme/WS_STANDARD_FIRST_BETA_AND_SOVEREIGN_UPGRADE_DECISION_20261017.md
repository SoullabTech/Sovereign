# Writer's Studio — standard-security private beta first; sovereign custody upgrade later

**Founder product direction: October 17, 2026.** Status: RATIFIED AS A PHASED PRODUCT DIRECTION, **NOT a release GO or consent-policy approval**.

## The decision

The initial Writer's Studio experience must be accessible to ordinary authors. A self-hosted key-management service, independently managed per-Work cryptographic deletion high-water, and an external key/freshness/revocation operator are **not universal prerequisites** for that conventional private beta. Those advanced, sovereign capabilities remain an intentional near-term *upgrade track*, not abandoned work.

The initial five-person invite-only beta may use established conventional hosted security **only after each control below is independently verified in the actual release environment**. Managed encryption at rest, disk encryption or provider-managed KMS can satisfy the initial encryption-at-rest requirement where documented; this does not imply end-to-end or member-only decryption. A cloud/volume security claim alone does not prove the database backups, temporary files, exports, provider copies or filesystem are encrypted.

No unsafe downgrade: R32/R35/R42/R47 already-protected Sources/Drafts, private editorial proposals, pending arrivals, and Works previously given stronger privacy/erasure promises must **never** be silently moved into a weaker, legacy plaintext path. They remain on their held protected pathway until an independently reviewed, author-consented migration is qualified. The older default-OFF legacy write interceptors and encrypted author fixtures must not be toggled blindly; author authorization and historical custody must be distinguished by exact Work.

## What standard beta MUST preserve

1. **Member ownership:** real verified login, tight consent and explicit tester admission; exact manuscript/member ownership checks on every read, export, write, Delete and version history; enforce same-origin/fetch posture where applicable. Another author's work must be denied indistinguishably from nonexistent work.
2. **Original and authorship:** exact imported Source remains recoverable and unchanged; writer edits and MAIA-proposed/adopted changes are durably distinguishable; exact user gesture, visible differences, clear Read in Context, Apply and separate Undo with concurrency/retry protection. MAIA never silently changes wording.
3. **Confidentiality:** actual HTTPS transport; verifiably encrypted production PostgreSQL storage/filesystems, file vault, backups and offsite archives; no secrets or manuscript text in logs, analytics, error payloads, caches, URLs or client headers. Allow privileged operational access only as described in the notice. Authenticated manuscript and editorial GETs must be private and `no-store`.
4. **Availability and recovery:** exact backups protected at rest/in transit, independently demonstrated restore of an original, latest Draft and at least one prior saved revision; credible published retention/deletion periods, including backup expiry. Do not promise cryptographic erasure, immediate destruction of all backup copies, or protection from a stolen admin key in this first profile.
5. **Provider/MAIA consent:** clear notice of which exact model/provider receives selected writing, for which purpose, and provider retention/training treatment as actually contracted. Require current member choice before external processing; no hidden provider calls or claims of no training without contract evidence.
6. **Scope:** ordinary authored writing only in initial private beta. **No identifiable patient/client records, protected health data, highly sensitive professional case notes or third-party confidential material** unless a separately approved appropriate privacy/compliance route is established. The user should see this limitation before import.
7. **Real release evidence:** full unsuppressed shipping TypeScript/build, exact reproducible release image/rollback, signed-in true Next.js import→Develop→Write→Review→Save→Apply→Undo→reopen→export, authentic Mac Safari and physical iPhone Safari, accessibility and small-group readiness. Start with the founder and **two individually authorized writers** before the remaining invitees. No mass invite by configuration toggle.

## What is deferred — and preserved

The sovereign upgrade will add separately governed per-Work wrapping/unwrap keys and leases, independent revocation/deletion/freshness authority, antirollback and stronger deletion guarantees, separately encrypted private editorial records, cross-process commit fencing, advanced recovery, and optional opt-in migration for existing Works. Keep manuscript/draft identity, Source provenance, member consent events and editorial history compatible so a later upgrade can be **verified, reversible where legally/technically possible, and never a quiet downgrade**. Do not promise that prior backup copies can be immediately destroyed.

This is a change to *initial product scope*, not an erasure of constitutional safety obligations. Writer's Studio A0 law still governs the author: **the manuscript comes first; MAIA proposes; the writer decides; changes are visible and reversible**.

## Source findings that must be qualified before standard launch

The currently checked in database migrations include raw text-bearing fields: `manuscript_sections.body`, `manuscript_source_arrivals.source_text`, `manuscript_keeps.verbatim_text`, `manuscript_working_drafts.content`, `working_draft_revisions.content`, and `manuscript_draft_sections.text`. These can be appropriate in a conventional application **only if all underlying storage, replica/export and backup media carrying them are proved encrypted at rest and access-controlled, and the beta notice truthfully describes operator access**.

Existing historical backup notes explicitly state the local `pg_dump | gzip` pathway and NAS copy did **not establish encrypted backup coverage**. Gzip and file mode 0600 do not make data encrypted. Verify the exact live host backup state; do not extrapolate from old docs or fictional backup tests. If unencrypted backup copies exist, STOP and produce an approved remediation/retention plan before storing any newly admitted beta member manuscript.

## Authority and release limits

This direction **does not authorize** deployment, paid vendor selection, secret creation, new data processing, existing-member access, an unencrypted import, a migration, an invitation, or the activation of default-off encrypted/legacy writer flags. An updated, exact member-visible beta privacy notice and policy hash must be reviewed and approved before admission; existing historical consent must not be reinterpreted as consent to a weaker profile.

**Current release state: HOLD.** The independent Work-key service is deferred as a *universal* prerequisite; actual conventional security, real author actions and observed release quality are emphatically **not deferred**.
