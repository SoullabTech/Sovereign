# The Provenance Constitution — S5 — 2026-07-18

**Status**: CANON-CANDIDATE. Commissioned by Kelly at the closure of incident
SANC-20260614-01: *"Stop feature development. Design provenance as if it were a
constitutional substrate for every future platform running on AIN OS."* This paper is
the constitutional layer; the engineering charter it governs is
`SANCTUARY_REPAIR_SEQUENCE_AND_ENFORCEMENT_DESIGN_2026-07-17.md` Part 4. Nothing here
authorizes implementation; ratification is Kelly's.

**Mission**: Make every durable object able to prove what governed its creation and
whether it was permitted to persist.

---

## 1. The seven questions

Every durable object in the system must eventually be able to answer:

```text
Who created me?          — authorship
What generated me?       — mechanism
What posture governed me? — the consent conditions in force at my creation
May I persist?           — persistence permission
May I become collective? — collective eligibility
May I be restored?       — restoration permission
May I be forgotten?      — deletion guarantee
```

An object that cannot answer these questions is not neutral — it is a liability. The
June 14 incident was, precisely, a set of objects that could not answer the third
question, written by a system that never asked it, discovered only because a separate
metadata lane happened to remember. The constitution exists so that discovery is never
again the mechanism of enforcement.

## 2. Constitutional ground (ratified sentences)

1. *Sanctuary is not a session property. Sanctuary is a per-turn posture.*
2. *No durable object may be written without knowing what governed its creation.*
3. *Deletion is not complete if restoration can silently resurrect what sovereignty
   required the system to forget.*
4. *The system can only reflect safely if it first knows exactly what it is allowed
   to remember.*

And from the reflection rulings, which this substrate exists to serve:
*Member-authored meaning may enter continuity directly. System-generated meaning must
pass through recognition.* (R13) — provenance is what makes that distinction
mechanical rather than aspirational.

## 3. The provenance shape

A candidate typed shape, uniform across object kinds (design target, not a migration):

```ts
type Provenance = {
  createdBy: 'member' | 'maia' | 'practitioner' | 'system' | 'import' | 'migration';
  generatedBy: 'member-gesture' | 'member-utterance' | 'inference' | 'synthesis'
             | 'derivation' | 'unattributed-historical';
  postureAtCreation: 'normal' | 'sanctuary' | 'unknown-historical';
  sourceContainer: string;          // personal | practice-field:<id> | co-lab:<id> | …
  source:                            // no "came from nowhere" state (ruling R14)
    | { type: 'turn'; turnId: string; sessionId: string }
    | { type: 'member_gesture'; gestureId: string }
    | { type: 'member_import'; provenanceId: string }
    | { type: 'derivation'; parentIds: string[] }
    | { type: 'migration'; migrationId: string }
    | { type: 'unattributed'; reason: string };   // historical only; never minted anew
  persistencePolicy: {
    durable: boolean;
    collectiveEligible: boolean;    // Stage-2 act only (Doc C); default false
    restorable: boolean;            // false ⇒ tombstoned on deletion
  };
};
```

Three properties are constitutional, not stylistic:

- **Immutability**: provenance is written once, at creation, by the server. Nothing
  edits it after the fact; correction means a new object with `derivation` lineage.
- **Server authority**: every field is resolved server-side. The TurnPosture pattern
  (nominal class, private constructor, fail-closed on absence) generalizes: a client
  can *express* intent; only the server *resolves* posture and mints provenance.
- **Fail-closed**: a write path that cannot mint complete provenance may not produce
  a durable object. This is the store-boundary discipline (S1) made universal.

## 4. The enforcement stack

```text
Per-turn posture              (resolved once per request; the June correction)
        ↓
Server-authoritative provenance   (runtime_consent_state; minted, not asserted)
        ↓
Derived persistence policy    (policy computed FROM provenance, never alongside it)
        ↓
Store-boundary enforcement    (stores demand provenance; refuse without it)
        ↓
Restorable deletion guarantees (manifests/tombstones; restore filtering; R20)
```

Each layer assumes the one above it and none below it. The stack's property worth
naming: **no layer trusts a caller.** Caller convention is how June happened.

## 5. Provenance map — every durable object, current state → S5 target

Source-verified against the live schema during the 2026-07-17 audits.

| Object | Answers today (verified) | Missing | S5 target |
|---|---|---|---|
| **Conversation turns** | who (user_id), source (session_id) | posture, typed source, restore policy | `postureAtCreation` per turn; the incident's lane, first priority |
| **Session history jsonb** (`maia_sessions.conversation_history`) | timestamps only | everything else; a shadow content lane | **Classified constitutional debt** (Kelly, 2026-07-18): temporary compatibility layer → eventual retirement. Not removed immediately; no new consumers; retired when the turns lane covers its remaining readers. Ruling candidate RC3: *duplicate content lanes constitute constitutional debt.* |
| **Episodic marks** | **exemplary**: `marked_by_member`, byte-exact verbatim, `source_turn_id`/`source_session_id`, interpretive columns NULL; server-side sanctuary guard (PR #625) | posture recorded explicitly (currently inferred by guard) | the model the rest of the system converges toward |
| **Memory atoms** | `provenance` jsonb, `facilitator_id`, `epistemological_status` (observed…claimed), `member_response_status` (confirmed/rejected/modified) | **no session linkage at all** (permanently unattributable historically), no posture, untyped source | typed `source` union; posture; the historical corpus becomes `unattributed` explicitly (§7) |
| **Quotes (candidates)** | writes nothing — proposes only | n/a while stateless | if a kept-quote object ever exists, it is born under this constitution |
| **Theme signals** | member_id, session_id, detected_at | posture (caller-gated only), authorship truth (system-inferred posing ambiently), ratification state, deletion path | `generatedBy: inference` + candidate status structural (register R4); member-visible; per-signal deletion |
| **Summaries** | boundary-guarded at write (suppress-if-sanctuary) | recorded posture; typed source | inherits turn/session provenance |
| **Anchors** | member-authored response, `surface_preference` consent triad | typed source; posture | light lift — the consent grammar is already correct |
| **Chapters (conversations)** | unbuilt | — | **born under this constitution** — chapters never exist without full provenance; this is the advantage of having frozen them |
| **Reflections (gold)** | designed but unbuilt; Doc A already specifies observation ≠ interpretation ≠ recognition, evidence refs, memberResponse, provenance block | — | the first object *designed* provenance-first; its build waits for this substrate (ratified freeze) |
| **Corpus callosum logs** | session/turn/user ids; posture-guarded at write (S1) | recorded posture on row; retention policy | posture column or retention rethink — telemetry holding content deserves its own ruling |
| **Spiral state** | metadata-only by design | — | document as metadata-class; no content, light provenance |
| **Collective contributions** | do not exist | — | exist only as Stage-2 offered objects (Doc C); `collectiveEligible` flows from a member act, never from classification |

## 6. Restoration guarantees (R20 made real)

Deletion that restoration can undo is not deletion — it is deferral. S5 must
establish:

1. **Deletion manifests**: every sovereignty-driven deletion (incident remediation,
   member deletion, sanctuary purge) writes a content-free manifest — object ids,
   lanes, time ranges, reason class — the incident's audit record generalized into a
   first-class object.
2. **Tombstones**: ids of forgotten objects persist as refusal markers so a restore
   can recognize what it must not resurrect.
3. **Restore filtering**: the restore path (currently a raw `pg_restore`) becomes a
   governed operation that consumes manifests and drops tombstoned rows. Until this
   exists, every restore is a constitutional event requiring founder presence.
4. **Protected backup classes**: whether some material (Sanctuary metadata aside —
   there is nothing; that is the point) warrants backup exclusion classes at dump
   time, so certain promises never depend on restore-side filtering at all.

## 7. Historical objects with unknown provenance

The existing corpus predates this constitution. The honest treatment:

- Historical objects receive `generatedBy: 'unattributed-historical'` /
  `postureAtCreation: 'unknown-historical'` **explicitly** — never a silently
  backfilled "normal." Unknown is a truthful answer; fabricated certainty is not.
  Formalized (Kelly, 2026-07-18, ruling candidate RC1): **Unknown provenance is
  itself provenance.**
- Unattributed objects are **permanently ineligible for collective use** and for any
  future surface that requires posture proof. They may continue serving the member
  they belong to (their continuity should not be punished for the system's past),
  visible to that member as their own material.
- No mass reclassification. If a member ratifies an unattributed object through a
  gesture (keep, mark, response), the *gesture* mints new, real provenance going
  forward.

## 8. Forgery prevention and observability

- Posture and provenance resolve from `runtime_consent_state` (turn-scoped,
  content-free, written at request start) — the S5 flip from `resolvedBy:
  'request_flag'` to server record. Background and queued writers resolve from the
  record, not from arguments handed down a call chain.
- Nominal types with private constructors remain the in-process forgery barrier;
  `instanceof` failure remains fail-closed.
- Observability stays metadata-only: refusal markers (`[SANCTUARY] write refused`,
  `[ORACLE-LANE] refused`, and S5's `[PROVENANCE] mint failed`) carry store names and
  id prefixes, never content. The constitutional test suite (refusal registry) grows
  one check per enforcement point; R20 converts from Proposed to demonstrated when
  restore filtering ships.

## 9. Why this is AIN OS substrate, not a MAIA feature

Any future platform running on AIN OS — practitioner fields, Now What?, third-party
authored environments — inherits the same question set. A field author never gets to
decide *whether* objects carry provenance; they decide only what their field's
objects mean. That is the differentiator Kelly named: most platforms bolt consent
onto memory; AIN OS makes memory impossible without consent's paper trail. For
Larry's register, one sentence: **we discovered that trust must come before
intelligence** — provenance is what that discovery looks like as architecture.

## 10. Design test

For any proposed durable write, ask in order:
1. Can it answer the seven questions at creation time, server-side?
2. Does its persistence policy *derive* from those answers (not sit beside them)?
3. Does the store refuse when the answers are missing?
4. Does its deletion leave a manifest a restore must obey?
If any answer is no, the write does not ship. This generalizes the sovereignty
invariant check in CLAUDE.md to the storage layer.

## 11. Stop

This paper + the object map end the constitutional phase of S5. Implementation
sequencing stays in the repair-sequence doc (S4/S5/S6). Ratification, and the
decision of whether this text moves to `docs/canon/`, are Kelly's.
