# WRITERS-STUDIO-NEXT-01 / A2-5R1
## CHILD SCOPE IDENTITY RECONCILIATION + SUCCESSOR CONTRACT

**Date:** 2026-09-25
**Class:** successor contract only
**Parent candidate:** f7174cecbf483f9a81ee10c3d8d0e403925a11ce
**Packet:** 3007745057c1d367a482f5fc91e69c20c8e0ebe6d40aa250340ea30009ad4bb6 · 8,319 bytes · 214 lines
**Runtime / schema / UI / deployment:** NONE

## I. Disposition

A2-5R1 resolves the scope blocker by rejecting one universal A2 scope axis.

> **A2 relationship frame, child subject, and manuscript locus scope are distinct concepts.**

No child may be coerced into another layer merely to fit a common enum.
## II. Three-layer vocabulary

### A. Relationship frame
The member-facing editorial frame described by A0/E2.

Examples named by A0:
- Whole Work;
- chapter;
- passage;
- sentence.

A relationship frame belongs to orchestration/presentation unless a child seam separately proves execution.

It grants no disclosure, cognition, reread, comparison, mutation, memory or provider authority.

Vocabulary alone never makes a frame executable.
### B. Child subject
The exact epistemic object the child seam addresses.

Current A2 child subjects:
- EDITORIAL_LOCUS;
- REVIEW_FINDING.

The child subject is carried by child kind + native child identity.

For Review, that is readingId + observationKey.
For Editorial, that is the exact thread + proposal-chain locus.

A child subject does not automatically define the relationship frame.
### C. Manuscript locus scope
A child-local classification used only where a child itself has one bounded manuscript locus.

Current Editorial values:
- section;
- passage.

Review Discuss has no manuscript locus scope in A2 parent custody.
Its subject is a finding, and its historical evidence may span several manuscript regions.

The evidence set remains authoritative in Review child custody.
## III. Review Discuss ruling

Review Discuss is finding-scoped.

Its A2 subject is:
- child kind REVIEW_DISCUSS / conceptual subject REVIEW_FINDING;
- readingId;
- observationKey.

A2 may not coerce a finding into passage or section.

A developmental reading's whole / section / unit / range commissioning scope is reading provenance, not an automatic A2 relationship frame.

A unit is not automatically a chapter.
A whole reading is not automatically a whole-Work conversation.
A multi-section evidence set is not reduced to one section label.
## IV. Editorial ruling

New proposal chains require one durable server-authored discriminator beside the frozen locus:

locus_scope_kind = section | passage

Custody locus:
- proposal_chains.

Why proposal_chains:
- it already owns draft id, base version, target section and expected text;
- the discriminator classifies that immutable locus;
- ask_threads references the chain rather than owning locus identity itself.

The client never supplies this discriminator as authority.
Section-open behavior:
- server mints locus_scope_kind = section.

Selection-open behavior:
- server mints locus_scope_kind = passage.

A selection spanning the entire body remains passage.

Expected-text equality, text length, route reconstruction, timestamps and current UI state may never reclassify it later.

The discriminator is immutable after chain open.
## V. Historical Editorial standing

Existing proposal chains predate this discriminator.

Their successor standing is:
- locus_scope_kind = NULL;
- classification = UNMEASURED;
- existing Editorial semantics remain lawful;
- existing threads remain readable and usable under their current child law;
- they are not A2 manuscript-scope-admittable.

No heuristic backfill is authorized.

If a future act wants historical A2 admission, it must establish a separately governed evidence basis rather than infer it here.
## VI. A2-1 successor law

A2-1's generic semantic-scope field is superseded as a universal child property.

The surviving laws are:
- relationship continuity may span heterogeneous child subjects;
- child-native identity remains immutable;
- parent continuity does not widen child authority;
- scope/frame truth may never outrun what was actually constituted.

New distinction:
- relationship frame belongs to parent orchestration;
- child subject belongs to child identity;
- manuscript locus scope belongs only to children for which that classification is real and durable.
## VII. A2-3 / A2-4 schema successor law

A2-4 columns requested_scope and executed_scope are no longer allowed to mean universal episode scope.

A2-5R2 should succeed them as manuscript-locus-scope columns.

Preferred migration shape:
1. rename requested_scope to manuscript_scope_requested;
2. rename executed_scope to manuscript_scope_executed;
3. drop NOT NULL on both;
4. replace global scope CHECKs with child-specific scope law;
5. add nullable proposal_chains.locus_scope_kind with CHECK section|passage;
6. leave all historical proposal-chain values NULL;
7. no backfill.
Child-specific episode law after succession:

EDITORIAL_TURN:
- manuscript_scope_requested IS NOT NULL;
- manuscript_scope_executed IS NOT NULL;
- values are section|passage;
- requested = executed;
- value must equal the proposal chain's durable locus_scope_kind;
- proposal-chain discriminator must be non-null.

REVIEW_DISCUSS:
- manuscript_scope_requested IS NULL;
- manuscript_scope_executed IS NULL;
- subject remains readingId + observationKey;
- evidence remains child-authoritative.
## VIII. Migration fail-closed law

The successor migration does not fabricate history.

If persistent A2 episode rows already exist that cannot satisfy the successor semantics without reinterpretation, the migration must STOP rather than rewrite them.

A2-4 currently has no live member-facing caller, so no production A2 episode population is claimed.

A2-5R2 must still witness the actual target database state before applying schema succession.
## IX. A0/E2 interpretation

One conversation, many scopes means the relationship can stay continuous while the writer moves among different frames and different lawful child subjects.

It does not require all child acts to share one scope enum.

Examples:
- an Editorial locus may be passage-scoped;
- a Review act may address a finding with multi-section evidence;
- a future chapter act may use a chapter-capable child seam;
- a future whole-Work act may use a whole-Work-capable seam.

The parent relationship is the continuity object. The child remains the authority object for its own act.
## X. Suite-first witness

Collapsed one-scope reference:
- 0/18;
- exit 1;
- strict typecheck PASS.

Lawful successor reference:
- 18/18 GREEN;
- 18/18 named defeat candidates DEAD;
- strict typecheck PASS.

The falsifiers kill:
- Review coercion;
- reading-scope auto-mapping;
- evidence-set collapse;
- expected-text scope inference;
- full-body passage reclassification;
- client-authored scope authority;
- mutable discriminator;
- heuristic historical backfill;
- historical unmeasured A2 admission;
- relationship-frame authority widening.
## XI. Instrument identities

- model.ts — c659a9b17b09048fa25360f75b54bddfa50cd3fe036bda1d6ea63e9a7b6e6806
- laws.ts — 9b8a8f73073027ed2a3eb74a79f2b6f9ddc629f0525b033b83b1de2a8f611946
- contract.ts — 11e7c46caf3ef8f277d047cae54823827932794728d75c56d94ce5cfe6bbf4e9
- candidates.ts — 5d047f7bc52c47592503722f0abde31e13faa457e7b3899e4f5e8391cc0a96a1
- matrix.ts — 20adc084bab95b88af6befddc98c9a4ee73a3c6a75b565fbe8d9740ecdc70f12
- red.ts — 613b5c1d72fc125dc15a73387c544ddb37de35fec5d0a3085de0f71732a2ece3
- tsconfig — eeb21d644359cc5157fa86b3356a4713acf1f46b0888bbc08a75d491b7fb1ba7
## XII. Exact next boundary

> **WRITERS-STUDIO-NEXT-01 / A2-5R2 — SCOPE IDENTITY SCHEMA SUCCESSION + EDITORIAL DISCRIMINATOR IMPLEMENTATION ONLY**

A2-5R2 should implement only:
- proposal-chain locus_scope_kind;
- server-authored section/passsage minting at the two Editorial open seams;
- historical NULL preservation;
- A2 episode scope-column succession;
- child-specific Review/Editorial scope checks;
- store/witness succession required by those schema changes.

No live relationshipId carriage yet.
No Focus.
No UI.

## XIII. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-5R1 CHILD SCOPE IDENTITY RECONCILIATION + SUCCESSOR CONTRACT**

A2-5R1 STOPS BEFORE SCHEMA OR RUNTIME.
