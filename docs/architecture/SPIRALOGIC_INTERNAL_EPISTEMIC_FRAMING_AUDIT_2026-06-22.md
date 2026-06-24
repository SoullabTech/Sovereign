# Internal Epistemic Framing Audit — Spiralogic (2026-06-22)

**Read-only / report-only. No architecture change, no behavior change — language audit only.**
Question: *where does MAIA internally speak as though developmental interpretations are
established facts rather than working hypotheses?*

Classification (Kelly's four types):
1. **Operational fact** — "session contains 12 messages"
2. **Runtime observation** — "theme recurred 5 times"
3. **Interpretive hypothesis** — "possible Water quality"
4. **Member-established standing** — "member describes their work as rebuilding"

The leak to find = **#3 phrased as #1** (an interpretation dressed as a measurement) or
**#3 phrased as #4** (an inference dressed as the member's own established position).

## Headline finding

**The cure already exists in the codebase — it just isn't applied uniformly.** Two live
surfaces already model epistemic humility; two others contradict it; one carries the hedge in
data but discards it in language. The correction is **internal consistency**, not invention:
make the certain surfaces speak the way the humble ones already do.

- **Gold standard (already humble):** `sacredMirrorCadenceBlock` — *"name … ONLY if present …
  If absent, say you don't have it yet (do not guess)"*, *"invitational (not prescriptive)"*,
  MIRROR *"no clinical language."* This is the reference register.
- **Honest in data, flattened in language:** `mythicAtlasService` `AtlasResult` carries
  `confidence`, `deliberationRecommended` (true when uncertain, <15% gap), and an `UNKNOWN`
  low-confidence fallback. The model *already knows when it's unsure* — and the prompt rendering
  throws that away by printing "Phase detected: 2".

## Audit table

| # | Location | Exact internal phrasing | Type | Framed as | Leak | Recommended rephrase |
|---|---|---|---|---|---|---|
| 1 | `maiaService.ts:891` | `CURRENT FIELD STATE:` | #3 | established state | **yes** | `POSSIBLE FIELD TEXTURE (working hypotheses — hold lightly, test against what they say):` |
| 2 | `maiaService.ts:892` | `Element detected: {el} ({theme})` | #3 | fact ("detected") | **yes** | `Possible elemental texture: {el} ({theme}) — a lens for attention, not a conclusion` |
| 3 | `maiaService.ts:893` | `Phase detected: {phase} ({theme})` | #3 | fact | **yes** | `Possible developmental movement: {phase} ({theme}) — hold as a working hypothesis` |
| 4 | `maiaService.ts:894` | `User state: {userState}` | #3 (some #2) | fact | partial | `They may be in: {userState} (provisional read)` |
| 5 | `maiaService.ts:897` | `Detection confidence: {n}%` | #1 number on a #3 | truth-probability | **yes (subtle)** | `Signal strength: {n}% (how strong the cue is — not how true the reading is)` |
| 6 | `maiaService.ts:904–905` | `…reference context… your response emerges from your own intelligence` | wrapper | humble | no (good) | **keep** — and make the contents (1–5) match this frame |
| 7 | `ClaudeService.ts:680` | `## MEMBER SPIRAL STATE (This Member's Current Journey)` | #3-as-#4 | established standing | **yes** | `## SPIRAL SENSING (a working read of this member's journey — not established fact)` |
| 8 | `ClaudeService.ts:684` | `Use this to understand where THIS member IS in their spiral journey` | #3-as-#4 | fact ("IS") | **yes** | `a possible sense of where this member may be — the member's own words remain authoritative` |
| 9 | `mythicAtlasService.ts` | `confidence`, `deliberationRecommended`, `UNKNOWN` fallback | #1/#2 (honest) | already hedged | no | **propagate** the hedge into the prompt wording (render low confidence / deliberationRecommended as tentative language or omission) |
| 10 | `sacredMirrorCadenceBlock` | `…ONLY if present… do not guess`; `invitational (not prescriptive)`; `no clinical language` | reference | hypothesis-respecting | no | **use as the template** for 1–8 |

> Note (worth keeping visible): #6 already says the right thing — *"reference context… your
> response emerges from your own intelligence."* The leak is that lines 1–5 inside that humble
> wrapper still speak in detections and confidence percentages. The block contradicts itself:
> **humble frame, certain contents.** Aligning the contents to the frame is the whole task.

## The one reference rewrite (the pattern for all of them)

```
BEFORE                                   AFTER
CURRENT FIELD STATE:                     POSSIBLE FIELD TEXTURE
- Element detected: water (…)            (working hypotheses — hold lightly, test against
- Phase detected: Return (…)              what the member actually says):
- Detection confidence: 87%              - Possible elemental texture: water (…) — a lens, not a conclusion
                                         - Possible developmental movement: Return (…) — hold as hypothesis
                                         - Signal strength: 87% (how strong the cue is, not how true the reading)
```

Member experience is **unchanged** (none of this is surfaced). What changes is how MAIA *holds*
the read — preventing the lens from hardening into a filter.

## Highest-leverage single move

**Render the hedge MythicAtlas already computes.** `deliberationRecommended` / low `confidence` /
`UNKNOWN` are first-class in the data and discarded in the prose. Wiring them into the field
block's language (tentative phrasing, or omission, when uncertain) is the cleanest possible
version of this correction: the humility isn't authored, it's *exposed* — it was there all along.

## Honest residuals (verify while editing, not another pass)

- Verified **Talk/FAST**; **Counsel/Scribe** (Care/Note) prompt assemblies may carry their own
  developmental-language surfaces — check the same lines there before editing.
- `intelligentVoiceAdaptation.ts` (DEEP `buildComprehensiveVoicePrompt`) and `maiaVoice.ts`
  addenda (`spiralSnapshotAddendum`, `bridgedSnapshot`, Wu Xing) were not line-audited here —
  same patterns likely; same rephrase rule applies.
- `ClaudeService` is off the live sovereign path (written intent), but the *pattern* (#7/#8) is
  the one to avoid wherever `spiralInjection` is assembled.

## Bottom line

This is the last trace. The architecture is verified, the surfacing is internal, and the only
remaining gap is a **register**: a handful of internal lines speak in *detections* where the
codebase elsewhere already speaks in *do-not-guess*. Make them consistent and Spiralogic stops
being an interpretive filter and becomes what the rest of the system already treats it as —
a disciplined way of paying attention. After this: build.

---

## Applied — 2026-06-22 (register correction pass; typecheck clean, not committed, not deployed)

Edited (register only — behavior, routing, storage, activation, strip/scrub, and member-facing
output all unchanged):
- **`maiaService.ts`** Talk/FAST field block — rows 1–5 + closing wrapper → hypothesis register.
  Kelly's canonical line *"signal strength is not truth strength"* is now embedded in the prompt.
- **`spiralSnapshot.ts`** — the single high-confidence leak only (`'trust this orientation'` →
  working-read language; `anchor` → `orient`). The rest was already humble (`Phase Read`,
  `clear/possible/uncertain`, "stay open / hold it lightly").
- **`ClaudeService.ts`** (off live path — written intent) — `## MEMBER SPIRAL STATE` → `## SPIRAL
  SENSING`; *"where THIS member is"* → *"a possible sense of where this member may be … the
  member's own words remain authoritative."*

Deliberately **not** edited (scope discipline): DEEP / Counsel / Scribe paths (no "detected"
phrasing present — no edit needed); dormant consciousness-zoo sites (`MAIAMemoryArchitecture`
"you're currently in X phase", `OrbitFlow`, etc.); `ClaudeService:510` (already humble —
*"stays invisible in your words"*); member-facing soulprint export (invited artifact, out of scope).

**Verification:** `npm run typecheck` → exit 0 (clean). **Lint not runnable** — `next lint` is
deprecated (Next 16) and the repo has no ESLint config (drops to interactive setup); changes are
string-literal content only, so no lint surface. **Not committed, not deployed** — working tree
was already dirty with unrelated calendar-proposal changes; the register edits are cleanly separable.
