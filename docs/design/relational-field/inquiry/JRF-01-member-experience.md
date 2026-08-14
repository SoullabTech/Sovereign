**PROPOSED — NOT RATIFIED** · invocation JRF-01 — MEMBER EXPERIENCE · 2026-08-13

# JRF-01 — The member's path: declaring, reading back, and the five later acts

## Scope

**The question given.** Design what a member *encounters* when they create a relationship, make a
declaration, review its exact wording, set retrieval consent, and later Affirm, Correct, Supersede,
Withdraw, or Release it — plus where they meet MAIA's tentative offering and correct it without
ceremony. Experiential floor plan first, per `docs/design/INHABITABLE_ARCHITECTURE.md`.

**What I did not examine.** Production row counts or whether any member has ever used the existing
relationship surface. Mobile/iOS rendering of any surface below. The retrieval side (JRF's other
lanes own `/api/sovereign/app/maia` reconnection). Schema shape — A2 §8 ruling 4 settles that a
dedicated table exists; I design no columns. Voice-mode declaring. The two-member shared space
(`relationship_spaces`) — A1 places item 7 there and it is out of RF-R3.

**What I did not do.** No file outside this one was modified. No code, schema, or migration proposed.

---

## Evidence and existing infrastructure

### The member-facing surface that exists today

**FACT.** A complete member-facing relationship surface exists and is wired end to end:

| Surface | Path |
|---|---|
| Threshold (list of relationships) | `app/relationships/page.tsx` (147 lines) |
| The room (one relationship) | `app/relationships/[id]/page.tsx` (381 lines) |
| Creation | `components/relationships/CreateRelationshipModal.tsx` |
| Card on the threshold | `components/relationships/RelationshipCard.tsx` |
| Timeline | `components/relationships/RelationshipTimeline.tsx` |
| Check-in | `components/relationships/CheckInFlow.tsx` |
| Empty state | `components/relationships/EmptyRelationalField.tsx` |
| Entry point from MAIA | `components/maia/panels/RelationshipsPanel.tsx:32` → `router.push('/relationships')`, mounted by `components/maia/MaiaRightPanelHost.tsx:76` under panel key `relationships`, hosted by `components/maia/MaiaShell.tsx` |
| API | `app/api/relationships/route.ts` (GET, POST) · `[id]/route.ts` (GET, PATCH, DELETE) · `[id]/entries/route.ts` · `[id]/checkin/route.ts` |
| Schema | `database/migrations/20260403000001_relationship_field_v1.sql` — `member_relationships`, `relationship_field_state`, `relationship_entries` |

**FACT.** All four routes authenticate server-side and scope by `session.memberId`
(`app/api/relationships/route.ts:17`, `:57`). A gesture witness in A2 §2 requirement 2's sense —
authenticated route + method + server timestamp — is therefore already producible on this path.
There is no new auth work implied by RF-R3.

**FACT — naming trap, recorded.** The migration named `20260630000008_member_relationships.sql`
does **not** create `member_relationships`. It creates `relationship_spaces`, and its own header
comment (lines 6–7) warns that `member_relationships` "is constitutionally occupied. This table
must not overload it." `member_relationships` is created by `20260403000001_relationship_field_v1.sql:5`.
Anyone binding a name to a file here will bind the wrong one.

**NOT ESTABLISHED.** `DECLARATION_CAPABLE_SOURCES` does not appear as a code symbol on this tree.
Two structurally different methods returned nothing: `grep -rln` across `app/ lib/ components/
database/migrations/`, and `git grep -ln` across all tracked files. A1 and A2 describe it as an
empty set; whether that set exists as code, or only as design language, is not established here.

**FACT.** `member_relational_signals.source` is constrained to `('maia_conversation',
'labtool_manual')` (`database/migrations/20260409000010_member_relational_signals.sql:49`), and
`persistDetectedSignal` exists at `lib/relationships/relationshipSignalService.ts:153`. Consistent
with A2 §0's account. No member-facing surface writes to it.

### Consent-gesture precedent that already exists

**FACT.** Two member-set consent gates exist and share one shape — a per-object preference that is
private by default and opened only by a member act:

- `member_daily_anchors.surface_preference` — `member_pulled` (private) vs `contextual_doorway`.
  Loader gate `lib/anchor/surfacePreference.ts`; route `app/api/anchor/[id]/surface-preference/route.ts`;
  member toggle `app/maia/anchor/history/page.tsx`. Its header comment (lines 13–17) states the
  reasoning: default private, standing consent granted by the member, restorable.
- `member_memory_atoms.return_preference` — same two values; member gesture at
  `app/maia/keep-capture/page.tsx:366-380`, rendered as **Sealed / May return** with the act labelled
  **Allow return / Reseal**.

A2 §7 already directs `retrieval_consent` to follow this shape. **FACT: the shape exists, is
member-facing, and is reversible in both directions.** The keep-capture wording (*Sealed* /
*May return*) is the closest existing member language for the exact question RF-R3 must ask.

### Where the existing surface collides with A5 (the Constitution)

These are stated, not resolved. Each is a FACT about the tree as it stands.

**C1 — The room opens on machine classification, not on the member's words.**
`app/relationships/[id]/page.tsx` orders the room: header → *Current Field* (lines 207–258) →
*Something remains open* (260–272) → *Timeline* (274–321) → *Next Movement* (323–337) → *Open with a
tool* (339–377). *Current Field* renders `fieldTone`, `dominantPattern`, `activeSignals`,
`developmentalTheme` — all system-derived — **above** the member's own timeline. A5 Article I
("the member must be present and primary; their words are the substance, not a caption") and
Article VIII ("the hearth is the member speaking about the relationship") both place the member's
words first. The current hearth is a machine reading.

**C2 — A date without a year.** `RelationshipTimeline.formatDate` (lines 35–47) returns a clock time
for today, `Yesterday`, a weekday name inside 7 days, and `{month, day}` — **with no year** — for
everything older. A5 Article XI: *"Time must be legible — a date without a year is not a history."*
Separately, `RelationshipCard.formatRelativeTime` (lines 16–27) falls through to
`toLocaleDateString()`, which *does* carry a year. The two surfaces disagree about time.

**C3 — Machine condition rendered at the doorway.** The threshold card shows `FieldToneIndicator`
plus up to three `activeSignals` chips (`RelationshipCard.tsx:62-68`) and `checked in Xd ago`
(lines 57–59). A5 Article VI: conditions "may not be derived by the system" and may not be
"ordered, ranked, aggregated, or compared across relationships" — a tone chip on every card in one
list is precisely a cross-relationship comparison. Article V: elapsed-time signals must be
*incapable* of firing where a relationship is held.

**C4 — The room asks for movement it is forbidden to require.** *Next Movement*'s empty state reads
"Check in to receive a grounded next step" (line 333); *Something remains open* renders
`unresolvedThreads` (260–272). A5 Article V: *"No relationship owes the software a next step."*
Article VII: nothing "may treat silence as unfinished business."

**C5 — Unattributed MAIA output stored as relationship knowledge.** `CheckInFlow` renders
`maiaReflection`, `patternHint`, `fieldToneSnapshot`, `suggestedMovement` under the bare headers
*Reflection · Pattern · Field tone · Next movement* (lines 72–96) — no author named, no correction
path — and those values persist into `relationship_entries` (`pattern_hint`, `field_tone_snapshot`,
`suggested_movement`, `confidence`; migration `20260403000001`, lines 44–54). A5 Article II requires
every rendered statement to carry its author and to be correctable. A2 §8 ruling 3 restricts
OBSERVED assertions to in-turn use before RF-R6, with an anti-laundering clause.

**C6 — The only removal path destroys the whole relationship.** `DELETE
/api/relationships/[id]/route.ts:158-170` sets `archived_at` on `member_relationships`. There is no
per-assertion remedy. This is the exact defect A2 §4 records from 2026-08-10 — *"the only remedy was
archiving the whole relationship"* — and it is still the state of the tree.

**C7 — The system container renders among people.** `app/relationships/page.tsx:12` labels the
`outer` realm **"People in your life."** A1's RF-R3-PREREQUISITE and A5 Article X govern this.
I did not verify from production data what currently sits in that bucket; RF-R3-PREREQUISITE owns it.

**C8 — Ceremony parity is inverted for consent.** Across every existing modal, the affirming act is
a filled jade button and the declining act is a small grey text link
(`CreateRelationshipModal.tsx:186-200`; `CheckInFlow.tsx:150-156`). That visual grammar, applied to
a consent question, *is* the dark pattern — before a single word of copy is written.

---

## Proposed design

Everything in this section is **RECOMMENDATION**.

### 0. Human purpose (the sentence the whole surface serves)

> *I am carrying a relationship. I want somewhere to put my own words about it, to find them again
> exactly as I wrote them, and to stay in charge of what MAIA does with them.*

Not: *I want to track my relationships.* Not: *I want insight into my relationships.* If a surface
below stops serving that sentence, it is out.

### 1. Experiential floor plan

Design vocabulary only. Room names below are for builders; member-facing labels are named separately
and must speak the member's world (Inhabitable Architecture, "Vocabulary boundary").

#### THRESHOLD — *the doorstep*

- **Member-facing label:** the plainest available. Recommended: **"People and presences"** — or, if
  the founder prefers one word, the member's own realm names, not "Relational Field."
- **Purpose.** Find your way into one relationship; or make a place for one that has none yet.
- **Emotional arrival state.** Carrying something, often mid-feeling, often heavy. Sometimes arriving
  because MAIA said a name back to them thirty seconds ago.
- **Primary gesture.** Enter a room. (Secondary, always available, never dominant: *make a place for
  someone.*)
- **Allowed objects.** The name the member wrote. A short fragment of *their own last words* about
  that relationship, in their voice, quoted. The date of those words, with the year.
- **Forbidden objects.** Field tone. Active-signal chips. Dominant pattern. Elapsed-time-since
  ("checked in 12d ago"). Counts of anything. Sorting by activity. Any system container rendered
  among people. Any badge indicating a relationship needs attention.

  *Rationale:* removing the tone chip and the elapsed-time line (C3) is not a style preference — A5
  Article VI forbids system-derived condition and cross-relationship comparison, and Article V
  forbids elapsed-time signalling. A member's own last sentence is a truer index than a machine's
  reading of it, and it is the member's, so it cannot rank anything.

#### HEARTH — *the room*

- **Member-facing label:** the person's name. Nothing else. Not "Sarah — Relational Field."
- **Purpose.** Find your own words about this relationship, as you wrote them, in time.
- **Emotional arrival state.** Wanting to be met, or wanting to put something down. On the worst day
  this relationship has, per A5 Article XII, this must still be enterable.
- **Primary gesture.** Write. (Equal and opposite: read back and do nothing.)
- **Allowed objects.** The member's words in reverse-time order — ordinary entries and declarations
  in the *same* stream. Absolute dates with years. Each declaration's standing line. MAIA's
  offerings, visibly in her voice, visibly hers. One quiet door to the relationship's own removal.
- **Forbidden objects.** *Current Field*, *Next Movement*, *Something remains open*, field tone,
  dominant pattern, developmental theme, progress of any kind, any prompt to resolve, any question
  whether a condition has changed (A5 Article VII names that last one explicitly).

**⭐ There is no "Declarations" tab.** Declarations are objects; the hearth is the room. A separate
tab would be exactly the failure Inhabitable Architecture names ("objects do not equal rooms") and
would also make declaring feel like filing rather than saying. A declaration is distinguished from
an ordinary entry by **weight** — more air around it, the words set larger and quoted, and a standing
line beneath — never by segregation.

#### RITE — *declaring* (inside the hearth, not a room)

Three beats, plus a fourth that is deliberately detached. §2 below.

#### READ-BACK — *what stands* (inside the hearth, not a room)

- **Purpose.** See what you said and whether it still holds.
- **Emotional arrival state.** Usually returning after time; sometimes checking whether a thing you
  said in pain is still the thing you'd say.
- **Primary gesture.** A nod (Affirm) — or nothing.
- **Forbidden objects.** Version-history chrome. Diff views. Status chips. Counts of affirmations.
  Any word implying decay: *stale*, *expired*, *needs review*, *out of date*. Nothing ages out of
  standing on its own, because A2 §4 forbids any system process from performing these acts, and the
  read-back must not imply one did.

#### THE NATURAL PATH

```
talking with MAIA
   → something is about this person
   → "put this somewhere"                     ← the room exists, or is made in one gesture
   → the member's words                        ← ordinary entry, OR declared (§2)
   → (a beat) may MAIA bring this back?        ← §3, detached from the declaring
   → later: MAIA quotes it back and asks       ← §5
   → one touch                                 ← §4
```

**The room must be fully meaningful with MAIA absent** (A5 Article VIII). Every gesture above is
reachable from `/relationships` with no conversation ever having happened.

### 2. The declaring gesture — what the member sees

**The problem to solve.** Today, `+ Add entry` offers three kinds — `note`, `reflection`, `threshold`
— as three equal-weight pills (`app/relationships/[id]/page.tsx:286-318`). All three feel identical
because they *are* identical: same box, same button, same result. A declaration cannot be a fourth
pill. A member must be able to tell, a week later and without instruction, that one of the things on
the page is different in kind.

**BEAT 1 — writing.** The member writes in the ordinary composer. Nothing is different yet. Two doors
out, not one:

- **Add to the timeline** — an entry. The existing behaviour. Unchanged.
- **Say this as something that stands** — the declaration door.

Both doors are equally weighted. Declaring is never the default and never the prettier button.

**BEAT 2 — the review.** Taking the declaration door does **not** submit. The surface changes state
visibly: the room quiets (other entries recede), and the member's text is **re-rendered out of the
input box** — set larger, quoted, in a reading face, not an editable field. Beneath it, small:

> **These words will be kept exactly as you wrote them, attached to *Sarah*, dated today.**
> They will not be edited, rephrased, shortened, or summarised — not by us, and not by you. You can
> say something else later, and both will be kept. You can take this out of use, or remove it.

Two acts, equal weight, no default focus, no timer, no auto-advance:

- **This is what I meant** → stored.
- **Let me say it differently** → returns to the composer with the text intact and nothing stored.

There is no third act and no "skip review". Nothing is written until *This is what I meant*.

**Why the review beat is load-bearing.** A2 requirement 4 makes `declared_text` write-once. A member
cannot consent to permanence they were not shown. Re-rendering their words **outside an input box**
is the visual-grammar carrying the meaning: an input box promises editability; a quotation promises
preservation. Remove every word of copy from beat 2 and the layout still says *this is now a thing
you said*. That is the Inhabitable Architecture every-screen test.

**BEAT 3 — kept.** The declaration takes its place in the hearth stream, with its standing line
already reading *"You said this today."* No celebration, no toast, no confetti, no count.

**Not a modal.** All three beats happen in the hearth, in place. A modal would make declaring feel
like a system transaction; it is a member speaking in their own room.

### 3. Retrieval consent — designing "unanswered" as a real outcome

**The ruling.** A2 §8 ruling 2: `retrieval_consent` is FALSE when unanswered; storage does not imply
permission; silence creates no consent.

**The dark-pattern risk, named precisely.** If the consent question is a required step *inside* the
declaring flow, "unanswered" is unreachable — the member is made to answer to finish saying the thing
they came to say, which is coercion by sequencing. If it is a pre-checked box, it is coercion by
default. If it is an unchecked box beside a filled "Save" button, unanswered technically equals
false but the member never knew a question was asked — silent, and the worse failure, because the
system would then hold a consent state the member has no memory of setting.

**The design: the offer comes after, and costs nothing.**

The declaration is **already kept and visibly safe** before the question exists. Then, in the same
place, one beat later:

> **Kept.**
> May MAIA bring this back to you later — in your own words, when it's relevant?
>
> **[ Yes, she may ]**  **[ Not now ]**
>
> *Either way, it stays here. If you don't answer, MAIA won't bring it up.*

Non-coercion requirements, all of which are structural rather than tonal:

1. **The declaration is complete before the ask.** Declining costs the member nothing they came for.
   This is the single most important property; without it every other measure is decoration.
2. **Three real outcomes, two of which are silence.** *Yes* · *Not now* · **scroll away / close /
   navigate**. The third must be genuinely available: no blocking overlay, no focus trap, no
   disabled-until-answered anything. The member can simply keep reading their room.
3. **Equal visual weight.** Both acts render identically — same size, same border, same colour, same
   weight. This directly reverses the existing grammar (C8). If one is filled and one is a grey
   link, the design is coercive regardless of copy.
4. **The consequence of not answering is stated before it happens**, in the same breath as the
   question — the italic line above. The member is never surprised by a state they didn't set.
5. **Asked once.** No re-prompt on a schedule, no nag on next visit, no "you have 4 declarations MAIA
   can't see." A recurring ask is coercion spread over time. The only re-ask is member-initiated
   from the read-back — with one narrow exception put to the founder as decision D2.
6. **No aggregate anywhere.** No counter, no ratio, no "sharing level", no progress toward a fuller
   memory. A number that goes up when you consent is a reward, and a reward is pressure.

**⚠️ FINDING — the two silences must not be flattened in language.** *Never answered* and *said no*
produce the same stored state and the same behaviour. They are different facts about the member.
The read-back must never tell a member who closed a sheet that they **declined**. Recommended
rendering: for both, the neutral **"Kept private — MAIA won't bring this up"**; the difference, if
stored (decision D2), is used only to decide whether the ask may appear once more, never to label
the member.

**Reuse, not a third mechanism.** A2 §7 already directs `retrieval_consent` to follow the atoms /
anchor shape, and that shape is member-facing today (`app/maia/keep-capture/page.tsx:366-380`,
`app/maia/anchor/history/page.tsx`). The member language should converge with it rather than invent
a third vocabulary — but *Sealed / May return* is atom language. For a declaration the honest pair is
**Kept private** / **MAIA may bring this back**.

### 4. Reading back — when it was said, and whether it still stands

A declaration in the hearth renders as four things, in this order:

1. **The words.** Verbatim, quoted, set larger than surrounding entries. Never truncated with an
   ellipsis — A5 Article XI forbids silent truncation of relational significance. If it is long, it
   is long.
2. **When.** **An absolute date carrying the year, always.** *"You said this on 14 August 2026."* A
   relative form (*three months ago*) may accompany it but may never replace it. This is the direct
   remedy for C2 and the Article XI requirement.
3. **Whether it stands** — a **sentence about what the member did**, never a status chip:
   - *Still standing. You last said yes to this on 2 October 2026.*
   - *Still standing. You haven't come back to it since.*
   - *You said it differently on 2 October 2026.* → the newer declaration renders directly beneath,
     in the member's words, with its own date.
   - *True then. On 2 October 2026 you said this is no longer how it is.*
   - *Out of use since 2 October 2026 — MAIA won't bring this up.*
4. **Consent.** *MAIA may bring this back* · *Kept private*. Tappable — this **is** the Withdraw
   control (§5.4).

**No chips.** A5 Article VI forbids status, score, stage, and rank; a coloured pill reading "CURRENT"
is a status by construction. Standing is prose about acts, in the past tense, naming the member as
the actor. *The member did this* is the only voice in which currentness may be spoken.

**Lineage renders inline, in time, not as version history.** A superseded declaration and the one
that followed it appear as two of the member's statements, both whole, both dated, the later one
nested under the earlier. There is no diff, no "v2", no "show history" disclosure. A2 §9: *correction
creates lineage; it never rewrites history* — and lineage rendered as software versioning turns the
member's life into a changelog.

**Eligibility is never shown as a flag.** A2 §9 forbids a cached authority bit. The corollary at the
interface: the read-back must present standing as *the consequence of acts the member can see* —
every act that produced the current standing is visible in the stream above it. If the member cannot
reconstruct why something stands by reading their own room, the surface is asserting rather than
showing.

### 5. The five acts as five felt gestures

#### 5.1 Affirm — *a nod*

**The feeling: agreeing, not filing.** Affirm has no composer, no confirmation, no ceremony. Two
entry points, both incidental:

- In conversation, under MAIA's quoted offering: **still true** (§6).
- In the read-back, on the standing line itself: **still true**.

One touch. The only visible response is the standing line's date changing to today. Nothing else
happens.

**⚠️ FINDING — Affirm's risk is that it feels like it did nothing.** The temptation will be to add a
toast, a streak, or a count of affirmations. All three are forbidden: a count of affirmations is a
metric on a relationship, which A5 Article VI forbids aggregating, and a streak converts a nod into
an obligation, which Article V forbids. The correct answer is to accept the quietness. The date
changed; that is the whole event.

#### 5.2 Correct — *"that's not what I said"*

**The feeling: saying it again, properly.** Entry point is **the words themselves** — the member
touches their own text. The composer opens **empty**, with the old words held visibly above it,
unchanged, while they write.

> *You wrote, on 14 August 2026: "we've stopped calling."*
> **Say it again, the way you meant it.**

**⛔ The composer must not be pre-filled with the old text.** A pre-filled editable field promises
that editing is what is happening; `declared_text` is write-once and editing is precisely what is
*not* happening. A pre-filled box would be an interface lying about the mechanism — the same class
of error as `source` being a label rather than provenance.

Confirmation, after the same review beat as §2: **"Your earlier words stay, marked as something you
corrected."**

#### 5.3 Supersede — *"that was then"*

**The feeling: time moved, and the earlier thing was true.** Same mechanism, different meaning
(A2 §4). Entry point is **the time**, not the words — reached from the standing line.

> *You said this in August.* → **this has changed**
> **What's true now?**

Confirmation: **"August stays as what was true then."**

**⚠️⚠️ FINDING — Correct and Supersede WOULD feel identical to a member if built as two labelled
buttons on the same surface.** Same composer, same outcome, differing only by a word the member must
correctly interpret about their own inner intent. That is the single largest experiential risk in
this design. They become distinct gestures only if **the door differs and the sentence about the old
record afterwards differs**:

| | Correct | Supersede |
|---|---|---|
| Reached from | the words | the date |
| Prompt | *Say it again, the way you meant it* | *What's true now?* |
| The old record afterwards | *something you corrected* | *what was true then* |
| Felt as | fixing a misstatement | marking a change in life |

If a member arrives at the wrong composer, one plain switch is offered **inside** it, phrased as
consequence, never as taxonomy:

- *Keep my earlier words as what was true then* (supersede)
- *My earlier words were wrong — this is what I meant* (correct)

⛔ The words *correct* and *supersede* never appear on a member-facing surface. They are the
system's vocabulary for the member's meaning, and A5 Article VI plus Sovereignty Invariant 14
(cultural sovereignty) both refuse imposing a vocabulary on relational meaning.

**Constitutional tension, named not resolved:** A2 §4 requires the member's intent to be *"captured
explicitly, not inferred from the edit."* Choosing a door labelled with its consequence is an
explicit member act — but only if the door's consequence is legible at the moment of choosing.
Whether that satisfies A2 §4, or whether an explicit member classification is required, is founder
decision **D1**.

#### 5.4 Withdraw — *closing a door*

**The feeling: stopping something, not undoing it.** Withdraw is **not a separate control**. It is
the consent gate (§4, item 4) thrown the other way — the same affordance, in the same place, tapped
again. That identity is the design: the member learns one control, and the act of withdrawing is
literally the act of un-consenting.

Instant. Reversible. **No confirmation dialog.** Asking *are you sure?* when a member withdraws
consent is itself pressure — the system arguing for its own access. The room responds immediately
and plainly: **"MAIA won't bring this up."** The words remain fully visible; nothing is hidden from
the member, only from MAIA.

**⚠️ FINDING — Withdraw and never-consented collapse to one state; keep them apart in language.**
*Kept private* (never granted) vs *You took this out of use on 2 October 2026* (withdrawn). Same
behaviour, different history, and the member's own act deserves to be visible as an act.

#### 5.5 Release — *taking it back*

**The feeling: reclaiming, not recanting.** The only destructive act (A2 §4), and the only one that
should be slightly hard to reach: at the foot of a single declaration's own read-back, never on the
threshold, never in a list, never as a swipe, never adjacent to Withdraw at equal weight.

The confirming surface must carry A2 §9's precision in the member's language, verbatim in substance:

> **Removing this doesn't say it wasn't true.**
> It says it's yours, and you're taking it back. Your words will be gone from here and MAIA will
> have no record of them.
>
> **[ Remove it ]**
> *Or — if you only want MAIA to stop using it, you can keep the words and take them out of use.*

Offering Withdraw as the **nearer door** matters: most members reaching for Release want Withdraw.
Offering it is not friction, it is accuracy about what they are choosing between. It must be offered
once and never insisted upon; if the member proceeds, the removal is immediate and complete.

**⚠️ FINDING — the tree has no per-assertion removal at all today.** `DELETE /api/relationships/[id]`
archives the whole relationship (C6). Until Release exists at the declaration level, the member's
only remedy for one wrong sentence is to lose the relationship's entire history — the exact defect
A2 §4 was written from, still standing.

#### 5.6 Summary of the two collapses

| Pair | Distinct? | Why |
|---|---|---|
| Correct · Supersede | **Only by construction** | Shared mechanism (A2 §4). Distinct entry point + distinct after-language required, or they are one gesture wearing two labels. |
| Withdraw · Release | Distinct **if separated** | Distinct in consequence, but placed side by side in one menu they read as "delete" and "delete-ish". They must never co-occur at equal weight. |
| Affirm · doing nothing | Distinct but silent | Affirm's only artifact is a date. Any attempt to make it feel more substantial (streaks, counts, praise) violates A5 Article V/VI. |

### 6. MAIA's tentative offering, and correcting it without ceremony

**Where it happens.** In the conversation — not in the room. A2 §5 gives the shape of the utterance:

> *"You wrote in June: 'we've stopped calling.' Is that still how it is?"*

**What the member sees.** MAIA's message renders the member's own words **as a quotation, visibly
theirs**, with the date carrying the year, and a question. Directly beneath the quotation, two
lightweight touches — and, unchanged, the ordinary reply box:

> *still true*   ·   *not anymore*

- **still true** → Affirm. One touch, in the flow of talking. This is the "no ceremony" path.
- **not anymore** → opens the supersede door, inline, with the review beat (§2 beat 2) intact.
- **Typing an ordinary reply changes nothing about the declaration's standing.**

**⛔ That last line is the whole safeguard.** The temptation is to read a warm reply as affirmation
and a cool one as change. That is `detect → classify → present as truth`, which A1 forbids by name,
and it would manufacture a member gesture from sentiment — a Declaration constructed after the fact,
which A2 §6 makes structurally unavailable. **Only an explicit touch moves the record.** Just
talking must always be safe.

**Asymmetry with MAIA's own noticing, made visible.** MAIA may also offer something she noticed
herself. That offering:

- is spoken in her own voice and attributed to her — *"That sounds to me like…"* — per A5 Article II
  and A2 §3 (OBSERVED may be offered **only** attributed, and as a question);
- carries **no** *still true* / *not anymore* touches, because there is nothing standing to affirm;
- persists nothing (A2 §8 ruling 3: in-turn only before RF-R6) — including in logs, metrics, or
  agent-run metadata, per the anti-laundering clause.

**The member should be able to feel this difference without being taught it.** Their own words come
back in quotation marks with a date and two touches. MAIA's noticing comes back in her voice with a
question and no touches. The grammar carries it; no explanatory copy is required. That difference —
*what has standing looks different from what does not* — is the single most important thing this
surface teaches, and it must be taught visually, never in a help text.

**Correction without ceremony, stated as the acceptance test:** *not anymore*, then one sentence,
then back to the conversation. If correcting MAIA requires leaving the conversation, the design has
failed.

### 7. Creating a relationship — the small changes

The existing creation flow (`CreateRelationshipModal.tsx`) is close and should be reused, not
rebuilt. Three changes:

1. **The optional note is not a declaration.** Today the modal collects `note` under prompts like
   *"What brought this person to mind?"* (line 16). That text is member-authored but carries no
   review beat and no consent ask — it is an ordinary entry. It must not become a declaration by
   proximity, and the creation flow must not be turned into a declaring flow. Creating a place for
   someone should stay light.
2. **`bond_type` is a system vocabulary offered to the member** — eight fixed labels for `outer`
   (line 8). A5 Article VI and Invariant 14 both bear on this; it is optional today, which is the
   saving grace. It should stay optional, stay unhighlighted, and never be inferred.
3. **Creation from conversation, in one gesture.** The natural path (§1) has the member arriving from
   MAIA saying a name. Making the room should be one act from there, landing them in the hearth with
   their composer already open — not a two-step realm-then-details modal.

### 8. The 18 UNPROVEN entries

A2 §8 ruling 1: the existing `relationship_entries` with `confidence IS NULL` are not retro-eligible,
but **may** be presented for new affirmation, correction, or restatement, never backdated.

**RECOMMENDATION on where that happens:** nowhere special. They already render in the timeline as the
member's own entries. When the member touches one, they may take the declaration door on it — which
runs §2 in full, produces a **new** declaration dated today, and leaves the original entry exactly as
it is, unchanged, in its original place with its original date. No migration surface, no "review your
past entries" queue, no badge. A queue would be a system asking the member to complete its homework,
which A5 Article VII refuses.

---

## Risks and falsification cases

1. **The review beat is too heavy.** If members abandon at beat 2, declaring is ceremony rather than
   speech. Falsifier: a tester walk where three members try to declare something and one stops.
   ⚠️ Measure this in a **witnessed walk, not production telemetry** — instrumenting abandonment of a
   relational act creates exactly the kind of behavioural record A2 §8's anti-laundering clause is
   about.
2. **Declarations and entries look the same after a week.** Falsifier: show a member their own hearth
   with a week of mixed material and ask which things they *said* versus *noted*. If they cannot
   tell, weight-not-segregation failed and the founder decision D3 (a separate view) reopens.
3. **Correct and Supersede are one gesture.** Falsifier: near-total usage through one door, or
   members using the in-composer switch frequently (meaning the doors are not legible).
4. **Consent yes-rate is low.** ⛔ **This is not falsification.** A low yes-rate is the design
   working — silence creates no consent, and most members will not answer most of the time. It
   becomes falsification **only** if members separately report expecting MAIA to remember something
   she does not. That, not the rate, is the signal.
5. **The consent ask lands wrong because it comes at the end of an emotional act.** A member who just
   wrote something painful may experience any question as intrusion. Falsifier: a member reports the
   ask felt like being sold something. Mitigation if so: move the ask entirely out of the declaring
   moment and into the read-back, asked only when the member next returns of their own accord.
6. **Removing tone/signals from the threshold makes it feel dead.** Falsifier: members stop entering
   rooms. Counter-hypothesis to test first: their own last sentence is a *stronger* pull than a
   machine's tone reading, because it is theirs. If both fail, the problem is the threshold's purpose,
   not its ornament.
7. **This design assumes the member wants to declare at all.** A5 Article II: *authorship includes
   the authority to decline to name.* If the surface makes non-declaring feel like an incomplete
   state, it has coerced. Falsifier: any empty state, any counter, any prompt that implies a room
   with no declarations is unfinished.

---

## Constitutional conflicts

Named, not resolved. C1–C8 in *Evidence* are the FACT-level collisions on the current tree. Beyond
those, three conflicts arise from **this design itself**:

**X1 — Entry-point-as-intent vs A2 §4's "not inferred".** §5.3. A2 requires explicit capture of
whether the member meant Correct or Supersede. This design captures it through which door they
opened, labelled by consequence. That is a member act, but it is not a member *classification*.
Founder decision **D1**.

**X2 — Declaring in conversation vs the review beat.** A2 §5 ratifies that the member's answer to
MAIA's offer "is itself a gesture, and therefore may produce a new Declaration." Taken literally, a
sent message could be a declaration with no review of permanence. This design requires the review
beat everywhere, including in conversation. That adds a beat A2 does not require. Founder decision
**D3**.

**X3 — Sanctuary and the declaring door.** A2 §7: a sanctuary session may not produce a Declaration.
The gesture is real; the boundary is absolute. **This design does not specify what the member sees
when they reach for the declaration door in Sanctuary Mode** — and a door that silently does nothing,
or a door that vanishes, are both bad answers. A visible refusal is a feature of the room (A5 Article
VIII); a silent absence is not. **NOT DESIGNED HERE** — it belongs to whichever invocation owns the
Sanctuary boundary, and it must not be left to implementation.

---

## Reuse opportunities

Substrate that exists and must not be duplicated:

1. **`member_relationships` / `relationship_entries` / `relationship_field_state`** —
   `database/migrations/20260403000001_relationship_field_v1.sql`. A1 is explicit: extend, do not
   replace. The hearth is a re-composition of `relationship_entries` rendering, not a new store.
2. **`POST /api/relationships` · `/[id]` · `/entries` · `/checkin`** — A1 records these as the only
   paths binding `relationship_id` correctly today. Authenticated and member-scoped already
   (`app/api/relationships/route.ts:17`, `:57`); the gesture witness is producible here without new
   auth work.
3. **The consent-gate shape** — `lib/anchor/surfacePreference.ts` + `app/api/anchor/[id]/surface-preference/route.ts`
   + `app/maia/anchor/history/page.tsx`, and atoms' `return_preference` with its member gesture at
   `app/maia/keep-capture/page.tsx:366-380`. A2 §7 directs `retrieval_consent` here explicitly.
   **⛔ Do not invent a third consent vocabulary or a third toggle mechanism.**
4. **`RelationshipTimeline`** — the rendering seam for the hearth. Its `KIND_STYLES` weight map
   (lines 26–33) is already the mechanism by which one kind of thing reads heavier than another;
   a declaration's weight belongs there, not in a new component. Its `formatDate` must be fixed (C2),
   not forked.
5. **`seedFromSource('relationships:thread', …)`** — `app/relationships/[id]/page.tsx:194`. The
   room→conversation handoff exists. The conversation→room direction (§7.3) is what does not.
6. **`RelationshipsPanel` / `MaiaRightPanelHost`** — the existing doorway from MAIA to the surface.
   **NOT ESTABLISHED:** whether `MaiaShell` is the live member conversation surface (CLAUDE.md names
   `app/maia` and `components/OracleConversation.tsx`), so whether members can actually reach
   `/relationships` from their primary surface today is not established here.
7. **`relationship_entry_patterns.expires_at`** — A1 names it as an existing currentness mechanism.
   ⛔ It must not become the standing mechanism for declarations: A2 §4 forbids any system process
   from performing the five acts, and an expiry that changes standing would be the system performing
   Supersede.

---

## Unresolved founder decisions

**D1 — Is choosing a consequence-labelled door an explicit capture of Correct-vs-Supersede intent, or
must the member classify the act themselves?**
*Recommended ruling:* the door is explicit capture. Requiring the member to classify their own act
into the system's two categories imposes a vocabulary on relational meaning, which A5 Article VI and
Sovereignty Invariant 14 refuse — and a member who has just realised their earlier words were wrong
should not first have to decide whether that is a correction or a supersession. The distinct entry
point, distinct prompt, and distinct after-language (§5.3 table) carry the intent; the in-composer
switch, phrased as consequence, is the remedy for a wrong door.

**D2 — When a member closes the consent offer without answering, may the system record that it was
never answered (as distinct from declined), both yielding `retrieval_consent = false`?**
*Recommended ruling:* yes, record which — and use it for exactly one thing: a never-answered
declaration may have its offer appear **once more**, the next time the member is in that room of
their own accord; a declined one is never re-asked unless the member reopens it. A2 §8 ruling 2
settles that silence creates no consent; it does not settle whether silence may be asked again once.
Recording the distinction also prevents the surface from telling a member they *declined* something
they merely walked away from.

**D3 — Must every declaration pass a distinct review-of-exact-wording beat before being stored,
including when the declaring gesture is a message sent in conversation?**
*Recommended ruling:* yes, always — but lightweight in conversation, where it appears as MAIA quoting
the member's words back and one touch to keep them. A member cannot consent to permanent, immutable
wording they were not shown as permanent, and A2 §5's "the answer is itself a gesture" establishes
that a declaration *may* arise from conversation, not that it may arise unseen. The cost is one beat;
the alternative is members discovering write-once wording after it is written.

---

## Dissent and uncertainty

**Where I disagree with the design authority.** A2 §4 lists Affirm, Correct, Supersede, Withdraw and
Release as five distinct member acts, and §9 requires their meanings be retained without system
inference. Experientially, **they are not five things.** They are one nod, two ways of saying
something again, one switch, and one removal — and the two ways of saying something again share a
mechanism, a composer, and an outcome. Presented as five, they will be built as five buttons and
will feel to a member like a settings panel for their marriage. My design deliberately never shows
five options anywhere, and never uses four of the five words. If the founder wants five nameable
acts *visible to members*, this design does not deliver that, and I would argue against it.

**Where I am uncertain about my own design.** The review beat (§2) is the piece I am least sure of. It
is correct in principle — immutable wording demands informed permanence — and it is exactly the kind
of ceremony that makes people stop using something. I have designed it as light as I can while
keeping it non-skippable, but I cannot establish from this tree whether members will pass through it.
That is a walk, not an argument, and I have not done one.

**Where I am uncertain about the frame.** This whole design assumes members *want* a surface for
declaring things about their relationships. `member_relationships` and the full room have existed
since `20260403000001` (April 2026). I did not examine whether anyone has used it. If the answer is
close to nobody, then the question this inquiry is answering may be a question about the substrate
rather than about the member — and no amount of gesture design fixes a place people do not go. I
flag this as the largest unexamined assumption underneath everything above, and I did not resolve it
because production data was outside my scope.

**Where I may be wrong about a collision.** C3 (tone chips at the threshold) reads to me as an
Article VI violation because a tone rendered on every card in one list *is* a cross-relationship
comparison. A reasonable reader could hold that Article VI forbids only explicit ordering and ranking,
and that an unordered chip is merely a display. I have stated it as a collision rather than a
certainty, and I have not reconciled it.
