# WRITERS-STUDIO-V2 — Decisions

Settled matters. A session does not re-litigate these; it reads them and
proceeds. New decisions append. Nothing is edited away — a reversal is a new
entry that names the one it reverses.

---

### D-001 · The programme replaces the room, it does not decorate it
**2026-08-27 · founder**

The reference screens are a coherent product architecture, not inspiration for
improving Press. Existing capabilities move into the new architecture. The
framing "keep extending Press until it resembles the mockups" is withdrawn.

Consequence: `SHELL-01` is withdrawn as a standalone start. WS2-00 → WS2-01 →
WS2-02 + WS2-03 is the opening sequence. After WS2-03, every change lands inside
the new architecture.

### D-002 · Claude Code is the JARVIS console; Desktop is not on the critical path
**2026-08-27 · founder**

`WRITERS-STUDIO-V2` is priority NOW. `JARVIS-DESKTOP-REPAIR` is secondary and
must not block it. Claude Code holds the whole programme and issues bounded
units underneath it. Programme state lives in these files, never primarily in a
conversation.

### D-003 · Quality judgment is separated from computed fact
**2026-08-27 · founder**

Showable as measurement: word count, material count, chapter count, goal
progress against a writer-declared target, reading time, version count, finding
count, passage count.

Never shown as measurement: movement health %, cohesion %, "coherence: strong",
"high priority", or any MAIA-produced score, grade, or ranking.

MAIA notices, interprets, questions, and provides evidence. The writer assigns
importance. This is also the better product, not only the more honest one.
Consistent with the standing programme doctrine (no quality scores; provenance
stated at crossings; "reach", not "priority").

### D-004 · Identity correctness precedes everything visual
**2026-08-27 · founder**

WS2-01 is mandatory and may not be painted over. The resolution chain is
explicit and total:

```text
requested work → authenticated owner → work_id → manuscript_id →
section/chapter_id → content
```

No "most recent manuscript" substitution. No silent fallback. No transcript
promoted into manuscript content because another lookup failed. A failure at any
link opens an explicit empty/error state naming what was asked for.

### D-005 · Structure is attentional architecture, including exclusion
**carried forward from the R2 directive · founder**

WS2-07 does not build an organizing feature. Member-defined structure determines
what MAIA attends to *and what remains outside attention*. "Give MAIA
everything" is refused: it produces an omniscient assistant hovering over the
whole manuscript.

> Situated intelligence requires not only access, but exclusion.

### D-006 · The design contract is not frozen until the images are in the repo
**2026-08-27 · Claude Code, pending founder action**

The reference screens exist only in a conversation. A contract whose source
material is disposable is not a contract. WS2-00 does not close until the images
are committed under `reference/`. Written descriptions are planning material and
are insufficient for visual acceptance.

### D-007 · A deploy is verified by built artifacts, not by GIT_COMMIT alone
**2026-08-27 · carried forward from the R2 directive**

`GIT_COMMIT` is stamped from the SHA the deploy was *told* to build. It verifies
the deploy against its own instruction and cannot detect a later, legitimate
deploy of a different commit replacing the image. Verify both ways: the env var
**and** the presence of the built routes the commit introduced.

Open structural problem, named and unfixed: two lanes deploy to one production
and neither can see the other. Candidate repair — warn when the live SHA is not
an ancestor of the deploy target. Not built.

### D-008 · Identity failure may never masquerade as successful retrieval
**2026-08-27 · founder**

The defect WS2-01 exists to close was not "wrong text appeared". It was a
failed identity resolution that presented itself as a successful retrieval —
the room rendered confidently under the right title with the wrong content.

Permanent invariant, applying to every read path in the Studio, forever:

```text
requested nonexistent id → explicit failure → ZERO substitute content rendered
```

Zero is literal. Not a fallback, not the most recent, not an empty-looking
placeholder that is actually another member's or another work's material. A
resolution that cannot complete opens an explicit state naming what was asked
for.

### D-009 · A passing screen closes the defect; it does not prove the cause
**2026-08-27 · founder**

`90f447cd8` and `1feec9b1d` may eliminate the observed failure. A correct
result after deployment proves the defect is closed. It does not retroactively
prove which hypothesis caused it.

So WS2-01 acceptance does not rest on the screen. It rests on the captured
resolution chain (`ACCEPTANCE.md` § WS2-01) plus the nonexistent-id probe. Root
cause stays UNRESOLVED in `STATE.md` until the chain itself is observed —
closing a defect and explaining it are separate acts, and only one of them has
happened.
