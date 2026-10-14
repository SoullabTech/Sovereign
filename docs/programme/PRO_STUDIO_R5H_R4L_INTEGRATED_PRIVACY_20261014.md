# Pro Studio / MAIA / Astro R5h — isolated R5gA + R4L chart-origin integration
Date: 2026-10-14
Standing: **LOCAL INTEGRATED CANDIDATE — NO PRODUCTION / BETA / CLASS A AUTHORITY**

## Source custody and reconciliation
- Parent: R5gA frozen commit `612cc9b53f4dfcca2693cd0fcf2a521cbf43d872`
  (carries R5f atomic consent, owner-scoped reads and R5gA verified preferences).
- R4L protected-chart source: **exact staged patch**
  `ee7cd2bb4d5280415e9be9cd0642386d2e86fb718aa69726c2a3b28c8340d5e5`,
  based on separate Writer's Studio parent
  `35440fb3b93b5b49031421e04121bb747cb9f7df`.
- New isolated T7 worktree:
  `/Volumes/T7 Shield/pro-studio-r5h-r4l-integrated-privacy-20261014`;
  branch `fix/pro-studio-r5h-r4l-integrated-privacy-20261014`.
- **133** privacy/chart-adjacent paths were initially selected from R4L's
  173 staged paths. **130 applied directly**, three needed reconciliation;
  before freeze one unrelated ConversationInsightPanel icon-only change was
  restored to R5gA rather than introducing unreviewed UI without its own
  experience contract. Thus **129 directly applied paths are retained** and
  3 manually reconciled:
  `app/api/conversation/turns/route.ts`, `app/maia/page.tsx`,
  `config/accessMatrix.ts`. The original 40 excluded paths include
  other Writer's Studio and workstream-specific artifacts. This is an
  integrated *chart/privacy subset*, NOT a byte-exact combination of
  every R4L/Writer's Studio source file.
- Full selected/applied/conflict/excluded manifest:
  `/Volumes/T7 Shield/ProjectCache/prostudio-r5h-r4l-patch-custody-20261014.json`.
- R5gA's account-conflict MAIA page already contained R4L's restored-session
  logic plus newer multi-tab identity reconciliation; its newer code
  was preserved, not replaced. Reflect access gate also already existed.
  The missing authenticated Astro Pro chart access rule was added.
- R5's conversation route keeps **R5f mandatory S5 audit + both turns
  in one PostgreSQL transaction**, R5e storage outage HTTP503/no-store,
  and R5gA member-auth; R4L protected-chart sessions are now refused
  at route read/write and filtered in raw cross-session SQL.
- Internal `TurnsStore.getSessionTurns(sessionId,memberId)` retains
  verified user_id and excludes protected origin sessions.
  Both normal turn inserts within R5f's transaction use an additional
  R4F/R4I registry NOT-EXISTS check, so a forbidden chart-origin
  insert cannot be acknowledged as a successful two-turn pair.
  An absent registry must fail closed instead of becoming permission.
- R4L's other derivative writers, vector/Cut-1 developmental and theme
  retrieval, secondary MAIA/Oracle/voice paths and birth/BaZi prompt
  context gates are included in this held source, with original
  product-specific UI/gifting and preview portions where required
  by those privacy contracts.

## Governing permission principle
The member retains privacy over natal/BaZi information. Even deliberate
one-time sharing of a chosen chart passage authorizes that **one
conversation only**; it does not silently authorize later recall,
derived themes, Scribe summaries, voice recall, model training, or a
different account. Official R4F chart SEND activation remains hard-OFF
until independent authorization and provenance/consent gates exist.

**Registered protected chart origins** (R4F issuance, R4I immutable
origin registry) are always excluded from ordinary prior-session
history and prompt memory; developmental/semantic/breakthrough/theme
candidates must have ordinary provenance and known source lineage.
Historical unknown origin is withheld without deleting the record.
Ordinary, source-qualified A history and A-derived signal remain
eligible when the member separately enabled that ordinary recall.

**Unresolved known limit:** a member can paste chart text into a legacy
unclassified ordinary chat without issuing a chart-source marker. A
source registry cannot infer the privacy of arbitrary old plain text.
An honest Class A assessment must test all chat/input producers and
require a separate member-selected chart classification/grant,
including foreign-session and revocation behavior, before claiming
universal chart-passage protection. Never equate a global default-on
conversation preference with a passage-specific recall grant.

## Qualification and release holds
- R4 chart protections and R5 S5 audited storage/security tests in
  the integration worktree passed initial 26 suites/121 tests.
  Integrated route-specific new 8 tests passed.
- Real disposable PostgreSQL16 applied all FOUR R4F/R4G/R4H/R4I
  migrations to fictional schemas and confirmed 1 ordinary A turn
  and 1 ordinary source-qualified derivative remain eligible, while
  registered chart-once session and its derivative are excluded,
  and historical UNKNOWN-origin developmental memory is withheld.
  No production migration and no real member data.
- Initial governed application-wide TypeScript no-regression passed
  with 209 existing diagnostics against baseline 239, zero new
  diagnostic identities; this is not zero-error TypeScript.
- Further combined original R4/R5 regression, exact production-build
  and compiled production HTTPS+restored synthetic PG are required
  before declaring exact-commit technical PASS.
- R4I minimal immutable chart-origin marker is pseudonymous and not a
  separately signed durable deletion tombstone. R20 signed high-water
  recovery and account erasure remain independent release blockers.
- R4L also holds account deletion fail-closed; it is NOT authorization
  to erase a member account nor to activate migration on production.
- Physical Safari, actual MAIA model/voice/consent, current deployed
  frontend image/ingress and rollback, independent qualified human
  Class A security review, exact consenting beta tester cohort and
  final distinct founder/operator GO remain OUTSTANDING.

**NO PUSH, MERGE, RELEASE, CLOUD CONFIG, BILLING, LIVE MEMBER DATA,
MIGRATION OR TESTER INVITES AUTHORIZED.** Both original source
worktrees are preserved unchanged. Concurrent Writer's Studio staging
remains independent.

Review issues:
- https://github.com/SoullabTech/Sovereign/issues/1817
- https://github.com/SoullabTech/Sovereign/issues/1819
- https://github.com/SoullabTech/Sovereign/issues/1816
- https://github.com/SoullabTech/Sovereign/issues/1793
