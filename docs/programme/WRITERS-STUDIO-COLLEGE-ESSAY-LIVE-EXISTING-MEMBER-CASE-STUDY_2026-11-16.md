# College Essay Studio: live existing-member walkthrough · JARVIS loop case study (2026-11-16)

**Lane:** #1982 → Writer owner #1800 → release #1938.
**Runtime:** production `85cb169ff` (#2304), served from soullab.life, minisforum. The rollback image is `f0f198f6e`.
**Who walked:** the founder's own signed-in account, an **existing member with 16 Works**, driven by the agent in the Claude desktop browser pane at the founder's request ("can you run a case study test"). The pane is about 686px wide, which is a phone-like single-column layout.
**Text:** invented; no member's writing was read. Database reads were metadata only, under `BEGIN READ ONLY`.
**Status:** `LIVE_WALKED_PRODUCTION / FINDINGS_OPEN / NO_SOURCE_CHANGE_IN_THIS_DOC`.
**Not authorized by this document:** any merge, deployment, migration, grant change or widening of beta access. The under-18 MAIA hold (#1900) is unchanged.
**Left behind:** one test Work, *"Case study — college essay (delete me)"* (`ddeffda5…`, manuscript `e8a77629…`). Removing it is for the founder to decide.

---

## 1 · OBSERVE: the walk, step by step

| # | Act | What the writer met | Verdict |
|---|---|---|---|
| 1 | Studio Home → **Start a college essay** (#2303) | Essay door: "COLLEGE ESSAY · IN WRITER'S STUDIO", "You're at: Discover", MAIA's moment question, Evening theme | ✅ |
| 2 | Typed an invented spark → **Tell MAIA** | MAIA reflected only the writer's own details ("the two of you are down on the kitchen floor… he keeps losing — on purpose…"), no interpretation, then "Am I hearing that right?" | ✅ |
| 3 | **Yes** | Went straight to "Would you like me to hold that as the spark?" **with no Ordinary/Sanctuary stop**. Exactly **one** posture control was on screen, with Ordinary pressed (#2301, #2304 item 4) | ✅ |
| 4 | **Hold it in my words** → Begin screen | "Let's begin your college essay." The title was pre-filled and **"MAIA asks, never rewrites"** was pre-ticked. The agent renamed the Work to mark it as a test. | ✅ |
| 5 | **Begin** | The Write room opened; `?path=` was dropped from the URL (#2303). The place was **"Your draft"**, the rail heading **"YOUR ESSAY"**, and the footer **"Your essay comes first. I follow where you put your attention."** (#2304 item 1) | ✅ |
| 6 | First sight of MAIA's column | Quiet line: *"You can write here on your own. A continuing thread with MAIA across this Work is optional, and only if you choose it."* · **See options** (#2304 item 3) | ✅ |
| 7 | Wrote a 72-word paragraph | It saved. **Show MAIA this page** appeared | ✅ |
| 8 | **Show MAIA this page → Yes, read it** | Reply: an exact quote of the writer's sentence, one observation ("The care arrives disguised as clumsiness."), one question. **The coverage line changed to "I read this page with you just now. That reading isn't kept."** (#2304 item 2) | ✅ |
| 9 | Added a sentence | The line changed to **"This page has changed since I read it with you."** | ✅ |
| 10 | **Talk about the whole essay** → asked *"Can you rewrite my last two sentences so they sound better?"* | MAIA **did not rewrite**. She quoted the writer's exact three sentences, explained what they do ("the reader supplies 'brave'"), and described a direction (*compress rather than expand*) **without supplying replacement wording**. She ended with a question. | ✅ questions-only held |
| 11 | Home → **Return to this work** | Home did not reopen the door. On return, all writing was present including the edit, along with "YOUR ESSAY", the essay footer and the quiet card. The coverage line was back to "I haven't read this draft yet." | ✅ (see F6) |

**Database (metadata only):** the new Work has `studio_path = college-essay`, `maia_revisions_paused = true`, the spark held, and one working draft. It is the only one of the member's 17 Works carrying a program, so **the 16 existing Works are untouched**.

## 2 · Findings (witnessed, not yet attributed or fixed)

| ID | What was seen | Where it likely lives (to be traced before any change) | Weight |
|---|---|---|---|
| **F1** | At a phone-like width, MAIA's column renders **above** the essay and fills about half the screen. The writer meets MAIA before their own page. This contradicts the essay's own footer. | Write layout / `Shell` regions at narrow width | **High** for ADHD-friendly and phone use |
| **F2** | The conversation surface still says **"the whole book"** (About: where I am / the whole book), along with generic "Let MAIA read my saved work" and "MAIA reads only the passage you are in". | Conversation stage scope chips; not covered by #2304 | Medium |
| **F3** | MAIA's reply said *"I can't put anything into **your manuscript**"* although the essay posture says never "manuscript". | Generic capability/boundary sentence in the conversation prompt, which outranks or precedes `studioPosture` | Medium |
| **F4** | The Home card labels the Work **"Work"**, not "College essay", and shows **~65 words** where the editor said 76. | Home work card (the program badge was planned in step 3) · word count source | Low–medium |
| **F5** | **"Which ones?"** is offered on a one-part essay that MAIA hasn't read. There is nothing to choose between. | `CoverageLine` detail toggle (`hasDetail`) when `total === 1` | Low |
| **F6** | On return, the coverage line says "I haven't read this draft yet" after a visit where MAIA read and discussed the page. **This is truthful by design** (visit readings aren't kept), but a writer may experience it as MAIA forgetting. | Copy choice, not a defect; a candidate for one honest sentence ("I don't keep readings between visits") | Low, copy |

Not observed: any consent bypass, any rewrite wording, any change to the member's other Works, any console or server error.

## 3 · What this establishes, and what it doesn't

| Claim | Evidence class |
|---|---|
| Existing member → Start a college essay → Begin creates a new program Work and leaves the others alone | **production device walk + DB metadata** |
| Essay wording, quiet card, single posture control, Ordinary default | **production device walk** |
| The reading status is truthful after an authorized read, and after an edit | **production device walk** |
| MAIA holds questions-only when directly asked to rewrite | **production device walk (one exchange)**; not a statistical claim |
| Leave and return keeps the writing and the essay identity | **production device walk** |
| Sign-in recovery after an expired session (#2302) | **NOT witnessed**: needs a session to actually expire |
| Real phone Safari, and a minor's experience | **NOT witnessed**. The minors hold (#1900) stands. |
| A new member's first run through an invitation | Witnessed on 2026-11-16 before #2304 (#1938). Not re-walked on `85cb169ff`. |

## 4 · Recommended next loop (for founder choice; nothing here is authorized)

1. **F1 first.** Essay-first layout at narrow widths: the page on top, MAIA one tap away. This is the largest gap between the promise and the experience.
2. One bounded wording PR for **F2–F5**: program words in the conversation chips, the posture outranking the generic "manuscript" sentence, a program badge and consistent word count on Home, no "Which ones?" for a single place.
3. Decide F6's wording.
4. Remove the test Work when convenient (permanent; founder decision).
