# Living Field — First-Entry Human Production Witness Protocol

**Date:** 2026-10-01
**Protocol status:** PRE-REGISTERED · HUMAN WITNESS NOT YET RUN
**Production condition:** admitted cohort member with genuinely empty member-owned Living Field substrate
**Standing:** first-entry evidence only · does not substitute for populated-field ownership/continuity evidence

> The empty field is not missing test data. It is the member's real first-entry condition.

## 1 · Human-only question

This witness asks:

> **Can a first-time member understand the Living Field as an invitation to author and explore
> their own field — rather than as a diagnosis, profile, or system interpretation already written
> about them?**

It also tests whether the early R1R3 instrument is discoverable and whether MAIA remains outside
the member's exploration until the member makes an explicit MAIA gesture — **Explore with MAIA →** at the field level or **Enter this dimension with MAIA** inside a dimension.

It does **not** claim that an already-populated Living Field feels continuous with the member's
existing lived material. That is a later witness.

## 2 · Preconditions

Run only when:

1. the member is already in the Early Field production cohort;
2. they use their own ordinary production account and existing session;
3. aggregate readiness confirms no persisted member-owned Living Field / constellation / governed-flow substrate for that participant;
4. production health is green and runtime SHA is recorded;
5. the early-field admission endpoint returns `admitted:true`;
6. explicit MAIA entry is present in the deployed build;
7. no session credential, private content, or new telemetry is obtained for the witness.

## 3 · What to tell the member

Before the first attempt:

> You're trying an early way of entering the Living Field. Nothing has been written into your
> field for this test. You do not have to create anything. Explore whatever draws your attention.
> If you choose to write something, write only what is genuinely true for you. You can explore
> without talking with MAIA; MAIA begins only when you explicitly choose a MAIA action — either
> “Explore with MAIA →” or “Enter this dimension with MAIA.” You may stop at any time.

Then give only this task:

> **Start from the House and enter your Living Field. Explore whatever draws your attention.
> Follow one path if you want to. Do whatever feels natural when you reach a dimension, then
> return toward the wider field and Home. Say what you are noticing if you are comfortable.**

Do not ask them to create an expression, choose a particular element, or enter MAIA.

## 4 · Observe

Record:

- what they believe the Living Field is on arrival;
- whether an empty personal field feels open/invitational, blank/confusing, or diagnostic;
- what draws attention first;
- whether recursive regions are discoverable without explanation;
- whether progressive labels orient or prescribe;
- what they believe is already known about them;
- whether the direct-writing affordance is discoverable without pressure;
- whether they choose to write, decline to write, or ignore it;
- whether any saved expression is clearly understood as **written by them**;
- whether MAIA is understood as absent until explicit entry;
- whether widening and Return Home remain legible.
## 5 · Content-creation law

> **The witness may observe authentic authorship; it may not demand authorship to make the test pass.**

If the member spontaneously writes and saves an expression that is genuinely theirs:

- the act is valid first-entry evidence;
- the resulting record is authentic member-owned substrate;
- record only that a save occurred, never the private text;
- verify that provenance reads **Written by you**;
- do not immediately reinterpret the save as permission to begin the populated-field witness in
  the same uncoached pass.

If the member chooses not to write, that is also valid evidence. The witness can still adjudicate
orientation, discoverability, non-diagnostic framing, consent, and return.

## 6 · Stop conditions

STOP / NOT ADMITTED if:

- the field presents system-authored material as though the member authored it;
- another member's material appears;
- the empty state makes an unsupported claim about who the member is;
- opening a dimension begins MAIA before explicit entry;
- the member reasonably believes MAIA has already interpreted or received material when she has not;
- saving changes material the member did not choose to change;
- the member cannot safely return to the wider field or Home;
- any privacy, authentication, authorship, or consent boundary fails.

Ordinary uncertainty, aesthetic dislike, or choosing not to write is not a STOP condition.
## 7 · Post-walk questions

Ask after the uncoached pass:

1. **What did you think the Living Field was when you first arrived?**
2. **Did it feel like an invitation to discover or author something, or like the system already had an idea about you?**
3. **What made you know where you could go next?**
4. **When you reached a dimension, what did you think you were being invited to do?**
5. **Did you feel any pressure to write something?**
6. **Before choosing MAIA, what did you think MAIA could already see or do?**
7. **Did the MAIA entry feel like a separate choice?**
8. **Could you find your way wider and Home again?**
9. **What would you naturally want to do next?**

Paraphrase by default. Do not preserve private expression text.

## 8 · Adjudication

### FIRST-ENTRY PASS

Requires:

- the field is understood as open/member-owned rather than diagnostic;
- navigation is discoverable enough to complete one recursive movement without coaching;
- labels do not falsely prescribe meaning;
- authorship remains optional and clearly member-owned;
- MAIA entry is understood as a separate voluntary act;
- widening/return are recoverable;
- no unresolved privacy, authorship, or consent concern remains.

### FIRST-ENTRY PASS WITH FRICTION

Use when the semantic and consent boundaries hold but recoverable wording, navigation, visual,
touch-target, empty-state, or orientation friction appears.

### NOT ADMITTED / STOP

Use for any §6 boundary failure.

One first-entry PASS proves only that the empty-field entry can be inhabited coherently by that
participant. It does not establish populated-field continuity, cohort-wide preference, or widening readiness.

## Amendment 1 · 2026-10-01 · before any run (pre-registration amendment)

Occasioned by the RC1 deploy (`03f0fd3ab`, 14:35Z), which moved production off the runtime at
which readiness was censused (`975a208b8`). Precondition 4 is tightened. No other clause changes.

- **4a.** Record the production SHA **at the start and at the end** of the walk. If they differ,
  the walk is **NO EVIDENCE**. Not a partial pass: the member experienced two builds.
- **4b.** If the start SHA differs from the SHA named in the readiness record, preconditions 3, 5 and 6
  must be **re-witnessed live** at the start SHA, and a source re-baseline must show that the
  intervening change did not touch Living Field surfaces. If it did, re-census readiness first.
  The RC1 re-baseline is `LIVING-FIELD_WITNESS_REBASELINE_RC1_2026-10-01.md`.


## Amendment 2 · 2026-10-01 · before any run (founder-directed pre-registration amendment)

Occasioned by the proposal to verify admission by signing into a cohort account on the Mac Studio,
a machine whose browser an AI agent session can control. Two acts had been merged into one: checking
whether a member is admitted, and the member's walk. They are separated here. Precondition 5 is
replaced, precondition 2 is tightened, §3 gains a disclosure, and precondition 8 is added.
No other clause changes.

- **5 (replaces).** Admission is verified **server-side and read-only**. Nobody signs into, borrows,
  or opens the member's account or session to check it. The check runs the same decision function
  the route uses (`decideEarlyField` in `lib/access/earlyFieldAccess.ts`) against the live container
  environment, and prints a boolean and nothing else:

  ```bash
  ssh soullab@minisforum "docker exec -e EF_MEMBER=<member-uuid> maia-sovereign npx tsx -e \"
    import { decideEarlyField, earlyFieldConfigFromEnv } from './lib/access/earlyFieldAccess';
    console.log(JSON.stringify({ admitted: decideEarlyField(process.env.EF_MEMBER, earlyFieldConfigFromEnv()) }));\""
  ```

  The member UUID is an operational input. It is **never written into the witness record**, which
  uses the participant label only. ⚠️ This command has not been run from the repository session
  that wrote it. Its first run is its own evidence: if it errors, precondition 5 is unmet. That
  outcome is not a reason to fall back to a member session.
- **2 (tightened).** The member signs in **themselves**, on **their own device**, in their ordinary
  browser. The facilitator never types the member's credentials, and no shared or operator machine
  is used by default.
- **8 (new). No undisclosed observer.** Before the walk, every channel through which the walk can be
  seen is known, and each one is either disclosed to the member and accepted, or absent. This
  includes the facilitator (in person, or on a call the member chose), screen-share, screen or video
  recording, screenshots, and **any AI agent session that can read or control the browser or
  screen** (for example a Desktop Commander or remote-control connection on the device used).
  An AI agent with that access must not be connected to the member's device. If the walk has to
  happen on the Mac Studio, the agent connection is closed for the walk, **and** the member is told
  that the machine is one an AI agent can normally operate and that it has been disconnected.
  An observer the member was not told about makes the walk **NO EVIDENCE**, whatever it recorded.
  The consent test cannot pass while its own observation breaks consent.

**§3 addition: say this before the existing text, and adapt it to the actual setup.**
Written to be spoken. Read it aloud once before using it.

> Before we start, I'd like you to know exactly who's with you. It's just me, [here with you /
> on this call]. Nothing is recording your screen, and no AI is connected to your device or
> watching what you do. MAIA only joins if you choose her, the way I'll describe in a moment.
> While you explore, I'll jot a few notes in my own words about what you do
> and say, but I won't copy anything you write in your field. The notes are kept under a label,
> not your name. If there's anything you'd rather I leave out, just tell me, now or afterwards.
> I'm here the whole time, so if anything feels hard, you can say so and we'll stop.

Then continue with the existing §3 text. Its closing *"You may stop at any time"* now repeats this
script; say it once, wherever it lands more naturally.

If any bracket is untrue for the actual setup, say what is true instead. If the member declines
the setup, the walk does not run.
