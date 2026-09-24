# JARVIS-WRITERS-STUDIO-FULL-REDESIGN-01 · A1 (PROPOSED)
## Function Completion + Function Preservation

**Status:** PROPOSAL · no authority until founder adoption
**Parent programme:** `docs/programme/JARVIS_WRITERS_STUDIO_FULL_REDESIGN_01_2026-09-23.md`
(branch `docs/ws-full-redesign-01-pc0-visual-custody-20260923`, commit `cc07fdb98`)
**Parallel custody:** a ChatGPT-run JARVIS flow holds the parent programme record. This file edits nothing of it; it may be
adopted, adapted, or refused by reference. Single writer per file.
**Production mutation authorized:** NONE

```text
Class: B (programme amendment proposal · documentary)
Governing authority: founder direction 2026-09-24 — "shouldn't we be concerned with completing the functions?" → "create a full Jarvis flow to do so"
Current gate: parent PC0 (founder adjudication); A1 adoption decision
Evidence subject: canonical e88688841 · function inventory a781467 · founder corpus 737bbb89 · S1 fidelity bundle a781467
Stop boundary: no code, no route, no flag, no merge, no deploy
```

---

## I. Why this amendment exists

The parent programme reconciles **image → substrate** (PC2) and then wires real substrate (PC5–PC8). It has no rule for the
reverse direction, **live function → design home**. A function that no image draws can therefore disappear without anyone
deciding it should — which is exactly the regression the founder named on 2026-09-23 when the full workspace was briefly
replaced by a bounded host ("what about all of the many functions we built? this is a major regression!").

It also has no track for **finishing half-built functions**: capabilities that exist in code but are orphaned, flag-hidden,
dead-labelled, or split across rooms.

---

## II. Proposed laws

**FP-1 · Function preservation (bidirectional).** Every member-reachable function at canonical `e88688841`
(inventory: `docs/design/writers-studio/shell-fidelity-s1/FUNCTION_INVENTORY.md` @ `a781467`) receives an explicit
disposition before PC5 opens. No function leaves the member's reach except by a recorded founder RETIRE.

**FP-2 · Reachability falsifier.** A committed reachability suite enumerates each CARRY / RELOCATE / COMPLETE function as
(surface, control, expected effect). It must be GREEN at PC5, PC6, PC7, PC8 exits, PC11 and PC13. Required defeat
candidate: the redesigned surface with one carried function removed must go RED on that function by name.

**FP-3 · No decorative capability (all screens).** Extends PC8's rule to every screen: a board object without governed
substrate renders an honest unavailable / not-read / undeclared state, never fixture data on a live route.

**FP-4 · Completion is not new capability.** COMPLETE means finishing or relocating what already exists under its existing
law. Anything requiring new cognition, new stored member data, or a new claim class is NEW CAPABILITY → PC9, opened only by a
PC1/PC2 ruling.

**FP-5 · Screen fidelity instrument.** Each PC3 screen family carries a landmark contract measured from its ledger image and
a falsifier that turns RED on the prior candidate (precedent: S1 bundle `a781467`, ledger #10). The instrument assists PC4;
it never proxies it.

---

## III. Disposition vocabulary

| code | meaning | who decides |
|---|---|---|
| CARRY | live and correct; needs a home in the new composition | PC2 assigns home |
| RELOCATE | live but in the wrong room / unreachable room | founder ratifies |
| COMPLETE | half-built: dead label, split flow, missing return path | founder ratifies |
| FLAG RULING | built, reachable only behind an off flag | founder only |
| RETIRE | removed from member reach | founder only |
| NEW CAPABILITY | board-drawn, no substrate | PC1/PC2 ruling → PC9 |

---

## IV. Proposed function ledger (JARVIS proposal · founder rules)

Line refs are orientation at `e88688841`; `RSC` = `app/writers-studio/rebuild/RebuildStudioClient.tsx`.

| # | function | today | flag | proposed | lands in |
|---:|---|---|---|---|---|
| F01 | Mode nav Write / Develop | RSC:1504, studioMap | – | CARRY (board top nav Home·Write·Develop·Review) | PC5 |
| F02 | EXPLORE · PUBLISH placeholders | studioMap 523-525 | – | RETIRE from nav until real (founder) | PC1 |
| F03 | REVIEW mode placeholder | studioMap 524 | – | COMPLETE → becomes real Review room | PC7 |
| F04 | Work switch ("‹ All Works" only) | RSC:1530 | – | COMPLETE → in-room Work picker (board top-right) | PC5 |
| F05 | Appearance / atmospheres | AppearanceMenu | – | CARRY or RETIRE — collides with fixed board palette | PC1 ruling |
| F06 | Report a bug | BugReportButton | – | CARRY | PC5 |
| F07 | Work card · Make this a Work | RSC:1531-1548 | – | CARRY | PC5 |
| F08 | Book structure tree (read-only) | RSC:1554 | – | CARRY → manuscript panel | PC5 |
| F09 | Structure authoring | /canvas StructuredOutline only | – | RELOCATE into Write | PC5 |
| F10 | Keep a version | /canvas only | – | RELOCATE into Write | PC5 |
| F11 | Materials list · bring in | RSC:1614 | – | CARRY | PC5 |
| F12 | Section editor · autosave · save state | RSC:1730, 1771 | – | CARRY (save engine untouched) | PC5 |
| F13 | Passage hold | RebuildAuthoredBody:41 | – | CARRY (board held passage) | PC5 |
| F14 | Focus toggle · Pure Canvas | RSC:1666-1671 | – | CARRY | PC5 |
| F15 | Footer "✦ Ask MAIA Aa⌄ ☷" (dead) | RSC:1772 | – | COMPLETE (wire) or RETIRE | PC5 |
| F16 | MAIA "•••" (dead) · "Rebuild preview" | RSC:1788, 1513 | – | COMPLETE or RETIRE | PC5 |
| F17 | Gold line (choose keeps) | GoldLine | – | CARRY — PC2 assigns home (no board shows it) | PC6 |
| F18 | Create keeps | /press/manuscript only | – | RELOCATE into Write | PC6 |
| F19 | Passage Interpret / Explore / Ask | RSC:2092 | FOCUS | FLAG RULING; COMPLETE — three tabs send one gesture | PC6 |
| F20 | Suggest · revision desk · alternatives | RSC:2080, RevisionDesk | EDITORIAL (on) | CARRY → board Discuss / Revise / Teach / Reason | PC6 |
| F21 | Apply · Undo · versions · name version | RevisionDesk | EDITORIAL (on) | CARRY | PC6 |
| F22 | Depth dial · editing latitude | RevisionDesk, EditingLatitude | EDITORIAL | CARRY — no board shows them; PC2 assigns | PC6 |
| F23 | MaiaListen (read aloud) | MaiaListen | – | CARRY | PC6 |
| F24 | Chapter review (7 lenses) | RSC:1850 | – | CARRY → Review room | PC7 |
| F25 | Findings · by section · show in manuscript | RSC:1889-1970 | – | CARRY | PC7 |
| F26 | Review Discuss | RSC:1924 | REVIEW_DISCUSS (on) | CARRY | PC7 |
| F27 | Finding standing keep/dismiss/unresolved | Develop :1313 | STANDING (off) | FLAG RULING | PC7 |
| F28 | Develop readings · lenses · custom range | DevelopRoom | – | CARRY | PC8 |
| F29 | Develop "Passage" scope (disabled) | DevelopRoom :678 | – | COMPLETE or RETIRE | PC8 |
| F30 | Refused reading → "Writer Canvas" (lands where no Keep a version exists) | DevelopRoom :944 | – | COMPLETE (fixed by F10) | PC8 |
| F31 | Observation dialogue ("talk with MAIA about this") | DevelopRoom :1214 | – | CARRY | PC8 |
| F32 | Home: begin · import · return · delete · image · history | HomeView | – | CARRY | PC5/PC9 |
| F33 | Import writing (→ legacy /press/manuscript) | HomeView :252 | – | RELOCATE into Studio | PC9 |
| F34 | Sources · transcription · bring to Work | /sources | OCR flag | CARRY; OCR = FLAG RULING | PC9 |
| F35 | /canvas room itself | orphaned | – | RETIRE after F09/F10 relocate | PC5 exit |
| F36 | /writers-studio/review witness page | no link | – | RETIRE or fold into F03 | PC7 |
| F37 | Flagship components + FlagshipWriteHost | unmounted | – | reuse only where earned (parent §III.C); visual authority withdrawn | PC3 |
| N01 | Themes · presence bars · theme chart · key moments | board #08/#10 | – | NEW CAPABILITY — collides with canon ban on Themes-as-lens | PC1 → PC9 |
| N02 | Member-declared Story / Spiral map | boards | – | NEW CAPABILITY (member data custody) | PC9 |
| N03 | Continuity presence grid | Review board | – | NEW CAPABILITY (inference class) | PC1 → PC9 |
| N04 | MAIA "Larger Patterns" · related passages · passage notes | boards | – | NEW CAPABILITY | PC9 |
| N05 | Search · Library | boards | – | NEW CAPABILITY | PC9 |

---

## V. The A1 track, bound to parent phases

| step | act | binds to | exit |
|---|---|---|---|
| FC0 | function census | — | **DONE** · `a781467` |
| FC1 | founder rules on RETIRE / RELOCATE / FLAG rows (docket §VI) | alongside PC1 | ratified ledger |
| FC2 | add reverse column to the master screen contract: every CARRY row gets a screen, region and state | inside PC2 | no CARRY row without a home |
| FC3 | author reachability suite + defeat candidates (suite-first; lethal before any PC5 code) | before PC5 | suite RED on defeat candidates |
| FC4 | execute COMPLETE / RELOCATE rows inside the phase each lands in | PC5–PC8 | phase exit requires its rows GREEN |
| FC5 | regression gate | PC11, PC13 | reachability suite GREEN on the release candidate |

A1 adds no phase and moves no parent gate; it adds exit conditions to existing ones.

---

## VI. Founder docket (smallest decisions)

- **A1-D01** Adopt FP-1…FP-5? (yes / adapt / no)
- **A1-D02** `WRITERS_STUDIO_FOCUS_ENABLED` — passage Interpret/Explore/Ask to members? (production value not witnessed)
- **A1-D03** `WS_STANDING_ENABLED` — keep/dismiss/unresolved on findings?
- **A1-D04** Appearance atmospheres vs the fixed board palette (F05)
- **A1-D05** Retire EXPLORE / PUBLISH from navigation until real (F02)
- **A1-D06** Retire `/canvas` once structure authoring and Keep a version live in Write (F35)
- **A1-D07** No River Between **Write** board exists in the corpus; Write boards exist only in the earlier dark-rail generation. Derive Write from the River Between shell, or commission a Write board first?

---

## VII. PC0 custody findings to hand upward

1. Founder corpus @ `737bbb89` holds **24 of the ledger's 26 unique hashes**. Not found by hash:
   **#05** `00-visual-canon-board-v2.png` (`918083c5…`) and **#23** `Soullab Writer’s Studio Review Dashboard(3).png` (`b46562a7…`).
2. Corpus `SHA256SUMS.txt` lists `.DS_Store`, which `.gitignore:185` excluded; from the repository 124/125 lines verify.
3. `docs/design/writers-studio/flagship/ref-c-develop-themes-revised.png` is a re-encode of ledger **#10** — the corpus file is the authority.
4. S1 shell fidelity (`a781467`) was measured against ledger **#10** (`c3f70882…`): 18/18 GREEN; prior candidate 10/18 RED.
   Proves geometry, palette, text integrity and the MAIA right-side relation at 1536–1024 px only.

---

## VIII. Boundary

Nothing in this proposal is authorized until A1-D01. It changes no code, route, flag, schema or deployment, and it does not
alter the parent programme record.
