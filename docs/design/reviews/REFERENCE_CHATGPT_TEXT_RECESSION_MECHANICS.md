# Reference — why ChatGPT's conversation surface recedes

> **Witness:** two iPhone captures of ChatGPT mobile, thinking state, 2026-08-13 (one pre-keyboard,
> one keyboard-open). Provided by founder as the text-UX reference.
> **Status: REFERENCE ONLY — nothing here is authorized.** Typography, `thinking` placement, and field
> behavior remain HELD pending trace #4's single-owner unit.
> **Purpose:** answer the standing question in the review loop — *study why theirs recedes so
> successfully, do not copy their UI.*

---

## What is actually on screen

| Zone | ChatGPT | Cost |
|---|---|---|
| Header | hamburger (+badge) · conversation title · compose · `…` | 4 controls |
| Prior turn | user message in a right-aligned grey bubble, scrolling **under a blurred header** | — |
| Assistant text | white, regular weight, ~17px, generous line-height, **full width, no bubble, no label, no color, no badge** | — |
| State | the single word `Thinking` — plain grey text, **no container, no dot, no panel, no background** | **one line** |
| Middle/lower | **empty black — deliberately unfilled** | ~55–60% of viewport |
| Composer | one pill: `+` · placeholder · model name · mic · stop | 1 zone |
| Above keyboard | **nothing.** Composer sits directly on the keyboard. | 0 |

## The five mechanisms

**1. Emphasis is inverted from MAIA's.** ChatGPT gives the *user's* message a container (bubble) and
the *assistant's* response **no container at all** — no bubble, no label, no accent color, no badge.
The response is simply text on the page, so it reads as *the page speaking* rather than a component
displaying output.

MAIA does the exact opposite: MAIA's response is the most decorated object on screen (large gold
serif + `MAIA` label + rainbow indicator + `L1`), while the member's own words are the smallest,
plainest thing. **That inversion — not the font — is why MAIA's responses read as proclamations.**
The founder's typography instinct was right, and this locates the actual cause: it is a *containment
and labeling* asymmetry, not only a type-scale one.

**2. State costs one line of typography, not a zone.** `Thinking` is a word in the content flow, sitting
exactly where the answer will appear. It is therefore a **placeholder for the response**, not a status
readout somewhere else on screen. Nothing is reserved; when the answer arrives it simply replaces the
word.

MAIA's `thinking` is a full-width navy panel in a *different palette register* from the conversation,
in a permanently-reserved fixed zone whose height doesn't vary with how much it has to say. This is
the direct instance of *"never require more screen to communicate less."*

**3. Empty space is a feature, not a vacuum to fill.** ChatGPT leaves ~60% of the screen black while
thinking and does not fill it. The emptiness *is* the reserved space for the incoming response — it
communicates "something is coming here." MAIA fills that region with field, which is why the response
then has nowhere to arrive and gets stacked below instead.

**4. One control zone.** Everything interactive lives in the header or the composer pill. **Nothing
floats.** No persistent bookmark, voice pill, visibility toggle, logo, or bug button.

**5. Nothing between composer and keyboard.** Compare image 3 of Witness 001, where MAIA puts the
SOULLAB logo and the bug button in exactly that slot — the most contested real estate on the device.

**Bonus mechanism: no hard boundary.** Prior content scrolls *under a translucent blurred header*
rather than clipping at an edge. The surface reads as continuous and deep rather than partitioned into
panels. MAIA's zones have hard edges, which is part of what makes them read as separate modules.

## What must NOT be copied

- **ChatGPT has no living field at all.** It is the extreme "pure transcript" end of the spectrum. The
  lesson is *how a surface recedes*, *not* "delete the field." MAIA's field is deliberate and is the
  encounter layer. The real question stays the founder's: **how does the field earn its space, and
  yield it when conversation is the activity?** ChatGPT answers the yielding half only.
- **Exposed reasoning.** ChatGPT renders its reasoning summary as body text. MAIA has no obligation to
  surface reasoning, and doing so would be its own governance question.
- **The notification badge** on the hamburger (`1`). That is a re-engagement affordance — precisely the
  retention pattern the review loop's baseline section says to refuse. Borrow the recession mechanics;
  leave the attention hooks.

## Where this lands in the existing findings

It does not open new work. It gives three existing items a concrete target:

| Existing finding | What this reference adds |
|---|---|
| Trace #3 — `thinking` owns a large mobile band | Target: one line of typography in the content flow, where the answer will appear. Costs zero reserved height. |
| Trace #5 — typography / declarative response | Root cause refined: the defect is **containment + labeling asymmetry**, not type scale alone. Member gets the container; MAIA gets the page. |
| Trace #4 — no owner for vertical space | Validates the reframe: the owner's job is to decide *what the emptiness is for*. ChatGPT's owner reserves it for the response; MAIA's has no owner, so the field takes it by default. |

**Still gated on the same precondition.** None of this is actionable until trace #4's single owner for
the conversational viewport exists — because "field yields, response arrives into the space" is exactly
a budget decision, and there is currently no component with the authority to make it.

---

# Reference 2 — Claude iOS empty state (founder: *"I like this look better"*)

> **Witness:** one iPhone capture, Claude iOS, empty/compose state, keyboard open, 2026-08-13.
> **Status: PREFERRED DIRECTION, still HELD.** Recorded as the design target. Not authorized, not
> implemented — the single-owner unit from trace #4 remains the precondition.

## What is on screen

| Zone | Content |
|---|---|
| Header | **two** controls: hamburger (small orange dot, not a count) · incognito ghost. **No title.** |
| Centre | the Claude mark in terracotta, ~80px — **the only saturated colour on screen** besides send |
| Greeting | **"Coffee and Claude time?"** — large warm serif in muted sage, centred. The only large text. |
| Space | generous, balanced emptiness above and below the mark+greeting |
| Composer | bordered rounded rect containing: a **dismissible notice inside it** ("Opus consumes usage limits faster…" with ×) · the typed text · `+` · `Opus 5 High` · mic · **filled terracotta send** |
| Above keyboard | **nothing.** Composer sits directly on the keyboard. |

## Why this maps onto MAIA almost 1:1

Unlike ChatGPT (pure transcript, no presence layer), this surface has MAIA's exact structure:

| Claude | MAIA equivalent |
|---|---|
| centred terracotta mark | the Holoflower |
| "Coffee and Claude time?" (warm serif greeting) | "Good morning, Kelly" |
| one accent colour on dark ground | navy field + holoflower as the jewel |
| dismissible notice **inside** the composer | MAIA's two floating limits banners + modals (F4) |
| `Opus 5 High` as plain muted text in the composer | MAIA's floating `MAIA voice: Off` pill and `L1` badge |
| filled accent send button as the one strong affordance | — |

## The load-bearing insight

> ⭐ **Claude achieves presence with no glow, no field, and no animation** — a small mark, generous
> negative space, and one warm colour.

This is a direct challenge to the assumption that presence requires territory. MAIA's canon already
says it (*"the eye should go: night field → living holoflower → warm gold typography; the holoflower
must remain the jewel"*) — this capture is that canon executed. It suggests the answer to *"how does
the field earn its space?"* may be **it mostly doesn't need much**: the encounter can be carried by a
small luminous centre in calm emptiness, which would free the majority of the viewport for
conversation without losing the encounter at all.

That reframes trace #3 and #4 together: if presence needs a mark and space rather than a large
illuminated region, then `thinking` as one line, and the field as a modest centre, stop being in
tension with each other.

## Mechanisms to take

1. **Two header controls, no title.** Identity lives in the centred mark, not a header label.
2. **One saturated colour.** Everything else greyscale/muted. Accent = presence + primary action only.
3. **Notices go inside the composer, dismissible** — never as floating banners. Directly actionable
   against F4's two limits banners.
4. **Status as plain muted text in the composer** (`Opus 5 High`), not floating pills or badges.
5. **One strong affordance.** Filled accent send; everything else outline or text.
6. **Nothing between composer and keyboard.** Now confirmed across both references.
7. **Emptiness that reads as calm, not unfinished** — achieved by centring and balance, not by filling.

## Limits of this witness

Empty state only, keyboard open. It does **not** show how Claude holds presence *alongside a long
transcript* — the exact case where MAIA currently fails (voice-sized field with text stacked beneath).
So it answers "what should arrival look like" well and "what should mid-conversation look like" not at
all. A second capture of Claude mid-conversation would close that gap.

Also note the hamburger's orange dot: a soft presence indicator rather than an unread count. Softer
than ChatGPT's `1` badge, but still an attention affordance — hold it to the same refusal test.

---

# Reference 3 — Claude iOS MID-CONVERSATION (closes the gap Reference 2 left open)

> **Witness:** two iPhone captures, Claude iOS, 2026-08-13 — (A) working/thinking, (B) response
> complete. Keyboard dismissed in both.
> **Status: PREFERRED DIRECTION, still HELD.** Precondition remains trace #4's single owner.

## ⚠️ CORRECTION to Reference 1 — the type scale was not the defect

Reference 1 concluded MAIA's response typography reads declarative and implied it should get
*smaller and quieter*. **These captures show that was wrong, and the earlier finding needs amending.**

**Claude's response is LARGE WARM SERIF** — roughly 26px, generous line-height, full width, no bubble,
no label. Visually it is very close to MAIA's treatment in size and typeface. And it reads as
comfortable reading material, not as a proclamation.

So the difference is **not** scale. It is three other things:

| | Claude | MAIA |
|---|---|---|
| Response colour | **cream / near-neutral off-white** | **saturated gold** |
| Adornment | none | `MAIA` label + rainbow indicator + `L1` badge |
| Member's own text | small bold **inside a bubble** (a deliberate object) | tiny plain, no container |

> ⭐ **Colour is doing the declarative work, not size.** A large serif in a near-neutral tone reads as
> *something to read*; the same size in saturated gold reads as *something being pronounced*.

Revised recommendation for trace #5 — **keep the large serif**, and instead: neutralise the response
colour toward cream/off-white, drop the label/indicator/badge from the response, and give the member's
text a real container so the asymmetry stops being "decorated vs discarded." This also *frees* gold for
the restrained semantic/sacred emphasis role the founder reserved for it — currently impossible,
because gold is spent on every word MAIA says.

## How presence coexists with a transcript

This is the question Reference 2 could not answer.

**The mark moves into the content flow.** During work, the terracotta Claude mark sits small (~60px)
and **left-aligned in the transcript**, exactly where the response will appear. After the response it
drops below as a quiet signature beside the disclaimer. It is never a large fixed region.

> ⭐ Presence is carried by **a small in-flow mark**, not by a reserved illuminated territory.

Direct implication for MAIA: the Holoflower would not need to *shrink* so much as **move into the
conversation flow** when text is primary — becoming the small standing presence at the point where
MAIA speaks, rather than a voice-sized field above the transcript. The encounter is preserved; the
territory is returned. That is a genuinely different move from "make the field smaller," and it may
resolve trace #3 and #4 simultaneously.

## Activity indication with zero added chrome

**The in-progress line shimmers its own text.** Capture A shows a tool step —
file icon + `Checking whether a file was actually…` — mid **shimmer sweep** (words alternately bright
and dim across the line). No spinner, no panel, no separate status zone. In capture B the same line
has settled and gained a `>` chevron: it is now a **collapsed, tappable one-line disclosure**.

One element, two states, one line of height, both times. Compare MAIA's permanently-reserved navy
`thinking` band.

## Post-response affordances are CONTEXTUAL

Capture B shows six equal, muted, outlined circular buttons appearing **only after** the response:
copy · share · play (TTS) · 👍 · 👎 · retry. They are low-contrast and equally weighted — none competes
with the text. Compare MAIA's persistent `Keep this moment` / `Copy` / bookmark / visibility controls.

The disclaimer (*"Claude is AI and can make mistakes…"*) is tiny, right-aligned, paired with the mark —
honest and recessive at once.

## Composer stability

The composer is a **persistent bordered card in a fixed position** across all states, with the
dismissible notice living inside it. It does not move, resize, or relocate between thinking, response,
and idle. **Voice entry is a button inside it** (waveform icon) — so text↔voice is one control in one
place, not a mode toggle living elsewhere. That is directly relevant to trace #2: MAIA's `Speak`
affordance and its `MAIA voice` toggle are separate controls in separate places, which is what made
them conflatable in the first place.

## Consolidated mechanism list (References 2+3)

1. Two–three header controls, no title; identity lives in the mark.
2. **Response: large serif, near-neutral colour, no label, no badge.**
3. **Presence = small in-flow mark**, relocating to where MAIA speaks; never a reserved region.
4. Activity = the working line **shimmers itself**, then collapses to a one-line `>` disclosure.
5. Member's message gets a container; the response gets the page.
6. Post-response actions are contextual, muted, equally weighted.
7. Composer is a fixed bordered card; notices live inside it; voice entry is a button in it.
8. Nothing between composer and keyboard.
9. One saturated accent, reserved for presence + primary action only.
10. Large emptiness is calm, not unfinished.

**Unchanged:** none of this is authorized. It is now a well-evidenced target for the design unit that
follows trace #4's single-owner refactor.
