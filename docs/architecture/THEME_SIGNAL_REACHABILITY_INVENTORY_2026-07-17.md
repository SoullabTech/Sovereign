# Recurring-Theme Pipeline — Reachability & Authority Inventory — 2026-07-17

**Status**: Register D1, delivered. Read-only inventory; the pipeline was not modified.
Governing ruling (R4): freeze expansion now; subsume into the ratification architecture
next. Pipeline output is *candidate observation*, never *known member theme*.

---

## 1. Writers

Single INSERT site: `storeThemeSignal()` at
`lib/consciousness/participatoryRealityHelper.ts:100-133` — fire-and-forget, errors
swallowed. **No UPDATE or DELETE code exists anywhere.** Upstream, `detectThemes()`
(`:67`) is a soft keyword heuristic, self-described "low confidence by design" (`:64`),
over a fixed 6-value theme enum.

Two live call chains:

| Caller | Gates | Behavior |
|---|---|---|
| `app/api/between/chat/route.ts:1993` | `!isSanctuary` + recognized-member UUID check + `resonance_strength >= 0.55` | stores only the top signal |
| `lib/sovereign/maiaService.ts:3589` | `!isSanctuary` + `effectiveUserId` — **no resonance threshold** | stores **every** detected signal |

Asymmetry noted: the sovereign path (the main traffic path) applies no confidence floor.
Both sanctuary gates are caller-side over the client-asserted flag (see the Sanctuary
audit — same structural weakness).

## 2. Readers

- `getRecentThemes()` (`participatoryRealityHelper.ts:147-173`): member-scoped, 30-day
  window, LIMIT 20. Sole caller `lib/memory/MemberLiveContext.ts:395`, feeding
  `findRecurringThemes()` (threshold ≥3 appearances in window).
- `getCirclePulse()` (`lib/circles/fieldPulseService.ts:57-69`): **the only cross-member
  reader** — JOINs to `circle_memberships`, 14-day window,
  `HAVING COUNT(DISTINCT member_id) >= 2`, LIMIT 3.
- `getCirclePulseLight()` (`:122`) does **not** read theme signals.
- Namesake methods in `PersonalOracleAgent.ts:366` and
  `consciousness-orchestrator.ts:758` are in-memory false positives — they do not read
  the table.

## 3. Prompt injections

- **Member Web block** — `MemberLiveContext.ts:478-489` renders
  `"Participatory Themes (self-observed, recurring): <label> (×<count>, …)"` — consumed
  by `app/api/oracle/conversation/route.ts:972` and
  `app/api/sovereign/app/maia/list/route.ts:658` → `memberWebAddendum` → composed
  system prompt (`maiaService.ts:1281`). Also feeds `fieldState.dominantTheme`
  (`MemberLiveContext.ts:224-226,496`).
- **Labeling defect against R4**: the injected label says **"self-observed"** — but
  these are *system-inferred* keyword detections. The prompt currently misrepresents
  candidate recurrence as member self-observation, precisely the authority inflation R4
  prohibits. (Flagged for the subsume phase; not modified now.)
- `buildParticipatorryHint()` (`participatoryRealityHelper.ts:251-262`) — honestly
  labeled "[Participatory lens — soft signal only]" — is **dead code, zero callers**.
  The honest template is the unwired one.

## 4. UI exposure

- **Circles detail** (`app/commons/circles/[circleId]/page.tsx` →
  `components/circles/FieldPresence.tsx:41` → `/pulse`): renders qualitative
  descriptions only (`fieldPulseService.ts:18-44`, e.g. "Themes of memory and return
  are surfacing") — no counts, no identity.
- **`/maia/orientation` `themeObservations` is a different pipeline** — member-named
  atoms via `lib/orientation/spiralOrientation.ts:404,422` ("only member-named themes;
  never system-discovered"). **Not implicated.** The platform already contains the
  correct member-authored theme pattern alongside the inferred one.

## 5. Collective use — full path confirmed

`storeThemeSignal` (private inference) → `member_theme_signals` → `getCirclePulse` JOIN
→ `GET /api/circles/[circleId]/pulse` (auth + active-membership required;
`circleService.ts:66-72`) → `FieldPresence` → **any active member of that circle**.
No feature flag gates the route or the JOIN.

## 6. Deletion

Migration `20260316000001_participatory_reality_themes.sql`: `ON DELETE CASCADE` from
`members` is the **only** deletion path. No TTL, no retention column, no cleanup job, no
per-signal deletion. Signals persist for the life of the membership; only the read
windows (30d/14d) age them out of influence.

## 7. Member visibility / correction

**CORRECTED 2026-07-17 (verified on `clean-main-no-secrets` during Workstream A)**:
read-only member **visibility does exist** — `app/api/members/themes/route.ts` returns
the member's own theme summary (per-theme counts, latest detection, element), strictly
`WHERE member_id = $1`. The original "none" claim was wrong. What remains true and is
the R4 gap: **no correction** — no route or UI lets a member reject, correct, or
dispute a signal, and prompt influence is not disclosed at the point of effect.

Additional readers found on main during the same verification (all outside the circles
surface): `lib/maia/memoryLoaders.ts:150` and `lib/maia/recurrenceDetector.ts:94`
(member-scoped, private), and `app/api/admin/activity-feed/route.ts:158` (admin-scoped
cross-member counts — to be inventoried under the collective boundary model per U8).

## 8. Staleness and contradiction behavior

No decay, no invalidation, no correction wiring (`detectCorrectionSignal` exists but is
not connected to theme expiry). Contradictory member input adds rows; it never retires a
theme. Old signals influence prompts until they age past 30 days.

## 9. Deployment status — the critical finding

`git diff origin/clean-main-no-secrets...HEAD` over the helper, `fieldPulseService`,
`app/api/circles/**`, and the migration is **empty**; all four exist byte-identical on
main (merge-base `f980b734`). **The pipeline is not branch-only. It is on the deploy
branch and plausibly live in production**, Circles UI included. Private inferred theme
content is therefore **actively crossing into a shared surface today** — subject to the
2-member floor and category-level descriptions.

Severity, stated honestly in both directions: what crosses is coarse (one of six fixed
theme categories, rendered as atmosphere language, no counts, no identity, 14-day
window) — this is not verbatim content exposure. But it is **system-inferred
developmental material crossing a privacy boundary with no member consent act, at a
cohort floor of 2 that ruling R5 has judged inadequate**, in circles small and intimate
enough that the reasonable-participant test (R6) can fail. Under R5/R10 reasoning this
classifies as a **sovereignty defect** — see the containment plan
(`CIRCLES_FIELD_PULSE_CONTAINMENT_PLAN_2026-07-17.md`).

## 10. Containment seams (identification only — acted on in D2)

- **(a) Sever theme → pulse**: narrowest at the theme aggregation query inside
  `fieldPulseService.ts:53-78` (short-circuit `themeResult` → `signals=[]`); pulse
  degrades gracefully via its inquiry/movement sources (`:80-108`). Outer alternative:
  the sole caller at `app/api/circles/[circleId]/pulse/route.ts:21`.
- **(b) Freeze prompt injection**: single-file seam at `MemberLiveContext.ts:398`
  (`recurringThemes=[]`), which silences the Member Web themes block **and**
  `dominantTheme` for both consumer routes at once.

Both seams leave writers untouched — signals keep accruing as candidate recurrence
(consistent with R4's "may continue detecting internally") while reaching no surface.

## 11. Answers to the directive's eight questions

1. **Writers**: one INSERT site, two callers (§1). 2. **Readers**: three, one
cross-member (§2). 3. **Prompt injections**: Member Web block into both conversation
routes; mislabeled "self-observed" (§3). 4. **UI**: Circles FieldPresence only;
orientation is a different, correctly-authored pipeline (§4). 5. **Collective use**: one
path, live (§5). 6. **Deletion**: member-cascade only (§6). 7. **Member
see/correct/reject**: impossible today (§7). 8. **Old signals after contradictory
evidence**: continue influencing until window expiry; no invalidation exists (§8).
