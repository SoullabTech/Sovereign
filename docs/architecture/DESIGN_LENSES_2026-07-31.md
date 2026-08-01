# Design Lenses — briefing prompts for screen work

Kelly, 2026-07-31. **The turn: philosophy phase closed, craft phase open.** Not another
framework — a working set. Grab one, apply it to one screen.

**The measure:** *would Kelly actually choose to work here for six hours?* If not, the
philosophy isn't wrong — the interface is.

**The workhorse:**

> Act as a world-class interaction designer and UX architect for creative tools. Do not begin
> by writing code. First understand what the member is trying to accomplish, where attention
> is interrupted, and what can be removed. Design the smallest, calmest experience that
> supports serious creative practice. Show three alternatives (obvious, simpler, minimal),
> explain the tradeoffs, and only then propose implementation. Every recommendation should
> make the Studio feel more like a place someone wants to spend years creating, not a piece of
> software they have to learn.

**Claude Code's job, restated:** *make this a place Kelly wants to spend eight hours a day
creating. Judge every proposal against real creative practice, not abstract UX principles.
Prototype quickly, simplify relentlessly, optimize for long periods of focused work.*

## The lenses

1. **Design the experience first** — walk from the moment someone decides to return until
   they're fully back in the work. No code, no components. Three increasingly simpler versions
   before recommending one.
2. **Become the member** — a mature creator six months into an important book. Use it an hour.
   Where does the interface disappear? Where does it become software? Where do you hesitate?
   Redesign only those moments.
3. **Remove half** — delete 50% of the interface. Justify every survivor. What can't justify
   itself goes.
4. **Apple design review** — clarity · hierarchy · typography · rhythm · spacing · interaction
   cost · cognitive load · continuity. Improve *this screen*; don't rewrite the product.
5. **Workshop test** — if this were a physical workshop: what's on the table? on the wall? in
   storage? never visible? Translate back to interface.
6. **Eight-hour test** — eliminate anything that becomes annoying on repeat. Calm over novelty.
7. **Mature creator review** — remove anything patronizing · motivational · over-explained ·
   tutorial-like · marketing. Software made by peers.
8. **Real practice study** — how experienced authors actually work, ignoring existing software.
   Design around recurring behaviors, not application conventions.
9. **Flow audit** — count every interruption, click, decision, context switch. Remove what can
   go.
10. **Three versions** — A obvious · B simpler · C almost nothing. Recommend one, say why.
11. **Relationship review** — per element: what relationship with the work does this
    strengthen? None → remove.
12. **Attention audit** — follow the eyes from load. Where does attention go? Where should it?
    What competes with the work?
13. **Dieter Rams** — quieter, not emptier. Obvious.
14. **Apple Notes, for serious creative work** — preserve the simplicity, add only what practice
    genuinely requires.
15. **Daily practice review** — assume ten years of daily ritual. What ages well? What becomes
    exhausting?

## The sprint

Design until obvious, as places to inhabit — not wireframes:

**Home · Your Work · Writing · Capture · Journal · Questions · Research · Voice · Keeps ·
Publishing**

Loop: one screen → one interaction → use it → throw it away → redraw → use it again.

## What actually gates the loop

The loop is *design → use → discard → redraw*, and its speed is set by the slowest step. That
step is **not** design.

- **Using it requires it reachable.** A production deploy is minutes plus verification; merged
  ≠ activated ≠ verified. At that cost the loop runs about once a day, not five times.
- **Throwing it away requires it cheap to throw away.** Discarding a standalone drawing costs
  nothing. Discarding a wired production surface costs a revert, a redeploy, and a walk.

So: **draw first, wire second.** Standalone artifacts for the discard-heavy passes; the real
surface only once a design has survived a sitting. Otherwise the cost of throwing away quietly
becomes an argument for keeping.

## What this doesn't need

Ratification. Designing is Discover/Draft — no state change
(`STATE_CHANGING_AUTHORITY_IS_EXPLICIT`). The design work can start today. Only *building* the
result waits on authorization, and only *member-facing* surfaces wait on the unruled yield
clause in `docs/canon/MEMBER_EXPERIENCE_DESIGN_CONSTITUTION_CANDIDATE_2026-07-31.md`.
