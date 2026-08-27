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

### D-010 · Identity custody at the emitting control
**2026-08-27 · founder**

The six findings of `WS2-01-READ-PATH-AUDIT.md` are one rule:

> A control that claims to open a particular writing must either emit that
> writing's exact identity or refuse to open. **Absence, loss, and invalidity
> must never collapse into "open something else."**

D-008 constrains the consumer: a named-but-unavailable identity must fail
explicitly and render zero substitute content. D-010 constrains the producer:
a control that cannot name what it claims to open must not open anything.

Together they close both directions of the failure, and neither is sufficient
alone:

```text
producer  may not lose or invent identity
consumer  may not compensate for lost or invalid identity
```

This is where the defect actually lives. The audit established that data
ownership is sound — every manuscript route gates on `member_id` and 404s
without leaking existence. What failed was **client identity custody**: the
moment a control decides what identity to hand forward. F-1 is the live
violation; F-2 and F-3 are why the contract did not prevent it; F-4 is how the
original parameter-drift class recurs; F-5 is the same weakness in the
predecessor Press path.

Design test for any new control that opens a writing: *can this emit a URL it
believes names something, when it does not?* If yes, it is F-3 again.

### D-011 · The legacy Press manuscript route is inside WS2-01
**2026-08-27 · Claude Code, adjudicating under D-010**

F-5 is admitted into WS2-01 rather than transferred.

The test the founder set is whether the legacy Press route is an active ingress
to the same writing identity system. It is, and by the Studio's own hand: the
Canvas emits `SOURCE_HREF` (`canvas/page.tsx:447`) and the Materials drawer
emits it again (`MaterialsDrawer.tsx:485`), both carrying `&m=`. It reads the
same parameter and resolves against the same manuscripts. The Studio is
therefore a producer of that ingress, and D-010 binds producers.

Transferring F-5 would require severing those two links — itself a Studio
change of the same size as the fix. Repairing custody in place is containment,
not extension, and does not violate the standing instruction not to extend the
old Press shell: nothing new is built there, a substitution is removed.

If the founder prefers severance, that is a one-line disposition and F-5
becomes a WS2-02/03 concern. Left as-is is the one option D-010 forbids.

### D-012 · Deploy per room, starting at WS2-03 — not once at WS2-13
**2026-08-27 · founder**

WS2-13 is the *final acceptance* unit, not the first deployment. The
redesigned Studio goes to production as soon as **WS2-02 + WS2-03** pass their
own acceptance, with core capability preserved underneath, and every vertical
room after that deploys as it finishes:

```text
design system → shell → DEPLOY → WRITE → DEPLOY → MATERIALS → DEPLOY
→ STRUCTURE → DEPLOY → REVIEW → DEPLOY → …
```

The failure this corrects is procedural: the old process repeatedly built a
large amount of code before the founder could feel the product, so correction
arrived after the cost was sunk. A room he can enter is worth more than a
branch he is told about.

What does NOT relax. Each deployment still carries exact lineage
(`IMMUTABLE_SHA_DEPLOY.md`), both-ways verification (D-007), and its unit's
acceptance evidence. Deploying more often is not deploying more loosely — it
is the same gate, applied more times.

WS2-13 keeps its meaning: the real-member experiential walk over the whole
environment, which no per-room deployment can substitute for.

## D-013 — Cut at the strongest heading level the document declares

**Settled 2026-08-27 (WS2-01C).**

Segmentation stays mechanical and stays refusing to infer structure. But a
document that uses `#` for its chapters and ALL-CAPS for its subheads has
*already declared* two levels, and reading both as one level is not neutrality —
it is a decision, and it was the wrong one. A 212-page book came back as a
hundred-plus one-page fragments with no chapters in it.

So: **cut at the strongest heading level the document actually uses**, skipping a
level only where it would yield a single section. Subheads are carried verbatim
inside the chapter they belong to. Nothing is invented, nothing is dropped, and
the member still confirms or redraws the cuts before anything is saved.

Two corollaries, both load-bearing:

- **A cap limits doors, never text.** `MAX_SECTIONS` stops us building more
  parts; it must never stop us keeping the member's words. The remainder is
  absorbed into the last section, verbatim and in order.
- **Unnamed is not missing.** A part carried without a heading has no line to
  make a door of. That is not drift, and saying "no longer in your draft" about
  text that is in the draft is a false statement about the member's own book.
  The leading unnamed part *is* the opening region and is not reported at all.

## D-014 — A refusal that leaves no record is not instrumented

**Settled 2026-08-27 (WS2-01B).**

Absence of logs was read as evidence that a request never arrived. It was not:
most of the ingest route's exit paths answered the screen and told the record
nothing, so a member-visible failure left the system with no memory of failing.

Any surface that can refuse a member's work must name the refusal in the record —
status and reason, counts only, never the member's content. Silence in the log is
never evidence about what happened; it is only evidence that we did not look.

## D-015 — The stamp is not the code

**Settled 2026-08-27 (WS2-01 candidate deploy).**

`GIT_COMMIT` is a build-arg consumed in the Dockerfile's **runner** stage. It
re-stamps the container on every deploy *even when every builder layer is a
cache hit* — including `COPY . .` and `npm run build`. So a deploy whose log
reads all-`CACHED` can report the correct SHA while running older code, and
`printenv GIT_COMMIT` will not tell you.

**`GIT_COMMIT` proves the stamp. Artifact inspection proves the code.**

The artifact leg of D-007 is therefore not optional garnish on a verified env
var; on an all-cached build it is the only leg carrying weight. Prove it with a
string that exists **only** in the candidate — new UI copy is ideal — found in
both the client chunk and the server bundle, corroborated by a moved chunk hash
on a route the candidate touched.

This deploy's cache hits turned out benign: a second run of the same deploy.
That was *established* by the grep, not assumed from the stamp. The distinction
between those two is the whole decision.

## D-016 — Visual convergence may never erase capability

**Settled 2026-08-27 (WS2-01).**

The rebuild judges itself against images. That is deliberate — a functional test
cannot tell you the manuscript stopped being the main event — but it introduces
a failure mode the old process did not have: a repair that improves the
screenshot and costs the writer something real.

**Any repair that moves the capture closer to the reference while weakening one
of these is a FAIL, and the divergence stays unrepaired until a repair exists
that does not cost it:**

```text
manuscript continuity     the draft is one document; a narrowed frame is
                          never a narrowed save
Materials ≠ Work          a material is not the work, and the distinction
                          survives every layout
Versions                  kept versions remain reachable and restorable
MAIA companionship        MAIA stays adjacent to the writing, not folded
                          behind a tab or reduced to a strip
authorship boundaries     MAIA notices; the writer adjudicates. No score, no
                          grade, no ranking presented as measurement
```

This is not a tiebreak between design and function. The reference images were
drawn from a product whose whole argument is those five things; a version of the
field that looks like 04 and has lost one of them is further from the designed
product, not closer, however well the pixels agree.

The practical form: when a divergence can only be closed by weakening one of the
five, the divergence is **recorded as accepted** with the reason, and the
implementation keeps the capability. An accepted divergence is a decision, not a
defect left lying around.
