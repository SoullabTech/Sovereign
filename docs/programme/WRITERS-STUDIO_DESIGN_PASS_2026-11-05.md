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
| W7 | Home | "Your last exact writing place is available." is machine phrasing. ⚠️ *Corrected:* "Welcome back to Local Walk." greets the writer back **to their book** and reads fine; it only looked odd because the test Work and test member are both named "Local". | **Fixed**: "Pick up where you left off." / "Open it and carry on." |
| W8 | Write | Nothing says MAIA is here. Her only door is selecting text and finding the small "Work with passage" pill. | D1 |
| W9 | Sign-in from a link | The link back after sign-in keeps only `/writers-studio`, so the writer lands on Home, not their passage. | **Fixed** in `proxy.ts`: the whole address travels in `next`; witnessed on the local server and in the browser (sign-in returned to Develop on the Work) |
| W11 | Coming back to Focus | Reopened the **older** conversation on the passage, not the new one MAIA had just opened. Resuming silently picks the first match. | ⛔ **Stopped**: `lib/manuscript/editorialRuntime/relationships.ts` rules that auto-picking "most recent" is itself a defect; several conversations per passage are lawful and **the writer decides**. The lawful repair is a small chooser ("continue the latest, or an earlier one?"); ruling owed |
| W12 | The new door | Opening it moved focus into MAIA's box, which dropped the text selection, and the door vanished with it. | **Fixed** with regression test (killed without the fix) |
| W13 | MAIA's reply to the writer's own words | Thoughtful, but ~300 words before her question, and it names a technical setting ("your latitude here is set to small changes only"). | D3b |
| W14 | Studio links locally | Some full page loads bounced to sign-in with `invalid_session` and no member cookie (the signed-out shape). | **Not reproduced** after investigation: a fresh token opens deep links (server-side and in-browser), no session was revoked, and no code signs out in the background. Held open as unexplained, not fixed. ⭐ The founder's "can't log in to my account locally" has a plain cause: the local database holds only the local test member (by design, no production members are copied), so the founder's own account does not exist locally. |
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
3. ✅ D4 header and quiet top bar (built: "Section 1 · paragraph 1"; **More ⋯** + **Back to the page**).
4. ✅ D1 one door (Doors ruling taken; built).
5. ✅ D3b responsive length (founder ruling; built).
6. D5 Develop: question first, plain language, path into the stage.
7. D7 place survives sign-in.

Each step is test-first with a defeat candidate, and walked locally.

## 5. Founder ruling — Doors (2026-11-05, in session) ✅

> "Yes, we want this level of interaction. If they know what they want technically they can ask
> for it through MAIA; otherwise they work with MAIA to be offered options."
> "Overwhelm is easy to reach for most of our members."
> "The simpler we make it via MAIA the better it is for them, because they still have the
> complexity but MAIA helps moderate it."

**Law taken from it:** nothing is removed from the writer, but complexity is reached *through
MAIA*, never through a menu. Selecting text offers one door, **Talk with MAIA**: a box for the
writer's own words, plus *What's happening here?* · *Show me an edit* · *Teach me the craft*. Every
path opens the same conversation. Craftsman's Table, Revise and Go deeper are no longer menu
entries; they are reached by asking, or as "Change it" on her option. The 2026-11-04 ruling that
made Craftsman's Table a door again is **superseded in part** (its test is kept and marked).
Built on this branch.

## 6. Founder ruling — responsive length (2026-11-05, in session) ✅

> "Make the responses responsive to the writer and their situation. Some want more and some
> need less."

**Built:** (1) MAIA fits each reply's length to the request in front of her: a short or practical
ask gets a short answer, a searching question gets more room, and she doesn't restate the
passage or mention settings unless one decides what she can do. Judged from the request, ⛔ never
from an impression of the writer (Guided and Direct; Learning keeps its own one-idea rule, and
the depth texts stay byte-identical). (2) Under her latest reply: **Shorter, please** · **Say
more**. Pressing one sends exactly those words and remembers the choice on this device, because
the writer made it; the choice is composed last, so it outranks every default shape. ⛔ Nothing
is inferred or stored about the writer otherwise.
**Witnessed locally:** after "Shorter, please", MAIA answered in 54 words instead of about 300.
Still owed: she said "within this latitude". The settings note (`latitudeInstruction`) uses a
technical word; plain wording is next.

## 7. Rulings owed

- None open from this pass.

## 8. Founder ruling — several conversations on one passage (2026-11-05) ✅

> "Yes, add the chooser."

**Built:** when a passage has more than one conversation in this Work, MAIA asks in the
conversation: *"We've talked about this passage before. Shall we continue our latest
conversation, or an earlier one?"* Each option shows when and how it began, latest first, plus
**Start a new one**. ⛔ Nothing is chosen for the writer, and older conversations that can't be
verified as this Work's stay untouched. What the writer already asked **waits in flight** for
their answer, with every check from its original gesture intact, then continues into the chosen
(or new) conversation. Moving away cancels it, so it is never sent somewhere else.
**Found on the way, and fixed:** (1) the first version dropped the writer's request while asking;
(2) a hand-off version re-ran the safety checks and could drop it silently, so it was replaced by
the in-flight wait; (3) a refused request showed the server's raw error to the writer. It now says
"MAIA couldn't answer that just now. Nothing was changed. Please try again."
(4) Local only: the dev server had served a stale copy of the turn route and refused
`replyLength`; a restart cleared it. **Witnessed locally:** ask → chooser → earlier
conversation → MAIA answered there.

## 9. Founder direction — answer choices (2026-11-05) ✅

> "Yes that would be good." (Answering MAIA's closed questions in one click.)

**Built:** when MAIA ends a reply with a question that has two or three clear answers, she may
add them as short buttons under her latest reply. A click sends **exactly the button's words** as
the writer's reply; typing something else is always possible. At most three answers, each short,
no duplicates; the markers are stripped from every surface that shows her words. Teaching turns
don't get them. **Witnessed locally:** "Make this quieter" → MAIA asked which kind, offering *Drop
the label · Keep it, lower it · The whole sentence* → clicking *Drop the label* returned the edit,
marked in red and green, with *Use it · Change it · Talk about it*.

## 10. Develop walk (local, 2026-11-05) — findings

The opening screen ("Explore your Work") is already much plainer than this morning's audit. The
friction is in what follows.

| # | Moment | What a writer meets |
|---|---|---|
| V1 | "What does MAIA think?" | Three blocks saying the same thing ("I don't have a saved reading…", "NOT READ YET · MAIA hasn't read this Work for Development yet", "You can choose exactly what she reads below"), and the only action is a small link at the bottom. |
| V2 | Choosing what she reads | "Opening this field never reads more of your Work", then Current section / Whole Work / Choose a range, then **Read for Development**. |
| V3 | A further gate | "This part of your Work has changed since its last reading snapshot. Save the current draft…" with **Save current draft & read**. Four clicks and three explanations before MAIA reads anything. |
| V4 | ⭐ The result | **MAIA's specific observation is hidden** behind "See the saved reading in full", while the card shows a generic template ("Something may still be open… MAIA noticed something introduced here"), which never says *what*. Her actual words name the three explanations and the unextended "most frightening". |
| V5 | Around it | About 10 actions under one observation (Stay with this in Write · Show me in the manuscript · Talk with MAIA · Help me understand · Go deeper · Previous · See another · See the evidence and limits · Read somewhere else · See the saved reading), plus "MAIA read 1 of 1 section in full · Read 11/5/2026 · Current", and the right panel repeats the same offers (Explain it plainly · Talk with me about it · Teach me what is happening). |
| V6 | Reassurance by denial | "Nothing is read automatically", "Nothing is read or changed until you choose it", "never reads more of your Work", repeated on most screens. |

### Proposed Develop design (same principles as the Conversation Stage)

1. **She asks once, in one message, with buttons.** "I haven't read Section 1 yet. Shall I read
   it now?" → **Read Section 1** · **Read the whole Work** (· *a range…* under More). The button
   saves and reads in one press (her words: "your writing won't change"). The writer's consent is
   the press; no separate gates.
2. **Her real words come first.** Each observation is shown as MAIA speaking her own specific
   observation, quoting the words she means. The category ("Unresolved thread") becomes a small
   label; the template sentence goes.
3. **One next step, as a conversation.** Under each observation: answer choices where they fit
   (e.g. *It's open on purpose* · *I mean to come back to it*) and **Talk about this passage**,
   which opens the Conversation Stage on the cited words with her observation as the first turn
   (flow-review step 5; Develop leads to editing). "See another" stays. Evidence and limits,
   saved readings, dates and coverage move under **More**.
4. **Say it once.** One quiet line about consent where it matters, not on every screen.
