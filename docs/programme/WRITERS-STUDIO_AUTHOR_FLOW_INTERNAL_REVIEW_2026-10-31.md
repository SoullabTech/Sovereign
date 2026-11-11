# Writer's Studio: author-flow internal review (2026-10-31)

**Status:** internal review, prepared by Claude at the founder's request. Not published, not committed. It authorizes no change.
**What this is:** a *persona read* of the flow, written as an author with a finished book (the founder's *Elemental Alchemy*) and as a first-time writer
pasting existing text. **It is not a user test.** Where a step was not actually walked, it says so.
**Evidence classes used:** WITNESSED (the founder's own screenshots/words, 2026-10-31) · RUNTIME (production reads or a throwaway-stack run with fictional writers)
· CODE (read, not executed in production) · NOT EXAMINED.
**Production at time of review:** `9856e27f7`, healthy. Writers-only gate on; five accounts admitted; no invitation sent.

## 1. The flow, step by step

| # | Step (what the author does) | What the author needs | What the system does | Status | Evidence |
|---|---|---|---|---|---|
| 1 | Sign in | Get in without friction | Username + password work. Email-code sign-in is wired to Proton but the token is unproven (no code request seen yet). | Works (password) / **unproven** (email code) | RUNTIME |
| 2 | Arrive at the House, enter Writing | A clear door | House home shows Writing; the rail now has a settings cog (Settings, Security, Sign out). Search and You were dead links, removed. | Works | WITNESSED |
| 3a | Bring existing text by **paste** | To start from what she has | Review structure, confirm sections, then "Create Work and open in Write": the **Work and the manuscript are created together**. | Works | WITNESSED (founder) + RUNTIME (journey) |
| 3b | Bring a **finished book** that was *uploaded* | Her whole book, as hers | The manuscript exists, **but is not attached to any Work**. Original-file import is held for members. | **Gap** (see F1) | RUNTIME + CODE |
| 4 | Write; text saves; return and find it | Trust that words are kept | Autosave, "Saved", reopen works. Two editor bugs (first letter jumping, caret dropping after a space) were found and fixed this week. | Works | WITNESSED + RUNTIME |
| 5 | Open **Develop** and press "Talk with MAIA about this" | To talk about this chapter | If no Work declares the manuscript the button is **greyed** and the page says the Work connection could not be confirmed. | **Dead end** (F1) | WITNESSED |
| 6 | Choose a way to begin | Something that invites, not accuses | With a chapter selected, the three starter cards are "I'm not sure what this chapter is doing", "Something feels off", "This doesn't sound like me". | **Tone gap** (F2) | WITNESSED |
| 7 | Talk with MAIA | A conversation about *her* chapter, nothing changed unasked | Side panel names the Work; MAIA replied honestly that she saw only a bibliography stub, but because the author had selected the short ALL-CAPS notes section, not the chapter (F4, F7); text small and dense (F8). | Doorway works; **reply read the wrong place** | WITNESSED + RUNTIME |
| 8 | Manage account / security | Readable, trustworthy settings | Security page was nearly unreadable (undefined colour token). Fixed and live. Settings opens fine. | Works after fix | WITNESSED |
| 9 | Review, Publish, Listen rooms | n/a here | not examined | **NOT EXAMINED** | none |

## 2. Findings, ranked

**F1 (high): an uploaded finished book strands the author at Develop.**
- The founder's book (`member_uploaded`, 29 Oct) belonged to no Work, so Develop's main action was unavailable. Production reads: of her 13 uploaded manuscripts only 2 are
  attached to a Work; of her 10 written (paste/blank) manuscripts 8 are. Written and pasted writing is born inside a Work; uploads are not.
- The page's explanation ("could not be confirmed. Your writing remains available in Write.") gives **no next step**. A self-serve path exists, an **"Add to a Work"** control on
  the Studio Home (`P4R1HomeView.tsx`), but Develop does not point to it.
- This contradicts the convergence charter's own acceptance condition of *no dead end* (WRITERS-STUDIO-CONVERGENCE-01).
- For the writers beta: those who **paste** text will not hit this. Anyone with an **uploaded** manuscript will.
- Today it was repaired by an operator database write at the founder's instruction, not by the product. The repair is recorded (Work `8b3a7f21…`, rollback ids on minisforum).

**F2 (medium): the first thing a Focused chapter offers is a problem.** All three starters presuppose something is wrong. The more open "Help me see the shape" only appears
when no chapter is selected. Proposed (Designed, not built): "Give me an overview", "What are you noticing?", "Offer me a suggestion"; existing starters stay under "Show more ways to explore".

**F3 (medium): "View: Focused / Guided / Full" is unexplained in the screen.** The author asked what the three do. Focused = three starters for the place; Guided = a few at a time with
guided next moves; Full = the whole Develop map. The control gives no hint of that.

**F4 (observed once, 2026-10-31): the first real MAIA reply was honest but read the wrong place.** The founder walked chapter 10 and shared the reply (WITNESSED).
- MAIA said, correctly, that what she had was a run of bibliography entries, not chapter prose, and declined to speak about the chapter. She then asked one question
  (is the second run a later draft or meant to coexist?), as the prompt asked.
- Production reads (structure only, no text): the place selected was the ALL-CAPS "CHAPTER 10: THE LIVING SPIRAL" at position 53, **558 characters**, and it contains the bibliography
  names. The real chapter, "Chapter 10: The Living Spiral" at position 25, is **73,246 characters** and does not. Positions 43 to 54 are twelve short all-caps sections (472 to 1,446 characters each)
  that look like per-chapter works-cited. So MAIA read the stub the author clicked; "she hasn't read the chapter" is literally true for that turn.
- MAIA's hypothesis (a later draft or an expansion) was wrong, and she guessed at a cause instead of saying she could not tell what the second run was.
- Founder feedback on the reply: **text too small, too condensed (one dense paragraph), too limited.**

**F7 (high): near-identical headings send MAIA to a stub.** The sidebar lists the chapters twice (Title Case run, then an ALL-CAPS run of short back-matter). Choosing the wrong one gives MAIA a few hundred characters and a confident-sounding but wrong theory.
Safe fix shape: when the chosen place is short and a much longer section has the same name, ask "This looks like Chapter 10's notes. Open the chapter itself?" as a question the author answers, never a guess.

**F8 (medium): the conversation panel is hard to read.** MAIA's text is small and low-contrast (muted purple-grey on navy) and arrives as one wall of words. Larger text, better contrast and short paragraphs are a presentation change; asking MAIA for short paragraphs is a separate, reviewable prompt change.

**F9 (medium): when MAIA cannot tell, she should say so.** She stated what she saw and asked a question, which is good, but also offered a structural theory she could not support. A cautious "I can't tell what the second run is" would have been truer.

**F5 (platform, not Writer-specific): the app cannot send email.** Email-code and recovery emails depend on Proton SMTP, wired but unproven. A writer who forgets a password cannot self-recover.

**F6 (hygiene): the studio carries clutter.** The founder has 12 Works, 11 of them tests ("Title Test", "Test 1"). New writers will not have this, but the founder's House home does.

## 3. What was not examined
Review, Publish and Listen; the Develop room on a phone; what MAIA actually replies; the Pro Studio entrance (another session's work); any writer other than the founder; whether "Add to a Work" is easy to find for a real first-timer.

## 4. Recommended order (smallest, most reversible first)
1. **Develop dead end (F1):** replace the greyed button's message with a plain next step ("Add this manuscript to a Work") and a button that does it, using the existing declaration route. Small Writer-lane source change.
2. **Positive starters (F2)** and a one-line explanation of the three views (F3). Copy and design, founder approves wording first.
3. **Fix the place MAIA reads (F7)**, then **readability (F8)**, then re-walk chapter 10 and re-record.
4. **Prove email (F5):** one real code request from the founder; then decide on recovery.
5. **Tidy the founder's test Works (F6)** when she says.

## 5. Questions only the founder can answer
- Should an **uploaded** manuscript automatically get a Work, or must the author always declare one (the charter says the Work is member-declared, never guessed)?
- Is "Add to a Work" the right wording and place, or should Develop do it in place?
- When the first invitation goes out, is the paste route the only supported way in? (Original-file import is held.)
