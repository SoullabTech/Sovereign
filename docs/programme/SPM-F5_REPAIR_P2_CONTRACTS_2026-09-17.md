# SPM-F5 Repair P2 — Root Repair Contracts — 2026-09-17

**Standing:** P2 CONTRACT SET · OBSERVABLE OBLIGATIONS ONLY · NO REPAIR ARCHITECTURE SELECTED

## 0 · Authority and denominator

- Governing law: `SPM-FC-01`
- Governing contract blob: `b52c53eae03851fb6bf21dbc41a1f38fe3a003d1`
- Examined organism: `89b79a4a59f42a1cd5951d6a9686d3a47772ddef`
- Ratified conformance commit: `bbb1672d5e454f1f9051bdca76b8f71e681e88d8`
- Accepted conformance record SHA-256: `a6fc0750944c907b2ceabc462d6771927bae90f9e3eaa55a883cb0a9a397ed62`
- Repair opening: `OPEN F5 REPAIR`
- P1 dependency map: `docs/programme/SPM-F5_REPAIR_P1_DEPENDENCY_MAP_2026-09-17.md`

P2 does not reinterpret FC-01. The law text, prohibited inference, adversarial case, and PASS/FAIL condition remain the authority.

## 1 · Coverage accounting

```text
RC-1  Legacy destructive corridor                 I-1 I-2 I-3 I-25 I-30 I-31
RC-2  Provenance mint authority                   I-4 I-27
RC-3  Custody / plurality / disposition           I-20 I-21 I-22 I-23 I-24 I-32
RC-4  Derivation lineage                          I-26 I-28
RC-5  Participation admission                     I-10 I-11 I-12 I-13 I-14 I-15
RC-6  Crossing-warrant continuity                 I-17
RC-7  Transformation provenance survival          I-5
RC-8  Member-visible outcome truth                I-29
                                                  -----------------------------
                                                  25 local FAIL laws
```

I-19 receives **no repair contract**: it remains a declared GAP.
I-33 receives a separate imported companion contract, XC-1, outside the local denominator.
## 2 · Contract form

Every repair contract binds six things:

1. **Failed law(s)** — the FC-01 obligations the contract is allowed to discharge.
2. **Required observable behavior** — what a witness must be able to observe after repair.
3. **Current violating seam** — the executable condition that presently defeats the law.
4. **Existing lawful exemplar** — proof the organism already knows a related constitutional form; never automatic implementation authority.
5. **Forbidden regression** — a repair that produces this state is rejected even if the target law appears green.
6. **Evidence required** — what must exist before P7 may re-adjudicate the affected law.

A contract may be satisfied by containment, replacement, retirement, or another architecture. P2 does not choose among them.

## 3 · Global non-regression kernel

Every RC must preserve:

- I-6 — interpretation ownership remains independently recorded;
- I-7 — foreign and absent protected objects remain refusal-symmetric;
- I-8 — standing never creates warrant;
- I-9 — no mechanism depends on standing being monotonic;
- I-16 — authorization remains exact-object/exact-version bound;
- I-18 — audience/relationship authority remains independently representable.

Additional global constraints:

- I-19 remains unfilled;
- I-33 remains imported;
- Sanctuary boundaries may not be weakened;
- no repair may depend on caller-carried identity where server identity exists;
- no repair may claim conformance from comments, types, schema names, or green tests alone;
- no response-producing bypass may survive a purported authority cutover.
# RC-1 — Legacy destructive corridor

**Laws:** `I-1 I-2 I-3 I-25 I-30 I-31`

## Required observable behavior

For every live surface that can initiate or claim a destructive member-data act:

1. the destructive subject is derived from verified server-side identity;
2. a caller-supplied subject identifier cannot select or redirect the target;
3. a confirmation phrase may establish deliberateness only after authority is independently established;
4. access authority is explicitly declared for that surface rather than inherited by lexical prefix, directory, or gated parent;
5. a failed, unavailable, interrupted, or unexecuted act never presents as completion or queueing;
6. the member-facing declared scope never exceeds executable scope;
7. where erasure is promised, the storage-specific completion condition is observed rather than assumed.

If the legacy corridor is made non-executable instead of repaired in place, no reachable UI/API/service may continue to promise that the retired act exists. Applicability is re-adjudicated at P7; retirement does not pre-award PASS.

## Current violating seam

`/api/sovereignty/delete-my-memory` accepts `body.userId`, forwards it to the legacy service, inherits auth from raw prefix matching on `/api/sovereign`, and returns a mock `success:true`/“queued” response when the service fails. Its Lab Tools caller treats `result.success` as deletion completion.
## Existing lawful exemplar

`/api/members/delete-account` derives the member from `getMemberIdFromRequest`, treats confirmation as deliberateness, refuses known governed content with a truthful 409, and bounds its success copy to the narrow act actually completed.

Manuscript vault erasure demonstrates the separate I-25 form: an absence promise is followed by an absence observation.

These are exemplars only; RC-1 does not select either as the repair architecture.

## Forbidden regressions

- replacing `userId` with another caller-selectable alias;
- adding a stronger phrase while retaining caller-selected subject;
- adding an explicit access rule but leaving subject/false-success defects;
- hiding the UI while leaving another reachable destructive endpoint;
- swallowing service failure into any 2xx completion semantics;
- claiming “all data”, “all systems”, “permanent”, or equivalent breadth without matching executable and observed scope;
- breaking I-7 by revealing whether a foreign target exists.

## Evidence required

P7 re-adjudication requires:

- a closed inventory of every reachable entry into the legacy corridor, including any independently deployed service;
- actor/subject adversarial tests using foreign, absent, and self identities;
- access-rule evidence proving the route is explicitly classified;
- failure-injection evidence proving unavailable execution cannot present success;
- scope witness comparing member-facing promise with actual executable classes;
- storage-appropriate completion evidence for every erasure promise;
- route/UI/service bypass test showing no old live entry escapes the contract.

**Exit condition:** all live destructive entries satisfy the contract, or the corridor is demonstrably non-executable and no surface promises the retired act.
# RC-2 — Provenance mint authority

**Laws:** `I-4 I-27`

## Required observable behavior

For every persisted item that carries an authorship/producer claim:

1. the writing boundary establishes the producer of the **exact persisted wording** independently of the caller's assertion;
2. the authenticated invoker and the content producer remain distinguishable facts;
3. a member gesture may establish selection, adoption, filing, or retention without rewriting source authorship;
4. derived or MAIA-authored wording cannot acquire member authorship merely because the member invoked Keep;
5. unknown/unproven authorship is represented as unknown/unproven rather than upgraded to member authorship.

A member may adopt material without becoming its historical author.

## Current violating seam

The generic portfolio Keep route accepts caller-carried source metadata and wording. Conversational Keep may route an excerpt through `keepSource()`. The shared minter stamps `generated_by='member-gesture'` even when the exact wording's producer has not been independently established.

The capsule declaration path is materially different: it resolves eligible source wording server-side before minting.
## Existing lawful exemplar

- capsule declaration: server-resolved source ownership + exact source wording before the mint;
- facilitated practitioner observation: a separate writer mints practitioner provenance and does not route through member Keep;
- proposal versions: authored formulations carry explicit `author`.

No exemplar is automatically generalized.

## Forbidden regressions

- treating authenticated invoker as equivalent to content author;
- trusting `sourceType`, `sourceId`, title, excerpt, or producer from the client as authorship proof;
- validating only that a source row exists without proving the persisted wording came from it;
- relabeling member adoption as authorship;
- preventing members from keeping/adopting MAIA-produced material merely to avoid provenance complexity;
- overwriting source provenance when a member later adopts or edits material;
- weakening I-6 by deriving standing from source authorship.

## Evidence required

Before P3, every current `keepSource()` caller must be classified as one of:

- server-resolved member-authored wording;
- current-turn member-authored wording with server-verifiable origin;
- externally/MAIA/practitioner-authored wording;
- caller-carried wording whose authorship is not independently provable.

P7 requires adversarial tests that route byte-identical MAIA-derived text and member-authored text through each live minting entry and prove the persisted provenance differs appropriately while the member's adoption act remains representable.

**Exit condition:** no live provenance mint can turn lawful access or member adoption into a false member-authorship claim.
# RC-3 — Custody / plurality / disposition

**Laws:** `I-20 I-21 I-22 I-23 I-24 I-32`

## Required observable behavior

Before a member-wide governed destructive act can execute, the governing mechanism can account for the complete affected information graph relevant to that act.

For every governed class it can state, before execution:

- what object class is involved;
- which identity/identities hold a stake;
- which disposition applies: `erased | retained | blocked | anonymized | transformed`;
- why that disposition is lawful;
- which dependent effects will occur, including database cascade/restrict behavior and non-FK stores;
- whether a surviving representation depends on authority the departing member would no longer be able to revoke.

Where another sovereign has a stake, one member's act may not destroy that other sovereign's record. The result must be refusal, severance, tombstone, or another explicitly governed non-destructive disposition for the other sovereign's record.

A member deletion may not leave an operative representation standing solely under a warrant whose holder has been erased and can no longer exercise withdrawal.
## Current violating seam

Account closure uses a bounded manual inventory while the actual custody graph spans hundreds of member-bound loci, FK cascades/restricts, text-typed ownership, and non-FK multi-sovereign rows.

Examples already established:

- `attention_items.created_by` and `recipient_id` both cascade to members;
- `circle_memberships.member_id` has no member FK;
- `shared_artifacts.shared_by` has no member FK;
- numerous multi-sovereign markers are invisible to located disposition paths.

Existing `deletion_manifests`, `deletion_manifest_scopes`, and `provenance_tombstones` are substrate, but no runtime member-deletion writer was located.

## Existing lawful exemplar

- manuscript erasure refuses when another living Work holds the material;
- Circle removal revokes/tombstones relationship-held representation while source remains;
- modern account closure refuses rather than knowingly orphaning governed content;
- deletion manifest/tombstone schema demonstrates durable disposition vocabulary.

## Forbidden regressions

- extending a hand-maintained table list and calling it complete without drift detection;
- equating FK reachability with governance;
- equating “no FK” with “not governed”;
- deleting a shared record because one participant leaves;
- retaining an operative share while deleting the only holder of its revocation authority;
- discovering cascade effects only after the act and reconstructing what happened;
- turning uncertainty about a new member-bound class into silent deletion.
## Evidence required

P3 may not select a member-wide schema/migration until a read-only authority model can account for:

1. baseline member-bound loci;
2. post-baseline/dynamic loci;
3. direct member FKs and their ON DELETE effects;
4. text/non-FK ownership;
5. multi-sovereign stake;
6. external/file custody;
7. existing domain-specific erasure/removal laws.

The contract must fail closed when a newly introduced governed member-bound class has no disposition.

P7 requires a seeded non-production witness with representative single-sovereign, multi-sovereign, cascade, restrict, no-FK, external-byte, and surviving-warrant cases. The mechanism must predict the disposition before execution and record the actual disposition from the same governed act afterward.

No production member deletion is required to prove the design.

**Exit condition:** the governed destructive process, not after-the-fact inspection, can explain the complete resulting disposition and preserves other sovereigns' records and revocation rights.

# RC-4 — Derivation lineage

**Laws:** `I-26 I-28`

## Required observable behavior

Every persistent governed derivative can identify the exact source material from which it was computed.

The lineage must distinguish:

- source object identity;
- source version/state where the source is mutable;
- multi-source derivation where more than one source contributed;
- derivative identity.

A session, member, Work, or other container identifier alone is not sufficient when it does not identify the material used.
Co-location of source and derivative is not sufficient lineage evidence.
## Current violating seam

The accepted census found derived stores with no specific source reference and others with only session/container lineage. In-row embeddings disappear with their source row but do not thereby become governed lineage.

Existing `artifact_lineage` and `attempt_lineage` are domain-local rather than a demonstrated organism-wide derivation rule.

## Existing lawful exemplar

- exact proposal-version identity;
- disclosure receipts with exact source references;
- case-memory chunks with source identity;
- immutable editorial lineage in Writer's Studio.

## Forbidden regressions

- storing only member/session/container identity;
- relying on physical co-location or cascade as proof of derivation;
- reconstructing likely sources later from timestamps or semantic similarity;
- copying source text into the derivative and treating duplication as lineage;
- creating lineage that cannot distinguish source versions.

## Evidence required

P3 requires a census of every governed persistent derivative class and its source cardinality.

P7 requires, for each class, a witness starting from the derivative's identity and recovering the exact source object/version(s) without inference. A source mutation/version-advance adversarial case must not silently make an old derivative appear to have come from the new state.

**Exit condition:** persistent derivation is historically answerable from durable lineage rather than storage layout or reconstruction.
# RC-5 — Participation admission

**Laws:** `I-10 I-11 I-12 I-13 I-14 I-15`

## Required observable behavior

Every response-producing cognition path that admits member-related stored material has an authoritative participation decision indexed by the relevant consumer, purpose, or room.

For each candidate, that authority must distinguish at minimum:

- availability from permission to participate;
- persistence from member adoption;
- system salience/retrieval frequency from member confirmation;
- historical standing from current warrant;
- live permission from withdrawn permission.

A declared withholding/withdrawal control must be read by every path it governs, including fallbacks, vector search, caches, replay, alternate rooms, and alternate transports.

Repeated system retrieval may affect salience only; it may not increase member standing or substitute for a member act.

Material stored but never adopted may not be treated as adopted merely because it is persisted and not rejected.
## Current violating seam

- ordinary `/maia/list` canonical participation is shadow-only and explicitly non-fatal;
- legacy addenda remain response-producing;
- `/api/sovereign/app/maia` and Between compose their own memory addenda;
- Now What?/Vision Studio use parallel `roomComposition.ts`;
- `MemoryBundle` vector fallback lacks the withdrawal predicate present on stronger read paths;
- atom participation treats never-confirmed and confirmed material alike except for rejection;
- system recall count participates materially in ranking.

## Existing lawful exemplar

Writer's Studio demonstrates response-producing:
`constructCanonicalTurn → adjudicateParticipation → renderTurnForCognition`.

Canonical policy already models room/purpose, Sanctuary, memory mode, producer class, and restraint. Stronger memory loaders already demonstrate explicit `valid_to` filtering.

## Hard dependency

**RC-2 must be proven before RC-5 implementation can receive a founder grant.**
A universal participation authority operating on false provenance would make the false provenance universally authoritative.

## Forbidden regressions

- copy/pasting MIPA checks independently into each route;
- leaving one response-producing legacy path beside the governed path;
- interpreting a missing preference or database error as affirmative consent without governing law;
- treating `recall_count`, confidence, significance, or model recurrence as member confirmation;
- deleting historical standing to implement withdrawal;
- suppressing all unconfirmed material by pretending persistence has no legitimate non-adopted role;
- making standing itself the permission check, violating I-8.
## Evidence required

Before P3, close the response-producing surface inventory, including typed/spoken paths where they differ, and identify the one authority decision each path currently obeys.

P7 requires adversarial matrices that hold material fixed while varying:

- room / purpose / consumer;
- Sanctuary state;
- recall preference;
- withdrawal / `valid_to`;
- adoption state;
- retrieval count;
- fallback/vector path;
- transport or modality where applicable.

For a withheld or withdrawn candidate, every response-producing path must exclude it. For repeated-but-unconfirmed material, standing must remain unchanged. For persisted-but-unadopted material, its treatment must remain explicitly non-adoptive.

**Exit condition:** no response-producing path can admit governed material without the same authoritative participation semantics, and no fallback can silently reacquire withdrawn influence.

# RC-6 — Crossing-warrant continuity

**Law:** `I-17`

## Required observable behavior

At the specific D9 crossing that earned I-17, authority to read material does not authorize the subsequent representation crossing.

The second crossing must have independently representable authority. Reusing, strengthening, or merely possessing the first warrant is insufficient.

This contract is intentionally narrow. It does **not** constitutionalize general MAIA-as-speaker representation; I-19 remains GAP.
## Current violating seam

The established specimen records a reading warrant while the resulting representation can persist without a separately represented second-crossing warrant.

## Existing lawful exemplar

- developmental Ask single-use authorization;
- exact-version manuscript revision authorization;
- Circle audience-indexed representation authority.

Each demonstrates that different crossings can carry independent authority.

## Forbidden regressions

- treating participation admission as representation authority;
- adding a broad “MAIA may represent” flag;
- deriving the second warrant from high standing/confidence;
- reusing the reading authorization identifier as proof of a different act without a separately established authority fact;
- expanding RC-6 into the unearned I-19 domain.

## Evidence required

P3 must identify the exact first and second crossing boundaries and the durable fact, if any, currently authorizing each.

P7 adversarial witness:
1. grant the read warrant;
2. exercise the read;
3. withhold the second-crossing authority;
4. attempt the representation.

The representation must refuse. A separately authorized second crossing must succeed without changing the source's standing.

**Exit condition:** read authority and representation authority can vary independently at the earned specimen.
# RC-7 — Transformation provenance survival

**Law:** `I-5`

## Required observable behavior

Starting from a transformed persistent Work object, the system can recover whose wording produced the transformed material and the exact authorized formulation/change that introduced it.

Provenance must survive the transformation itself. It may be linked, but it cannot exist only in a remote production history that the transformed object cannot durably identify.

Later member editing must not cause the entire transformed object to be falsely relabeled as either MAIA-authored or member-authored.

## Current violating seam

`manuscript_draft_sections` preserves text and source-section provenance but no authorship identity for transformed wording.

Writer's Studio separately knows:
`proposal_versions.author`, exact proposal version, exact authorization, target section, and resulting draft version.

The mutation therefore has stronger provenance before/at execution than the resulting Work can presently answer from itself.

## Existing lawful exemplar

Revision execution reads the exact immutable proposal formulation, applies it exactly once inside the same transaction, and records an authorization receipt with `resulting_version`.

## Forbidden regressions

- a single mutable `author` label on a section that contains mixed/later-edited wording;
- overwriting prior provenance when the member edits after accepting a MAIA proposal;
- inferring authorship from who currently owns the Work;
- calling `source_section_id` authorship provenance;
- requiring preservation of deleted source content when a durable non-content lineage reference would suffice under governing erasure law.
## Evidence required

P3 must define the transformed-object identity and the granularity at which authorship remains truthful after subsequent edits; P2 does not choose row-, span-, revision-, or event-level representation.

P7 must witness at least:

1. member-authored original wording;
2. MAIA-authored exact proposal;
3. member authorization and application;
4. resulting Work queried from its transformed identity and linked to the exact MAIA-authored formulation;
5. later member edit;
6. resulting provenance that does not falsely attribute the whole current state to one author.

The witness must survive version advance and must not depend on replaying logs.

**Exit condition:** provenance is recoverable from the transformed Work lineage and remains truthful under subsequent authorship changes.

# RC-8 — Member-visible outcome truth

**Law:** `I-29`

## Required observable behavior

A governed refusal or partial-retention outcome is complete only when the member-facing surface receives and renders:

- the governed reason;
- whether anything changed;
- the bounded retained/undisposed categories relevant to that outcome;
- the next lawful step when one exists.

Non-2xx is not itself presentation. The client must not silently discard the governed body.

Success presentation must be bounded to the action actually completed.
## Current violating seam

`/api/members/delete-account` returns a truthful 409 with `accountChanged:false`, retained categories, message, and `nextStep`.

`components/account/AccountSettings.tsx` checks only `res.ok`; it does not parse/render the refusal body and currently promises “Permanently delete your account and all associated data.”

## Existing lawful exemplar

The server response already carries a member-legible refusal contract. Other governed manuscript surfaces also distinguish refusal from infrastructure failure rather than presenting both as success.

## Dependency

The final deletion/retention wording depends on RC-3's stabilized disposition contract. RC-8 may not overstate completeness while RC-3 remains unresolved.

## Forbidden regressions

- generic “something went wrong” when a governed reason exists;
- treating 409 as transport failure;
- showing “nothing changed” if a partial mutation actually occurred;
- promising full deletion before RC-3 can establish full disposition;
- exposing protected foreign-object details in refusal, violating I-7;
- making support contact the only truth while hiding what the system already knows.

## Evidence required

P7 requires component/integration evidence for at least:
- governed refusal with no mutation;
- successful bounded account closure;
- infrastructure failure;
- any partial-retention outcome the final RC-3 design permits.

The member-visible state must match the exact server disposition in each case.

**Exit condition:** the member receives the governed outcome rather than the UI reducing it to `res.ok`.
# XC-1 — Imported traceability companion

**Imported law:** `I-33` — excluded from the 31-law local denominator.

## Required observable behavior

Where the Cut-1 retrieval act is designated accountable, the specific historical occasion is answerable from a durable record of that occasion.

If the occasion record cannot be durably established, the accountable act may not silently influence response-producing cognition and then rely on later reconstruction.

## Current violating seam

`MemoryBundle` decides live candidates, then attempts `recordCut1Trace()`. Trace persistence failure warns and the live candidates still return.

## Existing lawful exemplar

Other governed crossings couple execution and receipt such that failure to record the receipt rolls the mutation back.

## Forbidden regressions

- recomputing current eligibility and calling it historical trace;
- logging only aggregate counts when the law requires occasion accountability;
- letting trace failure disappear into a warning while the accountable act still affects cognition;
- folding I-33 into the local FC-01 denominator.

## Evidence required

A failure-injection witness must prove that an accountable Cut-1 occasion cannot affect cognition without its durable occasion record, or else that the act is explicitly outside the class for which traceability is claimed.

**Exit condition:** a historical accountable occasion is answerable from its own durable record.

# I-19 — Explicit non-contract

No repair contract is created for I-19.

P2 does not assert:
- that every MAIA statement about a member requires a new warrant;
- that self-characterization is representation in the I-18 sense;
- that first-person member-facing speech inherits Circle law;
- that external-human representation has been located.

Any future law here requires a separate evidence/adjudication lane.
## 4 · P2 cross-contract dependencies

```text
RC-2  Provenance mint
  └── HARD PRECONDITION ───────▶ RC-5 participation implementation

RC-3  Custody/disposition
  └── SEMANTIC PRECONDITION ───▶ RC-8 final deletion/outcome wording

RC-4  Derivation lineage
  └── CO-DESIGN INPUT ─────────▶ RC-7 transformation provenance
      (shared implementation not assumed)

RC-1  Legacy destructive corridor
  ├── containment/retirement can be designed independently
  └── any complete replacement erasure capability depends on RC-3

RC-6  Crossing warrant
  └── MUST NOT create an I-19 law

XC-1  Imported traceability
  └── remains outside local denominator
```

## 5 · P2 acceptance matrix

A P3 architecture candidate is inadmissible unless it can name which RC it discharges and can be falsified against that RC's required evidence.

One architecture may discharge multiple RCs only if the evidence proves the shared authority boundary. Similar vocabulary or adjacent tables are insufficient.

No RC is complete merely because:
- a migration exists;
- a type contains the needed field;
- a route calls a helper with the right name;
- a unit test passes against a mocked mechanism;
- an exemplar elsewhere in the organism has the desired property.

P7 remains the point at which FC-01 laws can change disposition.
## 6 · Gate transition

```text
P0  authority / denominator binding     COMPLETE
P1  root dependency map                COMPLETE
P2  root repair contracts              COMPLETE

P3  repair architecture selection      NEXT
P4  design falsification               CLOSED
P5  founder implementation grant       CLOSED
P6  contained implementation           CLOSED
P7  re-adjudication                     CLOSED
P8  canonicalization / release          CLOSED

SOURCE IMPLEMENTATION                   CLOSED
SCHEMA / MIGRATION                      NOT AUTHORIZED
UI / ROUTE REPAIR                       NOT AUTHORIZED
DEPLOYMENT                              NOT AUTHORIZED
PRODUCTION                              UNTOUCHED
```

## 7 · Next exact act

P3 may now compare candidate repair architectures against RC-1 through RC-8 and XC-1.

P3 must choose **authority-bearing seams**, not a collection of convenience edits.
For each candidate it must state:

- contract(s) discharged;
- exact authority boundary;
- bypasses eliminated;
- data/schema implications;
- rollback/containment posture;
- non-regression obligations;
- why a smaller boundary is insufficient;
- why a larger boundary is unnecessary.

P3 stops before source mutation. Any implementation still requires P4 falsification and a separate P5 founder grant.

## 8 · P2 closure evidence

RC-2's caller-classification prerequisite is discharged by:

`docs/programme/SPM-F5_REPAIR_P2_RC2_CALLER_CENSUS_2026-09-17.md`

That census distinguishes server-resolved source wording, current-member-turn wording, caller-carried/unproven wording, and gesture-only paths across every located live non-test Keep minting family.

Mechanical contract accounting also confirms:

```text
local FAIL laws expected    25
local FAIL laws covered     25
duplicate assignments        0
missing assignments          0
repair contracts             8
imported companion           1
I-19 repair contracts        0
```

P2 is therefore closed as a contract-design gate. This does not confer P3 selection or implementation authority.
