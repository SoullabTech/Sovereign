# JARVIS-MAIA-STANDING-SHADOW-01 — S1–S3 Proof

**Parent:** `204f2f351`
**Mode:** offline / production-shaped R&D
**Production mutations:** NONE

## S1 — StandingProjection

The projection is derived from a frozen Writer's Studio `CanonicalTurn` and does not accept model-authored standing metadata.

For each admitted non-floor participant it carries:

- deterministic evidence id derived from producer id + block digest;
- `producerId`;
- `authoredBy`;
- `participationClass`;
- `authority`;
- exact participant text;
- manifest-verified block digest;
- `claimStanding = unavailable / not_carried_by_canonical_turn`.

That last line is a deliberate honesty boundary. `CanonicalTurn` currently proves source standing, not present-tense claim succession. The projection will not infer current/superseded standing from chronology or wording.

### Refusal laws

The projection refuses:

- an unfrozen turn;
- a non-Writer's-Studio room;
- duplicate admitted producer ids;
- a producer marked `partitionPending`;
- a participant whose axes disagree with `PRODUCER_REGISTRY`;
- a participant whose axes or block digest disagree with the turn manifest;
- a renderer participant that has no admitted participant row.

The room-wide registry currently includes two `partitionPending` Writer's Studio producers (`member.episodic_recall`, `retrieved.conversational_recall`). Both are explicitly refused.

The live Focus crossing itself uses only `member.writer_focus` and `retrieved.writer_work_context`, neither partition-pending.

## S2 — Same-turn shadow contract

`buildStandingShadowComparison()` constructs both conditions from the **same frozen CanonicalTurn**.

Preflight requires:

1. same participant order;
2. same exact participant texts;
3. same constitutional floor blocks;
4. every admitted participant present in the current prompt;
5. every admitted participant present in the shadow prompt.

The shadow condition differs only in organization and output contract:

- source-standing axes are rendered explicitly;
- claim-standing absence is explicit;
- the model returns a bounded plan (`synthesis + support ids + optional question`);
- deterministic Structural Standing renders the final research response.

No provider, database, telemetry, persistence, or serving seam is imported into the projection/harness.

## S3 — adversarial corpus

Six synthetic editorial fixtures are constructed through the real `constructEditorialWriterTurn()` boundary:

1. correction;
2. partial adoption;
3. developmental reversal;
4. long-distance motif recurrence;
5. unresolved contradiction;
6. MAIA-was-wrong.

Each uses the existing four-way editorial authorship partition:

- member-authored locus;
- member-authored history;
- system-authored history;
- current member-declared act.

## Mechanical witness

`standing-shadow-proof.test.ts` executed against the current branch:

```text
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

The fifth test built all six fixture comparisons from real frozen canonical editorial turns and proved the expected member/member/system/member authorship sequence.

The full prompt-bearing fixture packet is local-only (`/tmp`, mode 0600) and is not an artifact proposed for commit.

## Standing

S0 live seam trace                ✅
S1 StandingProjection             ✅ mechanical proof
S2 same-turn shadow contract      ✅ mechanical proof
S3 six adversarial fixtures       ✅ canonical construction proof
S4 local-model comparison         OPEN / evidence not yet admitted
S5 human blind adjudication       UNSPENT
S6 production-shadow proposal     UNOPENED

## S1 correction after first S4 instrument pass — present utterance is evidence outside participation

The first S4 schema pass exposed that MIPA participants are not the whole turn evidence field. The editorial contract intentionally keeps the current writer's words out of history; they live at `CanonicalTurn.encounter.input` and the canonical-turn spec classifies current input as `member_authored`.

The final StandingProjection therefore adds a distinct current-input evidence entry with:

```text
source              CanonicalTurn.encounter.input
authoredBy          member
participationClass  authored
authority           situate
claimStanding       unavailable / not carried by CanonicalTurn
```

Its evidence id is derived from turn id + input digest. Its text is **not** duplicated into the shadow system prompt: the model receives the exact words once as the user message, while the system prompt carries the evidence id/standing metadata and states that the content is the current user message.

The same canonical proof suite was rerun after this correction: **5 / 5 PASS**. The Focus projection now contains one encounter-input evidence entry plus the two live Focus participants; each editorial adversarial projection contains one encounter-input evidence entry plus the four authorship-partitioned editorial participants.
