# WS-CRAFT-CONVENTIONS-01 · Merge-readiness summary (2026-11-09)

```
STATUS:     READY FOR INDEPENDENT REVIEW. Not merge-ready: the gates in §5 are owed.
            Merge and deploy remain separate founder acts.
LANE:       WS-CRAFT-CONVENTIONS-01, inside the Writers Academy lane (no new lane).
BRANCH:     feature/ws-work-continuity-part-a-suite. HEAD at the time of writing is the commit that
            adds this file. 100 commits ahead of canonical clean-main-no-secrets 84e12cf00, 0 behind.
            18 local commits are not pushed.
⚠️ SHARED:  the branch also carries the Develop redesign lane and the Sanctuary/quote fixes (other
            sessions). A merge decision covers the whole branch, not this lane alone.
DECISION:   founder, "agreed" (2026-11-09): stop tuning wording; no mechanical count check for now.
```

## 1. What MAIA does differently because of this lane

| # | Behaviour | Where | Ruling |
|---|---|---|---|
| 1 | Holds writing, editing and publishing conventions as knowledge of what writers commonly do, never as a measure of the writer's pages (seven rules) | Passage Focus + Develop | Rulings 1, 2 (approved wording) |
| 2 | Does not raise spelling, punctuation, dialect or surface consistency unless the writer asks or asked her to keep watching | Passage Focus + Develop | Ruling 8 (founder's exact ruling; wording revised twice) |
| 3 | Answers at the level the writer asks about, names it when helpful, moves to a smaller level only by the writer's choice, asks once "is this part staying?", and offers another level only as a closing choice | Passage Focus + Develop | Design §2–§3 and §5a (model and wording approved) |
| 4 | Gives professional editing names (line edit, copyedit, substantive, developmental) on request or at Direct; plain Studio names otherwise | Passage Focus + Develop | Ruling 3 (best practice) |
| 5 | The Develop conversation carries the text-accuracy rule (first turn) and the full integrity rule (later turns) | Develop | G-1 (approved) |
| 6 | "Ask MAIA where next" follows the writer's own focus, in manuscript order, with no implied importance; with no focus she asks | Passage Focus (both call sites) | G-5 (approved option (a)) |
| 7 | The Develop conversation uses the writer's working-style preference and offers "Teach me about this"; only the writer's click sends a teaching turn | Develop | G-3 (best practice; UI pattern agreed with the redesign session) |
| 8 | Leaves out counts the writer did not ask for, and counts the exact words an edit changes | Passage Focus + Develop | Founder: "Yes, add and measure", "Yes, target it" |

Runtime files touched (diff against the lane's starting commit `6f91eda56`):
- `lib/writersStudio/editorialDepth.ts`
- `lib/manuscript/ask/askReader.ts`
- `app/api/sovereign/manuscripts/[id]/ask/route.ts`
- `lib/writersStudio/askClient.ts`
- `lib/writersStudio/studioActions.ts`
- `lib/writersStudio/passageActs.ts`
- `app/writers-studio/canvas/WorkConversation.tsx`
- `app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx` (one line)

There are no migrations, no schema changes, no new provider, and no stored data about the writer.

## 2. This lane's commits

**Rulings 1, 2 and 8:**
- `2a49e3a34` convention stance (rules 1–7)
- `ca0ddf11e` ruling 8, and both rulings reach the Develop conversation
- `22bc7a129` ruling 8 wording revision 2, plus the editorial-process design
- `457f67a49` the design uses the existing Develop offers
- `28916a915` ruling 8 confirmation run

**Levels and G-1:**
- `3ea7aeb55` G-1
- `da059359f` records the G-1 ruling
- `04927892c` records the level-model approval
- `794b7dce2` the levels directive
- `eb8b5231d` Studio walk of the levels, and the G-5 finding
- `f3d53b895` founder correction: replies are judged by level-fit and organization

**G-5:**
- `8c08e598f` G-5
- `4047487a8` the older call site routed

**Accuracy and counts:**
- `c0a4aa76d` direct accuracy, 54/54
- `e327fb111` passing counts measured
- `142b0bff6` passing-counts sentence
- `d203457da` edit-arithmetic sentence

**Ruling 3 and G-3:**
- `38f7217dd` ruling 3, and the G-3 server side
- `3114482bb` the G-3 UI

Plus this summary.

## 3. Evidence

All in `WS-CRAFT-CONVENTIONS-01_STANCE_WITNESS_2026-11-09.md`. Runs are in
`tests/witness/craft-conventions/runs/`, and every run is kept, including the defective ones.

| Claim | Evidence | Class |
|---|---|---|
| Conventions described as practice, with variation; no verdicts on the writer's choices | §4, runs 2–3 (13 cases, before/after) | Instruction-level, read by Claude |
| No unasked surface remarks | §7.1–7.2: 22/36 → 6 → 2 → **0/36, twice** (72/72), all three depths; correction, watching and teaching hold | Instruction-level |
| Levels hold | §9 run 8 (all depths), §10 **Studio walk** in Develop and Passage Focus | Instruction-level + real Studio (fictional harness) |
| G-1 | §8 Develop walk: exact counts and quotation; a false claim about her own earlier answer refused | Real Studio, single sample, no measured gain |
| G-5 | §11.1: ranking phrases 7/9 → 0/9; asks with no focus | Instruction-level |
| Ruling 3, G-3 | §13 run 10; §13.1 **real-model check**: offer shown, clicked, teaching shape returned | Instruction-level + real Studio |
| Accuracy | §12: direct questions 54/54 (twice); passing counts ~93% → ~94–96%; edit arithmetic in Passage Focus ~40% → ~4% | Mechanical truth + hand reading |

**Gates at the last code commit:**
- Guard tests for every directive pin the code to the approved text.
- In `lib/writersStudio`, `lib/manuscript/ask`, `app/writers-studio` and `app/dev`, the only
  failures are suites that were already failing before this lane: `askSourceCloseout`,
  `manuscriptImportWork`, listen ×6, and `kdpCoverGeometry`.
- Typecheck: 214 against a baseline of 214.

## 4. What this evidence does not establish

- **"Describes, not prescribes" is Claude's reading, not an independent witness.** The ACAD-1
  contract keeps it a human-witness item.
- **Every walk was on the founder's fictional harness, by Claude.** No writer other than the
  founder has used any of this.
- **Most measurements are one or two samples per case**, so they are indications, not rates.
- **There is no production witness.** Nothing is deployed.
- **Not walked:**
  - whether the older "where next" call site is reachable in the live Studio;
  - the Living Work conversation route, which receives no working style or teaching anchor;
  - the interaction between the integrity rule's "treat nothing said earlier as established" and
    Develop's "do not say you were mistaken when the text changed". The other session's tests
    pass, but this was not walked after an actual edit.
- **One systematic slip remains:** "Mara stood at the window" is miscounted as four words.

## 5. Gates owed before a merge decision

1. **Independent review** of the eight runtime files above by someone other than this session, for
   example `/code-review` or a human reviewer. Focus: prompt composition order, the hash coverage in
   `workAskPromptHash`, and the WorkConversation send path (draft untouched by Teach me).
2. **A non-founder writer walk** (the Academy roadmap's Jondi or ACAD-5 walk) on a fictional or
   their own Work. Questions: does MAIA meet them at their level; is the reply organized; were
   there any unasked surface remarks; does Teach me help.
3. **Branch-level readiness.** The branch carries other lanes, so their owners' gates apply too
   (the redesign session's walk evidence; Sanctuary negative suites).
4. **Push.** 18 commits are local only.

Then come the founder's merge decision and, separately, the deploy decision with its production
witness.

## 6. Open items, deliberately left

- **Style sheet (ruling 4):** held until after Jondi's walk.
- **Academy library:** ACAD-3 (the founder writes the ideas) and ACAD-4 (wiring) are not started.
- **Mechanical count check:** not built (decision above). Revisit only if writers notice
  miscounts.

## 7. Independent review (2026-11-09; founder: "Run the review")

A separate reviewer was given the eight runtime files, the intent and the hard constraints, but not
this session's conclusions. It made a read-only review of `git diff 6f91eda56..HEAD`. Each finding
was then checked against the code by this session.

| # | Finding | Verified | Disposition |
|---|---|---|---|
| 1 | `workAskPromptHash` always hashed the full integrity rule, while a first turn runs only text accuracy, so the hash named a prompt that did not run | **Real** (high) | **Fixed:** the hash takes `hasHistory` and names `workIntegrityRules(hasHistory)`; `askMaia` passes `history.length > 0`. Test: first and later turns carry different, matching hashes. |
| 2 | "or I have chosen the Direct depth" can never fire: no prompt names a depth "Direct", and Develop uses a different depth vocabulary | **Real** (wording) | **Fixed:** the wording now says "…unless I ask what an editor would call them, which holds at every depth, or you have been asked to use the full editorial vocabulary". That matches Direct's own text ("Use the full editorial vocabulary"). It is drafted under the ruling-3 delegation. |
| 3 | Guided ("no technical terms, do not define them") contradicts giving names on request | **Partly**: run 10 showed Guided giving "line edit" when asked | **Fixed with 2:** "which holds at every depth" states the precedence. |
| 4 | Teach me can be offered with no passage in view (no `sectionId`), so MAIA is asked to teach "this passage" with none | **Real** | **Fixed:** no button without a passage in view. Test added. |
| 5 | A Teach me button from before Sanctuary stays clickable after Sanctuary is turned on, and sends a teaching turn there | **Real, judged not a violation** | A teaching reply is ordinary conversation. Sanctuary keeps nothing, and nothing is granted, saved or read beyond what the turn already has. The same holds for other non-acting offers. Recorded, not changed. |
| 6 | A failed Teach me showed "your question is still in the box", when the box holds the writer's unrelated draft | **Real** | **Fixed:** its own message ("…Nothing you wrote was changed; press it again…"). Test added. |
| 7 | The Living Work route never sets `sanctuary`, so in Sanctuary MAIA is still told about grant-reading and the other offers there | **Real**, in the other session's Sanctuary fix | **Handed to that session** with the fix suggested. Not changed here (their file). |
| 8 | Some prompt parts (Sanctuary text, the studio guide and actions instruction) are not in the hash | **Real, mostly pre-existing** | Recorded. Hashing the whole composed prompt would be its own change, coordinated with the hash's other users. |

**Gates after the fixes.**
- `lib/manuscript/ask`, the Teach-me and convention suites: the only failure is `askSourceCloseout`,
  which was already failing.
- Wider run (`app/writers-studio`, `app/dev`, `lib/writersStudio`): only suites already failing
  before this lane.
- Typecheck: 214 against a baseline of 214.

**Effect on §5.** Gate 1 (independent review) is done for this lane's files, apart from finding 7 (the
other lane's) and finding 8 (recorded). Gates 2–4 remain.

## 8. Pushed (founder: "Push it", 2026-11-09)

`feature/ws-work-continuity-part-a-suite` was pushed to origin: `72228a0c4..46b7b25ee`, 20 commits,
local and remote now level. Gate 4 (§5) is done. Still owed:
- gate 2: a non-founder writer walk;
- gate 3: branch-level gates for the other lanes on this branch;

then the founder's merge decision, and separately the deploy decision.
