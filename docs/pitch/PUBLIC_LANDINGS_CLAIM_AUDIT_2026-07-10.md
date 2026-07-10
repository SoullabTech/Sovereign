# Public Landings — Claim Discipline Audit (2026-07-10)

**Scope:** the four public marketing landings shipped together —
`/vision-studio`, `/soullab-studio`, `/press`, `/now-what/welcome`.
**Instrument set:** `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` — every outward
statement (1) declares its **Layer**, (2) names its **Center of Gravity**,
(3) passes the **Failure Test**.
**Register rule (founder directive, 2026-07-10):** copy leads with what a thing
**is** — a sentence never opens with a negation ("Not a…", "Nothing here…"),
because the reader sees the negated thing first. Contrast, if needed, comes
after the positive. Sentence-initial is the test: negation as a closer, after
the positive has landed, is emphasis; negation as an opener is
definition-by-what-you're-not, which concedes the frame before the frame
exists. **Boundary:** negation that *is* the claim stays ("it will say no
dominant element rather than invent one" — refusing to invent is the feature);
negation that *frames* the claim flips ("Soul Portrait isn't a reading" →
lead with what it is, contrast after). Truth-layer and register-layer sit side
by side, neither substituting: the three instruments govern *what may be
claimed*; this governs *how a claim opens*.
**Status:** prepared on a branch; publishing is a founder decision at merge +
deploy. *Preparation ≠ authorization.*

Hero copy (eyebrow / title / subtitle) on all four pages is taken **verbatim**
from `SECTIONS` in `lib/og/ogCard.tsx` — the share card and the page it opens
say the same thing. Body copy is audited paragraph by paragraph below.

---

## /vision-studio — "Cultivate a Lifelong Body of Work"

| Claim | Layer | Center of gravity | Failure test |
|---|---|---|---|
| "Some work does not fit in a task list…" | — (framing, no capability claim) | Reader's own experience | Survives trivially |
| "The Vision Studio is a room inside MAIA where that work has a home… work with it in conversation, at your own pace, on your own terms." | **Live** — `/maia/vision-studio` exists as a member room; conversation is the live mechanism (room composition shared block, PR #579 merged) | The room existing and conversation working — both Live | Strip Designed/Vision: room + conversation remain. **Survives** |
| "MAIA holds the space; the pace and the authorship stay yours." | **Live** (posture claim, answerable to the Oath/Invariants, not to a feature) | The sovereignty architecture that already governs runtime | Survives — this is a constraint we enforce, not a capability we promise |

Deliberately **not** claimed: memory synthesis, progress tracking, "MAIA
remembers your vision across years" (episodic substrate is not Live).

## /soullab-studio — "Shape and Steward Your Body of Work"

| Claim | Layer | Center of gravity | Failure test |
|---|---|---|---|
| "For practitioners… sessions, relationships, and a growing field of practice." | **Live** — session rooms, caseload/clients modules, studio fields all exist in the gated app | Audience naming; capabilities named generically | Survives |
| "Hold sessions, keep faith with the people you work alongside, and let years of practice accumulate into a field you can actually see and steward." | **Live** — sessions live; Relationship Memory v1 deployed; `/studio/fields` views exist. "Years of practice accumulate" is what the member does over time, not a synthesis claim | Sessions + fields being real workspaces | Strip Designed/Vision: sessions, relationships, field views remain. **Survives** |
| "Built sovereign: self-hosted, consent-first, direct to the people you serve. Your practice — and your clients' trust — stays yours." | **Live** — architecture facts (minisforum, local Postgres, consent gates) | The infrastructure as it runs today | Survives |

## /press — "Publishing the Living Work"

| Claim | Layer | Center of gravity | Failure test |
|---|---|---|---|
| "Most publishing starts with a market. Soullab Press starts with a life…" | — (stance) | Editorial posture, not capability | Survives |
| "The first works are **taking shape now** — Soul Portraits given as gifts, and books grown from years of practice." | **Live** (Soul Portraits — generated and gifted) + **Designed, in forward voice** (books — literary generator exists but is unmerged; no published catalog) | The forming-state itself is the claim; the tense carries the layer | Strip Designed: "Soul Portraits given as gifts" stands alone and true. **Survives** |
| "Records of encounter — made to be held and given." | — (stance) | Editorial posture | Survives |

Deliberately **not** claimed: a catalog, titles, dates, "available now."
This is the page most at risk of drift as Press matures — **re-tag on revision,
do not smooth** (canon drift check).

## /now-what/welcome — "Flourishing in the Midst of a Busy Life"

| Claim | Layer | Center of gravity | Failure test |
|---|---|---|---|
| "A live room where you bring the actual thing… until a next real step appears." | **Live** — the room is prod-verified (What Now? field live 07-09; composition witnessed 07-10) | The room being live | Survives |
| "You speak; MAIA listens and works with you — plainly, without scripts or diagnosis." | **Live** — describes the live conversational mechanism; "without diagnosis" is a vow (Oath), enforced not promised | Live room + standing constraint | Survives |
| "When the step is clear, the room lets you go. The point is your life, not the session." | **Live** — off-ramps (closing gesture + field timeline) built and verified 07-10, PR #577 merged + deployed | The off-ramp telos being real | Strip Designed/Vision: closing gesture exists. **Survives** |
| "Private by design: self-hosted, consent-first, nothing sold, nothing farmed." | **Live** — architecture facts | Infrastructure as deployed | Survives |

---

## Routing posture (why these paths)

All four pages are **additive** — no existing flow changed:

- `/vision-studio` — top level; the member room stays at `/maia/vision-studio`.
- `/soullab-studio` — top level because `/studio` is the gated app shell
  (its client layout wraps every child, so the landing cannot live under it).
- `/press` — top level; `/book-studio` stays founder-gated.
- `/now-what/welcome` — under the family; the `/now-what` → room edge redirect
  (room-as-entry, 2026-07-08) is exact-match and untouched, `/now-what/pitch`
  (Larry Closs deck) untouched.

**Held for the founder:** whether `/now-what` itself should serve this landing
to unauthenticated visitors (reversing room-as-entry for prospects), and
whether the `/what-now` spelling alias should point at the landing instead of
the room. Both are one-line `next.config.js` changes; neither is made here.

## Coverage note for docs/ops/SHARE_CARDS.md

That doc lives uncommitted on `feature/now-what-maia-presence`; to avoid
colliding with in-flight work it is not modified here. When it lands, add to
**PUBLIC-SECTION**: `/vision-studio`, `/soullab-studio`, `/press`,
`/now-what/welcome` (each: named `SECTIONS` card + `openGraph` metadata on the
page). `lib/og/ogCard.tsx` is included in this branch verbatim-identical, so
the eventual merge is clean.
