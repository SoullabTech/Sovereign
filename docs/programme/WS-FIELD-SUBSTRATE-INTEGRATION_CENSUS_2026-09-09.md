# WRITER'S STUDIO — FIELD + SUBSTRATE INTEGRATION · CENSUS

**Authorized:** *"Put the new room around the proven writing engine; do not rebuild the
engine to obtain the room."* Integration work **GO**; production replacement **HOLD**
until the navigation/place defect is repaired and the integrated field is witnessed
against the real manuscript.

**Method:** read-only census on canonical `5b133abcd`. No product code changed. Nothing
executed. No manuscript copied.

⛔ **No integration code is written in this document.** It establishes what the two
halves actually are, because the census found that the shape of the authorized work is
not the shape it was assumed to have.

---

## 1 · ⭐ THE HEADLINE: THERE ARE NOT TWO CODEBASES TO MERGE

The mission was framed as a controlled integration of two lines of work. The census
finds that only one of the two halves exists as code, and it is the substrate.

```text
THE ENGINE          canonical, present, real          app/writers-studio/canvas/*
THE ROOM            a published artifact              NOT IN THE REPOSITORY
```

### 1.1 The prototype branch is not the source of the room

`534d3439e` sits on `origin/feature/jarvis-ws2-sel0-production-discovery-2026-09-08`,
which forked from canonical at `6345b8e08`. Its entire `app/` + `components/` delta is
**ten files**:

```text
app/api/sovereign/manuscripts/[id]/ask/route.ts        +171
app/api/sovereign/manuscripts/[id]/encounter/route.ts  +114   (+2 test files)
app/api/sovereign/living-works/[id]/route.ts             +6
app/api/sovereign/living-works/[id]/visual/route.ts     +10
app/press/manuscript/page.tsx                           +11
app/writers-studio/HomeView.tsx                         +10
app/writers-studio/develop/DevelopRoom.tsx              +21
```

**None of them is the Field + Orbit surface.** There is no Focus Frame, no orbit, no
Focus strip, no Workbench drawer anywhere in that branch's `app/` tree.

### 1.2 ⛔ AND THE PROTOTYPE BRANCH IS *BEHIND* CANONICAL ON THE ONE ROOM FILE IT TOUCHES

`develop/DevelopRoom.tsx` differs by `+24 / −29` — and the direction is the wrong one.
Canonical carries the R-4 refusal-copy work (`3c7ce921f`, *"a refusal that says what
happened, to the member and to the operator"*); `534d3439e` predates it and would remove
`OUTCOME_SENTENCE`, `causeLine()`, `data-develop-completion` and `data-develop-attribution`.

⛔ **A literal merge of that branch into canonical would be a regression, not an
integration.** This is the concrete form of the founder's own instinct that this must not
be a "merge these two codebases" operation.

### 1.3 The two `__fixtures__` compositions are already identical on both refs

`studio/__fixtures__/WritingFieldComposition.tsx`, `CanonicalRail.tsx` and
`InertControls.tsx` are **byte-identical** on canonical and on the prototype tip. They are
the **WS2-02B** composition derived from `04-writing-field-wide` — inert, route-less,
reference content, *and not the D9 Field + Orbit form.* They predate it.

---

## 2 · ⭐⭐ WHERE THE ACCEPTED FORM ACTUALLY LIVES

Thirteen D9 witness scripts (`scripts/witness/d9-*.mjs`, prototype branch only) all begin:

```js
await p.goto('file://' + process.cwd() + '/ch4-working.html');
```

`ch4-working.html` **is not committed on any ref, and never has been.** So today:

> ⛔ **All thirteen D9 witnesses are unrunnable from a clean checkout.** They assert
> against a file that does not exist in the repository.

That is the same defect class this programme has already named twice — the ephemeral
falsifier (*"a machine subject that cannot be re-witnessed on demand degrades into a
claim"*) and `@playwright/test` being imported by `e2e/` without being declared. Here it
has reached the **design** evidence: the D9 acceptance walk is recorded, and the surface
it was walked on is not in the tree.

### 2.1 ⭐ The carrier is recoverable, and has been recovered

`docs/programme/JARVIS-WS2-DEVELOP_D9_ORBIT_PROTOTYPE_2026-09-09.md` names it:

```text
artifact   https://claude.ai/code/artifact/bff88df8-b4ba-46f0-8000-0acede01334e
title      "Chapter Four, Working"
baseline   the pure-Field control is preserved in that artifact's version
           history, labelled "Published Ch4 restored"
```

It was read in this session: **888 lines, 62KB, single-file HTML, owned privately.**
`ch4-working.html` was a local download of it. **So the form is a retrievable subject,
not a lost one** — but it is retrievable from the artifact service, not from git, and
nothing in the repository says so.

### 2.2 The form, as the recovered source actually implements it

```text
RAIL         3.25rem fixed left · Struct · MAIA · Workbench
             no counts, no badges, no indicators
ORBITS       ALL position:fixed. ⭐ None participates in layout, so the Work
             cannot reflow when a capability enters.
APERTURE     body.structopen / .maiaopen / .benchopen add PADDING.
             ⭐ "An orbit may reduce the field around the Work. It may not lie
             on top of it." Same words, same scroll position, narrower aperture.
FOCUS        CSS Custom Highlight API — ::highlight(held) — painted
             independently of the browser selection, so focus SURVIVES the
             composer taking keyboard focus. #frame is an absolutely positioned
             writer-draggable aperture with top/bottom handles.
FOCUS STRIP  #focus — accent left rule, "Focus · <SCALE>", the framed text,
             Wider / Narrower / Release, and #focusJump back to the frame.
LADDER       selection → paragraph → section(s) → whole chapter, and back.
THREAD       #thread — MAIA's colour, thinner rule, NEVER the accent.
             ⭐ "A thread is subordinate to the Focus. It never becomes a second
             Focus and it never touches the Work."
CONVERSATION lives in the MAIA orbit; only the composer travels (534d3439e).
```

⭐ **The founder's preferred treatment C is already the prototype's own law.** The
recovered source states it in a comment, unprompted: `FOCUS = what in the Work we are
attending to. THREAD = what in our conversation we are pursuing about it.` The design
study is therefore not choosing a direction — it is testing whether that separation
survives contact with a 262-section book.

---

## 3 · The substrate the room must wrap

```text
canvas/WholeManuscriptSurface.tsx     18KB · windowing, mount set, focus pin
canvas/SectionWritingSession.tsx      section ↔ whole, autosave, custody
canvas/StructuredOutline.tsx          the rail's data and gold row
canvas/page.tsx                       the wiring the prototype branch does not have
__tests__/wholeManuscriptSurface.test.ts
__tests__/makeWorkReach.test.ts
```

⛔ These exist **only on canonical.** They are the H2 lane, merged, at real-book human
acceptance **7 PASS / 1 FAIL**.

---

## 4 · ⭐ THE SEAM COLLISION — the one sequencing fact that must not be discovered late

The mission says: *"do not solve the known navigation defect opportunistically inside
this integration."* Correct — and it has a consequence that has to be designed for, not
discovered.

**Finding A lives exactly on the seam the integration replaces.** Finding A is a
navigation defect in `StructuredOutline.tsx:169` / `WholeManuscriptSurface.tsx:278` —
which is *the rail and the destination*, i.e. precisely the "rail presentation" and
"navigation placement" the integration is authorized to recompose.

```text
REPLACE / RECOMPOSE     rail presentation          ← Finding A lives here
DO NOT                  solve the navigation defect ← also here
```

Both can be true only if the integration **carries the navigation call unchanged** rather
than reimplementing it. Any rewrite of the jump — however well-intentioned — either
silently repairs Finding A (destroying the repair lane's subject) or silently re-breaks it
in a new place (destroying the census's diagnosis).

⭐ **The integration must therefore preserve `scrollIntoView` call sites byte-for-byte,
defect included, and change only what surrounds them.** A room that quietly fixed the
engine while claiming only to have been built around it would make both lanes
unfalsifiable.

There is a second reason this matters. The Finding A census established that the room's
scroll container geometry is itself an open question — `StudioPanel`'s content wrapper has
no `height` and no `flex` while the scroller inside asks `height: '100%'`. The
integration changes exactly that geometry. **So the integration can move Finding A's
diagnosis even without touching its code.** Whichever lane runs second inherits a changed
subject.

⛔ **Recorded, not resolved.** Sequencing A-then-integration versus integration-then-A is
a founder call.

---

## 5 · The design study, as designed — NOT YET BUILT

Authorized as *hours, not a research programme.* Three treatments, behaviour identical,
walked over the same eight acts.

```text
A   FOCUS FRAME PRIMARY     section divisions extremely quiet; rail says location;
                            a visible frame only on intentional shared attention
B   SECTION PRIMARY         current section gets spatial treatment; Focus becomes
                            an inset mark inside it
C   LOCATION / FOCUS / THREAD DELIBERATELY DIFFERENT      ← founder's preference
      LOCATION  where am I in the Work        rail + quiet section boundary
      FOCUS     what are we looking at        Focus Frame
      THREAD    what are we pursuing about it MAIA orbit / Focus strip
```

**The walk:** read normally · jump to another section · select one sentence · widen Focus
to a passage · Ask MAIA · Work with one observation · close MAIA · continue writing.

**The falsifier — one, hard:**

> At no moment should the writer have to ask whether a visual mark represents **location**,
> **attention**, or **conversation**. If a treatment makes two of those meanings look the
> same, reject it.

### 5.1 ⚠️ Act 2 of the walk is the known blocking defect

*"jump to another section"* is Finding A. On the real book it fails **identically in all
three treatments**, because all three share the substrate. It therefore **discriminates
nothing** and must be recorded as **BLOCKED — not as a treatment failure.** A study that
scored act 2 would be scoring the engine while claiming to compare rooms.

⭐ The other seven acts discriminate normally and are the study.

### 5.2 The surface the study is walked on — a fork, with a recommendation

```text
(i)  the recovered prototype        available today · hours · real Ch4 corpus
                                    ⛔ proves visual semantics only, not the engine
(ii) the real substrate, in the     the honest walk · doubles as the first
     isolated Class A runtime       integration increment · needs the PR #1272
                                    tooling, which is draft and unmerged
```

**Recommendation: (ii).** The study's own question — *which version makes you stop
noticing the interface fastest* — is a question about a 262-section book with variably
sized sections, and (i) has ten uniform ones. The Finding A census already established
that a uniform corpus cannot reproduce this class of defect. ⛔ Founder's call.

---

## 6 · ⛔ The custody question this census will not decide

The prototype's corpus is **real book text** — ten sections of *Elemental Alchemy*
Chapter 4, inline in the artifact. Committing the recovered carrier verbatim would put
real member text permanently into git.

⭐ **That is a founder act, and it is deliberately not taken here.** The standing law:
*real member text should cross the custody boundary only after every failure that can be
discovered without it has already been eliminated* — and permanence raises that bar, not
lowers it.

Three options, none taken:

```text
a   commit the carrier verbatim              real book text enters git permanently
b   commit a corpus-free carrier             ⛔ changes section indices; the thirteen
    + gitignored corpus                      D9 witnesses assert on s0/s2/3/4/5/8
c   commit nothing; record the artifact      what this document does today
    URL + version label as the subject
```

Today the census takes **(c)**, which is the minimum that stops the form being a claim.
⛔ It does **not** make the D9 witnesses runnable — that needs (a) or (b).

---

## 7 · What does NOT come across, restated from the mission

```text
⛔ the fixture responder      respond() / F[] / provisional() — canned cognition
⛔ the prototype corpus       SECS[] is ten sections; the Work has 262
⛔ generic MAIA wiring        the Canvas conversation bypasses CanonicalTurn.
                             Visual integration and whole-organism MAIA
                             integration remain SEPARABLE and stay separate.
⛔ writers_studio room policy · canonical producer policy · manuscript persistence
```

⭐ The Ask MAIA gesture in the ported shell reaches the **existing** Canvas conversation
path, unchanged and unimproved, and must be labelled as not-CanonicalTurn where it lands.
Putting a better panel in front of the old path and calling it finished is the specific
failure the mission names.

---

## 8 · Standing

```text
integration branch     claude/ws-field-substrate-integration @ 5b133abcd
integration code       NOT WRITTEN
design study           DESIGNED · NOT BUILT · surface fork open
D9 form                RECOVERED as a subject (artifact URL) · not in git
D9 witnesses           13 · UNRUNNABLE from a clean checkout
534d3439e              ⛔ NOT a merge source · behind canonical on DevelopRoom.tsx
Finding A              census complete · repair NOT SCOPED · seam collision recorded
Finding B              unverified · implicated by the same mechanism
H2                     e20e32704 · frozen · the subject that FAILED §4b
production             ⛔ HOLD
```

---

*Put the new room around the proven writing engine; do not rebuild the engine to obtain
the room. This census establishes that the engine is in the tree, the room is not, and
that the room is recoverable — so the work ahead is a build to a recovered form, not a
merge of two branches.*
