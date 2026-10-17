# Writer’s Studio R52 — legacy-write ingress preparation

**October 16, 2026 | Isolated Mac Studio | Default OFF | Five-tester production beta HOLD**

## Purpose and exact ancestry

R51 qualified fictional encrypted Source, Draft, Apply/Undo and ciphertext recovery, but it did not change the existing legacy manuscript-writing routes. A separately accepted R47 source inventory found 12 content-writing/delegating API routes and two related collection/export custody surfaces.

This isolated R52 branch preserves R51 exact commit 12aa14a563362755a803774050a738745a9265e0 and the R47 inventory ddaa5fb53f181e8e487b256cf3d786c56425ad40 as dual parents of conflict-free merge f7c673df94e61e9ffd32a6dcd0e3d7deb0208702. Both original worktrees and public production remain untouched.

## R52 implementation: a stop, never encrypted-writing permission

New held-only service: lib/writersStudio/release/heldLegacyWriterFenceR52.ts.

The code-level activation constant R52_REAL_LEGACY_PILOT_FENCE_ENABLED is permanently false for this candidate. Setting an environment variable does not turn it on. The helper returns immediately with no database query or request-body access while OFF.

Twelve legacy API files now include the helper **after existing verified member authentication and before body decoding or legacy persistence**, covering 13 POST/PUT writing operations: creation, Source ingest, blank Draft, Draft creation, Draft save, checkpoint, history restore, section save, Keep creation, structure adoption, editorial adoption, editorial Undo, and editorial turn persistence.

Existing GET/read routes and member-initiated Keep deletion are intentionally unfenced. The offline Cabin writer has a separate refusal-only clause because local Cabin identity is not a verified web session. Existing Safari/iOS x-session-token interpretation and verified-member identity resolution have not been modified.

The proposed policy for a **separately authorized future activation** is conservative: an exact server-held allowlist of at most five, enabled restricted beta, authoritative founder/CTO role and **historical protected Work custody** must be checked. Current approved testers and founders cannot use legacy writers. Anyone with a prior accepted beta consent event, R33 encrypted pending arrival, R32 original Source or R35 protected Draft remains held even after consent withdrawal or allowlist removal. A verified nonpilot member may retain legacy writing only after the protected-history check proves none exists. Missing, malformed or unavailable configuration, roles or custody tables must HOLD rather than downgrade.

The server-owned read-only custody query references review-only R32/R33/R35 tables not currently deployed as operational migrations. Turning the fence on before those schemas and independent key authorities are qualified would deliberately hold legacy writes broadly, including some nonpilot writers. Such an activation is NOT permitted by this candidate. HTTP 423 responses have no-store and persisted=false, with no author prose, token or manuscript locator.

The two related collection/export custody paths and unknown transitive/background writers remain unresolved. R52 makes no claim that all historical plaintext writers or readers have migrated.

## Reproducible release stops

Original R47 source inventory:
- Node command scripts/ops/wsBetaR47LegacyWriteInventory.mjs --audit: exit 0 for the recognized 12 writer plus 2 adjacent surfaces, while still HOLD.
- Same command --release-gate: expected exit **2**.

New R52 source-only integration audit:
- Node command scripts/ops/wsBetaR52LegacyIngressReleaseGate.mjs --audit: source wires verified, default-off, no history-table omission, no premature content-writing/body read, and preserved privacy/deletion routes. Successful audit still means HOLD.
- Same command --release-gate: expected exit **2**, not GO.
- Any missing/moved guard, changed writer sink, Cabin bypass, accidental Keep DELETE barrier or source activation drift must return exit **3**.

## Fictional local qualification (pre-commit)

- 14/14 R52 pure policy and route-placement tests PASS.
- 10/10 R52 source scanner negative/defeat tests PASS.
- 6/6 inherited R47 legacy writer inventory tests PASS.
- 13/13 disposable PostgreSQL 16 historical-custody SQL checks PASS on invented metadata and authentic review-only schemas. Accepted-then-revoked consent, pending encrypted arrival, immutable original Source, Draft head, founder and an ordinary nonpilot were distinguished. Removing a protected table caused refusal. The database container was removed.
- 76/76 selected inherited Source, Studio, security, consent and recovery suites: 795/795 tests PASS.
- Strict R52 core TypeScript: PASS. A route-inclusive strict project finds one inherited diagnostic in lib/sovereign/intelligentVoiceAdaptation.ts. The final full shipping TypeScript check remains a separate gate.

Fictional evidence root on Mac Studio:
/Volumes/T7 Shield/ws-beta-r52-legacy-ingress-evidence-20261016/

## Nonwaivable remaining launch gates

A protective stop by itself is not a usable encrypted editor. The real Next.js Studio must send properly verified member-and-consent-bound author choices into the independent Work-key Source/Draft/Apply/Undo pathway, preserving Undo, section identity and existing manuscripts without a plaintext fallback.

Operational independent key custody, monotonic cross-node revoke/delete highwater, encrypted private proposal recovery, old Source/Draft/Keep/MAIA SQL/WAL/backups/rollback-reader migration, and separately witnessed offsite restore remain incomplete. Full enforced production build and exact authenticated Mac/physical iPhone Safari experience (Develop/Write/Review, editable columns, semantic zoom, import, Save a Copy and Listen) still need acceptance.

R52 does not alter production, live member data, keys, public routes, DNS, mail, providers or GitHub. Any activation, release image, deployment or member admission requires a separate founder authorization and independent Class A review.

**Disposition: local held-only R52 ingress preparedness, real five-member beta HOLD.**
