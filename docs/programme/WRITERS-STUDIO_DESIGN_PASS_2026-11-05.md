# Writer's Studio — design pass (2026-11-05)

**Founder direction:** "Super user friendly and next-level design for high-level editing, with a
human-level interface." Run as a JARVIS flow.

**Canonical bound:** `clean-main-no-secrets` = `96e2e1458` (Conversation Stage + MAIA opens, live
in production). Branch: `feature/ws-design-pass-20261105`.

**Governs:** the founder principle in `WRITERS-STUDIO_FLOW_REVIEW_2026-11-05.md`: *powerful edits
are made through a conversation about the writer's work.* That record's build plan (steps 5–9)
stands; this pass adds what a new walk found and makes the design concrete.

## 1. What the walk found (local, as a tester, 2026-11-05)

| # | Moment | What happened | Standing |
|---|---|---|---|
| W1 | Focus, "Start a new conversation" | **"MAIA is reading…" stayed forever with no request behind it.** Focus mounted before the old thread loaded, so the opening was declined, and the new conversation never got one. | **Fixed** `62c6ade97`; witnessed: MAIA opened the new thread, with one MAIA turn at index 0, a typed opening episode and no writer turn |
| W2 | Selecting a passage | **Five doors before saying anything:** Focus, Craftsman's Table, Discuss, Teach me about this, More ways to work. The writer must choose the machinery first. | Design D1, ruling owed |
| W3 | MAIA's edit reply | **Fragments:** the stage joins her "Friction" and "What I'd try" parts with the labels cut off, so a turn reads "cutting 'which was' and letting…". | Fix D3a (small) |
| W4 | The proposed change | **You can't see the change.** A deletion is muted grey with a faint strike on a dark ground; the only edit ("the") is near-invisible. | Fix D2 (small) |
| W5 | MAIA's replies | Warm and specific, the right voice, but long (250–350 words each). The answer to "show me an edit" is an essay before the edit. | D3b (prompt shape; Teach-me untouched) |
| W6 | Focus header | Says "Selected passage", not where you are. Five controls sit above the conversation (Tools, Preferences, Next passage, Start a new conversation, Return to manuscript). | D4 |
| W7 | Home | "Welcome back to Local Walk." greets the Work's title as if it were the writer; "Your last exact writing place is available." | D5 (copy) |
| W8 | Write | Nothing says MAIA is here. Her only door is selecting text and finding the small "Work with passage" pill. | D1 |
| W9 | Sign-in from a link | The link back after sign-in keeps only `/writers-studio`, so the writer lands on Home, not their passage. | D7 |
| W11 | Coming back to Focus | Reopened the **older** conversation on the passage, not the new one MAIA had just opened. Resuming picks the first match, not the most recent. | D7 (resume the latest) |
| W10 | Local browser pane | Every full page load signed the walker out (`no_session_cookie`). Not reproduced in the founder's own browser, so possibly pane-specific. | **Unconfirmed**, held |

Develop could not be walked in this pane (W10). Its findings stand from this morning's production
walk and the language audit (about 75 technical strings; lens picker first; ordinals instead of
headings; no path from an observation to an edit).

## 2. What mature tools learned (comparison, from product knowledge, not a fresh survey)

- **Suggestion mode (Google Docs, Word):** a change is shown *in the text*, in colour, and accepted
  or rejected where it sits. Nobody has to read a description of a change to find it.
- **Inline AI edit (Notion AI, Cursor, Copilot):** select, say what you want in your own words,
  see the change as an inline diff, then press Accept, Try again or Discard. One door, one input, one
  decision.
- **Grammarly / ProWritingAid:** one card per point, one sentence of why, the deeper explanation
  on demand. Short by default.
- **Lex / Sudowrite:** the conversation lives *beside* the page, not instead of it; alternatives
  come as small cards you can compare.

What transfers, held to our law (MAIA proposes, the writer decides; no stealth text):
**speak first in your own words → see the change in the text → decide in one press → undo.**

## 3. The design

**D1 — One door.** Selecting text shows one quiet pill, **"Talk with MAIA"**, plus three intents
in plain words: *What's happening here?* · *Show me an edit* · *Teach me the craft*. Each opens the
same conversation, with that intent as its first act. The five-entry menu retires. Craftsman's Table
becomes "Change it" inside the conversation. ⚠️ Ruling owed (Doors): which entries survive.
In Write, a small persistent "MAIA" handle at the page edge says she's there (W8).

**D2 — The change is visible in the text.** A proposed edit renders as a tracked change: additions
on a clear green ground, deletions struck through on a red ground at full contrast. A line above it
says what kind of change it is, e.g. "One small change", before the buttons
*Use it · Change it · Talk about it*. *(Built in this pass.)*

**D3 — MAIA speaks like a person, briefly.**
(a) An edit turn reads as her voice: "I notice…" then "I'd try…", never label-stripped fragments.
*(Built in this pass.)*
(b) Default length about 80–120 words, with "Say more" on demand; the edit itself arrives as its own
turn. This is the `REVISE` shape in `passageActs.ts` (flow-review step 8); Teach-me prompts and
`CONVERSATION_TURN_SHAPE`'s closing line stay untouched.

**D4 — The stage names the place and gets out of the way.** Header: the section's heading and
"paragraph 1" (never "Selected passage"). Top bar: **Back to the page** plus one "⋯" holding Next
passage, New conversation, Preferences and Tools.

**D5 — Plain, relational copy everywhere.** Home: "Welcome back. You were working on *Local Walk*."
Develop: question first ("What would you like to understand about your book?"), machinery behind
"More", headings instead of ordinals; every observation offers "Talk about this passage", which
opens the stage (flow-review steps 5–6).

**D6 — Nothing pretends.** Every waiting state stands on a request that was actually sent; every
refusal carries an action. *(W1 fixed; the remaining dead ends are flow-review step 9.)*

**D7 — Your place survives.** Sign-in returns the writer to the exact passage and room, and
coming back to a passage resumes the conversation the writer was last in (W11).

## 4. Build order (local first; founder walks before any deploy)

1. ✅ W1: honest opening (`62c6ade97`).
2. ✅ D2 visible change + D3a her voice in edit turns (this pass).
3. D4 header and quiet top bar.
4. D1 one door (after the Doors ruling).
5. D3b short replies (`REVISE` shape).
6. D5 Develop: question first, plain language, path into the stage.
7. D7 place survives sign-in.

Each step is test-first with a defeat candidate, and walked locally.

## 5. Rulings owed

- **Doors:** of Focus, Craftsman's Table, Discuss, Teach me and More ways to work, which survive as
  separate entries once the conversation carries them? Recommendation: none. One "Talk with MAIA"
  door with three intents; Craftsman's Table becomes "Change it".
- **Reply length:** default about 100 words with "Say more"? Recommendation: yes, for edit and
  discuss turns; Teach-me exempt.
