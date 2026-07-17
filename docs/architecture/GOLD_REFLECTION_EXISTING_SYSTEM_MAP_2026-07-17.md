# Gold Reflection — Existing-System Map — 2026-07-17

**Ruling status (2026-07-17)**: Accepted by Kelly. The §2.2 near-miss (theme pipeline)
drew ruling R4 (freeze-then-subsume); §2.1's grammar reconciliation is ratified as R3.
See `GOLD_REFLECTION_DECISION_REGISTER_2026-07-17.md`.

**Status**: Design investigation only. Source-verified on branch
`feature/practitioner-program-platform` (2026-07-17). Status vocabulary follows the
six-category typology and the built ≠ wired ≠ surfacing ≠ verified discipline. Note:
most `/maia/*` surfaces, `lib/psyche`, `lib/anchor`, and `participatoryRealityHelper`
are **branch-only relative to main** — nothing here asserts production liveness unless
stated.

Companions: Individual Architecture (Doc A), Interaction Study (Doc B), Collective
Boundary Model (Doc C).

---

## 1. The map

| Existing capability | Verified state | Possible role in reflection | Risk | Gap |
| --- | --- | --- | --- | --- |
| Episodic marks ("Keep this moment") | `components/OracleConversation.tsx` → `POST /api/sovereign/episodes/mark`; verbatim-only, system never auto-marks, Sanctuary guard in route; removal via two-tap in `/maia/moments` → `DELETE` | Member-signaled significance — the strongest evidence seed | Overreading marks; several marks construed into a conclusion the member didn't make | Clustering/recurrence assembly with citations; ratification grammar |
| Marked Moments view (`/maia/moments`) | `app/maia/moments/page.tsx`, live-on-branch, member's kept verbatim words | The natural "evidence is visible" surface; possible home for kept reflections later | Becoming a profile page if reflections accrete there uninvited | Reflection display = citation-first; member-pulled only |
| Memory atoms + gestures | `AtomGesture` vocabulary (`lib/psyche/types.ts:279-293`): `mark_still_alive`, `set_aside`, `protect`, `archive`, `return_to_active`, `set_return_preference`, `touch`; UI `app/maia/keep-capture/page.tsx`; handler `lib/psyche/portfolio.ts:418-559`; loader gate `lib/maia/memoryAtomsLoader.ts:279` | Continuity substrate; gesture grammar is the nearest ancestor of the member-response grammar | Interpretation becoming fact if construals are stored as atoms | A response-to-construal verb set (recognized/revised/not-true/not-now) — deliberately absent today (see §2.1) |
| Anchor consent triad (`surface_preference`) | `lib/anchor/surfacePreference.ts:24-44`; loader gate `lib/anchor/loadRecentAnchors.ts:66`; toggle on `/maia/anchor/history`; migration `20260702000003` | The template for reflection surfacing policy (default member-pulled) | None inherent — this is the pattern to copy | Third instance of the triad for reflections |
| Conversational recall (Phase 2) | Verified live 2026-07-13 (per project record; FAST+CORE prompt path) | Cross-session verbatim continuity — evidence retrieval | Recall drifting into construal without ratification | Provenance-visible citation when recalled material grounds a reflection |
| Recurring-theme detection | **Built and prompt-wired**: `lib/consciousness/participatoryRealityHelper.ts` — `detectThemes()`, `storeThemeSignal()` → `member_theme_signals` (migration `20260316000001`), `findRecurringThemes()` with `RECURRENCE_THRESHOLD = 3`; wired via `lib/sovereign/maiaService.ts:66`; `SessionMemoryService` emits "connects to a recurring theme… in N of our recent conversations" | Could become the recurrence-assembly engine — the threshold constant even matches Doc A §6 | **This is the live near-miss**: system-inferred themes already influence prompts and feed the Circles pulse with no member ratification and no member review surface | Ratification state on theme signals; a member surface to see/correct them; consent before any cross-member use (Doc C §9.7) |
| Prompt-layer reflective moves | `lib/sovereign/maiaService.ts:938-990` pacing block ("Only after sustained dialogue: pattern reflection becomes appropriate"; "You've mentioned that a few times now…"); `maiaVoice.ts:313-316` "Move from single events to recurring dynamics"; speech-act boundary at `maiaVoice.ts:500` (may reflect that something matters, must never claim it was kept) | MAIA already has license to name recurrence in-conversation — the conversational half of the loop exists as prompt guidance | Unfalsifiable "a few times now" claims — the prompt permits counting language without checkable citations | Grounding: counting claims should be backed by retrievable evidence, not model impression |
| Chapters (conversations) | **Docs-only.** No conversation-chapter code exists; `GET /api/conversation/chapters` unbuilt; approved-queued behind security-patch → deploy sequence (`MAIA_CONVERSATION_CHAPTERS_DESIGN_2026-07-17.md`, `MAIA_HOUSE_PRESENCE_IMPLEMENTATION.md:72`). The `ChapterStatus` in `lib/story/types.ts` is the story-authoring system, not conversations | Temporal seam for the prototype ("end of chapter") once shipped | Forced narrative; conflating story-chapters with conversation-chapters | Prototype uses "end of conversation" seam; does not wait for chapters (Doc A §12.6) |
| Orientation view (`/maia/orientation`) | `app/maia/orientation/page.tsx:1-206`, read-only, renders member's own `themeObservations` in their words | Proof that a member-words-only continuity surface works | — | — |
| Greeting continuity | `lib/greetings/greetingRender.ts:64,125-174` — "Last time we were with ${softTheme}. Want to pick that up…" | The "during a return" surface already exists in safe form (invitation, not claim) | Escalating from invitation to "I know what you need" | Keep as-is; kept reflections could later feed it under surfacing preference |
| Now What? Themes/Reflections rooms | Pages exist (`app/now-what/themes`, `/reflections`) but **isolated by founder directive** — "no general member MAIA memory inside Now What?" (`lib/maia/presence/place.ts:43`, `maiaService.ts:1225`); HOLD+EXPLAIN | None in v0 | Room names invite exactly the feature this investigation governs — premature convergence | Stays isolated pending ruling |
| Session review | Studio surfaces (`app/studio/session-room`, `/scribe`, `/sessions/[id]`) are **practitioner-facing**; scribe prompt mode is "pure witness… no interpretation"; no member post-session surface exists | The prototype's home is precisely this missing surface — member-invited end-of-conversation reflection | Client-material leakage if practitioner containers ever feed reflection | Container-scoped evidence (Doc B, Case 8); member surface to be designed |
| Sanctuary mode | Guard verified present in the episodes/mark route path | Boundary, not evidence | Any reflection citing Sanctuary content | Absolute exclusion carried into any reflection loader |
| AIN learning / collective | See Doc C §1 — **one live cross-member path** (Circles field pulse, `lib/circles/fieldPulseService.ts`, threshold ≥2, no Stage-2 consent); Corpus Callosum write-only with constitutionally-tested zero readers; `MorphicPatternService` dormant (0 callers, leakage-risk-flagged); `QuantumFieldMemory`/`CollectiveMemoryField` in-memory aspirational | Collective patterns — only via Doc C's staged gates | Private extraction; the pulse standing as silent precedent | Consent membrane (Stage 2), cohort threshold, contribution store — none exist |

### 1.1 Substrate detail (atoms / recall / marks / quotes) — source-verified

**Memory atoms — wired end-to-end.** Loader `lib/maia/memoryAtomsLoader.ts`
(`loadMemberMemoryAtomsForPrompt` L230, `formatAtomsForPrompt` L361) → live route
`app/api/sovereign/app/maia/list/route.ts` (load L835, injected into FAST/CORE/DEEP
prompt assembly L981/L1058). Three columns matter enormously to this design:

- **`member_response_status ∈ {confirmed, rejected, modified}`** + `member_response_at`
  (migration `20260702000002`, coherence CHECK). **The ratification grammar already
  exists in schema.** Only `rejected` has a live writer
  (`app/api/sovereign/atoms/[id]/decline/route.ts`); `confirmed`/`modified` are reserved
  forward-compat with no writer. The reflection grammar (recognized/revised/not-true) is
  not a new invention — it is the completion of columns already ratified into the schema.
- **`epistemological_status ∈ {observed, reported, inferred, provisional, claimed}`** —
  the observation ≠ interpretation distinction already exists as a typed column.
- **`provenance` JSONB** (GIN-indexed, migration `20260624000002`) + `facilitator_id` —
  audit-history provenance already modeled.

Also verified: `is_breakthrough` (member-only writer, auth-owned, idempotent;
migration `20260524000002`); `return_preference` loader gate (L279); no dedicated
source-quote column on atoms (`body` holds member-typed verbatim only for spontaneous
atoms).

**Conversational recall — wired.** `lib/maia/conversationalRecallBlock.ts` with consent
gate as the first branch (L85, `members.conversational_recall_enabled` default TRUE,
migration `20260524000001`) and Sanctuary suppression (L89); injected at maia/list L989/
L1060 with log marker `[MAIA] conversational-block`.

**Marked moments — wired, exemplary provenance.** Route
`app/api/sovereign/episodes/mark/route.ts` writes `episodic_memories` with
`marked_by_member = TRUE`, byte-exact `verbatim_text`, **all interpretive columns NULL**,
and `source_turn_id`/`source_session_id` provenance (migration `20260531000001`).
Recall gated by `members.episodic_recall_enabled`
(`lib/maia/episodicRecallBlock.ts`, maia/list L883). This is the evidence substrate the
reflection loop needs, already shaped correctly: significance without construal.

**`EpisodicMemoryService`** is NOT this path — one legacy caller
(`MemoryPalaceOrchestrator` → `app/api/oracle/conversation/route.ts`, the near-zero-traffic
lane). Cat-3 built substrate; the moments path above is the live one.

**Quotes — route-first, member-pulled.** `app/api/sovereign/quotes/candidates/route.ts` →
`lib/analysis/extractQuotes.ts`: character-exact lines from the member's own journal,
interpretive fields dropped, **writes nothing**; keeping is the separate mark gesture.
No UI surface yet. (A "quote-wire / developmental publishing" module was not found on
this branch — grep empty; prior project notes referencing it should be re-verified
against the branch they described.)

**Sanctuary — one gap found.** Defense-in-depth exists on session summaries
(`lib/memory/stores/SessionSummaryStore.ts` L54-56 forces null) and reads skip Sanctuary
(`lib/memory/MemberLiveContext.ts` L334/L365), but the episodic-mark route's Sanctuary
guard is **client-side only** — the route has no session-state input and would accept a
mark from a Sanctuary session if called directly. Pre-existing, out of this
investigation's scope to fix, but any reflection loader must not rely on the mark route
having filtered Sanctuary; it must gate on session provenance itself. Flagged for a
separate fix.

## 2. Findings that change the design

### 2.1 "Reject" is deliberately absent from the existing gesture grammar

`lib/psyche/portfolio.ts:624`: portfolio material is "curated via set_aside/archive,
**never rejected**." This is correct for its domain — a member rejecting *their own
authored material* makes no sense; you set your own words aside, you don't refute them.
But a reflection is different in kind: it is **MAIA's construal**, and refusing a
construal (`not-true`) is essential to authorship. The two grammars must not be merged:
atom gestures curate member material; reflection responses adjudicate MAIA construals.
The closest existing ancestor of `not-true` is the practitioner-observation
decline/withdraw flow (`keep-capture/page.tsx:144-153`, `member_response_status`) — a
member responding to *someone else's* observation about them. That is the correct
precedent, and it already exists. **Ruling for Kelly**: confirm that `not-true` applies
only to construals, never to member-authored material, so the "never rejected" doctrine
and the reflection grammar coexist without contradiction.

### 2.2 The live near-miss: unratified theme inference already influences prompts

The recurring-theme pipeline (`participatoryRealityHelper` → `member_theme_signals` →
prompt injection + Circles pulse) is, functionally, a reflection engine **without the
ratification grammar** — system-inferred, member-invisible (no review surface), ambient
in prompts, and cross-member at the pulse. It predates this investigation and is not a
violation of anything ratified, but it is the sharpest demonstration of why the
grammar is needed: the platform already construes; it just doesn't yet ask. Any
reflection prototype should either subsume this pipeline under the ratification model or
explicitly quarantine it (Doc C §9.7; Doc A §12).

### 2.3 The speech-act boundary is the right foundation

`maiaVoice.ts:500` already enforces "may reflect that something matters; must never claim
it was kept." The reflection grammar is the natural extension: *may observe with
citations; must never conclude; only the member confirms.* This can be framed as
continuous with ratified canon rather than a new regime.

## 3. What is genuinely missing (consolidated)

1. Reflection object + member-response grammar (no substrate records agreement/refusal
   to a construal — except the practitioner-observation decline, the precedent to extend).
2. Recurrence assembly with checkable citations (theme detection counts, but cites
   nothing).
3. Member review surface for system-inferred themes.
4. Rejection-suppression mechanism.
5. Member-invited reflection surface (end-of-conversation seam).
6. Any collective consent membrane (Stage 2 of Doc C) — including for the already-live
   Circles pulse.
