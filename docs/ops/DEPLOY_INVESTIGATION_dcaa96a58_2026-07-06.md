# Deploy Investigation — production `dcaa96a58` (2026-07-06)

**Status:** observation note · read-only · uncommitted-hold
**Trigger:** during a gated, pinned deploy of `0de213157` in this thread, the *origin-stability*
gate caught that production had moved `29b1ed0cd → dcaa96a58` — a deploy from a **different
thread**. This records what shipped and what the evidence says about authorization.

## What is live (verified)
- prod `GIT_COMMIT = dcaa96a58` · health **ok** (`safeMode:false`, db ok) · container Created
  `2026-07-06T17:02:05Z` · image `maia-sovereign:prod`.

## What shipped (`29b1ed0cd..dcaa96a58` — 8 commits, **all authored by Kelly Nezat**, 2026-07-06)
- `013d377ce` remove Living Field rail icon
- `946946599` now-what demo home at /now-what
- `797341185` activate Living Field nav rail
- `0de213157` Gate 3 consent helper (#564) — inert *(this thread's target)*
- `aa1fe2a7c` **Living Field moved to lower rail — member-facing to ALL members**
- `1b561b7c6` Living Field label
- `d85718149` now-what demo home v2
- `dcaa96a58` **session-room #566 — consent threshold, evidence layer, threshold→room door**

## Migrations (2 — applied and verified)
- `20260705000001_encounter_streams_and_consent` — creates `encounter_consent_events`,
  `encounter_media_streams`; alters `transcript_turns`.
- `20260705000002_encounter_stream_lifecycle` — alters `encounter_media_streams` (+`sha256`, +`byte_size`).
- **Ledger:** both recorded applied @ `2026-07-06 16:47:09Z`. **Schema:** `encounter_consent_events`,
  `encounter_media_streams`, and the `sha256` column all confirmed present — genuinely + fully
  applied, no drift.
- **Timing:** migrations 16:47:09Z, container built 17:02:05Z (~15 min later) — consistent with a
  migration-running deploy path (e.g. `scripts/deploy-production.sh`), not a quick maia-only rebuild.

## Authorization assessment
- **Authorship:** all 8 commits authored by Kelly Nezat — not third-party, not rogue code.
- **Provenance:** `GIT_COMMIT=dcaa96a58` baked in (not `unknown`) → provenance-aware deploy path.
- **Migrations:** applied + ledger-recorded → a gated deploy path (quick rebuild skips migrations).
- **Conclusion:** evidence is consistent with an **intentional, provenance-clean deploy of Kelly's
  own authored work** from another of his threads (session-room #566 + now-what + Living Field).
  It does **not** look rogue.
- **Open item (only Kelly can close):** whether that deploy ran the same explicit
  observe → gate → authorize → verify discipline this thread held, or a lighter path. The
  member-facing change (Living Field to ALL members) and the consent/encounter migrations are
  exactly the scope that warrants the full gate; confirming the gate ran is the one thing not
  visible from git/prod.

## Scope note for the record
The `0de213157` pinned deploy authorized in this thread would have **rolled prod backward**
(`dcaa96a58 → 0de213157`) — correctly declined (accept-and-hold). Gate 3's goal (helper live +
inert) is already satisfied via `dcaa96a58`.

## Recommendation
Accept-and-hold (done). No rollback. If the member-facing + migration scope was a deliberate
gated deploy, this note is the audit trail; if not, it marks where a deploy moved production
outside the discipline this thread has been holding.
