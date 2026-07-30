# Jondi Companion — Increment 1 Build Plan

**Date:** 2026-07-21
**Authorizes:** Track A container build (the `Prepare → Participate → Integrate → Continue` rhythm as a
practitioner configuration of existing substrate), for the **individual_session** container type only.
**Does NOT authorize:** Jondi corpus ingestion, "Virtual Jondi" simulation, group/training/workshop/retreat
user-facing experiences, Extraordinary College, community/legacy/practitioner-intelligence surfaces, or any
cross-session synthesis. Those remain [[project_jondi_companion_candidate]] Track B / held vision.

Grounds: the pasted build prompt (Kelly, 2026-07-21) + `JONDI_COMPANION_CANDIDATE_2026-07-21.md`. This plan is
the "brief implementation plan before coding" the prompt's §1 requires. Status discipline per §12:
**implemented ≠ wired ≠ deployed ≠ verified.** Nothing here is deployed; nothing is verified until the full
participant journey is walked in a production-equivalent environment.

---

## 0. Boundary of this increment

The smallest complete participant journey, for one practitioner (Jondi) and one participant, individual
sessions only:

```
Prepare  →  Participate  →  Integrate  →  Continue  →  (Prepare for next)
(before)     (during)        (after)       (between)
```

MAIA remains the single voice/host. The library does not speak; navigation does not speak; practitioner
content never impersonates Jondi.

---

## 1. Reuse map (archaeology-verified, main-repo paths authoritative)

| Need | Reused substrate | Assessment |
|---|---|---|
| Practitioner environment / config | `practice_fields` (`20260701000001`), `lib/practiceField/*`, `app/fields/[field]/*`, `app/practitioner/*` | Jondi = a `practice_fields` row; no new app. |
| Reusable container_type | `field_programs.kind` + `field_program_positions` (`20260712000001`) | Enum already covers future group/training/workshop/retreat. **No new container enum.** |
| Participate "Keep This" | `POST/DELETE /api/sovereign/episodes/mark` (member-marked, verbatim, Sanctuary-guarded at call site) | Direct reuse. **No new keep table.** |
| Prepare/Integrate journaling shape | `founder_practice_entries` JSONB prompt→verbatim pattern (`lib/founder/practice.ts`) | Borrow the *shape* (prompt-keyed JSONB, no scoring, no AI); build member-scoped, not founder-only. |
| Auth / member scoping | `lib/auth/getMemberFromRequest.ts`, `lib/auth/session.ts` (`requireMemberId`), `config/accessMatrix.ts`, `lib/security/requireAccess.ts` | Extend `ACCESS_RULES`; call `requireMemberId` at top of every route. |
| Consent / recording / sanctuary | `lib/scribe/scribeAuth.ts` (`consent_status`), `sovereignSummarizer` sanctuary refusal, `accountSettings.defaultMemoryMode` | Preserve; new surfaces must read mode/consent before persist/share. |
| Wisdom / resources retrieval | `lib/library/LibraryService.ts`, `corpus_documents`, `practitioner_resources`, `wisdom_submissions` provenance | Placeholder content only until an approved Jondi corpus exists. |
| Boundary proof | `scripts/verify-constitution-colab.ts` (**real name**; old `verify-colab-boundaries.ts` does not exist) | New tables MUST be added to its isolation checks. |
| Member shell / single-host | `components/now-what/NowWhatShell.tsx` | Jondi Home renders inside this frame. |

## 2. New (minimal, member-authored, private-by-default)

Migration `20260721000002_jondi_companion_experiences.sql`:

- **`practitioner_experiences`** — the "Experience" anchor for one session/engagement instance.
  `container_type` defaults `individual_session` (CHECK allows future types; UI exposes only individual_session).
  Member-scoped via `member_id`; joins `practice_fields.field_slug`.
- **`experience_preparations`** — member-authored pre-session reflection. `fields JSONB` (prompt-keyed verbatim),
  `sharing_state` default `private` (CHECK `private | shared_with_practitioner`), reversible before submit.
  No scoring, no AI, no inferred goals/diagnoses/states.
- **`experience_integrations`** — member-authored post-session reflection. Same shape, `sharing_state` default
  `private`. Any AI reflection (if later added) must be a tentative mirror grounded only in the member's own
  words — not in this increment.

Server lib `lib/jondi/experiences.ts` (mirrors `lib/founder/practice.ts` query style); client-safe
prompts/types in `lib/jondi/experiencesShared.ts`.

## 3. Routes

Member-facing (inside `NowWhatShell`, one coherent journey — no dashboard-of-modules):

```
/fields/jondi                       Jondi Home (Prepare · Recent Session · Integrate · Continue · Wisdom)
/fields/jondi/prepare               Prepare flow
/fields/jondi/session               Current/recent session context (reuses Session Room + Keep This)
/fields/jondi/integrate             Integrate flow
/fields/jondi/continue              Between-session home
/fields/jondi/wisdom                Wisdom/Practices (placeholder corpus; Tap = unavailable-pending-content)
```

APIs (all `requireMemberId`, member-scoped): `/api/jondi/experiences`, `/api/jondi/preparations`,
`/api/jondi/integrations`, `/api/jondi/wisdom` (read-only, placeholder). Reuse `/api/sovereign/episodes/mark`
for keeps.

Practitioner-facing (minimum only): `/practitioner` view surfaces **only** experiences + material the member
has explicitly shared (`sharing_state = shared_with_practitioner`), plus resource-sharing. **No** scoring,
dashboards, rankings, theme analysis, clinical records, or predictive analytics. Positions/preparations/
integrations that are private are never read by the practitioner (mirrors `field_program_positions` §8:
"no practitioner read, ever").

## 4. Build sequence (each stage lands with its own tests before the next)

1. **Foundation** — migration + `lib/jondi/*` + `accessMatrix` rules + Jondi `practice_fields` seed.
2. **Prepare** — API + UI; private-by-default; editable pre-session; explicit reversible share.
3. **Participate** — session context page reusing Session Room + Keep This; view prep in-context.
4. **Integrate** — API + UI; member-authored reflections; shows prep + kept moments + shared resources.
5. **Continue** — between-session home; next-Prepare pathway.
6. **Wisdom/Practices** — placeholder retrieval; Tap marked unavailable-pending-content.
7. **Practitioner minimum view** — shared-only visibility + resource sharing.
8. **Boundary + consent tests**, then **end-to-end walk**.

## 5. Tests (§13)

Member CRUD on prep; private prep invisible to practitioner; explicitly-shared prep visible only to the correct
practitioner; keep created during an experience; integration bound to correct experience; member-A cannot read
member-B material; unauthorized practitioner blocked; resources preserve provenance/permission; recording +
consent + sanctuary gates intact; future container types absent from UI. Extend `verify-constitution-colab.ts`
with the three new tables. Then `npm run typecheck`, lint, targeted tests, production build.

## 6. Known blockers / deferrals (§15.10)

- **Jondi corpus + permissions** — Track B, not engineering. Wisdom = clearly-labeled placeholder until an
  approved corpus row exists. No scraping, no ingesting public/private/group content.
- **EFT / Clean Language** — no implementation exists. Tap ships as an integration point marked
  **unavailable pending approved content and specification**. Not invented here.
- **Reflection stack** (`member_reflections`, `/maia/reflection`) — unmerged worktree; **not** a dependency
  (Integrate is self-contained). Recorded so the two are reconciled later, not conflated.

## 7. Constitutional check (CLAUDE.md pre-change gate)

Increases member agency (member authors prep/integration, owns visibility) · pushes life outward (continuity
into next real meeting) · reduces system centrality (accompanies, never interprets) · Inv 14 (member's own
words, no imposed vocabulary; verbatim). Surfacing rule honored: only member-authored, curated-Jondi-authored,
or procedural support may surface. No commit or deploy without Kelly's explicit approval.
