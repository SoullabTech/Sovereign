# MAIA-MAVEN-T1A — J5 SPEECH-ACT RECOGNITION CONTRACT

**Status:** BOUNDED IMPLEMENTATION CONTRACT  
**Date:** 2026-09-17  
**Authority:** J5 remediation after decisive falsification  
**Scope:** recognition + truthful facilitation only  
**Excluded:** CONTINUE persistence substrate · personal-Keep READ route · capability registry · schema · migration · `/maia` redesign · merge · deploy

## 1. The defect this contract repairs

Canonical `detectKeepIntent()` exposes only `keep_material | open_keep`. Measured against the ratified four-act contract, ordinary CONTINUE language such as `keep this open` is therefore absorbed into KEEP before availability is consulted.

The repair must change what the system **understands**, not silently change what it is capable of executing.

> **Member meaning precedes capability availability.**
>
> Availability may affect execution. Availability may not redefine the member's act.

## 2. Recognition vocabulary

The deterministic recognition seam owns only the local member-language distinctions required to keep governed acts apart.

### Recognized acts

- **KEEP** — member asks for present material to enter the member-controlled persistence flow.
- **CONTINUE** — member asks to leave / return to a thread as continuity. It is not persistence of selected material.
- **OPEN_KEEP** — member asks to open the Keep interface. This is an interface act, not itself a Keep.

### Resolution states

- **RESOLVED** — one or more governed acts are deterministically recognized.
- **AMBIGUOUS** — a governed act is implicated but the recognizer cannot determine which without choosing for the member.
- **ORDINARY** — no governed persistence/continuity act is recognized.

AMBIGUOUS and ORDINARY are not aliases. Ambiguity requires clarification; ordinary speech simply remains conversation.

## 3. Multi-act law

Recognition must be capable of returning **more than one act from one utterance**.

`Keep this and leave it open.` means:

```text
KEEP + CONTINUE
```

Neither act may erase the other. A one-field winner-takes-all enum is therefore insufficient as the authoritative representation of member meaning.

The result must preserve an ordered, deduplicated set of recognized acts and the matched language supporting each act.

## 4. Deterministic minimum cases

| Utterance | Required recognition |
|---|---|
| `keep this` | KEEP |
| `can we keep this?` | KEEP |
| `open Keep` | OPEN_KEEP |
| `keep this open` | CONTINUE |
| `keep this question open` | CONTINUE |
| `can we keep this question open?` | CONTINUE |
| `keep that open` | CONTINUE |
| `leave this open` | CONTINUE |
| `come back to this` | CONTINUE |
| `Keep this and leave it open` | KEEP + CONTINUE |
| `keep this door open` | ORDINARY |
| `keep this in mind` | ORDINARY |
| `keep going` | ORDINARY |

The governed CONTINUE class is not implemented as an expanding false-friend blacklist around KEEP. Positive recognition of CONTINUE must occur before bare `keep this` can absorb it.

## 5. Exact distinction from ordinary continuation

CONTINUE in this contract means **thread continuity across a leaving / returning boundary**. It does not mean every request to continue the present encounter.

Thus ordinary phrases such as `keep talking`, `keep going`, and `I want to keep working on this feeling` remain ordinary conversation unless they also contain an explicit governed continuity act.

## 6. Recognition ≠ execution

Recognition is pure and side-effect free.

- KEEP recognition may surface the existing member-controlled Keep doorway.
- OPEN_KEEP may open the existing zero-persistence Keep surface.
- CONTINUE recognition **must not** surface Keep, open Keep, persist material, or fabricate a continuation record.
- If no CONTINUE substrate is available, the system preserves the understood act and truthfully withholds execution.

> **Understand-and-withhold, never reinterpret-and-execute.**

## 7. Non-consuming law

The existing recognition seam runs after MAIA's conversational reply specifically so recognition does not consume the member's utterance.

That property remains mandatory. No CONTINUE rule may be moved into a path that returns early and silences MAIA.

## 8. MAIA's language contract

The platform knowledge supplied to MAIA must explicitly teach:

- `keep this` / `save this as a Keep` = KEEP;
- `keep this open` / `leave this open` / `come back to this` = CONTINUE, **not KEEP**;
- CONTINUE does not authorize a Keep;
- CONTINUE must not be claimed as established unless a continuation substrate confirms it;
- KEEP must not be claimed as completed unless its separate member-controlled substrate confirms it.

This is necessary because deterministic UI recognition happens after the reply; MAIA must not be left with a prompt that teaches only the KEEP half of the distinction.

## 9. `lib/library/keepIntent.ts` is out of scope

The Personal Wisdom Library `MemberIntentVerb = 'keep'` governs conversion of an already-established Keep act into a governed persistence object. It is not the conversational phrase resolver.

This lane must not widen that schema-level type merely to solve a recognition defect upstream.

## 10. Falsifiers

The repair fails if any of these occur:

1. `keep this open` still yields KEEP.
2. a CONTINUE phrase becomes `null` merely because the platform cannot execute CONTINUE.
3. `Keep this and leave it open` loses either act.
4. ordinary language such as `keep this door open` gains a governed act.
5. CONTINUE surfaces or opens the Keep UI.
6. recognition consumes the turn or prevents MAIA from replying.
7. the recognizer performs I/O or persistence.
8. MAIA's platform contract still teaches CONTINUE-shaped language as a Keep doorway.

## 11. Stop boundary

This contract authorizes the smallest code/test/prompt repair needed to satisfy the falsifiers above. It does **not** authorize a CONTINUE persistence implementation.

After implementation, rerun the failed J5 controls and stop for adjudication. J6 remains closed.
