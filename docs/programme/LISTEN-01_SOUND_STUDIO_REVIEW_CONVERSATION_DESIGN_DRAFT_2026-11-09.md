# LISTEN-01 · Sound Studio review conversation — design draft

**Status: DESIGN DRAFT. Nothing here is built or authorized.** Owner lane: LISTEN-01 (#1979). Founder direction
2026-11-09: *"build a dynamic beta interface that can learn from them, converse with them, and design around best
practices."* Builds on the named beta (PR #2199, `d147d8f51`) and the reviewer guide
(`LISTEN-01_SOUND_STUDIO_NAMED_BETA_DRAFT_2026-11-09.md`).

## 1. What it is, in one paragraph

After (or during) a listening session, a reviewer can open a short **review conversation** about the work they just
heard. A conversational guide asks one open question at a time, follows up on what the reviewer actually said,
anchors it to the work and the moment, and at the end shows the reviewer **"here is what I heard — is this
right?"**. Only what the reviewer confirms is saved. The founder sees each saved review and a synthesis of themes
across reviewers, where every theme links back to the reviewers' own words. Design changes are decided by people,
not by the system.

## 2. What "learn from them" means here — and does not

| Means | Does not mean |
|---|---|
| Reviewer-confirmed statements are stored as review records | Passive listening telemetry, dwell time, skip tracking |
| Themes across reviewers, each traceable to quoted, confirmed statements | Inferring traits, mood, health or "effect" from listening |
| The guide's next question adapts to what this reviewer said in this conversation | Any memory across conversations, or into MAIA's memory |
| Founder decisions recorded against the feedback that prompted them; reviewers told what changed | Training or fine-tuning any model on reviewer words |

This follows the Writer's Studio beta precedent (`writer_studio_beta_feedback`): *a row exists only because the
member deliberately said something*, and the founder roster is built from counts and timestamps only.

## 3. Best practices it is designed around

1. **Informed consent at the door.** Before the first question: what is recorded, who sees it, how long it is
   kept, that they can skip anything, and that they can delete a review afterwards.
2. **One open, non-leading question at a time.** "What stood out?" rather than "Did you find it relaxing?" The guide
   never suggests the answer, never praises the work, never argues with the reviewer.
3. **Anchor to the experience.** Which work, roughly where (passage or minute), what device and listening setup.
   Critical-incident follow-ups ("tell me about the moment that happened").
4. **Separate observation from opinion from suggestion.** The guide asks for each, so craft notes, felt experience
   and proposed changes stay distinct.
5. **Reflect back before saving.** The reviewer sees the summary in plain language, can correct or remove any line,
   and chooses to save. Nothing is saved silently.
6. **Short by default.** Five to eight exchanges; the reviewer can end at any time and still save what they said.
7. **No outcome or health framing.** The guide does not ask whether the sound changed their brain, healed or
   treated anything, and does not make such claims (research report, claim discipline).
8. **Close the loop.** Reviewers can see, per work, what changed in response to the reviews.
9. **Professional respect.** Reviewers may answer in their own vocabulary (mix, gain staging, spectral balance);
   the guide follows their register rather than translating it into Soullab language (Invariant 14).

## 4. Shape (proposed)

- **Surface:** a "Review this work" entry inside `/listen`, visible only to the named beta cohort. It opens after
  listening, never interrupting playback.
- **Guide:** Claude through the existing canonical provider adapter (no new provider; no OpenAI), with a fixed,
  reviewed interviewer prompt and the work's manifest metadata as its only context. It sees nothing about the
  reviewer beyond this conversation.
- **Storage:** one new table, e.g. `sound_studio_reviews`: member id, work id, optional passage or minute, device
  setup, confirmed summary lines (observation · experience · suggestion), the raw transcript **only if the
  reviewer chooses to keep it**, consent version, timestamps. Reviewer-deletable. No listening telemetry.
- **Founder view:** an admin panel on the Writers Pilot pattern: per-work reviews, a theme synthesis with links to
  the source lines, and a "decision" note per theme that can be published back to reviewers.
- **Safety:** if a reviewer raises distress, the guide does not continue the review. It says plainly that this is
  a product review, not support, and points to a human path (and records nothing about it unless asked).

## 5. Open questions (founder rulings owed before building)

1. **Who is the guide?** (See the recommendation below.)
2. **Transcript retention:** confirmed summary only by default, with the transcript kept only on opt-in? (Recommended.)
3. **Retention period** for reviews after the beta ends.
4. **Can reviewers see each other's reviews?** Recommended no for now: independent judgments first.
5. **Schema landing:** the new table is a migration, and merging it to canonical makes it deployable by the next
   full deploy (2026-09-07 finding). It should ride in its own PR, after #2199 is deployed.

### Recommendation on (1)

**A clearly named review guide, not MAIA.** MAIA is a sovereign companion for the member's own life; asking her to
gather product feedback for Soullab would quietly turn her toward serving the organization rather than the person
in front of her, and would blur what MAIA remembers. A distinct guide ("Sound Studio review") with its own visible
name, no access to MAIA memory, and a stated purpose keeps both roles honest. MAIA could later offer a *door* to the
review ("Would you like to tell the Sound Studio team about this?") without conducting it.

### Founder ruling on (1), 2026-11-09: hybrid ("both or hybrid")

Both are present, in two distinct roles, joined by one bridge that only the reviewer can open:

| | Review guide | MAIA |
|---|---|---|
| Role | Conducts the product review | The reviewer's own companion, unchanged |
| Asks about | The work: craft, arc, purpose, the room | Whatever the person brings, including what the listening stirred |
| Stores | Only reviewer-confirmed review lines, in `sound_studio_reviews` | Under MAIA's existing memory consent (Sanctuary applies) |
| Sees | This conversation and the work's manifest | Never the review table |

**The bridge (MAIA → review):** when a reviewer talks with MAIA about a Sound Studio work, MAIA may offer once,
plainly: *"Would you like to pass any of this to the Sound Studio team?"* If the reviewer says yes, they see
exactly which of their own sentences would cross, can edit or remove them, and confirm. Those lines then open a
review with the guide, pre-filled and marked as from MAIA. Nothing crosses without that confirmation, nothing
crosses in the other direction, and MAIA never asks product-research questions herself.

**Laws carried by the hybrid:**
1. MAIA never becomes a feedback-collection channel; she may only offer the door, and only once per conversation.
2. A review is never written to MAIA's memory, and MAIA's memory is never read by the guide.
3. Every line that crosses the bridge is shown to and confirmed by the reviewer first.
4. Sanctuary sessions offer no bridge at all.
5. Both voices are visibly named, so the reviewer always knows which one they are talking to.

**Phasing:**
- **Phase 1:** the review guide, storage, consent, confirm-before-save, and the founder panel. No change to MAIA.
- **Phase 2:** the MAIA door. It touches MAIA's runtime, so it is held to the Deep-Intelligence gate and the
  Sovereignty Invariant check, and needs its own review before building.

## 6. Not authorized by this draft

Building any of it · a migration · storing reviewer words · any model call with reviewer content · any change to
MAIA's behaviour or memory · sending anything to reviewers.
