# NW-V1-CLIENT-01 — render evidence

**Status**: IMPLEMENTATION CANDIDATE READY FOR MEMBER WITNESS.
**Cold witness**: WAIVED FOR PRE-IMPLEMENTATION (founder, 2026-08-28).
**Experiential acceptance**: STILL REQUIRED. **V1 acceptance: NOT CLAIMED.**

> Not executed is not failed. Not observed is not passed.
> Nothing here is an adjudication of the experience. It is evidence that the
> implementation renders, and what it renders.

---

## How these were produced

Real Chromium (`/opt/pw-browsers/chromium-1194`), real Next.js route, real
Postgres, real authenticated member session. **Not a harness and not a mock**:
the browser loaded `/now-what` and `/now-what/room`, the routes read the member's
own rows through `GET /api/now-what/home` and `GET /api/now-what/field-note`, and
the middleware auth gate was satisfied by a genuine `auth_sessions` row.

```
viewport            390 × 844 CSS px, DPR 2, isMobile, dark
seeded member acts  a kept question  · "I know I don't want the next chapter…"
                    a kept practice  · "Talk with David before Friday."
```

| File | What it shows |
|---|---|
| `01-client-home-implemented.png` | Returning Home, first viewport |
| `02-client-room-lived-implemented.png` | The Room entered through `entry=lived`, first viewport |
| `03-client-home-after-return.png` | Home AFTER the lived update was kept — the world changed |
| `00-prototype-comparison.png` | frozen prototype beside the implementation, both screens |

---

## The return composition — one act

Founder review of `e89465b7b` found a semantic defect and it is repaired here.

That cut selected the latest carried thread and the latest chosen move
**independently** and stacked them. Each line was a true member act; the stack
was not. It composed

```
YOU WERE CARRYING   "Should I leave my role?"        (kept Tuesday)
YOU CHOSE           "Call my sister this weekend."   (kept Thursday)
What happened since?
```

which asserts that the choice answers the question, when the record holds no
such relationship. This is the relational form of the "bracing for" failure,
and more dangerous than the sentence-level version because each half survives
inspection on its own.

> **Provenance of the parts does not guarantee provenance of the composition.**

The Home now shows **one** act — the member's most recent keep, labelled by
what it actually is — and "What happened since?" refers to that same visible
act, which is also the act sent to the room. A second act appears **only** when
`responds_to_thread_id` already records the relation, and then it is stated as
the relation ("You wrote this in answer to …"), never left adjacent for the
reader to infer. Relationship is never inferred from recency, category,
textual similarity, sequence, or MAIA's judgement.

Four negative controls guard it, in
`__tests__/now-what-v1-consequential-return.test.ts` § A2.

`01-client-home-implemented.png` therefore shows one act where the frozen
prototype shows two. That is a founder ruling superseding the prototype on this
point, not a fidelity loss — and it makes the phone Home cleaner.

---

## The loop, walked in the browser

```
HOME              ONE act — "YOU CHOSE · Talk with David before Friday.
                  You kept this on Tuesday." — then "What happened since?"
  ↓ typed into "Tell MAIA…", pressed enter
ROOM              /now-what/room?entry=lived&thread=<prior act id>
                  states "YOU CHOSE · Talk with David before Friday. / What happened?"
                  her opening words arrived in the composer, unsent
  ↓ kept, with the relation
RECORD            the kept update carries responds_to_thread_id = the prior act
  ↓ returned
HOME              now reads "YOU WERE CARRYING · 'We talked. It went differently
                  than I expected — he was relieved, not disappointed.'
                  You kept this today.
                  You wrote this in answer to 'Talk with David before Friday.'"
```

That last line is the ONE case where two acts appear together, and it appears
because the record holds the relation the member herself made.

Verified in that walk: the draft crossed in `sessionStorage` (not the URL), and
`sessionStorage` was cleared on arrival. She still pressed send herself.

## The relation, as persisted

Five posts against the real database, one row per member act:

| what was posted | row written | relation |
|---|---|---|
| lived keep, carrying the prior act | yes | **answers the prior act** |
| an unrelated visit | yes | none |
| another member's thread id | yes | **none — refused** |
| a discard, carrying the same id | **no row at all** | n/a |
| a revise, carrying the same id | yes, her revised words | **answers the prior act** |

Every row: `can_be_shown_to_practitioner = false`.

---

## Defects found by rendering, and repaired

These were invisible in the source and appeared only in pixels.

1. **The base chrome rode up into the first viewport.** With a short carried
   thread the rooms sat above the fold and the screen read as a menu with a
   quote on top. Margins would have fixed it for one length of her words and
   broken at the next, so the fix is structural: the return block now occupies
   the viewport (`min-height: 100svh`), and the rooms are below the fold at any
   content length.
2. **"My Work" repeated the chosen move** already stated in the fold — two
   claims about one act on one screen. The door line is now the plain
   invitation.
3. **The Room greeted a returning member with the first-visit welcome.** Return
   detection is scoped to `fieldContext`, and Home's lived doorway carries none,
   so a member walking back in carrying her own act met "Welcome… Come in". A
   resolved entry act now counts as a return, and the room holds a beat until
   that resolution completes so the welcome can never flash ahead of it. This
   was the sharpest find: the screen forgetting her is the exact failure V1
   exists to fix.
4. **The arrival mandala and a duplicate wordmark pushed her act below the
   middle of the phone** — the first thing she met was decoration. On
   `entry=lived` only, both step aside and the composer left-aligns with the
   threshold. Every other doorway is unchanged.

---

## Known gaps in this evidence

- **Screen 02 is captured at the threshold**, before she speaks. The prototype
  depicts the later moment — turns exchanged, Keep / Revise / Discard offered.
  Rendering that requires a live model call, which this environment cannot make.
  Keep / Revise / Discard and the relation are therefore evidenced by the
  persistence table above and by `__tests__/now-what-v1-consequential-return.test.ts`,
  **not by a screenshot**.
- **No MAIA turn was rendered.** The grounding boundary is evidenced as composed
  prompt text and by negative-control tests, not by observed model output.
- **Chromium's own dev-overlay bug icon** appears bottom-right in these captures.
  It is Next.js dev tooling, not the interface.

## Deviations from the frozen prototype, named

1. **Five demoted room links at the base, where the prototype shows two.**
   `/now-what/questions`, `/work`, `/coaching`, `/field` and The Room must stay
   reachable (`RETIRE PRESENTATION ≠ RETIRE CAPABILITY`), and the UX-02
   continuity suite asserts it. The prototype's compositional rule — demoted,
   base-pinned, out of the first viewport — is preserved exactly; the count is not.
2. **The base links keep their existing room names** ("My Question", "My Work",
   "My Story") rather than the prototype's "What I'm carrying". That label names
   a surface CLIENT-01 is explicitly scoped not to build, and pointing it at
   `/now-what/questions` would promise a room that does not exist under that
   name — the naming break UX-02 closed.
3. **Home shows one act where the prototype shows two** — see *The return
   composition* above. Founder ruling, 2026-08-28, superseding the prototype on
   this point.
4. **The prototype's top-right ring is decorative here.** It carries no label in
   the prototype; giving it a destination would be inventing a meaning the
   design did not state.
