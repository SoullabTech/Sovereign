# SPM-F5 Repair P1 — Root Dependency Map — 2026-09-17

**Standing:** P1 COMPLETE · READ-ONLY DEPENDENCY MAP · NO REPAIR ARCHITECTURE SELECTED

## Bound authority

- Law: `SPM-FC-01` · blob `b52c53eae03851fb6bf21dbc41a1f38fe3a003d1`
- Examined organism: `89b79a4a59f42a1cd5951d6a9686d3a47772ddef`
- Ratified conformance commit: `bbb1672d5e454f1f9051bdca76b8f71e681e88d8`
- Accepted conformance record SHA-256: `a6fc0750944c907b2ceabc462d6771927bae90f9e3eaa55a883cb0a9a397ed62`
- Founder ruling: `OPEN F5 REPAIR`
- Repair charter: `docs/programme/SPM-F5_REPAIR_CHARTER_2026-09-17.md`

P1 inspected the current source/schema lineage only. No application source, schema, migration, route, UI, or production state was modified.

## 1 · Dependency graph

```text
R4 provenance-at-intake ── HARD PRECONDITION ──▶ R2a participation cutover

R3a custody/disposition ── SEMANTIC PRECONDITION ──▶ R5b deletion/refusal presentation

R3b lineage ── POSSIBLE SHARED SUBSTRATE ──▶ R5a transformation provenance
              (not yet proved to require one mechanism)

R1 legacy destructive corridor ── independently containable
R1 destructive feature replacement ── would depend on R3a

R2b crossing warrants ── separate executable seam from R2a
                         and must not fill I-19
```
## 2 · Root decomposition finding

The five ratified roots remain the correct constitutional synthesis, but three are not single executable loci.

### R2 decomposes into

- **R2a — participation admission**: `I-10 I-11 I-12 I-13 I-14 I-15`
- **R2b — crossing warrant continuity**: `I-17`

They share an authority-continuity failure but not one proven mechanism.

### R3 decomposes into

- **R3a — custody / plurality / disposition**: `I-20 I-21 I-22 I-23 I-24 I-32`
- **R3b — derivation lineage**: `I-26 I-28`

They require a common inventory of governed objects, but custody edges and derivation edges have different semantics.

### R5 decomposes into

- **R5a — transformation provenance survival**: `I-5`
- **R5b — member-visible refusal/outcome truth**: `I-29`

These share the pattern “truth lost across a crossing” but are executable in different subsystems.
## 3 · R1 — Legacy destructive authority

### Executable loci

- `app/api/sovereignty/delete-my-memory/route.ts`
- `services/user-sovereignty/delete-memory-api.js`
- `app/labtools/sovereignty/page.tsx`
- `config/accessMatrix.ts` / `matchRule()`

The Next route accepts `body.userId`, forwards it to the legacy service, and returns `success:true` when the service import/call fails. The access matrix has `/api/sovereign`; raw prefix matching also catches `/api/sovereignty`.

### Lawful substrate already present

`app/api/members/delete-account/route.ts` already demonstrates verified identity, confirmation-after-authority, truthful 409 refusal, bounded success copy, and transactional credential revocation.

### Bypass risk

Changing only the Next route is insufficient if the standalone Express service remains reachable. Changing only UI copy leaves the destructive service. Adding only an explicit access rule leaves body-selected subject and false success.

### Dependency

R1 can be **contained independently**. A decision to preserve or rebuild “delete my memory” as a real destructive feature would depend on R3a's governed custody/disposition model.

### Smallest credible boundary hypothesis

Treat the Next route, direct service, UI, and route authority declaration as one legacy destructive corridor. The repair boundary must cover every live entry into that corridor, not one file.

### Evidence still missing

Repository evidence does not establish whether the standalone Express service is independently deployed/reachable in production. That reachability must be witnessed before any implementation grant.
## 4 · R2a — Participation admission

### Executable loci

Response-producing addenda consumers exist in:

- `app/api/sovereign/app/maia/list/route.ts`
- `app/api/sovereign/app/maia/route.ts`
- `app/api/between/chat/route.ts`
- `lib/sovereign/maiaService.ts`

Parallel ephemeral-room composition exists in:

- `lib/maia/roomComposition.ts`
- `app/api/now-what/interview/route.ts`
- `app/api/maia/vision-studio/interview/route.ts`

Canonical participation exists in `lib/maia/canonical-turn/*`, but ordinary `/maia/list` constructs it as `cognitionPath: 'shadow'`; failures are non-fatal and the legacy turn proceeds. Writer's Studio is the current response-producing canonical exemplar.

`lib/memory/MemoryBundle.ts` also contains a vector fallback over `developmental_memories` with no `valid_to` predicate.

### Lawful substrate already present

`constructCanonicalTurn → adjudicateParticipation → renderTurnForCognition` is live and response-producing in Writer's Studio. `lib/maia/memoryLoaders.ts` already demonstrates `valid_to IS NULL` on one developmental-memory read path.

### Bypass risk

A local cutover on `/maia/list` would leave `/maia`, Between, and the room-composition family. Fixing loaders alone would still leave route-level composition authority duplicated.
### Dependency

R2a has a **hard dependency on R4**. Canonical participation consumes producer/provenance classifications. If a Keep can mis-stamp derived material as `member-gesture`, making MIPA universal would universalize the false provenance.

R2a does not require full R3a account-erasure machinery before design, but its withdrawal guarantees must not rely on a path-specific store predicate.

### Smallest credible boundary hypothesis

All response-producing surfaces need one authoritative participation-admission crossing; loaders produce candidates, but may not independently decide prompt membership.

This is a boundary hypothesis, not a selected cutover design.

### Evidence still missing

Before P3, the full response-producing surface inventory must be closed beyond the currently located addenda and room families, including voice/alternate transport parity where those share cognition.

## 5 · R2b — Crossing warrant continuity

### Executable locus

The ratified failure arose where authority to read member Work can produce a persistent MAIA representation without a separately represented second-crossing warrant.

### Lawful substrate already present

Developmental Ask single-use authorization, revision authorization, and Circle audience consent each demonstrate non-composing warrants in bounded domains.

### Bypass risk

Treating R2a participation admission as sufficient would conflate “may enter cognition” with “may be represented/persisted afterward.”

### Dependency

R2b can be designed in parallel with R2a, but any generalized representation rule must preserve **I-19 as GAP**.

### Smallest credible boundary hypothesis

Identify the exact representation crossing and require its authority to be independently representable from the read/participation warrant.
## 6 · R3a — Custody, plurality, and disposition

### Executable loci

- `app/api/members/delete-account/route.ts`
- the member-bound baseline schema and FK graph
- domain erasure/removal mechanisms, including manuscript erasure and Circles
- existing deletion-record substrate:
  `deletion_manifests`, `deletion_manifest_scopes`, `provenance_tombstones`

The account route's own source states its `GOVERNED_CONTENT` list is “everything currently known”, not everything.

Concrete plural examples remain:
`attention_items.created_by` and `recipient_id` both cascade to `members`;
`circle_memberships.member_id` and `shared_artifacts.shared_by` have no member FK.

No runtime application writer for `deletion_manifests` was located; only migration/witness SQL writes were found.

### Lawful substrate already present

Modern account closure truthfully refuses known governed content. Manuscript erasure proves observed byte absence. Circles prove explicit revocation/tombstoning. Deletion manifests/scopes/tombstones provide a durable vocabulary for disposition history.

### Bypass risk

Extending `GOVERNED_CONTENT` by hand would remain drift-prone and cannot encode multi-sovereign stake, incidental FK cascades, or tables with no FK. Fixing FKs alone would not provide member-legible disposition or derivation lineage.
### Dependency

R3a is the semantic prerequisite for any future complete account-erasure promise and therefore for the final R5b deletion presentation contract.

### Smallest credible boundary hypothesis

A member-wide destructive act needs one governed custody/disposition boundary that knows the affected object classes and plurality before execution and records what happened afterward.

P1 does **not** select whether that knowledge is generated from schema, registry, manifest, or another mechanism.

### Evidence still missing

The accepted conformance census supplies the current denominator and gap counts. Before schema design, P2/P3 must establish how dynamic/post-baseline tables and non-FK ownership are admitted to the governed graph without manual-list drift.

## 7 · R3b — Derivation lineage

### Executable loci

Lineage is heterogeneous: exact `source_id/source_ref` in some stores, container/session lineage in others, and no specific source identity in several derived stores. Existing `artifact_lineage` and `attempt_lineage` are domain-local.

### Lawful substrate already present

Exact source binding already exists in several bounded domains, including manuscript proposal/authorization objects and disclosure receipts.

### Bypass risk

A generic “same member/session” link can satisfy co-location while leaving I-26/I-28 false.

### Dependency

R3b may provide shared substrate for R5a, but P1 does not prove they require a single graph or schema.

### Smallest credible boundary hypothesis

Derived governed objects need an explicit relation to the exact source object/version from which the derivation was made; container identity alone cannot serve as lineage.
## 8 · R4 — Origin authority at intake

### Executable loci

- `app/api/psyche/portfolio/keep/route.ts`
- `lib/psyche/portfolio.ts::keepSource()`
- source-specific Keep callers/resolvers
- conversational Keep pathways

The generic portfolio route accepts client-carried `sourceType`, `sourceId`, `title`, and, for spontaneous material, `body`. `keepSource()` then stamps `generated_by='member-gesture'`.

Capsule declaration is a strong counterexample: `resolveCapsuleDeclarationSource()` resolves eligible source content server-side before minting, and the browser supplies no wording.

### Lawful substrate already present

The capsule declaration path already separates source resolution from the provenance mint. The facilitated practitioner path separately stamps practitioner provenance.

### Bypass risk

Adding validation to one route leaves every other caller of `keepSource()`. Validating only source type/id existence still does not establish who authored the exact wording. Treating the authenticated invoker as the content author repeats the current defect.

### Dependency

R4 is **independent enough to design and prove first** and is a hard prerequisite to R2a cutover.

### Smallest credible boundary hypothesis

The provenance mint must establish source producer/origin independently of the Keep invoker. Where the member adopts wording produced by MAIA or another producer, source authorship and member adoption must remain separate facts.

### Evidence still missing

P2 must classify every current `keepSource()` caller by whether wording is server-resolved, current-member-authored, externally produced, or caller-carried without proof.
## 9 · R5a — Transformation provenance survival

### Executable locus

`manuscript_draft_sections` preserves exact text and `source_section_id`, but carries no authorship identity for transformed wording.

At the same time, Writer's Studio already records strong upstream facts:
`proposal_versions.author`, exact `proposal_version_id`, authorization identity, target section, and `resulting_version`.

### Lawful substrate already present

Revision execution applies the exact immutable proposal formulation and atomically records the authorization receipt after the mutation.

### Bypass risk

Simply adding an `author` column to a mutable section would collapse mixed authorship and later member edits into one label. Conversely, leaving provenance only on the proposal side may make the resulting Work unable to answer how current wording arrived.

### Dependency

R5a may share R3b's lineage substrate, but this is not yet a hard dependency.

### Smallest credible boundary hypothesis

The transformation crossing must leave durable lineage from the resulting Work state to the exact authored formulation/authorization that produced it, without reclassifying later member edits.

## 10 · R5b — Member-visible refusal/outcome truth

### Executable loci

- server: `app/api/members/delete-account/route.ts`
- client: `components/account/AccountSettings.tsx`

The server returns a truthful 409 with `accountChanged:false`, `retained`, and `nextStep`. The client checks only `res.ok` and does not read/render the non-OK body.

### Lawful substrate already present

The server already has a bounded member-legible refusal shape.

### Bypass risk

UI-only copy cannot be finalized while R3a may change the disposition contract. Server-only truth already proved insufficient.

### Dependency

R5b depends on R3a for the final account-deletion semantics, though the current 409 can already be presented more truthfully.

### Smallest credible boundary hypothesis

The governed outcome must be an end-to-end contract: server disposition → transport → member-visible state, with non-OK outcomes rendered rather than discarded.
## 11 · P1 sequencing conclusion

No implementation order is authorized here. The dependency evidence supports this design order for P2 contracts:

1. **R1 corridor containment contract** — bounded and independently analyzable.
2. **R4 provenance-mint contract** — bounded and a hard prerequisite to R2a.
3. **R3a custody/disposition contract** and **R3b lineage contract** — broad substrate work; schema proposals remain forbidden until these contracts are falsified.
4. **R2a participation contract** — may be designed now, but no implementation grant before R4 is proven.
5. **R2b crossing-warrant contract** — separate from participation and barred from filling I-19.
6. **R5a transformation-lineage contract** — co-designed against R3b without assuming one implementation.
7. **R5b member-truth contract** — finalized after the R3a server disposition contract stabilizes.

R1 and R4 contract design may proceed in parallel. This is sequencing of analysis/design only.

## 12 · Gate transition

```text
P0  authority / denominator binding     COMPLETE
P1  root dependency map                COMPLETE

P2  root repair contracts              NEXT
P3  repair architecture selection      CLOSED
P4  design falsification               CLOSED
P5  founder implementation grant       CLOSED
P6  implementation                     CLOSED
PRODUCTION                             UNTOUCHED
```

P1 stops here. No repair mechanism has been selected and no executable source has been changed.
