# Now What? — Room & Doorway Logic Review (2026-08-05)

**Provenance**: reviewed against the working tree on `feature/labtools-redesign` (the doorway-centered redesign). The deployed soullab.life/now-what is the superseded old room (`95b21ce42` lineage) — findings here describe the current source of truth, not what is live.

**Lens**: senior UI/UX practice for executive flourishing-coaching clients. Criteria: time-to-meaning under 10s per doorway · one primary gesture per room · distinct jobs (no repeated fields) · progression-not-inventory · coaching-grade copy register · honest empty/returning states. "Flourishing" is applied as a quality bar only — no practitioner taxonomy is recommended into room content (per the Now What? ⊥ Flourishing-framework ruling).

---

## 1. Room-by-room verdict

| Room | Dev state | Doorway-relevant? | Verdict |
|---|---|---|---|
| **Session Room** (`/room`) | Fully developed (1,882-line 6-phase machine; only room with real gestures) | Yes | ✅ The anchor. Keep as the single gesture surface. `roomPhase==='closed'` recovery via full page reload is crude but functional. |
| **Home** (`/now-what`, ClientHome) | Developed | — | ⚠️ 8 doors render unconditionally (comment says "six"); 3-col grid leaves an orphan; two doors are structurally hollow (see §2). |
| **Arrive** | Fully developed | Yes (auth door) | ⚠️ Dead `ArrivalResolving` branch (`useSearchParams()` never null under Suspense); signed-in landing goes to `/now-what/map`, not Home — two competing front doors. |
| **Field** ("Your story") | Fully developed | Yes | ⚠️ Fetch fires before the session gate (signed-out 401 behind threshold). Its claim ("what you kept") subsumes Questions, Next, and Calendar's commitments — see §3. |
| **Next** | Developed but thin | Weak | 🔴 Near-clone of Field: same panel grammar, same keyframes renamed `nwf→nwn`, same closing copy; its data is a strict subset (Field filtered to `practice`). Same pre-gate fetch bug. |
| **Questions** | Fully developed | Yes | 🔴 **Data bug**: threads a member authors in-room save with the session `spiralogicPhase`, not `'question'` (field-note route L269 vs L238) — self-authored questions can never appear in this room. Also client-filters after fetching up to 200 rows. |
| **Position** ("Where you are" / "Your programs") | Fully developed, read-only by design | Yes | ⚠️ Deep-linked without `fieldContext` the fetch is skipped and the room is permanently empty — a dead room, not an honest empty state. Named differently on Map vs Home. |
| **Cultivate** | Shell | Promised, not delivered | 🔴🔴 **Trust-breaking bug**: page promises "a reflection added here is placed under its dimension by you," but the `dimension` slug is framing copy only — never included in the `POST /api/now-what/field-note` body, and `asPhase()` would reject it. The placing gesture silently does not persist. All six "Explore →" links point at the same unfiltered `/now-what/field`. No fetch at all — static 6-domain array. |
| **Coaching** | Partial (honest-absence by design) | Yes | ⚠️ Duplicates Calendar: same `/api/now-what/home` payload, duplicated `whenLabel`/`dayLabel`/`HOW` helpers, byte-identical "Previous conversations" block, same Prepare link. |
| **Calendar** | Partial | Weak | 🔴 Copy says commitments are "created by you, never assigned" but the room offers **no create affordance** — to a returning member it reads dead. Redundant with Coaching. |
| **Themes** | Intentional gated placeholder | Yes as a held promise | ⚠️ Structurally near-identical to Reflections (same HOLD+EXPLAIN template, same rhetoric, only animation prefix differs). |
| **Reflections** | Intentional gated placeholder | Yes as a held promise | ⚠️ Same as Themes; also a nav cul-de-sac (zero CTAs). |
| **Map** | Developed but stale | — | 🔴 Hardcoded `OPEN_ROOMS`/`PROTECTED_ROOMS` omit Home, Calendar, Coaching, Cultivate — the map no longer depicts the building. Hand-placed SVG coordinates make additions non-trivial despite the "WIRING" comment. |
| **Welcome** | Fully developed (marketing shell) | Yes | ⚠️ CTA targets `/now-what/pitch`, which exists only via a `next.config.js` rewrite (L110-121) — drop the rewrite and it 404s. |

## 2. Doorway → destination integrity

- **`entry=think` is dead.** ClientHome's "A place to think" door links `room?entry=think`, but `NowWhatRoom` handles only `question | cultivate | lived | prepare` — `think` falls through to the generic arrival prompt. The door's promise ("clarify a decision, explore a tension") is never honored.
- **Three doors, one room**: "The question you are carrying," "What you are living," and "A place to think" all land in the Session Room; only the first two get differentiated arrivals.
- **`entry=prepare` duplicated** verbatim across Coaching and Calendar.
- **Registry drift**: Cultivate, Coaching, Calendar — three of Home's six primary doors — are absent from `lib/nowWhat/rooms.ts`. Consequence: `roomForPath()` returns null there, no `NowWhatShell`, invisible on the Map. `rooms.test.ts` only asserts registry→disk, never disk→registry, so this can't be caught. Registry doc block ("7 rooms + 2 non-rooms") is false against 12 route dirs.
- **Two nav registers coexist**: dark-glass (`NowWhatShell` + Map + registry rooms) vs warm-paper (`PaperRoom` + ClientHome rooms). A member in Cultivate/Coaching/Calendar has no hallway — only PaperRoom's wordmark. And the wordmark itself is inconsistent: ClientHome's → `/now-what/map`, PaperRoom's → `/now-what`.
- **Two vocabularies for the same rooms**: Field is "Your field" (map) and "Your story" (home); Position is "Where you are" (map) and "Your programs" (home).

## 3. Repeated-field map (the core question)

| Repetition | Rooms | Severity |
|---|---|---|
| `practice`-tagged threads surface in **three** rooms | Field ("Kept") · Next ("What you chose to live") · Calendar ("Your commitments") | 🔴 Same member data, three names — the member cannot form a stable model of where their commitments live |
| Same `/api/now-what/home` payload rendered twice | Coaching ≈ Calendar | 🔴 Byte-identical blocks |
| Next ⊂ Field | Next is Field filtered to one phase | 🔴 One room should absorb the other |
| Themes ≈ Reflections | Same placeholder template + overlapping "not open yet — on purpose" rhetoric | ⚠️ |
| Three doors → Session Room | question / lived / think | ⚠️ (think unhandled) |

## 4. Executive-coaching UX assessment

- **Triage fails at the threshold.** Eight visually equal doors with no state-driven prioritization is inventory grammar, not progression — precisely the warehouse failure mode the project's own Inhabitable Architecture law names. An executive arriving with 90 seconds cannot tell which door is *theirs right now*.
- **The one-gesture rule is honored by exactly one room** (Session Room). Cultivate is the worst offender: it *promises* a gesture and silently drops it — for this audience, a coaching product that loses what you gave it once is a coaching product you never trust again.
- **Returning-state honesty is uneven.** Position deep-linked = dead room; Calendar with no create path reads abandoned; Field/Questions handle absence well.
- **Copy register is largely right** — calm, second-person, non-prescriptive ("held open, not prescribed," "nothing here measures you") is exactly the register this audience accepts. The problem is not the voice; it's that several rooms' voices write checks the mechanics don't cash.

## 5. Ranked recommendations

1. **Fix the two silent-loss bugs first** (Cultivate dimension never persisted; Questions phase-tag mismatch). Both make a member gesture vanish without feedback — the single worst failure class for a trust-first coaching product.
2. **Merge Calendar into Coaching** (one "Your coaching" room: relationship + upcoming + prepare). If a pure schedule view survives, it renders *only* schedule — no duplicated blocks, and give commitments either a create path or remove the "created by you" claim.
3. **Fold Next into Field** as a filter/lens, and pick **one home for practice threads** with one name.
4. **Resolve the 8-door home to the intended 6**: wire `entry=think` with a real arrival branch or cut the door; differentiate the three Session Room doors at arrival or reduce them.
5. **Heal the registry split**: add cultivate/coaching/calendar to `rooms.ts`, extend `rooms.test.ts` to assert disk→registry, update the Map (or derive it from the registry), unify on one nav register and one signed-in landing (recommend Home, not Map).
6. **Collapse Themes + Reflections into one held-capabilities page** ("What is not open yet, and why") until either ships.
7. **Hygiene**: gate the Field/Next fetches behind the session check; give `/now-what/pitch` a real route or an in-repo redirect; fix the Position no-`fieldContext` dead room; correct the stale registry doc block and one-name-per-room vocabulary.

---

*Method: three parallel code readers over the full `app/now-what/*` + `components/now-what/*` + `lib/nowWhat/*` surface, with API routes followed to persistence. Line references verified in working tree at review time.*
