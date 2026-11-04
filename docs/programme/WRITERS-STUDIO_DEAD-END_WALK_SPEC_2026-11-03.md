# Writer's Studio — Dead-End Walk Specification (Write & Develop)

**Date:** 2026-11-03 · **Companion to:** `WRITERS-STUDIO_WRITE-DEVELOP_FUNCTION_INVESTIGATION_2026-11-03.md`
**Purpose:** a repeatable walk through the Write and Develop case studies that proves **no step ends in a dead end**, meaning the writer clicks something and nothing visible happens, or reaches a state with no way forward.

**Definition used throughout.** A step is a *dead end* if, after the writer acts, none of these is visible: the request was **sent**, it was **held** for a gate the writer can answer, a **reason** was shown, or the **room/table it names opened**. A state is a dead end if the writer cannot reach a lawful next action from it.

> **Authority note.** This file defines a walk. It does not open a JARVIS lane, change a gate, or authorize any deployment. Opening a lane to run it is a founder act (see §5).

---

## 1. What is already automated (CI, runs on every change)

| Guard | File | What it proves |
|---|---|---|
| **Dead-end sweep** | `app/writers-studio/__tests__/writeViewDeadEndSweep.interaction.test.tsx` | 6 passage actions (Focus, Craftsman's Table, Discuss, Teach me about this, Revise, Go deeper) × Living Work (none / one) × privacy posture (unanswered / Ordinary / Sanctuary) × MAIA relationship (none / begun) = **72 combinations**. Each must end sent, held, reason-shown or opened. **Never silent.** |
| Regression pins | `writeViewDeadEnds.interaction.test.tsx` | "Suggest an edit" tells the server the writer asked for wording; actions are *held*, not dropped, while a gate is open; with no Work the reason names a Living Work. |
| Craft Save/Apply | `craftsmansTableR1.interaction.test.ts` | A writer who pressed **Keep mine** can still Save and Apply; kept marks are never sent to the server. |
| Real-view entry | `jarvisActualWriteCraftEntryR1.interaction.test.tsx` (now registered in `jest.config.js`; it was previously never run) | Craft opens only on the writer's choice; Save, Apply, Undo are separate gestures; changed Work or revision never exposes an old draft. |

These use a **fictional manuscript and inert providers**. They prove the interface never goes silent. They do **not** prove MAIA's model answers are good, nor that production configuration is right.

---

## 2. Case-study walk (what a live walker does)

Mark each step **PASS**, **DEAD END** (and say what was clicked) or **BLOCKED-BY-CONFIG** (and which flag/permission).
"Automated" means the interface behaviour is covered by §1; the **live** column is the part only a real session can prove (model reply quality, network, production flags).

### CS-1 · First-time author brings a manuscript in
| # | Step | Expected visible outcome | Automated | Live |
|---|---|---|---|---|
| 1 | Sign in as an invited tester | Lands in the Studio, not the invitation page | — | ✔ |
| 2 | Home → Import writing → choose `.docx` / `.pdf` / `.txt` | File name shows; a refusal, if any, says which Word feature and why | parse guards | ✔ |
| 3 | Review structure | Text imports; notices say what stayed in the original (pictures, flattened tables) | docx fidelity tests | ✔ |
| 4 | Confirm headings → Open in Write | The chapter opens in Write | — | ✔ |
| 5 | Check the original was stored | A new row in `writer_source_landing_intents` at `ARRIVAL_RECORDED` | — | ✔ (query) |

### CS-2 · Writer revises one passage
| # | Step | Expected outcome | Automated | Live |
|---|---|---|---|---|
| 1 | Press **Edit**, select words that occur once | **Work with passage ›** appears. In **Prose** view a hint says "press Edit and select the words" | ✔ pill; hint is copy only | ✔ |
| 2 | No Living Work | Every menu action shows the Living Work reason; menu stays open | ✔ sweep | ✔ |
| 3 | Posture unanswered / no MAIA relationship | The action is **held**; the panel asks the gate; it continues after the answer | ✔ sweep (held) | ✔ (continuation) |
| 4 | **Discuss** | MAIA replies; **no edit mark appears** (discuss-first is correct) | ✔ sent once | ✔ reply |
| 5 | Craftsman's Table → **Suggest an edit** | MAIA's reply can include **edit marks** (the request now says "propose wording") | ✔ flag sent | ✔ model |
| 6 | Click a mark → Use this / **Keep mine** / Write it / Another way / Why? / Teach me | Each responds; Keep mine no longer blocks later steps | ✔ | ✔ |
| 7 | **Save my version** → **Apply my version** → **Undo** | Saved, applied, undone as separate gestures | ✔ | ✔ (write path) |

### CS-3 · Writer writes their own replacement
Write here → Use this as my working copy → Save → Apply. **Automated:** ✔. **Live:** confirm the applied text appears in the chapter and Undo restores it.

### CS-4 · Writer learns a craft idea in their own passage
**Teach me about this** (and the 10 other Teach entry points). **Automated:** the menu entry only. **Live (required):** only 1 of ~11 entry points has ever been walked live. Walk each and record what MAIA says and whether it ends with a question.

### CS-5 · Author checks structure
Develop → Structure lens → Read → observations with evidence → "Restore chapter structure" (if headings were lost) → proposal → adopt. **Live only** (model-backed). Known gap: no UI to rearrange, split or merge chapters (WS2-08B–E need a founder act). Walk it and record "no way to do X" as a **finding**, not a pass.

### CS-6 · Author works a whole chapter
Develop → starters (e.g. "Help me see the shape") → reading → Edit with MAIA / editorial pass → "See in manuscript" → back to Write. **Live only.** Confirm the return path works from every entry (Develop → Write → Develop).

### CS-7 · Review after revision
Review → "How does the chapter hold now?" → Deep Review → Saved Reviews → Discuss a finding. **Live only.** Discuss needs `WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1`; a failure should say so, not only "failed".

### CS-8 · Gate edge cases (must each show a reason or a hold)
Sanctuary on · MAIA revisions paused · passage changed after selecting · two Living Works include the manuscript · manuscript with several chapters opened without `?m=` · a repeated phrase selected · browser blocks localStorage.

---

## 3. Exit criteria

The walk passes when **every step above is PASS or a recorded BLOCKED-BY-CONFIG**, and **no step is DEAD END**. A DEAD END becomes a defect with the exact click that produced it. **Gaps in capability** (e.g. no way to split a chapter) are findings, and are never marked PASS.

## 4. Known, deliberate limits (not dead ends)
Under Sanctuary, passage acts, Save and Apply are intentionally unavailable. Kept ("Stet") marks last only for the session; the saved version holds the writer's wording. PDF/EPUB export and permanent erasure are not certified.

## 5. Running it through JARVIS (needs a founder act)

This spec is written so a JARVIS lane can consume it: each case study is a sequence of (action → expected visible outcome → evidence). To run it as a lane, JARVIS needs:
1. A founder-authorized lane charter (this session does not open one).
2. A logged-in tester session on soullab.life (JARVIS cannot sign in for itself).
3. Evidence capture per step (screenshot + the `/api/writers-studio/editorial/*` network status).
4. A stop rule: a DEAD END stops that case study and files a defect; it is never skipped.

Until that exists, the **automated sweep in §1 is the always-on guard**, and CS-2 to CS-8 are walked by hand with this table.
