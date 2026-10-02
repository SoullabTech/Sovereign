# JARVIS-FOUNDER-WORKSPACE-01 / F1 — `programme-state.v1` Projection Contract (CANDIDATE)

**Authorized by:** F0 founder adjudication §VII (D-03): *"F1 is authorized to define `programme-state.v1` — projection contract + recorded fixture only."*
**Standing:** CANDIDATE CONTRACT · recorded fixture delivered · **amended at F1R1 (population block + PS-9, founder ruling F1-R1)** · ⛔ no projector implemented · ⛔ not ratified.
**Fixture:** `prototypes/jarvis-founder-workspace-f1/programme-state.v1.fixture.json` (generated from `fixtures.js`; 13 programmes emitted of 26 examined by hand, `complete: false`; observed against `b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f`).

## 1 · What it is, and is not
- It is a **projection**: a derived, machine-readable view of programme standing that a Today surface can read without paragraph or filename heuristics.
- The **source of truth remains the governed programme records** (`docs/programme/*`, founder rulings, CLAUDE.md priority thread, git). ⛔ The projection is never a second hand-maintained truth store. If a projection row and its cited source disagree, the source wins and the row is wrong.
- ⛔ It confers no authority and changes no standing. A row saying `merge: NOT AUTHORIZED` reports a ruling; it does not make one.
- A **deterministic projector** (records → projection) is a later governed act. The F1 fixture was projected **by hand** and says so in `projector`.

## 2 · Shape
```jsonc
{
  "schema": "programme-state.v1",
  "projected_at": "YYYY-MM-DD",
  "observed_against": "<full canonical SHA the projection was read against>",
  "projector": "<who/what produced it; 'manual' until a governed projector exists>",
  "population": {                       // F1-R1 (founder ruling 2026-09-23): the consumer must be able to determine the population
    "definition": "<what counts as a programme for this projection>",
    "source": "<where the population was enumerated from>",
    "examined": 0,                       // subjects examined
    "emitted": 0,                        // rows in `programmes`
    "selection": "<rule that decided examined → emitted>",
    "not_emitted": [ "<examined subjects deliberately left out, by id>" ],
    "unreadable": [ "<subjects whose record could not be read>" ],
    "unclassified": [ "<subjects that could not be classified as a programme or not>" ],
    "complete": false,                   // true ONLY when a deterministic projector enumerated the population mechanically
    "why_not_complete": "<required when complete=false>"
  },
  "programmes": [ {
    "id": "<programme or lane code as the records name it>",
    "name": "<ordinary-language name for the founder>",
    "kind": "programme | ops | external",
    "question": "<one sentence: what this programme is for, in the founder's terms>",
    "standing": "<verbatim from the governing record; never paraphrased>",
    "stage": { "current_act": "<act or 'none open'>", "mode": "<the record's own word: STOP · HOLD · NEXT · CLOSED · PROTOTYPE · …>" },
    "needs_founder": [ { "what": "<the decision, as a sentence>", "why": "<why it is the founder's>", "source": "<path §section>" } ],
    "last_change": { "date": "YYYY-MM-DD", "authority": "<who/what changed it>", "source": "<path>" },
    "custody": { "branch": "<branch or null>", "candidate_sha": "<sha or null>", "observed_against": "<sha or null>" },
    "authority": { "merge": "<verbatim>", "deploy": "<verbatim>", "production_write": "<verbatim>", "member_facing": "<verbatim>" },
    "external": false,
    "evidence_state": "<manual §4 state for this row as a whole>",
    "sources": [ "<paths>" ]
  } ]
}
```

## 3 · Rules (each is a falsifier for the future projector)
- **PS-1 Verbatim standing.** `standing` and the four `authority` fields are copied from the record, never summarized. *Defeat:* a projector that "cleans up" a standing line.
- **PS-2 Every row cites.** `last_change.source` and each `needs_founder[].source` name a path (and section where possible). *Defeat:* a row with an empty source.
- **PS-3 Needs-founder is a list, not a rank.** Order in the file carries no priority; consumers order by `last_change.date` or leave the order alone. *Defeat:* a `priority` or `severity` field.
- **PS-4 Absence is explicit.** A programme whose record could not be read is emitted with `evidence_state: UNVERIFIED` and empty fields, not omitted. *Defeat:* silently dropping unreadable programmes.
- **PS-5 External is a boundary, not a gap.** `external: true` rows (e.g. Merge Authority) carry the founder-stated standing and `custody.branch: "outside this repository"`. *Defeat:* rendering an external programme as missing or unknown.
- **PS-6 Freshness travels with the file.** `observed_against` is mandatory and consumers display it; a projection older than the canonical tip is shown as older, never refreshed by inference. *Defeat:* a consumer that hides `observed_against`.
- **PS-7 No authority from projection.** Nothing reads a projection row to decide whether an act may run. *Defeat:* any code path where `authority.*` gates execution.
- **PS-9 Population before totals (F1-R1).** `population` is mandatory. A consumer may state an unqualified total ("N decisions are waiting on you") **only when `population.complete === true`**; otherwise every derived count is scoped ("in this snapshot …", "visible in the programmes included …"). `complete` may be set true only by a deterministic projector that enumerated the population mechanically, never by hand. *Defeat:* a manual projection with `complete: true`; a consumer that renders a bare total when `complete` is false or absent.
- **PS-8 Reconstructible.** Deleting the projection and re-projecting from the cited sources loses nothing (manual §24 cockpit test). *Defeat:* a field with no source.

## 4 · What the fixture demonstrates
Today's *Needs you* list, *In motion* list and the System *Authority at a glance* table in the prototype are rendered **only** from this projection. That is the D-03 demonstration: a Today surface can be built without heuristics if a projection of this shape exists.

## 5 · Owed later (not F1)
- A governed **projector** (deterministic, from records → this shape), with PS-1…PS-8 as its falsifier suite and defeat candidates built before it.
- A decision on **where the projection lives** (a generated file under `docs/programme/` vs `$AIN_HOME`) — founder ruling.
- A decision on **what counts as "the record"** for programmes whose only current standing is a CLAUDE.md priority-thread bullet.
