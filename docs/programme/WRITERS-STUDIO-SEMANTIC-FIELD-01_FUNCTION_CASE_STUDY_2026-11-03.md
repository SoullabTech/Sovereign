# WRITERS-STUDIO-SEMANTIC-FIELD-01 — function case study: conversation first, written options deeper

```
STATUS:     CASE STUDY (founder-requested, 2026-11-03). Every Writer's Studio function walked live, judged on
            three questions: does it work, is it logical, is it simple. The test the founder set: "a
            conversation-first edit approach with options to go deeper into written options."
EVIDENCE:   Production soullab.life. All conversation turns ran 01:28–01:42Z on GIT_COMMIT f21fda83a
            (ask_turns timestamps). Production moved to f159ed71f at 01:46:31Z (another session's deploy:
            #2081, #2078, #2064). "Read this chapter" finished around the swap. Review/Publish/Listen were viewed
            after it; f159ed71f doesn't change those rooms.
            Founder account. Text-changing acts (Save, Apply, Undo) were done on the test Work "Title Tesst";
            Elemental Alchemy was not changed. Develop body-read permission granted by the founder in chat.
            ⛔ Founder use is not member witness: this measures capability and shape, not a writer's experience.
NOT:        A build. Recommendations in §5 are proposals; §6 lists the founder questions they need.
```

## 1. Verdict

**Every core function works.** No function failed, and none produced a wrong or invented result. The conversation
itself is strong: MAIA stays on the writer's words, asks before changing anything, carries an answer forward,
and turns a conversation into a written option that follows from it.

**Against the test, it isn't yet simple.** The Studio has the parts of conversation-first editing, but three things
work against it:

1. **Passage Focus hides the conversation.** Only MAIA's latest reply is shown. The writer's own words and earlier
   turns disappear, so the room looks like a series of single answers, not a conversation.
2. **The written-options view is heavy and repetitive,** and replaces the conversation instead of sitting under it.
3. **Applying a written option takes three hidden steps** (Save, then Read in context, then Apply), and nothing on
   screen says so.

On top of these, the same acts have too many doors (§4.4), and Craftsman's Table duplicates Focus with about
30 controls.

## 2. Functions walked

| Function | Works | Logical | Simple | Evidence |
|---|---|---|---|---|
| Write → select → **Work with passage** menu | ✅ | ✅ | ✅ | Elemental Alchemy (textarea), Title Tesst (direct selection) |
| Menu → **Focus** | ✅ | ✅ | ✅ | opens with no stale conversation |
| Menu → **Teach me about this** | ✅ | ✅ | ✅ | one idea + a steering question (thread `1b4a992f`, earlier run) |
| Focus card **Discuss what's happening** | ✅ | ✅ | ⚠️ | strong, 282 words, three observations, then a question (`9f9f1360`) |
| Free **Ask MAIA** box, as a reply to MAIA | ✅ | ✅ | ⚠️ | carried the conversation forward exactly; but the writer's message isn't shown |
| Follow-up **Show revision options** | ✅ | ✅ | ❌ | the option follows the conversation ("finally" → "First time I could get you…"); heavy view |
| Card **Show edit options** | ✅ | ✅ | ❌ | one small, well-judged change; same heavy view (`ae5e5d2e`) |
| **Explain this change** | ✅ | ✅ | ⚠️ | good explanation; shown above the same full packet |
| **Another option** | ✅ | ✅ | ⚠️ | two options side by side; muddled labels ("MAIA's recommendation · Alternative") |
| Relationship gate → **Begin relationship with MAIA** | ✅ | ✅ | ✅ | clear refusal ("Nothing has been sent"); the held card then ran by itself |
| **Save my version** | ✅ | ✅ | ⚠️ | "Saved"; Apply still disabled with no reason given |
| **Read my version in context** | ✅ | ⚠️ | ❌ | a required step before Apply that reads as optional |
| **Apply my version** | ✅ | ✅ | ⚠️ | manuscript changed (Title Tesst) |
| **Undo this change** | ✅ | ✅ | ✅ | returned after reopening Focus; manuscript restored, clear message |
| **Craftsman's Table** | ✅ (opens) | ⚠️ | ❌ | ~30 controls; cramped at 800 px; reuses Focus's saved version |
| **Start a new conversation** (Focus, Work conversation) | ✅ | ✅ | ✅ | earlier witness; chooser lists the old one |
| Work conversation (**Talk about this place**) | ✅ | ✅ | ✅ | pointed to the editorial pass and flagged real heading problems |
| 1B buttons **Go to "Read this chapter"** / **Go to "Start an editorial pass"** | ✅ | ✅ | ✅ | each landed on the right control, pressing nothing |
| Develop **Teach me what is happening** + read permission | ✅ | ✅ | ✅ | read §175/176/182 after consent; one idea, honest limits, a question |
| Develop **Read this chapter** | ✅ | ✅ | ✅ | plain reading in under a minute, then five deeper options |
| **Import writing** | ✅ (offered) | ✅ | ✅ | PDF/EPUB/DOCX/TXT/MD; nothing uploaded (earlier witness) |
| Review / Publish / Listen | ✅ (load) | ✅ | ✅ | Publish says plainly it's a preview; Listen records; not exercised further |

**Not exercised:** Speak (needs audio), Ordinary/Sanctuary (already chosen), Why this? / Change it on revision marks,
Revision latitude changes, Start an editorial pass (whole-manuscript read), Craftsman's Table actions, and the
1B Craftsman's Table and new-conversation buttons live.

## 3. What works well (keep)

- **The conversation itself.** MAIA asks before editing ("is this meant to land as God being genuinely exasperated…?"),
  takes the writer's answer, and refines. That is the conversation-first behaviour the founder described.
- **Conversation leads into options.** "Show revision options" after a conversation produced an edit grounded in what
  the writer had just said. The bridge from talk to text exists and works.
- **Gates explain themselves.** The relationship gate and the Develop read permission say what's needed and that
  nothing has been sent or read; the held card continues once the writer acts.
- **Undo is real and clear.**
- **1A/1B make the Studio navigable by asking.** MAIA names real controls and offers a click that only takes you there.

## 4. Findings (ranked)

### 4.1 Focus doesn't show the conversation (most important)
Only `lastMaiaTurn` renders (`EditorialDancePanel.tsx`). The writer's question, their reply ("Tired and
affectionate…") and MAIA's earlier turns are invisible. Conversation-first editing needs the conversation on screen.

### 4.2 The written-options view repeats itself and replaces the conversation
On one screen: the edit's purpose ×3 (recommendation title, "Editorial purpose", "Why"), what was protected ×2
("What I'd preserve", "What I protected"), the revised text ×2 plus a diff, a "Reader effect" placeholder, then
7 adjustment buttons, 3 "another direction" buttons and a working-version editor (17 buttons in the room). The
conversation that led here is gone.

### 4.3 Apply hides two prerequisite steps
`applyReady` requires a saved version **and** that the writer pressed "Read my version in context"
(`EditorialDancePanel.tsx`). The disabled button gives no reason. A writer who saves and wants to apply is stuck.

### 4.4 Too many doors to the same acts
- **Discuss:** menu "Discuss", card "Discuss what's happening", follow-up "Discuss further", "Talk it through",
  Craftsman's "Discuss".
- **Teach:** "Teach me about this", "Teach me about the writing", "Teach me more", "Teach me why", Develop's "Teach me
  what is happening".
- **Options:** "Show edit options", "Show revision options", "Give me ideas", "Show me examples", "Another option",
  "Want another direction?".
In a conversation-first room most of these are things a writer can just say.

### 4.5 Craftsman's Table duplicates Focus
A second room for working on the same passage, with about 30 controls (Markup/Preview, Guided/Professional,
Previous/Next passage, Stay here, Choose passage, Ask MAIA where next, Suggest an edit, Discuss, Write here, Write
from mine, Edit current hybrid, Save, Apply, Next focus, Stop revisions, Another example, Bring into my question,
Ways to work, Work it through…). It's cramped at 800 px (one notice wraps a word per line) and shares Focus's saved
version, so "Apply my version" is offered there after an Undo in Focus.

### 4.6 Smaller
- The free box gets the conversational shape (3C); the **cards don't** (Discuss gave 282 words, three observations).
- **Option labels** read "MAIA's recommendation · Alternative" for the newest and use the descriptive name for the
  older one.
- **Studio guide gaps:** "Give me ideas", "Discuss further" and "Show examples" exist but aren't in MAIA's guide.
- **Develop:** before read permission is granted, the pending question shown under "YOU" is an older one; after
  permission she answers the right question.
- After a 1B jump the address keeps the Focus conversation's `editorialThread` and `s` (harmless here).
- The cut-off Work-conversation reply (§4 of the guide witness) did not recur; still unattributed.
- **Deploy lane:** production moved to `f159ed71f` during this walk through another session's deploy, although the
  founder ruled that this session deploys. Reported, not acted on.

## 5. Proposed shape: conversation-first Focus (for founder ruling)

1. **One conversation on screen.** Focus shows the whole exchange (writer and MAIA turns), newest at the bottom, with
   one composer. Cards remain only as starters for an empty conversation.
2. **Written options appear inside the conversation, when asked.** "Show me options" (button or words) adds a compact
   option card to the conversation: the revised passage with changes marked, one line of purpose, and three actions:
   **Use this · Adjust · Another**. "Why", "what I protected" and the full diff sit behind one "More" disclosure (the
   "go deeper" layer).
3. **Use this = one act.** Show the passage in context inside the card and apply on one press, with Undo right there.
   (Keeps the writer as the only one who applies; removes the hidden Save → Read → Apply sequence.)
4. **Fewer doors.** Keep Discuss / Options / Teach as the three starters; everything else is a sentence to MAIA.
   Give the cards the same conversational shape as the free box.
5. **Craftsman's Table becomes Focus's deeper mode, not a second room** (or is retired), so there's one place to work
   on a passage.

## 6. Founder questions

1. Adopt §5 as the target shape for Passage Focus?
2. Craftsman's Table: fold into Focus as its "deeper" mode, or keep it as a separate room?
3. "Use this" as a single apply (with the in-context view inside the card), replacing Save → Read in context → Apply?

## 7. Founder ruling (2026-11-03, in session): §5 ADOPTED

The founder adopted the conversation-first Focus shape in §5, answering §6.1. Read as including its two
bundled choices:
- **§6.3:** "Use this" is a single apply (in-context view inside the option card, one press, Undo beside it),
  replacing Save → Read in context → Apply. Applying stays the writer's own act.
- **§6.2:** Craftsman's Table becomes Focus's **deeper mode**, not a separate room. Retiring it was not chosen.

This is design adoption. Each step below is built and reviewed in its own PR, with tests, and deployed by a
separate founder act.

### Build order (dependency first)

1. **Card acts become server-owned (F1 extended).** Discuss, Show edit options / Show revision options, Show me
   examples, Give me ideas and Go deeper still send composed instructions as the writer's own words
   (`EditorialDancePanel.tsx`). Before Focus can show the conversation, each card must send only its button's
   words plus a closed field, with the instruction added server-side. Teach-me already does this (#2071); the
   free box does with `turnShape` (#2073). Teach wording stays the implicit-Academy session's.
2. **Focus shows the conversation:** writer and MAIA turns, newest last, one composer; cards only as starters.
3. **Option card inside the conversation:** the changed passage with marks, one line of purpose,
   **Use this · Adjust · Another**, with "why / what I protected / diff" behind **More**. "Use this" = one apply.
4. **Fewer doors:** Discuss / Options / Teach as the starters; cards take the conversational shape.
5. **Craftsman's Table folded into Focus** as its deeper mode.

## 8. Steps 1 and 2 live (witness, 2026-11-03)

```
EVIDENCE:   Production GIT_COMMIT 374c472a9 (cutover 11:47:23Z, founder-authorized; carries #2085 step 1 and
            #2087 step 2). printenv == Config.Env == asserted; healthy; restarts 0; 0 error lines after the swap.
            Founder account, Elemental Alchemy, thread 18633ebb, 11:48–11:50Z. ⛔ Founder use is not member witness.
```

- **Card → conversation.** "Discuss what's happening" on "The four of them crowded in around a statue…".
  Focus showed **You:** "Let's talk about what's happening in this passage." and then MAIA's reply in the Discuss
  shape (observations, then one question). The instruction reached her server-side; it wasn't stored as the
  writer's words.
- **Reply in the box.** "It's there to protect the joke." The conversation then showed all four turns, oldest
  first. While MAIA answered, the earlier turns stayed and "MAIA is with the passage…" showed.
- **Deeper into written options.** "Show revision options" gave an option grounded in the conversation ("Keep
  the guard, drop the aside"), with **"The conversation so far (6 turns)"** above it.
- **Stored writer turns** (`ask_turns`, exact): `Let's talk about what's happening in this passage.` ·
  `It's there to protect the joke.` · `Show me revision options, from what we've discussed.` No instruction text.

**Steps 1 and 2: PASS.** Open, carried to the next steps:
- The writer's just-sent message doesn't appear until MAIA's reply arrives (the thread is reread after the turn).
  Showing it at once belongs with step 3's conversation work.
- Written options still replace the reply area (the conversation is folded above them). That is step 3.
