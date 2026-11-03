# Writer's Studio — Write & Develop: Full Function Investigation

**Date:** 2026-11-03 · **Code examined:** production SHA `02cb39406` (canonical `clean-main-no-secrets`)
**Method:** four independent read-only code investigations (Write room · Suggest-an-edit pipeline · Craftsman's Table / Focus / Discuss / Teach · Develop + Review + gating), then the two headline defects re-verified by hand against the source.
**Status:** nothing was changed, committed, deployed or run. No production data, logs, database or environment were read.

> **How to read the evidence.** Every claim is marked **CODE-PROVEN** (read in the source, file:line given), **DOCUMENTED** (stated in a dated repo record, may be stale), or **UNVERIFIED** (only your live site or server can confirm). This report never presents an UNVERIFIED item as fact.

---

## 1. The short answer

You have asked for this many times and it still does not work. The investigation found **two defects in the code itself** that explain the symptoms you describe, and **several production-configuration questions only your server can answer**.

### Confirmed code defects (CODE-PROVEN, verified a second time by hand)

**D1 — "Suggest an edit" cannot produce an edit on a first request.**
The button (`CraftsmansTableR1.tsx:790-794`) tells the app "the writer is explicitly asking for a proposal." The function that forwards the request (`sendCraft`, `P4R1Pc3WriteEditView.tsx:1365-1372`) forwards only three of the four options and **drops the "yes, propose now" flag** (`proposalRequested`). The server has a "discuss first" rule: at the default setting (latitude 1, "suggest wording straight away" off) and on the first exchange of a thread, MAIA's option to propose wording is removed (`sequence.ts:72-81`, `turn.ts:375`). So MAIA discusses or asks a question, no edit mark appears, and nothing tells the writer why. Every other path that asks for edits (Passage Focus "Show edit options") keeps the flag; only the Craftsman's Table path loses it. The same defect affects "Try wording here" and the other proposal buttons in MAIA's Craft companion (`MaiaCraftCompanionR1.tsx:453/489/501/513`).
No test covers this button, which is how it survived.

**D2 — "Keep mine" blocks Save and Apply.**
In Craftsman's Table, clicking **Keep mine** (Stet) on a mark stores the choice only in browser memory. **Save my version** then sends that choice and the server refuses it (`workingSave.ts:148`, error `settled_choices_not_persisted`); the writer sees "Save cannot yet preserve settled Craft choices separately" (`P4R1WriteEditController.tsx:1663-1664`). **Apply my version** requires a saved version (`CraftsmansTableR1.tsx:332`), so a writer who kept any mark can neither save nor apply until they press **Reopen** on every kept mark. The UI invites Keep mine as a normal move.

### Likely configuration causes (UNVERIFIED — need one read-only check on the server)
Everything that calls MAIA in the Write room is behind a server switch, `WRITERS_STUDIO_EDITORIAL_ENABLED=1`, which the code defaults to **off** and which is not in the repo's compose or env files. Repo records dated 2026-11-01 to 11-03 say it is on in production and show founder Focus conversations working, so it is **probably on** — but nobody has re-verified it at the current version. See §8 for the exact check.

### Why it feels like "nothing happens"
The design fails **silently** in many places: buttons that return without a message when there is no Living Work, menu items that drop the request if the privacy posture or MAIA relationship isn't set yet, a selection that never shows the "Work with passage" pill if the words appear twice in the section, and a Prose view that shows no pill at all. Each of those is listed below.

---

## 2. What is actually mounted on soullab.life

- `/writers-studio?mode=write|develop|review|…` mounts **`P4R1StudioHost`** (`app/writers-studio/page.tsx`).
- The folder is named `app/dev/...`, **but that is only a folder name — these are the production rooms.** `P4R1WriteEditController` + `P4R1Pc3WriteEditView` (Write), `P4R1DevelopController` + `P4R1DevelopView` (Develop), `P4R1ReviewController` (Review).
- Older, separate implementations exist but are **not reachable** from the production host: `flagship/WriteRoom.tsx`, `FlagshipWriteHost`, `rebuild/DiscussLayer.tsx`, `full-redesign/DevelopRoom.tsx`, `ReviewRoom.tsx`, `develop/DevelopRoom.tsx`. `/writers-studio/rebuild` and `/writers-studio/develop` redirect into the canonical host (`proxy.ts:751-756`).
- **Consequence:** the original Focus route `POST /api/writers-studio/focus` (consent, receipts) has **no caller in the live UI**. Observation "Standing" (Keep/Dismiss) has **no UI** in the live Develop.

---

## 3. Write room — selecting a section or passage

**Selecting a section:** click a chapter/section in the manuscript rail, or Previous/Next (`go()`, View ~:476). CODE-PROVEN.

**Selecting a passage:** there is no click handler; the app listens for `selectionchange` (`:537`). A passage is accepted only if:
1. the selection is inside the **Edit** editor (`[data-write-editor]`) or an active section textarea, **and**
2. the selected words occur **exactly once** in the section (`locateUniquePassage`, `editorialCollaboration.ts:493-501`).

If either fails, the **"Work with passage ›"** pill silently does not appear. Known ways to lose it:
- **Prose view (the default for multi-section chapters) shows no pill.** The member must press **Edit** / **Edit this section** first.
- Repeated or very short phrases never match.
- The pill hides while Craftsman's Table or Focus is open.
- (Speculation) selections spanning a single line break may not match the raw text.

---

## 4. "Work with passage" — every option, and what each does

All MAIA-backed options go through one path: Work + Ordinary posture + confirmed MAIA relationship + server flag → `POST /api/writers-studio/editorial/turn`.

| Option (exact label) | What it does | Verdict | Where it can fail |
|---|---|---|---|
| **Focus** | Opens the isolated passage room (`IsolatedEditorialRoom`) | PARTIAL | Silent no-op if the manuscript is not in exactly **one** declared Living Work |
| **Craftsman's Table** | Opens the Craft workbench on the held passage | PARTIAL | Silent no-op with no Living Work; refuses with a visible notice if the passage/revision changed |
| **Discuss** | Sends a reply-only "discuss what's happening" turn | PARTIAL | Request is **dropped** if posture unresolved or no MAIA relationship; no relationship/posture hold |
| **Teach me about this** | Sends a teaching turn (`teachingAnchor:'passage'`) | PARTIAL | The **only** item that holds its request until you answer posture/relationship gates; still silent with no Work |
| **More ways to work → Revise** | Asks MAIA to revise wording | PARTIAL | Same as Discuss |
| **More ways to work → Go deeper** | Direct-depth turn | PARTIAL | Same as Discuss |
| *(no "Suggest an edit" in this menu)* | It exists only inside Craftsman's Table | — | See D1 |

"Mark" and "Keep" (line marks) exist on **Home only**, not in the Write passage menu.

---

## 5. Craftsman's Table — complete option tree

**Header:** Write · Craftsman's Table — "The writing is the workbench."
- **Craft view:** Markup / Preview.
- **Marks:** Guided / Professional notation (delete, insert, replace, transpose `TR↗`, `#`, `⌒`, `¶`, `No ¶`, caps, lowercase, `STET`; "Keep mine" reads "Stet · Keep mine").
- **Focus tools** (`CraftFocusToolsR1`): Previous passage · Next passage · Stay here · Choose passage · Ask MAIA where next · Work here · Earlier work/Return here · Saved working versions/Open saved version.
- **Kept chips:** "Kept: …" with **Reopen** each.

**Work with the focused passage**
- **Suggest an edit** — asks for one small edit. **Affected by D1.**
- **Discuss** — reply-only.
- **Write here** — opens "Edit your working passage"; buttons **Use this as my working copy** / **Cancel**. Purely local; works.

**Click a change mark → "Edit options for change N"** (Insert/Delete/Replace; Esc closes):
- **Use this** · **Keep mine** (Stet in Pro) — **affected by D2** · **Write it** (→ "Use my wording"/Cancel) · **Another way** · **Why?** · **Teach me**.

**Footer**
- **Compose:** Write from mine · Edit current hybrid · Start from MAIA.
- **Save my version** (blocked by D2 once anything is kept) · **Apply my version** (needs a saved version) · **Undo**.
- **Next focus →:** Continue in order · I'll choose · Ask MAIA.

**MAIA Craft companion (right pane):** Ordinary/Sanctuary posture · Stop/Resume revisions · "Keep these exact words" · "Help me find a way to ask" · free text "Talk with MAIA about the writing" · **Ways to work:** Discuss, Try wording, Examples, Ideas, Lighter, Keep more of mine, Another option, Why this?, Teach me, Go deeper · **Edit strength** (latitude slider; "may suggest removing a whole paragraph"; "may offer wording without waiting for me to ask").

**Passage Focus room cards:** *Work on the words* — Show edit options, Discuss what's happening · *Explore* — Show me examples, Give me ideas · *Learn* — Teach me about the writing, Go deeper · open box "What do you want to do with this passage?" · after a reply: Teach me more, revision directions, Make it lighter, Keep more of mine, Go a little further, Another option, Restore a part, Talk it through, Save my version, Apply my version, **Undo this change**, Why this works / Teach me why / Advanced craft view · Preferences (working style, edit strength, explanation depth).

**Storage:** kept marks, decisions, direct drafts, view and notation are **browser memory only** (by design, per the code comment at `CraftsmansTableR1.tsx:225-227`). Saved versions → `/editorial/save-working`; applying → `/editorial/adoption`; MAIA turns → `ask_threads`/`ask_turns`. Latitude and `maia_settings` posture live in `localStorage`.

---

## 6. Discuss, Focus, Teach — status

- **Discuss (Write):** WIRED through the editorial API; gated by flag + Work + relationship + posture. The old `DiscussLayer` is **dead** (not mounted anywhere).
- **Discuss (Review finding):** needs `WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1`; the UI shows the control regardless and a flag-off failure reads as generic "failed."
- **Focus:** the room works through the editorial API (a founder witness on 2026-11-02/03 ran fresh Passage Focus conversations). The separate `/api/writers-studio/focus` boundary route is **unreachable from the UI**.
- **Teach me:** about 11 entry points exist (Passage menu, Focus cards, Teach me more/why, Craft change "Teach me", Ways-to-work, revision mark, observation "Teach me why", Develop "Teach me what is happening"). **Only one has been walked live** (Academy roadmap row 2c lists the other ten as not walked). The Academy/F1 record says production at `a4dd6fc85` did **not** contain F1.
- **Guided / Learning / Direct "facets":** exist only as per-act depth ("Teach me" / "Show me examples" → learning; "Go deeper" → direct), **not** as a persistent selector. Develop's View "Focused / Guided / Full" is disclosure depth and collides in name with the ratified FACETS-01 (open question F2).

---

## 7. Develop and Review — what a tester can do

**Develop (live, no feature flag):** Prepare this Work for Develop · View Focused/Guided/Full · ten starter conversations (Just exploring, What does MAIA think?, Something feels off, Help me see the shape, …) · lens readings (Overview, Development, Structure, Arc, Themes, Voice, Coherence, Continuity, Reader) over whole Work or a range · reading display with evidence and limits · Themes (noticings, add/dismiss/restore) · writer-declared understanding + MAIA whole-Work reflection · **Edit with MAIA / editorial pass** (ordered suggestions, nothing applies without the writer) · chapter read, scorecard, in-book fit, movement, minimal path · Sources/intellectual-lineage orientation and chapter investigation · Restore chapter structure (when import lost headings) · Open in Write.
**Not available:** observation Standing (no UI; two flags off), a "Passage" scope, the Focus composer, PDF/EPUB export, permanent erasure, Co-Lab sharing (channel unset), and the destinations marked "later" in the map.

**Review (live):** "How does the chapter hold now?" quick reread · Deep Review · Saved Reviews with Proof tab · Discuss a finding (flag).

**Caution:** the Develop chapter *scorecard* ("optional craft guide · not a grade") should be checked against the project's rule that MAIA does not grade the writer.

---

## 8. What only your server can confirm (read-only checks)

Run on the production host:
```bash
docker exec maia-sovereign printenv | grep -E 'WRITERS_STUDIO|WS_STANDING|MAIA_INFERENCE|MAIA_EDITORIAL|ANTHROPIC_API_KEY|WRITER_SOURCE' | sed 's/=.*KEY.*/=<set>/'
```
- Expect `WRITERS_STUDIO_EDITORIAL_ENABLED=1`, `WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1`, `ANTHROPIC_API_KEY` present, `MAIA_INFERENCE_MODE` unset or `primary`.
- If editorial is **not** `1`, every MAIA action in Write returns a bare 404 and shows a vague failure.

**One browser check that discriminates D1 from a config problem:** open DevTools → Network, click **Suggest an edit**, and look at `POST /api/writers-studio/editorial/turn`.
- **200 with text but no edit:** D1 (the discuss-first gate). Compare with **Show edit options** in Passage Focus, which keeps the flag.
- **404, empty body:** editorial flag off.
- **502 `structured_refused` / `model_unattributable`:** provider/model/API-key problem (the server log line is `[editorial/turn] refused`).
- **No request sent at all:** no Living Work, posture unresolved, no MAIA relationship, or passage misaligned.

---

## 9. Ranked reasons a tester may see "nothing happens"

1. **D1** — Suggest an edit / Try wording drop the propose-now flag (CODE-PROVEN).
2. **D2** — Keep mine blocks Save/Apply (CODE-PROVEN).
3. **No single Living Work** → Focus, Discuss, Teach, Craft all silently no-op (CODE-PROVEN; depends on the member's data).
4. **No MAIA relationship / posture unresolved** → request dropped; only Teach holds it (CODE-PROVEN).
5. **Prose view shows no selection pill** (CODE-PROVEN).
6. **Passage not unique in the section** → pill silently hidden (CODE-PROVEN).
7. **Editorial/Review-Discuss flags off on the host** (UNVERIFIED; documented as on).
8. **Provider/model/key issue**, including a strict model-id match that fails on a dated alias (CODE-PROVEN risk; UNVERIFIED state).
9. **Beta roster** — non-rostered members are redirected (`betaAccessServer.ts`).
10. **A missing migration** surfaces only as a route error, not a boot refusal (CODE-PROVEN risk; UNVERIFIED state).
11. **Failures read as generic messages** — a flag-off 404 shows "The revision relationship could not be opened just now."

---

## 10. Case studies — what the code supports

**Supported end to end:**
- **S1 Ask a question about a passage** (founder-witnessed): select → Work with passage → Focus → Ordinary → Begin relationship → Ask MAIA / cards.
- **S2 Discuss before changing** (`reply_only`).
- **S3 Revise mark by mark, save, apply, undo** — works if the writer **never presses Keep mine** (D2) and the first exchange has happened or latitude ≥ 2 (D1).
- **S4 Write the replacement yourself** — Write here → Use as working copy → Save → Apply.
- **S5 Learn a craft idea in your own passage** — Teach me about this (one idea, then a question).
- **S6 Move through the chapter** — Next focus (Continue in order / I'll choose / Ask MAIA).
- **S7 Pause or limit revisions** — Stop revisions; Edit strength.
- **Develop:** import → confirm headings → open in Write; lens readings; themes; editorial pass; chapter read/scorecard; lineage; quick reread/Deep Review.

**Implied by the UI but not supported:**
- Kept/Stet choices surviving save, reload or a later session (N1).
- The boundary Focus API from the live Studio (N2); the old Discuss layer (N3).
- Recovering an unsent Craft draft after leaving (N4); any use under Sanctuary (N5).
- A persistent facet selector (N6); a live walk of most Teach entry points (N7).
- Observation Standing; a Passage scope in Develop.
- **Rearranging, splitting or merging chapters** (WS2-08B–E need a founder act).

---

## 11. Docs versus code (claims the code does not support)

- "Develop is flag-gated and out of COLAB-BETA-01 §5" (CLAUDE.md) is **stale**: Develop is a live mode for roster testers; only Standing is flagged, and it is unreachable.
- The Free/Pro table implies `advanced_develop` / `advanced_review` are gated; **no route enforces them** (moot while every roster member is Pro).
- `studioMap.ts` "available/later" describes the legacy shell, not the six-room canonical Shell.
- The 2026-11-01 beta walk **did not** walk Talk with MAIA, starters' model replies, editorial marks, Teach me, correction or Review.
- Conversion-era plans (Elemental arrival, coverage-licensed reading, PASS unit, Compass) have no matching canonical-host surface.

## 12. Founder decisions needed (not code fixes)

1. Run the §8 environment check and record it.
2. Decide whether Standing and the Focus composer are wanted in the canonical host or should be retired.
3. Decide whether `/api/sovereign/manuscripts` (list/create) and ingest should be roster-gated (they are not today).
4. Set the Co-Lab channel for journey sharing, if wanted.
5. Rule the "Guided" naming collision (F2).
6. Decide whether the scorecard is consistent with the no-grading rule.

## 13. Recommended fix order

1. **D1** — forward `proposalRequested` through `sendCraft`, add a test pinning the Suggest an edit → turn request. Smallest, highest value.
2. **D2** — either persist kept choices or let Save proceed without them with a clear message; at minimum stop offering Keep mine when it will block Save.
3. **Silent failures** — show a message instead of returning silently (no Living Work, unresolved posture, passage not unique, Prose view); make Discuss/Revise/Go deeper hold their request like Teach does.
4. **Flag-off messaging** — a clear "not enabled" instead of generic failures.
5. **Walk the Teach entry points and model-backed Develop/Review acts live** and record the results.

## 14. What this report did not do

No code was run; no production state was read; apply/undo write paths and the `draft`/`revisions` routes were not traced end to end; several R20/corrections migrations were not mapped to tables; the passage-pill position in textareas and cross-browser selection events are unverified without a browser.
