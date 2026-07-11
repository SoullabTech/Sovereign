# Larry Field — Spec + UI Map (before code)

**Status:** CANDIDATE build spec. 2026-07-07. Companion to [`NOW_WHAT_DEMO_JOURNEY_2026-07-07.md`](./NOW_WHAT_DEMO_JOURNEY_2026-07-07.md) (the experience) and [`NOW_WHAT_DEMO_SPEC.md`](./NOW_WHAT_DEMO_SPEC.md) (the deployed surfaces).
**Purpose:** turn the Larry-Field vision into concrete build guarantees — *not* another deck. Every surface below carries an explicit **Live / Designed / Vision** label so implementation inherits credibility only from what is actually true.

## Build discipline — three questions, three evidence standards (do not collapse)

| Question | Evidence required | Applies to |
|---|---|---|
| Does this interaction work? | **Live verification** (deployed + walked) | per-surface status labels below |
| Is this architecture coherent? | **design reasoning + implementation** | this spec, the tenant model |
| Is this the right long-term direction? | **years of practice** | the tenancy hypothesis (held as [[ain-os-field-tenancy-candidate]]) |

Sequence for anything that ships: **build → verify → experience → expand.** A surface is not "Live" until it renders in prod *and* produces the intended felt shift.

## The key implementation move

Do **not** build "Larry's app." Build a **Field tenant**:

```
Field tenant
  → composed from shared AIN capabilities
  → governed by a non-disableable constitution
  → customized by Larry's teachings / resources
```

If Larry's Field requires new *primitives* (not just new *content + configuration*), the tenancy hypothesis has weakened and we stop to reconcile — that is the falsifier, wired into the build.

## Non-negotiables (inherited, non-disableable)

Each maps to an existing invariant/refusal — these are not new promises, they are the constitution applied at tenant scope:

1. **Core constitution cannot be disabled** — consent, sovereignty, privacy, human authority are inherited, not composable (Sovereignty Invariants; [[ain-os-field-tenancy-candidate]]).
2. **Client private memory stays private** — Sanctuary + default-private; verified live (`can_be_shown_to_practitioner=false` honored, 2026-07-07).
3. **Shared resources are explicit** — per-thread member gesture, never inferred from context (ratified 2026-07-01; live in `member_field_note_threads`).
4. **Facilitators see only what clients consent to share** — consented visibility only; Co-Lab Release Gate 31/31 governs any scoped surface.
5. **Research/analytics never aggregate client patterns without opt-in** — Flourishing refuse-mode: no cross-context synthesis, no client profiling.
6. **Marketplace / shared modules trade templates, not member data** — member data never leaves a Field as a contribution unit.

**World Design principle (durable, adopted 2026-07-07):** *The world presents what people have chosen to bring into relationship. It does not narrate who they are becoming.* Every practitioner-facing surface shows **evidence** (what someone shared/chose/brought), never an **interpretation** of who they are.

## Guarantee 1 — Separate the worlds

No one sees "the same app." Each person enters from their responsibility.

| Role | Enters through | Sees | Status |
|---|---|---|---|
| Client / student | Personal Portal + **MAIA in Larry's Field** | their own developmental world; Larry present but not central | Portal + member room **Live**; Larry-Field-scoping **Live** (`field_context`); Larry-corpus-awareness **Designed** |
| Larry (practitioner) | **Pro Studio + Field Composer** | the living ecology of his work; the consent-shaped field view | Studio field view **Live** (`/studio/fields/<id>`); **Field Composer does not exist — Designed** |
| Facilitators | limited facilitator workspace | only consented shares, scoped | **Designed** (distinct facilitator role not yet built; consent primitive Live) |

## Guarantee 2 — MAIA field-aware, not Larry-impersonating

```
MAIA Core
  + AIN Constitution
  + Larry Field Context
  + Student's private memory
  + Explicitly shared Larry resources
```

**Guardrail (hard):** MAIA may serve Larry's teachings; it must **never pretend to be Larry**, and must **never read the member *through* Larry's developmental map** (offer practices as options; point back to Larry — never classify: "you're at stage 3 of Larry's model"). This is the apprentice-not-imitation line (Cultural Sovereignty / Invariant 14; Living Field Mirror Invariant — never synthesis).

| Capability | Status | Evidence |
|---|---|---|
| Field-scoping of member threads by `field_context` | **Live** | `member_field_note_threads.field_context` |
| Return-branch: load prior practice, open from it, no adherence-evaluation | **Live** | `RETURN_PROMPT`, `app/api/now-what/interview/route.ts`; verified 2026-07-07 |
| MAIA loading Larry's corpus/practices/language into companion context | **Designed** | mechanism not built |
| "Bring this to Larry" hand-off referral | **Designed** | — |

## Guarantee 3 — The Field Composer (Pro Studio)

Larry **composes** a world (not "toggles settings"). Console capabilities — **all Designed / Vision unless noted**:

- toggle AIN modules on/off · add practices · assign workshop journeys · upload teachings/resources · configure onboarding · invite facilitators · set permissions · publish client pathways · **test new experiences safely** (sandbox)

**Status:** the Field Composer is **not built** — it is the primary new build this spec authorizes at the *design-reasoning* standard, not a liveness claim. Its first honest increment should be the smallest composition that a real member can enter (e.g. Larry adds one practice → a member sees it in-room), so it earns Live one surface at a time.

## UI map (surfaces × role)

- **Member:** Personal Portal → MAIA-in-Field room (threshold / reflection / practice / return) → history + per-thread share gesture. *[Live]*
- **Larry:** Pro Studio home → Field view (Questions Alive · Practices · Recognitions · Shared Reflections, consent-scoped) *[Live]* → Field Composer *[Designed]* → cohort view *[Designed, gated]*.
- **Facilitator:** scoped workspace, consented shares only *[Designed]*.

## What to build first (smallest unit that proves the architecture)

Per build→verify→experience→expand, and because the demo's keystone is already Live: the highest-value *new* build is **one complete developmental journey** composed by Larry — *invitation → welcome → first MAIA conversation → reflection → one practice → resource → return to Larry.* Not larger for its own sake: a **journey is the smallest unit that exercises the whole constitution at once** — onboarding-feels-like-Larry, MAIA-belongs-in-the-world, participant-sovereign, practitioner-sees-only-consented-shares, return-feels-alive, the-whole-thing-disappears. If that loop feels natural, the *architecture* is proven — not a screen. It also proves the tenant model *by composition, not new primitives* (the falsifier). Everything larger (facilitator workspace, marketplace, multi-tenant creation) stays **Vision** until that one journey is Live *and felt*. Composition discipline: [Journey Composition Guide](./JOURNEY_COMPOSITION_GUIDE_2026-07-07.md).
