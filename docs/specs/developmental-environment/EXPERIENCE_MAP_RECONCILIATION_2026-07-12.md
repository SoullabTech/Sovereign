# Developmental Experience Map — Reconciliation Against Surfaces v1 (CANDIDATE)

**Status**: CANDIDATE, uncommitted, pending Kelly ratification (preparation ≠ authorization).
**What this document is**: the requested "repo-grounded candidate specification and implementation plan
for a member-facing Developmental Experience Map" — delivered as a **reconciliation delta** against
`DEVELOPMENTAL_ENVIRONMENT_SURFACES_v1.md` (same directory), which already formalizes this environment.
Authoring a second spec would be the duplicate architecture the brief prohibits. "Experience Map" is
hereby an **alias**, not a second document; the seven-surface enumeration and three rulings of v1 govern.
**Inventory basis**: three-lane repo sweep, 2026-07-12, on branch `feature/now-what-maia-presence`.
Claim states use the six-category discipline: *repo-present ≠ wired ≠ surfacing ≠ verified.*

---

## 1. The six requested areas, mapped onto the seven v1 surfaces

| Brief area | v1 surface(s) | Claim state (repo-grounded, 2026-07-12) |
|---|---|---|
| My Position | Arrival / Position (+ Developmental Place for self-location) | **BUILT IN REPO — verify hold status.** Spec header still reads "PREPARED, NOT AUTHORIZED," but the build exists: migration `20260712000001_field_programs_and_positions.sql` (`field_programs`, `field_program_positions`, `practice_fields.current_focal_point`), service `lib/practiceField/programPositionService.ts`, route `app/api/now-what/program-position/route.ts` (confirm \| focalPoint \| depart), wired into `lib/maia/roomComposition.ts`. The sitting must reconcile spec header vs build before this surface is claimed. |
| My Journey | Library/Keeps timeline (near) + Themes Across Time (far) | **PARTIAL + FENCED.** `/now-what/field` timeline and atoms/anchors history exist; `/journey` page exists with `spiralogicEngine.ts` BUILT-UNWIRED; Journey Framework is doc-only CANDIDATE. Cross-session theme visibility remains **Vision**, blocked by Ruling 2 until Episodic Phase 2. |
| My Materials | Library / Keeps | **EXISTS TODAY (composition, not creation).** Journals (`app/journal`, quick-journal + audio tables), dreams, ideas (`app/maia/ideas`), uploads (`app/labtools/upload`, media/book-studio upload routes), voice notes, keeps/atoms (`app/maia/keep-capture`), anchor history. Member-owned; consent columns already on atoms/anchors. |
| What I'm Working On | Questions I'm Living | **PARTIALLY LIVE.** Member-authored material in threads/field notes; no dedicated room. If built: organization of member-authored text only, no synthesis (v1). |
| Practices & Commitments | **GAP — no v1 surface owns this.** Nearest: What May Be Next (off-ramps, Live-as-deployed) | **FUTURE / REQUIRES NEW SPEC.** Substrate exists (`practice_fields`, `practice_sessions`, `practice_insights`, elemental completions) but no practitioner-assigned-practice / member-created-practice / commitment tables. `docs/specs/PRACTICE_FIELD_SPEC.md` is cited by a migration but absent at that path — locate or re-author before any build. `AchievementService` is dormant ("Later — reframe as practice" per standing matrix); do not resurrect here. |
| MAIA Reflections | MAIA Reflections | **VISION — but the gates are live.** Consent machinery already enforced in SQL + refusal tests (R01/R04/R07/R08/R13): `return_preference`, `surface_preference`, recall opt-out, Sanctuary guards, `identityPredicateGuard`. The **room** doesn't exist; the constitution for it does. |

**Delta the brief genuinely adds to v1** (three items, nothing else is new):
1. **Practices & Commitments as an eighth surface** — propose adding to v1's enumeration *at the sitting* (enumeration changes are a sitting act, per v1's closing line).
2. **The citation obligation made explicit on MAIA Reflections** — fold in the portrait-lens invariant verbatim: *every echo carries a required provenance pointer into the member's own record (atom id / journal entry / chart fact); an echo without a citation is an inference wearing reflection's clothes — the surface stays silent rather than emit it.* Type-level: the difference between forbidden and permitted forms is exactly one required field.
3. **Uploads/audio enumerated inside Library/Keeps** — already-existing routes; naming them prevents a parallel "materials" build.

---

## 2. The one-page map (the artifact the member actually sees)

**The map is doorways, not a dossier.** A single member surface that *composes navigation into
existing rooms* — it represents the environment, never the person (v1's closing constitutional
sentence). Six doors, each rendering only what its substrate can honestly show today:

```text
My Position        → program-position block (member-confirmed footing, or silence)
My Journey         → /now-what/field timeline + anchor/atoms history
My Materials       → journal · dreams · ideas · uploads · keeps
What I'm Working On→ questions/threads (member-authored text, organized)
Practices          → door renders ONLY after the Practices spec exists (until then: absent, not "coming soon")
MAIA Reflections   → door absent until Episodic Phase 2 + sitting authorization (Rulings 2+3)
```

Absent doors are **absent** — no placeholders, no "coming soon" (dangerous-failure lesson: a
promise-shaped surface is an unverified claim). Outward register, if this page is ever shown
externally: internal Missing → "Taking Shape"; internal Held → "Deliberately Protected" (v1).

**The simple version for Larry** already exists: `docs/fields/larry/LARRY_DEVELOPMENTAL_ENVIRONMENT_MAP.md`
(presentation register) — reuse it; do not write a third rendering.

## 3. Route & component map (composition, all existing)

- Page: extend **`app/maia/orientation/page.tsx`** (already the domain-grouped aggregator) *or* a sibling
  `app/maia/environment/page.tsx` that composes existing cards. No new data model for the page itself.
- Doors link to: `app/maia/keep-capture`, `app/maia/anchor/history`, `app/maia/ideas`, `app/journal`,
  `app/maia/library`, `app/now-what/field`, `app/maia/living-field`.
- Position block: reuse `composeProgramPositionBlock` (`lib/practiceField/programPositionService.ts`) —
  render *confirmed-current* vs *assumed-from-last-known* footing exactly as the position spec defines;
  never a progress bar, never advancement language (P8d fence).
- Auth: `x-member-id` via `apiFetch()` per `AUTH_POSTURE_X_MEMBER_ID_2026-07-11.md`; Capacitor-safe.

## 4. Data ownership & consent rules (all pre-existing; the page adds none)

- Atoms: `return_preference` (default `member_pulled`); anchors: `surface_preference` (default private);
  recall: `conversational_recall_enabled` opt-out; Sanctuary: guards + `suppressedReason: 'sanctuary'`.
- The map page is **member-pulled by definition** (the member navigates to it) — it may *show* the
  member their own material regardless of ambient-surfacing preferences, because member-pulled viewing
  is precisely what those preferences protect. It may never feed what it shows back into prompt
  composition beyond the existing gated loaders.
- Practitioner read: **none, ever**, of positions (standing ruling) and of this page. The page is a
  member room, not a practitioner dashboard — practitioner overreach risk is closed by scope, not policy.

## 5. Minimal viable implementation (build only after sitting approval)

One page, six doors, zero new tables, zero new synthesis:
1. Compose door cards from existing routes (counts optional and only via existing member-scoped queries).
2. Render position block via existing service (silence when no confirmed position — no fabrication).
3. Absent-door rule enforced in code (door list is a function of substrate presence, not config).
Estimated scope: one page + one loader that calls existing services. No migration.

## 6. Deferred (fenced, with owners)

- Practices & Commitments spec (new; practitioner-assign jurisdiction sits inside the
  practitioner-client privacy model — largely unbuilt **by design**).
- Themes Across Time; MAIA Reflections room (both wait on Episodic Phase 2 — "environmental
  infrastructure" per v1; nothing here accelerates it).
- Any position surfacing outside the room; cohort management; module-menu picker (position spec §9).
- Journey spine build (`spiralogicEngine` stays BUILT-UNWIRED until the Journey Framework leaves CANDIDATE).

## 7. Tests & verification criteria

- Inherit the refusal-registry pattern: each door ships with a refusal test in
  `tests/constitutional/refusal-registry/` (page renders member's own material only; absent doors
  absent; no identity predicates in any rendered copy — reuse R13 guard on page copy).
- Position footing probes P7a–d (already defined) must be green before the position door claims anything.
- Verification ladder per house standard: built → wired → surfacing → verified; the page is not
  "Live" until witnessed under an authenticated member on production.

## 8. Risks

- **Inference drift**: any door that summarizes (counts, "recent themes") is one adjective away from
  synthesis — MVI renders links and member-authored titles only.
- **Privacy leakage**: aggregation is re-identifying at cohort scale (the "cohort of 8" lesson) — no
  practitioner-visible aggregates of anything on this page, ever.
- **Promise-shaped UI**: placeholder doors would convert Vision to implied-Live — absent-door rule is
  the mitigation, tested not trusted.
- **Duplicate architecture**: the standing risk this document exists to close — v1 + this delta are the
  single source; any future "experience map" work cites them or is drift.

---

**Guiding principles carried verbatim**: Development happens; authorship never moves. Same environment,
different entry positions. Position is member-confirmed. MAIA reflects; it does not declare.
Evaluation before invention.

*Prepared 2026-07-12. The eighth-surface addition, the citation-invariant fold-in, and MVI
authorization are sitting acts. Nothing in this document lifts a standing freeze.*
