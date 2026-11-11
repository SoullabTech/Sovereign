# WS-WORK-CONTINUITY — Standing Read Scope + Honest Reading · IMPLEMENTATION AND ACCEPTANCE PLAN (DRAFT FOR REVIEW)

```
STATUS:    DRAFT. RULING TAKEN 2026-11-08 (founder, in chat): YES on the §6 principle
           (standing, revocable, member-declared Work-level read scope; every crossing
           still receipted). The §6 smaller questions remain RECOMMENDATIONS, not ruled.
           The ruling authorizes NO implementation: source, migration, merge and deploy
           each remain separate founder acts, and the plan still awaits review.
LANE:      Writer's Studio owner record #1800, under Soullab Continuity #1982.
NOT:       source mutation · migration · merge · deploy · a ruling · a canon edit.
EVIDENCE:  code-read at canonical 8446b5645d4e563628e5dd2f372fae542b345e22
           (git ls-remote, 2026-11-08). The local checkout is 703 commits BEHIND and
           DIRTY, so every claim below was read with `git show <sha>:<path>`, never
           from the working tree.
CLASS:     code-read only. NO runtime trace, NO production thread read, NO live walk.
```

## 1. The founder's observation, stated as a crossing

> Returning to a Work and asking a follow-up, MAIA does not have the chapter being discussed.

Named crossing: **manuscript text → the Work conversation's context, per turn.**
It is broken at that crossing. The conversation record itself (threads, turns, resume) is not the
broken part.

## 2. What the code says (canonical `8446b5645`)

| Fact | Where |
|---|---|
| The Work conversation's system prompt lists exactly: member's own words about the Work, section **headings**, member corrections, and — only if the writer is at a passage — **that one passage**. "Do not claim to have read anything they do not list." | `lib/manuscript/ask/askReader.ts` `WORK_STANDING`, `workSays`, `workAnchorSays` |
| The passage is the **locus**: one section, read fresh each turn from the canonical projection, from the `sectionId` the UI sends *at that moment*. Moving chapters changes it. | `workContext.ts` `buildWorkContext`/`loadProjectedSectionBody`; `canvas/WorkConversation.tsx` (sends `sectionId` per send; deliberately not a discovery dependency) |
| The `living-works/[id]/ask` route builds `buildLivingWorkOnlyContext` → **`locus: null`**: headings only, no body. | `app/api/sovereign/living-works/[id]/ask/route.ts` |
| Prior turns **are** replayed as chat history (`historyFor(priorTurns)`), so MAIA's *earlier statements* persist while the *text they were about* does not. | same route; `retry.ts` |
| There is **no tool** in this reader. Absent by design ("not disabled — absent"). Whole-chapter reading is a different path: the developmental Ask, gated by single-use `authorize_sections` acts and receipts. | `askReader.ts` header; S3 records |
| `studioGuide` tells MAIA to point the writer at "Read this chapter". | `lib/writersStudio/studioGuide.ts` |

**So the limitation is architectural, as the founder's direction says**, and "Open this chapter in Write"
was never the remedy — it only moves the locus to that chapter for the *next* send.

## 3. The second defect — unsupported claims about unread text

MAIA described a section and quoted a closing line "as though I'd read it" (her own admission in the
screenshotted turn). **Likely mechanism (HYPOTHESIS, not witnessed):** the writer asked from a locus
where the passage *was* supplied, MAIA quoted it; on a later send the locus moved, the quote stayed in
replayed history as her own prior assistant turn, and nothing tells her that history may refer to text
she no longer has. The standing prompt forbids it, but a prompt is an instruction, not a mechanism.

**CORRECTION (2026-11-08, after the thread export + a read-only manuscript query; the original
paragraph above is kept as the superseded hypothesis).** Thread `ffd2b452…` (16 turns) and the draft text show:
- Turn 13 (Nov 2, writer had selected "The Story of the Four Yogis") described that section in detail and
  quoted its last two lines. A read-only query found those exact lines ("That is the joke. And that is also the
  teaching.") in the draft section `bf5a7292…`. So the quote was **accurate**; she very probably had the text
  that turn (exact match + specificity — INFERRED, not recorded: `ask_turns` stores no locus/sectionId).
- Turn 15 (Nov 8, writer now at Chapter 10) said she never had the text and "quoted … as though I'd read it. I
  hadn't." That self-report is the **false claim**. The replayed history kept her old answer but not the passage
  behind it, so she concluded she had fabricated it.
- Therefore the defect is **history without its grounding**, in the *disowning* direction. Part A1 must say
  earlier turns may rest on passages she no longer has and she must not infer fabrication from their absence;
  and a per-turn record of which sections were supplied is needed (also for B5). The A2 quote-fidelity check
  targets the opposite failure and stays valuable, but would NOT have caught this one.

**Original to-do (now done for this thread):** export that thread's `ask_turns` (founder-run or authorized read) and the
`sectionId` of each send. Without it, §4 Part A addresses a mechanism, not a witnessed cause.

### 3a. Live walk (2026-11-08, production, founder's session; skill §5/§10 witness)

Founder-authorized walk in the built-in browser, Develop → Overview, Chapter 10 (`s=60522350…`, a 492-char opener section):
1. **"Read this chapter"**: the POST to `/api/sovereign/manuscripts/<m>/readings` stayed pending for **several minutes**
   (button stuck on "MAIA is reading the chapter…", no server error in the logs) and then returned **201**. A tester would
   see a button that never finishes. Not yet attributed (slow model call vs stuck request).
2. The reading rendered and **names the hiker-with-a-map image** and where it returns.
3. Ask panel, immediately after: **Send was disabled** while "You have 3 conversations about this Work" was unresolved,
   with no hint why; it enabled only after "Start a new conversation".
4. **Follow-up** ("Where in this chapter does the image of the hiker with the map come back?") → MAIA answered she has
   only the Teasdale epigraph plus headings for Chapter 10 and **told the writer to press "Read this chapter" — which had
   just been pressed.** **The defect is reproduced live, minutes after the reading.**
Side effects of the walk on the founder's data: one stored reading and one new Work conversation (2 turns); manuscript text untouched.

### 3b. Part A suite authored (2026-11-08) — laws first, NO implementation

Worktree `/Users/soullab/worktrees/ws-work-continuity-part-a`, branch `feature/ws-work-continuity-part-a-suite`, cut from canonical
`8446b5645`; **uncommitted**. Files: `tests/constitutional/ws-work-continuity/{laws,candidates}.ts` and
`lib/manuscript/ask/__tests__/workConversationHistoryGrounding.test.ts` (12 tests, jest, all green).
- 7 laws (A1a, A1b, A2–A6) over the Work conversation's system prompt; a conforming reference satisfies all in 4 worlds
  (history × passage); **8 defeat candidates each die on their named law with no unclassified collateral.**
- Real `askMaia` today: A2–A6 hold; **A1a and A1b are RED as expected** (`it.failing`, so implementing A1 forces conversion
  to ordinary tests; the law is never to be weakened).
- **The matrix found two defects in the SUITE, not the candidates** (same lesson as every prior lane): A1b was *vacuous*
  — the existing standing prompt already contains "invent"/"do not infer", so keyword-anywhere matching passed with no
  implementation; repaired by requiring the meaning-bearing words to co-occur in one sentence. DC-5's guard sentence was
  too thin and tripped A1b as accidental collateral; repaired in the candidate (isolation), the law untouched.
- ⚠️ **Prompt laws are not behaviour.** That MAIA stops disowning her answers is UNKNOWN until a live walk of the implemented fix.
- Still owed for Part A: the per-turn "which sections were supplied" record (needs a schema change; not in this suite) and the
  A2 quote-fidelity gate (a separate law family, different failure).

## 4. Proposed design

### Part A — Honest reading (narrow, bounded; no authority change)

A1. **History grounding.** Tell MAIA, per turn, which sections' text is in front of her *this turn*
    (already stated once) **and** that earlier turns may quote text she no longer has — those are her
    past words, not a source.
A2. **Mechanical quote fidelity (the part that can fail).** Post-answer deterministic check: any quoted
    span above a length floor must be a substring of text actually supplied this turn (passage, or the
    member's own question). Otherwise the answer is not returned as written (regenerate once with a
    correction, else a plain "I don't have that text" answer). A prompt-only fix cannot be falsified; this can.
A3. Everything stays inside `askRuntimeCannotWrite` / `askRouteEffectFamily`. No new tables.

### Part B — Standing, revocable reading scope (needs a founder ruling, §6)

B1. **A new, additive authority record** — "Work reading scope": member-declared, per Work, append-only
    grant/revoke events (state derived, never a stored status). Scope levels the *member* chooses:
    *this chapter only* · *the whole Work*. Nothing inferred; no default.
    ⛔ It is **not** a mutation of the S3 act (`authorize_sections` stays single-use and frozen @ `2255b60d`).
B2. **Every crossing under the scope is still receipted** (`context_disclosure_receipts`, a boundary value
    for the Work conversation), carrying the scope event as its authority. Consent is established once;
    accountability stays per crossing. Revocation is checked at each Ask, so it is effective mid-thread and
    after recovery.
B3. **Retrieval, not whole-book loading.** Host-side, bounded selection of saved sections the question needs
    (the chapter the writer names, the locus, heading match), derived server-side — never client-supplied.
    Open choice: host-selected vs a bounded `request_sections` tool (the 05B reader has one). Recommendation:
    host-selected first; a tool adds a new capability surface.
B4. **Revision fidelity.** Read from the saved revision; bind revision number + digest (BUILD-07A readState
    machinery); if the section changed since an earlier turn quoted it, MAIA must say the text moved.
B5. **What she read stays visible** (Convergence law L8): a per-answer "read: Ch 4 §2, rev 12" line.
B6. **Ordinary / Sanctuary.** Recommendation: scope is **suspended in Sanctuary** and nothing read there is
    retained; to be ruled (§6).
B7. **Not conflated with the Editorial Reading.** A conversational read is not body-depth coverage. It must
    not discharge `DEVELOPMENTAL_NON_CONCLUSIONS` or license whole-work claims. "Read this chapter" remains
    the deliberate, coverage-licensed reading; it just stops being a prerequisite for conversation.
B8. **Continuity across returns** mostly exists (thread resume/choose, `ask_threads`/`ask_turns`). The gap is
    text context, which B1–B4 close. Memory-mode interaction (what is retained) is listed for ruling.

### Part C — Migration

One additive migration (scope events table). ⛔ Per the 2026-09-07 finding, **merge to canonical is latent
schema-deploy authorization**: it does not merge ahead of its witnesses, and deploy is a named founder act.

## 5. Acceptance — lethality first (S3 Class-B discipline)

Order: author the suite → build one deliberately WRONG candidate per law → prove each dies on its named
test → only then implement. A surviving candidate repairs the suite, never the candidate.
Fictional manuscripts only, 3+ chapters, no real member text.

| # | Law | Defeat candidate (must die) |
|---|---|---|
| T1 | Follow-up about chapter X gets X's saved text with scope granted, no reopen | passage only, scope ignored |
| T2 | Consecutive follow-ups across chapters keep access | scope consumed after first Ask (S3 shape) |
| T3 | Leave and return: thread resumes, text context restored | context rebuilt from history only |
| T4 | Manuscript revised: quotes match the *current* saved revision; moved text is acknowledged | cached/stale text, or revision unchecked |
| T5 | Revoked: next Ask has no body, mid-thread and after recovery | revocation checked only at thread open |
| T6 | Separate writer accounts: no scope or text crosses members | scope keyed by Work id without member binding |
| T7 | Sanctuary: scope suspended, nothing retained | scope honoured in Sanctuary |
| T8 | Quote fidelity (Part A2): a quote of unsupplied text never reaches the member | prompt-only fix |
| T9 | Each crossing has a receipt carrying the scope event; no scope → no receipt, no body | body read with no receipt |
| T10 | Scope is member-declared: nothing infers or defaults one | scope granted by inference/default |
| T11 | No Editorial-Reading coverage or non-conclusion discharge from a conversational read | read counted as coverage |

**Founder-witness only (UNKNOWN until the founder walks it; no automated result may report these
established):** the experience of "she knows my book and I never reintroduced it"; whether the visible
"what she read" line feels like trust or like machinery.

## 6. Founder rulings owed — ONE question of principle

> **May a member-declared, revocable, Work-level standing scope stand in for per-Ask single-use
> authorization for reads inside the Work conversation, with every crossing still receipted?**
> **Recommended ruling: yes**, as a new additive instrument. S3's single-use law stays intact for the
> developmental Ask; the standing scope is a distinct, narrower-by-the-member relationship.

Smaller questions that follow the principle (recommendations, not rulings): scope levels chosen by the member
at establishment, no inferred default · Sanctuary suspends scope · host-selected retrieval before any tool.

## 7. Stops and holds

- Local checkout is 703 behind and dirty; implementation must start from a clean worktree at the canonical SHA.
- Not verified: whether `manuscripts/[id]/ask` (vs `living-works/[id]/ask`) receipts the current locus
  crossing; which route the Develop panel in the founder's screenshot actually used; the real thread contents.
- Owner record #1800 was read for its latest comment only (a 2026-10-31 video-handoff note, 1362 comments in
  all); it has not been reconciled against newer decisions.
- Not authorized by this document: any code change, migration, merge, deploy, canon edit, or posting this
  plan to #1800 (posting is outward-facing; held until the founder says so).

## 8. Proposed sequence (each step its own review)

1. Founder ruling on §6. 2. Thread export to confirm §3 mechanism. 3. Part A suite + defeat candidates, then A1/A2.
4. Part B suite + defeat candidates, proven lethal; freeze. 5. B implementation + migration (candidate only).
6. Disposable-shadow witness. 7. Founder walk (F6) with fictional manuscripts. 8. Merge and deploy as separate acts.
