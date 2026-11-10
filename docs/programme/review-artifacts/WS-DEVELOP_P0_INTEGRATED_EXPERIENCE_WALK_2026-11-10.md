# WS-DEVELOP-P0 — Integrated Experience Walk

**Owner record:** Writer's Studio #1800 · continuity #1982 · draft PR #2208 · merged density spec #2207
**Standing:** evidence for founder review. **P0 remains HOLD.** No source promotion, merge, deploy, release, production change or beta expansion is requested or implied. #2208 stays draft. No source file was modified.
**Kept separate and untouched:** standing manuscript read scope · cross-chapter knowledge continuity · Class A security remediation (H1 #1969) · every release decision.

## 1 · What was walked

| | |
|---|---|
| **Source** | `895ffbc61c42ec0147dab989f5f309a7e99e0eb9` on `claude/ws-develop-p0-candidate-20261110` — a **freshness merge only** of #2208 `a70bd1cc66b0` and canonical `b3f246b456e5`. **No Develop, Writer's Studio or lib/writersStudio source differs from #2208** (checked). Tracked tree clean; `package-lock.json` untouched; `npm ci`. |
| **Build** | `next dev` 16.4.3 (**not a production build**), Node 22.23.4, React 19.2.3, `NEXT_PUBLIC_WS_DEVELOP_STAGE=1` |
| **Browser** | Chrome for Testing 153.0.8010.12, 1440×980, one context, one continuous script |
| **Data** | throwaway PostgreSQL 16.15 (UTF-8), fictional writers `bwriter` / `cwriter`, fictional 4-chapter novel; chapter 3 *The Letter* lengthened to ~9,500 characters so scroll and selection are real |
| **Model** | **STAND-IN stub** (`sha256 842d7bb39a8569f0`), reader delayed 25 s. **There is no authenticated or actual MAIA behaviour in this walk.** |
| **Script** | `walk.mjs` `1ed46173f6644b18` · `p0lib.mjs` `0ff35fe98f38c637` · events in `p0-walk-repro/events.jsonl` |

**Evidence classes.** `PRES` presentation only · `REAL` real product pipeline (reader → grounding → classifier → freeze → store → routes → UI) with the stand-in model · `STUB` a stand-in reply · `SEED` a reading restored by URL. **No observation here is hand-seeded:** both readings were produced by the real commission. Their text is the stub's fixed fiction and is bound to the chapter by reference only, so it says nothing about MAIA's literary judgement.

## 2 · P0 acceptance matrix

| # | Scenario | Verdict | Class | Why |
|---|---|---|---|---|
| W1 | Manuscript arrival and chapter stability | **PASS** | PRES | Calm stage, chapter central, View Quiet; chosen chapter shown; scroll 900 and a text selection held after 6 s idle |
| W2 | Writer-initiated conversation with MAIA | **PASS** *(stand-in)* | PRES · STUB | Message sent, reply shown, chapter / View / scroll unchanged, no decision event created. Text-selection survival **NOT TESTED** (moving focus into the box collapses a selection natively). Reply quality **BLOCKED** — stand-in only |
| W3 | Observation arrival without automatic selection or focus capture | **FAIL** | REAL | A real completion **selected observation 1 and showed it** with no writer act, and the lens page **has no chapter on screen**. Focus was *not* moved (PASS) |
| W4 | Explicit observation opening, chapter and View preserved | **FAIL** | REAL | No index exists and an observation is **pre-opened**; the chapter is not on screen while one is open. View was preserved (PASS) |
| W5 | MAIA follow-up without resetting the active thread | **FAIL** | REAL | A reading completing mid-conversation **closed the conversation, replaced the observation under discussion, reset MAIA's panel and discarded the writer's unsent text** (screens below). The follow-up *reply* is **BLOCKED** by the product's consent gate (§4) |
| W6 | Quiet / Balanced / All tools | **FAIL** | PRES · REAL | Transitions work and keep the manuscript central (Quiet 38 → Balanced 38 → All tools 48 → Quiet 38 controls; no decision or scope created). But **Balanced is identical to Quiet**, and **"More ways to explore" silently saved All tools** as the writer's View (F1, reproduced in-walk) |
| W7 | Leave-and-return; account isolation | **FAIL** *(on the newly ruled rule only)* | PRES · SEED | View and chapter restored after a Write round-trip **and** a full reload; a second writer in the same browser saw her own Work and Quiet, nothing of the first, and the first writer's View was intact on return (all PASS). **Temporary observation focus is not cleared** on a new visit (design decision D6) |
| — | Manuscript unchanged across the walk | **PASS** | REAL | digest identical before and after |

**Count:** 2 PASS · 5 FAIL · 0 scenario-level BLOCKED. Each FAIL is a behaviour the 2026-11-10 rulings require that this candidate does not implement. **I did not compare against earlier builds, so no claim is made about whether any of them is a regression.**

## 3 · The decisive observation (W5)

Before the late arrival, the writer was inside an observation conversation: observation **2 of 4** open, MAIA's panel "*We're talking about …*", the consent prompt showing, **her unsent text in the focused box**, and the second reading still "*MAIA is reading…*". After it completed, the page showed the **new reading's observation 1 of 4**, MAIA's panel read "*Shall we talk about what I noticed?*", the conversation was gone and the text was lost. The effect that selects an observation also runs `setTalking(false)` and clears the dialogue prompt whenever the reading changes, and commission completion changes it by navigating.

This was a source-level **risk** in the earlier review; it is now **demonstrated on a real completion.** The writer had *asked* for that reading, and what failed is that its arrival took the screen.

## 4 · BLOCKED and untested, stated plainly

- **Actual MAIA behaviour (all of it).** No provider key exists here; every reply is the stand-in. Nothing in this walk speaks to MAIA's quality, tone or grounding.
- **A follow-up reply in the observation conversation.** The dialogue's own status read: *"MAIA needs to read Section 1 to answer that faithfully. Nothing from your writing has been read yet. Allow MAIA to read this section …"* — the **consent gate working as designed.** It was not exercised, because granting it is a standing-scope matter kept out of this walk.
- **A reading arriving on the calm stage by a real route.** The only path I found (MAIA's offered "Read this chapter") needs a model to offer it.
- **A UI route from the calm stage to a lens page.** None was found; the walk reached the lens page **by URL.** *More ways to explore* only changes the View.
- Chapter 10 (fixture has 4); text selection across transitions; an on-device keyboard/screen-reader pass; production behaviour of any kind.

## 5 · Corrections made during the walk (so the evidence can be trusted)

The first full run produced three verdicts that were **my instrument's, not the product's**, and the walk was re-run from a clean state rather than patched: W2's "selection not preserved" was the browser's native behaviour; W4's "View not preserved" compared against a hard-coded Quiet when the View was already All tools; and W5 never ran because my script re-clicked an already-open disclosure. The database also correctly **refused** my attempt to delete a reading ("*a reading is superseded by a later reading, and the record it anchors is not erased*"), which is why the final run starts from a fresh harness. All three are fixed in `walk.mjs`.

## 6 · Questions for the founder

1. **A reading the writer asked for.** Should its completion show a quiet *ready* state and wait, or take the writer to it? W3–W5 fail on the second reading; the ruling already says the former.
2. **How does a writer reach a lens page from the stage?** If there is no visible route, is that intended?
3. **F1:** is *More ways to explore* a link or a View change?
4. **Does the consent gate inside the conversation belong to P0**, or to the standing-scope lane where it currently sits?

## 7 · Custody

No source file was modified, committed or pushed except this record and the repro scripts. The integrated base is a freshness merge, pushed as `claude/ws-develop-p0-candidate-20261110` (no change beyond the merge) so the SHA can be checked; the `p0-walk-repro/` scripts use container paths and are provided for audit, not as a runnable kit. Screenshots accompany this record in the founder-review message and are not committed. Release HOLD; H1 Class A, R20, merge and deploy holds untouched.
