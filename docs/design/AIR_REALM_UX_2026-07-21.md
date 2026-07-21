# Air Realm Development — UX and Interaction Design (Prompt 7) — 2026-07-21

**Status**: Design only. Authorizes nothing. Prompt 7 of the Air Realm Development sequence,
executed under Prompts 2–6 as ruled. Wireframe descriptions and state flows in prose — no
production code, no visual design.

**Questions carried in**: five from Prompt 6 (inspection reading experience · silence rendering ·
ceremony-free disposition gestures · entry/exit feel · version-lineage display) + Kelly's two
additions (relationship coherence · the experience of forgetting) + the standing caution (the
inspection view must never drift into Open Items / Growth Areas / Insights / Recommendations).

> **RULED — Kelly, 2026-07-21: PROMPT 7 APPROVED, with one implementation constraint:**
> **the retained release boundary must not contain recoverable semantic content.** The precise
> model: *active memory* (MAIA may use) · *released content* (MAIA may not use or resurface) ·
> *release boundary* (MAIA retains only enough governance information to honor the non-use
> commitment). The system may preserve a tombstone/exclusion identifier, the fact that a release
> occurred, and the scope of the non-use instruction. It must NOT preserve a semantic summary,
> keywords, an embedding capable of rediscovery, the emotional category, or a hidden
> interpretation of what was released — *"otherwise forgetting becomes concealment rather than
> release."* (§8's "asked once" re-raise behavior must therefore work from the member's own
> re-raising alone, not from any retained semantic trace.)
> Also ruled: drift guards are **requirements, not aesthetic preferences** (no counts · no urgency
> · no importance sorting · no completion percentage · no "needs review" · no recommendations from
> held material · no obligation-producing empty state · no tile-based developmental categories ·
> no automated resurfacing of released material); "a letter, not a list" approved; hidden
> capability name approved ("naming the system too early could make the member perform the
> program rather than inhabit the need"); equal dignity of earlier versions approved ("version
> lineage should show movement without implying improvement").

---

## 1. The coherence principle (Kelly's A1 — the organizing answer)

**One voice, one thread, no third person.**

Everything the member ever sees is one of two things: (a) conversation with MAIA, or (b) MAIA
showing the member their own record *in the same voice*. There is no third, system voice — no
"3 items need review," no notification center, no card grid with type icons, no object taxonomy
surfaced to the member. Held items, versions, lineage, recognitions, and releases are not
features; they are *things MAIA can show you when you ask*, narrated relationally.

The device that makes this real: **provenance as narrative, not metadata.** Never
`Type: Held · Created: 03/14 · Source: session`, but "You said this in March, after the
conversation about your father. We've been holding it since." The record reads as shared history.
Coherence is achieved by *register*, not by layout: if every surface speaks the way MAIA speaks,
the objects cannot fragment into features.

Test for every future screen: *could this sentence be said aloud by MAIA in conversation without
sounding like a different entity?* If not, rewrite it or remove it.

## 2. First encounter

No role picker, no onboarding, no explanation of "Air Realm Development" (the capability's name
never appears member-facing; naming the capability to the member would itself be a kind of
program framing). The first encounter is a conversation that goes one level deeper than expected:

> Member: "I don't know how to explain what I do anymore."
> MAIA: "Try explaining it badly. Just to me."

If the work wants to continue over time, the consent moment is one plain question — "Want to work
on this together over time? I'd keep what you choose to keep, and you can see all of it whenever
you like." — and a plain yes/no. Nothing else is created, shown, or announced. Declining changes
nothing about the present conversation.

## 3. Ongoing conversation: disposition gestures without ceremony

Dispositions are words, not workflows. In text: the member says "keep that," "hold that one,"
"that's not mine," "leave it open," "let it go" — natural language is the primary gesture surface.
Quick affordances (a small row appearing under a recognition offer: *keep · hold · not mine ·
leave open*) exist as accelerators, rendered once, quietly, and never blocking; they disappear
after the moment passes. No modals, no confirmations, no "saved!" toasts — MAIA acknowledges in
voice ("Kept — your words, exactly.") and the conversation continues.

State flow (the only lifecycle in the capability):

```text
                    ┌─ Kept ──── Revised ─┐
offer / member act ─┤                     ├─→ (any state) ─ Released → quietly forgotten
                    ├─ Held ──────────────┤
                    └─ Rejected   Open ───┘
```

Every transition is a one-word member gesture. No state is terminal except Released, and even
Released reverses if the member themselves brings the thing back.

## 4. The recognition moment and silence rendering

A recognition offer renders as ordinary conversation — no special card, no highlight, no
"insight" framing (visual elevation is authority). Tier-revealing wording per the evidence model.

**Silence in text**: a short line that closes nothing and asks nothing — "Yeah." / "…I'm staying
with that." — then *the turn simply ends*. No typing indicator afterward, no follow-up bubble, no
suggested replies. The input field stays open and unlabeled. The absence of a question *is* the
rendering. **Silence in voice**: a brief registration ("Mm. That landed.") followed by an actual
pause; MAIA does not fill it; the member's next utterance, whenever it comes, is received without
comment on the gap.

Accessibility note: silence must not read as a hung interface — the short registration line is
what distinguishes accompaniment from failure, in both modalities and for screen readers. This is
why registered impact (behavior spec §2a) is load-bearing UX, not flavor.

## 5. "What we're holding" — the inspection view

**Entry**: member-pulled only — "show me what we're holding," or a single quiet menu entry of the
same name. Never a badge, never a count, never "you have new insights."

**Form**: a readable page, closer to a letter than a list. Structured by **context** (A1), never
by object type: "Around your work…" / "Around you and your daughter…" — because contexts are how
the member lives, and separating them here is what prevents the flattening A1 forbids. Within a
context, items appear as short narrated entries:

> *"I keep translating instead of speaking."* — your words, March. Held, at your ask.
> *"The work is becoming teaching."* — you kept this in May, and revised it in June. Yours.

Each entry: verbatim text · relational provenance sentence · current disposition · the same
one-word gestures (keep / hold / not mine / leave open / let it go) available inline.

**Drift guard (standing caution, made structural)**: the view has no sections named or shaped
like Open Items, Growth Areas, Insights, Recommendations, or Progress; no counts anywhere; no
sorting by "importance"; no empty-state prompts to generate more ("nothing held right now" is a
complete, healthy screen — rendered exactly as that sentence). The view never suggests actions.
Any future addition to this surface must pass the §1 test *and* the question: "does this create
an obligation to return?" If yes, it does not ship.

## 6. Version lineage: "what you said in March"

Member-pulled, inside conversation or from an item's entry in the inspection view. Rendering:
plain quotations in time order, each with its context sentence — never a diff view, never
highlighted changes, never "improvement" language. The reading is side-by-side witness:

> March — "I help people fix their communication."
> July — "I sit with people while they find what they actually mean."

MAIA's only commentary, if asked: descriptive ("the second one keeps the sitting-with") — the
member does the recognizing. No arrows, no progress connotation in layout (vertical time order,
equal visual weight; the earlier version is never grayed out — it is not a lesser draft of the
person).

## 7. Practice surfaces

The four forms are conversational moves with minimal framing:
- **Say-it-to-me**: no UI at all — it is conversation.
- **Say-it-as-if**: one quiet frame line from MAIA ("Say it to him. I'll stay here.") marks entry;
  the member's speech renders as ordinary messages; exiting the frame is just… stopping, or MAIA
  receiving ("You said the hardest part first."). No scene chrome, no role labels.
- **Depth-shifting**: MAIA offers the next depth in words ("want to try it in one sentence?");
  versions are captured into lineage only by the member's keep.
- **After-action**: the member brings a real conversation back; anything kept is kept by gesture.
Voice modality is primary for practice (speaking aloud is the practice); text is the fallback,
not the default.

## 8. Release and forgetting (Kelly's A2 — answered)

- **Does release feel ceremonial?** No. Ceremony makes release heavy, and heavy release creates
  archive guilt — the exact failure the journey forbids. Release is one gesture, one
  acknowledgment, one line: "Released. It won't come back unless you bring it." No confirmation
  dialog — "are you sure?" makes letting go cost more than keeping, which quietly biases the
  system toward accumulation.
- **Does it disappear completely? Is there a trace?** From MAIA's active memory and all surfacing:
  completely — released items never enter context assembly, doorways, reflections, or the
  inspection view again. In the member's own record: it remains theirs, reachable only by their
  own act (asking "what have I released?" shows verbatim entries, narrated plainly, no
  invitation to re-adopt). The member owns their history; MAIA just genuinely stops using it.
- **Does MAIA remember forgetting?** MAIA remembers *that* it agreed to forget — the boundary,
  not the content, and **not any similarity trace**. The release boundary retains no summary, no
  keywords, no embedding, no emotional category (Kelly's constraint, header above) — which means
  MAIA structurally *cannot* notice that new material "resembles" something released; resemblance
  detection would require exactly the retained semantics the boundary forbids. The recognition
  belongs entirely to the member: if they say "this might be what I let go of in June," their own
  record opens at their ask. MAIA's only permitted knowledge is bare and non-semantic — that
  releases have occurred — and it surfaces only in response to the member's own wondering ("You
  have released things before. Does this feel related, or entirely new?"), never as an unprompted
  observation. *(Amended 2026-07-21 after the distance review: the earlier text had MAIA saying
  "you released something like this in June," which required a retained semantic trace and
  contradicted the release boundary. Release integrity wins; the member performs the recognition.)*
- **What emotional experience should accompany release?** Lightness. The register is completion,
  not deletion: "some meanings were only needed for a season." Never condolence, never "growth,"
  never a summary of what the released thing meant — meaning-extraction at the exit is the last
  and worst place for it.

## 9. Reflection forms (member-initiated until scheduling exists)

Monthly/quarterly/annual reflections render as **letters over the record, in MAIA's voice**, not
reports: the member's own kept language, laid out in time order within each context, ending with
the standing questions ("What has endured? What have you let go? What remains unresolved?") — the
member answers in conversation, and only what they keep is kept. No charts, no themes-detected,
no year-in-review montage. Contexts remain separated (A1): the work letter and the family letter
are different letters, composed only if the member asks for each.

## 10. Entry and exit feel

**Entry** feels like a conversation that deepened, then one plain question (§2). **Pause** is
undramatic and unannounced — the member just doesn't continue, and nothing follows them (no
"we haven't talked in a while" about Air material, ever). **Exit** ("stop holding all of this" /
"I'm done with this") is honored in one turn: MAIA states exactly what will remain (the member's
record, member-reachable) and what stops (all assembly, all doorways, all offers), asks nothing,
adds nothing. Leaving is a complete outcome, rendered as respect rather than loss.

## 11. Mobile and voice

Short encounters are first-class: a thirty-second voice note ("I finally said it to her — it went
sideways at the end") is a complete after-action visit; MAIA's response fits the moment (one
registration + at most one question). Keeps and dispositions work by voice verbatim ("keep that" /
"let that one go"). The inspection view on mobile is the same letter, comfortably readable — never
compressed into cards. Nothing in the capability requires a large screen, a session length, or a
sitting posture; Air happens in hallways.

## 12. Accessibility

Readable serif-or-humanist typography at comfortable measure for the letter surfaces; full
keyboard operability for every gesture (dispositions as reachable buttons when shown, plus
natural-language always); screen-reader semantics that match the coherence principle (the
inspection view reads as continuous prose with landmarks per context, not as a list of widgets);
transcripts for all voice practice, member-owned; no meaning carried by color alone (dispositions
are words, never chips-by-color); low-cognitive-load defaults — one thing at a time, no
simultaneous panels; silence rendering announced to assistive tech as the short registration line
only (never an unlabeled dead turn).

## 13. Handed to Prompt 8 (implementation plan)

1. Disposition gestures need intent-routing work (natural-language "keep that" → existing gesture
   routes; the conversational-keep discriminator is the precedent).
2. The inspection view's letter rendering: one route, member-pulled, reading from existing
   atoms/threads with the A1 context tag — the first consumer that *requires* the tag.
3. Silence as a turn type needs a small orchestration/rendering contract (a response that ends
   without question and suppresses follow-up affordances).
4. Release semantics: exclusion from assembly must be structural (loader-level filter), not
   prompt-level politeness — same enforcement philosophy as selection-before-instruction.
5. Version lineage storage = the articulation-version object (Prompt 6 Layer 2) — this UX defines
   its minimal fields: verbatim text, timestamp, context tag, authorship marker, lineage link.
