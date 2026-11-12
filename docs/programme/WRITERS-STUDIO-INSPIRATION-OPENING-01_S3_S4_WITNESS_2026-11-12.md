# WRITERS-STUDIO-INSPIRATION-OPENING-01 · S3 (B) + S4 (C) — Witness Record

**Authority:** founder, 2026-11-12: *"build B and C and merge all for writers"*.
**Base:** `origin/clean-main-no-secrets` `b2f1d0e05a` (contains S1 merge `3c2030a33d`).
**Branch:** `feature/ws-inspiration-opening-bc-20261112`.

## What was built

**B · The First Page (S3)**
- **The blank page.** The three-card overlay that covered the section heading is now one invitation line where the first
  sentence will go: *"Write whatever is closest. A memory, an image, the sentence that won't leave you alone. No one is
  grading this."* It is followed by *"I'm here when you want me. I won't read this page until you show it to me."* The
  three existing beginnings remain as quiet words (*Just start writing · Talk with MAIA · Help me find a beginning*),
  with the materials list unchanged.
- **"Show MAIA this page".** MAIA's column offers it on a Work's first page only (exactly one section, with words in it,
  up to 12,000 characters). The writer confirms the scope first: *"MAIA will read only this page. Her answer isn't kept."*
- **MAIA's reply.** She reads through `askMaia` with `moment: 'first_page'` and her own frame: one exact line, a sentence
  on what she noticed, one question; no edits, no verdict.
- **Quote check.** The route **refuses to show a reply whose quote is not on the page** (`quote_unverified`).
- **Answering her.** *Answer her* opens the existing Work conversation with an unsent draft.

**C · Bring What You Carry (S4)**
- **Before anything is read.** Above the import, MAIA asks *"Before anyone reads a word, would you tell MAIA what this
  book means to you?"* It is optional: *Tell MAIA first · Skip*.
- **The question.** It is C's question: *"Not the table of contents or the shelf it belongs on. What made you need to
  write it?"* Then come the same reflection and the same separate hold as the door, deciding through the same
  `sparkCommitPlan` (own words only, held only, never Sanctuary).
- **Where it lands.** A held spark reaches the imported Work's `purpose` through the S1 carry path (existing member-act
  PATCH; failure is an explicit notice).
- **After import.** MAIA's offer to read is the existing *Read my book* in Write, under the writer's read permission.

## Evidence

- **Falsifiers F12–F14 added.** F12: first-page eligibility. F13: quote fidelity, enforced at the route. F14: C keeps
  exactly what the door keeps. Suites: 39 tests across the three, all pass.
- **Mutants red:**
  - M8: quote check always passes.
  - M9: eligibility ignores section count.
  - M10: route skips the quote check.
  - M11: route accepts history with a page.
  - M12: a page read with the door's frame.
- **Typecheck:** 214 errors against baseline 214, no regressions.
- **Neighbours:** 192 suites, 190 pass. The 2 inherited failures are unchanged (`askSourceCloseout`;
  `p4r1RelationalDevelopGuidance`, from #2230). The existing blank-page tests pass unchanged.
- **Real-model walk** (harness `REAL_MODEL=1`, fictional text only):
  - **B.** Shown the fictional first page, she quoted *"After the funeral nobody went out there for a month, and when I
    finally did, the beans had climbed the fence and the fence had given up."* exactly, noted *"The month passes inside
    the sentence, so the absence does its work offstage,"* and asked *"Is this the start of something, or a way in to
    something else?"*
  - **C.** To *"I walked that coast for a year after my father died…"* she reflected *"the ground first, the understanding
    later … Am I hearing that right?"* Hold in my words, paste a two-chapter fictional manuscript, Create Work: Write opens.
  - **Database.**
    - *The Salt Road*'s `purpose` equals the writer's sentence byte-for-byte.
    - The first-page Work has `purpose` NULL (nothing was held).
    - Neither of MAIA's replies appears in any table or in `app.log`.
- **Walk finding fixed in-lane:** the invitation first sat over the section heading (inherited `top:108px`). It now sits
  below the heading.

## What this does not prove

- Phone width.
- File uploads, as opposed to pasted text, for C.
- Production.
- That the letter MAIA writes after *Read my book* treats a held spark as "you told me". The letter path was not changed
  here, and S2's spark-history work owns that.

## Adjudication

**S3 + S4: PASS** (local, real model on fictional text). Merge was authorized by the founder in the same instruction.
Deploy is a separate founder act.
