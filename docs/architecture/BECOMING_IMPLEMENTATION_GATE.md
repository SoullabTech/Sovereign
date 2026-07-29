# Becoming — implementation gate

**Status: CONCEPT RATIFIED, BUILD DEFERRED.** This document is a **proposal**, not canon.
Class: *Vision* under `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`. Becoming does not exist and must be described as aspiration in any outward use.

⚠️ Merging this document records the gate as proposed; it does not ratify it. The room stays deferred either way — a proposal cannot authorize a build.

This document exists so that "not yet" is a **recorded condition with a test**, not a vague hesitation that erodes under enthusiasm. It names what must be true before the Becoming room is built, and what is reserved in the meantime.

**Rulings this rests on:** Becoming ratified as the fourth room, *concept only not build* (2026-07-28) · *"Shared infrastructure only; no speculative Becoming implementation"* (2026-07-28 eve) · the domain object is **not** a "practice".

---

## 1. Why deferred

> *"Becoming is a synthesis surface. It becomes meaningful only after members have accumulated material they intentionally chose to carry forward. If you design the full Becoming schema now, you'll be designing around hypotheses instead of observed use."* — Kelly, 2026-07-28

Becoming's entire function is **gathering material the member chose to carry**. The gatherable inventory today:

| Source | State |
|---|---|
| Journal entries | live |
| Changes | live |
| Commitments | **does not exist** |
| Episodic marks | **6 marked rows** (2026-07-23 → 07-28) — ⚠️ **all six are the founder's**, across two member rows (`Kelly`, `Kelly Nezat`). A naive query reports "2 distinct owners"; that is misleading. Supersedes the "zero rows in production" statement carried by four architecture docs. |
| Memory atoms | live |

Built today, Becoming renders an empty room for every member — and worse, it would be designed against an imagined pattern of use rather than an observed one. The generalized discipline: **build from lived evidence outward, not from conceptual completeness.**

There is a second reason, and it is constitutional. Becoming sits closest to Recognition in `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`. A room that answers *"who am I becoming?"* is one design mistake away from the system authoring Recognition — which would reopen frozen Patterns, the parked Journey Point, and Living Field simultaneously. That risk is best carried against real member material, not hypotheses.

---

## 2. Reserved vocabulary — claimed, not built

The name is settled now **so nothing else claims it**, and so a later implementation does not relitigate naming under delivery pressure.

**Domain object: Becoming Thread.**

**Ruled 2026-07-29: storage identifiers are NOT reserved.** An earlier version of this section claimed
`member_becoming_threads`, `becoming_returns`, and `becoming_thread_links`. Those names have been
removed, along with a proposed capability slug.

Reserving storage names fixes a data model ahead of observed use — quietly performing the speculative
schema design this document exists to defer. The reservation's stated purpose (so nothing else claims
the name, so a later implementation need not relitigate under delivery pressure) is real but is served
by the **concept** being recorded, not by the table names.

> **Ratify the human concept now; defer storage names and schema shape until observed use requires them.**

If Commitments needs a generic link or return-history primitive today, it is named for **the capability
it presently serves** — not for Becoming. See `COMMITMENTS_SCHEMA_AND_LINK_CONTRACT.md` §4.3b.

**What is recorded now is the human-facing term only**, and it remains provisional:

> A **Becoming Thread** is a neutral, member-authored continuity through which a person may return to
> something they intentionally wish to carry forward. It does not define who the member is becoming,
> and it is not automatically classified by MAIA or the system.

`practice` remains refused as the domain word for the reasons in §2.1.

### 2.1 Why not "practice"

Kelly's own list of what a member might tend — grief · fatherhood · forgiveness · cancer · creativity · courage — breaks the word. **Nobody practices cancer.** Requiring the member to translate grief into cultivation vocabulary in order to record it is the Invariant 14 failure: imposing a framework and translating the member's meaning into ours.

Independently confirmed by audit: `practice` is already spent 8+ ways in-repo, all practitioner-side (`practice_sessions`, `practice_worlds`, `practice_fields`, `practice_insights`, `practice_streaks`, `rl_practices`, `founder_practice_entries`, `/api/practice/*`, `lib/practice/`, `members.studio_mode DEFAULT 'practice'`).

### 2.2 Optional member-selected kind

A thread **may** carry a member-chosen kind: `practice` · `quality` · `question` · `commitment` · `relationship` · `transition` · `direction` · `other`.

⚠️ It must be **optional, member-selected, never required, never inferred, and never used to classify the member.** It is a label the member finds useful, not a taxonomy the system applies. A thread with no kind is fully first-class.

### 2.3 Room language

**Ambient, not interrogative** (ruled 2026-07-28). *"A library doesn't force you to read. A chapel doesn't force you to pray."* The room must never repeatedly confront the member with *"Who are you becoming?"* — a question that, posed to someone in cancer treatment, demands that suffering produce growth.

General form, reusable beyond this room: **room names may be aspirational; room prompts may not be.**

Empty state: *"Becoming — a place for the things you choose to tend over time."*
Primary action: name a thread. Secondary: reflect with MAIA.

---

## 3. The gate — what must be true before building

All four must hold. Each is observable; none is a judgement call.

**G1 — Commitments is live and exercised.**
Commitments deployed, and real members (not the founder alone) have created commitments and recorded returns over a span of weeks. Becoming's first genuine link target must exist and be in use.

**G2 — Members are voluntarily connecting material.**
Members are using `member_object_links` unprompted. If nobody connects a journal entry to a commitment when offered, the premise that they want a gathering surface is unevidenced — and Becoming is that premise scaled up.

**G3 — There is something to gather.**
A meaningful population of member-authored, explicitly-marked material exists across at least two source types. Specifically: **episodic marks are no longer zero**, or an equivalent member-marked corpus has accumulated. Counting to nine requires nine things.

**G4 — Observed use has replaced assumption.**

> Observed use must reveal at least one **materially important need, behaviour, or distinction that the current design did not predict.**

⚠️ **This wording is the gate; "produced a surprise" was the first draft and is not sufficient** (founder refinement, 2026-07-28). "Surprise" is subjective and can be theatrically manufactured — a team wanting to ship can always find something to call surprising. The test is **inspectable**: the finding must have *altered the understanding* of what the room is for, not merely felt novel.

Evidence for G4 is a written statement of what was believed before, what use revealed, and what changed as a result. If nothing changed, G4 is not met — and absence of any such finding usually means nobody is really using the room yet.

**Lift condition:** G1–G4 evidenced **and** an explicit founder ruling. Evidence alone does not lift the gate; it makes the ruling possible.

---

## 4. Activation is a member act, never an inference

When Becoming is eventually built, its House doorway must be gated on a **member act**:

- ✅ The member has explicitly created or populated a Becoming Thread.
- ⛔ MAIA determined the member is "ready."
- ⛔ The member's activity pattern suggests a theme.
- ⛔ Enough material accumulated, so the room appeared.

This mirrors the Daily Anchor consent model, where eligibility originates from a member act and the deploy flag is a kill-switch only — not the consent source.

The room may exist and be enterable while empty. What may never happen is the *system* deciding a member has arrived somewhere.

---

## 5. What the Commitments work must leave ready

The only Becoming-serving work authorized now — because Commitments genuinely requires it:

1. **The provenance link primitive** (`COMMITMENTS_SCHEMA_AND_LINK_CONTRACT.md` §4, bounded by §4.3b)
   should be built no wider than Commitments requires. If it later admits a Becoming thread as another
   `from_type` with a registry entry and no schema change, that is the better outcome — but that is a
   consequence to hope for, not a requirement to design toward. ⛔ It must **not** be widened today on
   the grounds that Becoming may reuse it.
2. **Member-owned object lifecycle** — the status/timestamp/archival pattern, established once.
3. **Explicit adoption** — reuse, do not reimplement. ⚠️ These are **two separate systems** and an
   earlier version of this line merged them under one phrase:
   - **`keepSource()`** (`lib/psyche/portfolio.ts:340`) is the *adoption persistence* primitive. It
     writes the adopted row and enforces source guards (hard reject of `practitioner_observation`).
   - **`lib/psyche/keep-governor.ts`** is *offer governance* — whether and how MAIA may offer Keep
     again (pause posture, decline streaks). It **never writes adopted content** and must not be cited
     as though it does.
4. **Neutral return history** — returns as an append-only member-authored record with arithmetic counts and no derived vocabulary.

**Test for anything proposed as "shared":** *does Commitments need this to ship?* If no, it is speculative Becoming work and is out of scope regardless of how reusable it looks.

---

## 6. Explicitly NOT authorized

- Any Becoming thread migration, table, or model — under any name.
- Any Becoming API route.
- Any Becoming UI, House destination, or navigation entry — including one hidden behind a flag.
- Seeding threads on a member's behalf, or suggesting threads from observed behaviour.
- Any surface that names an arc, stage, pattern, trend, or transformation.

---

## 7. The line the room exists to hold

Becoming's admissible form is narrow and worth stating plainly. The member authors the name; **the system supplies counting, recurrence, and recency only.**

✅ *"You've returned to courage nine times, most recently Tuesday."*
⛔ *"Courage has become part of who you are."*
⛔ *"Your relationship with boundaries has shifted."*

The second and third are the system authoring Recognition in the member's own life — the one thing the House exists to refuse.

> **MAIA may open doors. It may not describe what is on the other side of one in the member's own life.**

⚠️ **Citation repaired 2026-07-29.** This line was previously attributed to `THE_HOUSE.md`. **No such
file exists at canonical HEAD** — the same failure already recorded in `CLAUDE.md` for
`WISDOM_IS_RECOVERED.md`, where a spec rested on a canon file absent from the repo. The citation failure
does not invalidate the principle; it invalidates the claimed provenance.

The principle stands on the founder ruling record (2026-07-28, recorded as a candidate principle) and on
`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`, which it specialises. For the **executable** House contract
— what doorways exist and how they are declared — cite `lib/navigation/houseDestinations.ts`
(`HOUSE_DESTINATIONS`, :103), rendered by `components/maia/MaiaHouseSheet.tsx:119` and guarded by
`lib/navigation/__tests__/houseNavDrift.test.ts`. No replacement constitutional file has been invented.

---

## 8. Review

Revisit when Commitments has been in real member use long enough for G1–G4 to be answered with evidence rather than estimate. Re-evaluating earlier is not forbidden — but the answer must come from usage data, not from the room feeling overdue.
