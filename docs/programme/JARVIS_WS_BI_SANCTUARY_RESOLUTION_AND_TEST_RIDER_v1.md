# JARVIS — WRITER'S STUDIO FLAGSHIP FLOW 01
# B-I Sanctuary Resolution + Test Rider v1

Programme: `JARVIS-WRITERS-STUDIO-FLAGSHIP-FLOW-01`
Lane: `OBSERVATION-ADDRESS-01 / B-I`

Status: GOVERNING CLARIFICATION FOR THE AUTHORIZED B-I LAW MATRIX  
This does not authorize runtime persistence, schema, migration, merge, or deployment.

---

# I. Prerequisite 2 — Sanctuary Standing

The prerequisite is **RESOLVED BY EXISTING CONSTITUTIONAL LAW**.

The governing Sanctuary invariant already states:

> Sanctuary content is never stored, indexed, or converted into long-term memory under any circumstances, including by user request during the session.

Existing named guards reinforce the same boundary:

- `shouldPersistKeep(isSanctuary)` → false in Sanctuary;
- `shouldPersistTurn(isSanctuary)` → false in Sanctuary;
- `contentWritable(TurnPosture, ...)` → refuses Sanctuary writes;
- unresolved / forged posture fails closed at protected store boundaries.

Therefore:

> **A durable Writer's Studio member observation MUST NOT be persisted from a Sanctuary turn/session.**

The member's authorship does not override Sanctuary.

Explicit member request during Sanctuary does not override Sanctuary.

This is not a new product policy.

It is application of the existing Sanctuary persistence constitution to a new durable object class.

---

# II. Product Semantics

Outside Sanctuary:

```text
member marks passage
→ chooses noticed / question / possibility
→ confirms Keep with this passage
→ durable member observation may be written
```

Inside Sanctuary:

```text
member marks passage
→ may compose / explore ephemerally
→ persistence boundary refuses durable write
```

The UI must not claim:
> Saved with this passage

when Sanctuary blocks persistence.

A lawful member-facing outcome may be:

> **This stays in this Sanctuary session and will not be saved.**

Exact copy belongs to the Language Canon / later UI act.

B-I concerns the law, not final copy.

---

# III. Persistence Class Under Sanctuary

A member observation has two possible runtime postures:

## Standard posture
May transition:

```text
EPHEMERAL DRAFT
→ member confirmation
→ DURABLE MEMBER OBSERVATION
```

## Sanctuary posture
May remain:

```text
EPHEMERAL ONLY
```

It may **not** transition to DURABLE.

No "save anyway" exception exists in Sanctuary.

---

# IV. Store-Boundary Requirement

The eventual persistence implementation must not depend only on the UI hiding a button.

The write boundary must enforce Sanctuary.

Preferred constitutional pattern:

```text
resolved TurnPosture
        ↓
contentWritable(...)
        ↓
member-observation write
```

or another existing equivalent store-boundary mechanism.

Requirements:

- Sanctuary → refuse write;
- missing/unresolvable posture → fail closed where the persistence boundary requires posture;
- refusal writes zero member-observation content rows;
- refusal logs/telemetry must not contain manuscript/observation content;
- ordinary non-Sanctuary writes remain possible after explicit member confirmation.

The exact wiring is an implementation question for the later act.

---

# V. B-I Falsifiers to Add

Add these to the member-place / observation law matrix.

## MA-S1 — Sanctuary explicit-save refusal

Given:
- exact Work;
- exact passage;
- member-authored observation;
- member explicitly chooses `Keep with this passage`;
- current TurnPosture = Sanctuary.

Expected:
> durable persistence REFUSED.

Must prove:
- zero durable observation object is created;
- historical/durable address is not minted as though saved;
- UI/runtime result does not report saved.

Defeat candidate:
> member confirmation overrides Sanctuary and persists.

Must die.

---

## MA-S2 — UI hiding is insufficient

Given a Sanctuary posture, direct invocation of the persistence boundary must still refuse.

Defeat candidate:
> server/store writes successfully because only the client normally hides the action.

Must die.

---

## MA-S3 — Missing posture fail-closed

Where the durable member-observation store requires a resolved posture:

Given:
- no valid `TurnPosture`.

Expected:
> write refused.

Defeat candidate:
> absence of posture defaults to ordinary persistence.

Must die.

---

## MA-S4 — Standard explicit persistence

Given:
- standard posture;
- correct member;
- correct Work;
- lawful address;
- explicit member confirmation.

Expected:
> persistence permitted by Sanctuary law.

This does not bypass the other member-observation guards.

---

## MA-S5 — No content in refusal evidence

Sanctuary refusal instrumentation may carry:
- store/action name;
- opaque or truncated non-content identifiers where existing privacy law permits;
- refusal category.

It must not emit:
- member observation text;
- manuscript passage;
- full member id in logs where privacy helpers are required.

---

# VI. Important Boundary: Existing Keep Routes

The presence of a current route that does not visibly call a Sanctuary guard does **not** change the constitutional ruling above.

B-I should not expand into a general Keep repair.

If CC discovers an existing production path that can persist manuscript/member content during Sanctuary without another upstream/store guard:

> record it as a **separate Sanctuary boundary finding** and STOP before opportunistically repairing it in B-I.

B-I's job is to write the future member-observation law, not silently widen scope into unrelated persistence repair.

---

# VII. A0 Unknown Update

A0 item:

> `Sanctuary × member-observation write — UNK`

may now be refined to:

```text
POLICY / CONSTITUTIONAL LAW   RESOLVED
  durable member observation MUST NOT persist in Sanctuary

EXACT FUTURE WIRING          NOT IMPLEMENTED
RUNTIME WITNESS              NOT YET POSSIBLE
```

This is not E2 implementation.

It is law suitable for the B-I E1 matrix.

---

# VIII. B-I Prerequisite Standing

Based on the reported prerequisite work:

```text
1. EvidenceRef.sectionId namespace     RESOLVED
2. Sanctuary persistence law           RESOLVED
3. stale-Apply committed assertions    RESOLVED
```

Therefore B-I does **not** need to STOP on its prerequisite gate, provided CC's exact source record supports items 1 and 3 as reported.

It may proceed to author:

- member-place v1 contract;
- MA-F1…MA-F8;
- MA-D1…MA-D8;
- MA-S1…MA-S5;
- discriminating reference population;
- defeat population.

No persistence implementation follows automatically.

---

# IX. Evidence Footer

The resulting B-I matrix must end with:

```text
GREEN LAW · MEMBER-OBSERVATION PERSISTENCE NOT YET IMPLEMENTED

Sanctuary law:
  durable observation persistence forbidden in Sanctuary

This proves:
  the future contract is discriminating

This does not prove:
  a member-observation table exists
  a write path exists
  Sanctuary runtime refusal is wired
  cross-session retrieval exists
```

---

# X. Governing Principle

> **Sanctuary protects the member from persistence itself, not merely from persistence they did not ask for.**

And:

> **Authorship gives the member authority over the Work. Sanctuary gives the member a stronger temporary boundary: nothing durable leaves the session.**
