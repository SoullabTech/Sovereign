# PRODUCT FINDING A · CENSUS

**Finding A:** clicking a far section in the rail highlights its row but does not
bring that section into view. Observed by the founder during the §4b human
witness on the real book (`ELEMENTAL_ALCHEMY`, 262 sections):

> *"It lights up but I had to scroll to find it."*

It is the blocking failure of §4b acceptance.

**Authorized:** census-first — diagnose before any repair is scoped.
⛔ **No repair is scoped in this document.** ⛔ `H2`, PR #1272, the §4b evidence
record and production are untouched.

**Method:** read-only source census on canonical `5b133abcd`. No runtime was
started, no manuscript copied, nothing executed.

---

## 1 · What the census establishes

### F1 — Two `scrollIntoView` calls, neither scoped

```
StructuredOutline.tsx:169      el.scrollIntoView({ block: 'center' })   the gold row
WholeManuscriptSurface.tsx:278 node.scrollIntoView({ block: 'start' })  the rail destination
```

Both pass only `block`. Neither constrains which container may scroll.

### F2 — `scrollIntoView` scrolls EVERY scrollable ancestor

This is specified behaviour, not a quirk: the method scrolls each scrollable
ancestor of the element **including the document**, so that the element becomes
visible. An unscoped call on a node inside a scrollable panel will therefore
move **both** the panel and the page.

⭐ **This alone accounts for FINDING B.** The outline reveals its gold row with
`scrollIntoView`; that call also scrolls the window; the studio header is pushed
off the top. Which is exactly what was reported:

> *"The panel jumps up when I select something in Manuscript."*

### F3 — ⭐ The falsifier's check 5 measured a container-relative distance ONLY

Verbatim from `falsifier.spec.ts`:

```js
const near = await page.evaluate((sel) => {
  const sc = document.querySelector('[data-whole-manuscript]');
  const el = sc.querySelector(sel);
  return el ? Math.abs(el.offsetTop - sc.scrollTop) : -1;
}, shell(217));
expect(near).toBeLessThan(120);
```

`el.offsetTop - sc.scrollTop` asks **where the destination sits inside the
scroller.** It never asks **where the scroller sits in the viewport.**

⛔ **So a jump that lands the destination perfectly at the top of a container
that has itself slid out from under the reader's eye passes this check.** The
machine's question and the writer's question are different questions, and only
the writer's was about arriving.

---

## 2 · Why the synthetic corpus masked it

The falsifier's fixture is 262 sections of six identical lines. Two properties
of that corpus matter:

- **uniform height** — every shell is the same size, so the estimated-height
  fallback and the measured height agree, and geometry never surprises anyone;
- **short total document** — less opportunity for the page itself to be
  meaningfully scrollable behind the panel.

The real book has neither property. It is exactly the difference the §4b
constitution predicted:

> A machine PASS makes the runtime mechanics eligible for human witnessing.
> It does not promote the human witness.

⛔ **The falsifier is not wrong and must not be weakened.** Its question was
answerable by its corpus and it answered it correctly. The finding is about the
**reach** of the question, not its honesty.

---

## 3 · The single-cause hypothesis, and how to falsify it

**Hypothesis:** Findings A and B share one cause — unscoped `scrollIntoView`
moving the document as well as the intended container.

It predicts, on the real book:

1. a rail click moves BOTH the manuscript scroller AND the window;
2. the destination is correctly positioned **within** the scroller (which is why
   the machine measured it as arrived);
3. the reader must scroll because the **scroller itself** is no longer where
   their eye was;
4. Finding B is the same motion, observed on a click that was not asking to
   navigate at all.

⛔ **NOT YET ESTABLISHED.** Points 1–3 require runtime measurement of viewport
position, which this census deliberately did not perform.

**A second candidate, recorded and NOT resolved:** `StudioPanel`'s content
wrapper is `{ padding, overflow: 'auto', minHeight: 0 }` — no `height`, no
`flex`. The Whole Manuscript scroller inside asks for `height: '100%'`. Whether
that percentage resolves against a definite height, and therefore whether the
intended scroller is the panel or the page, is a **runtime** question. If the
page is the real scroller, the diagnosis changes shape entirely. ⛔ Do not
assume either way.

---

## 4 · What the repair must satisfy — for the lane that scopes it, not here

Recorded so the eventual repair is not measured by the instrument that missed
this in the first place:

- Arrival must be asserted in **viewport coordinates**, not container-relative
  ones. `getBoundingClientRect()` of the destination against the visible area is
  the reader's question; `offsetTop - scrollTop` is not.
- The fixture must include **variably sized sections**. A uniform corpus cannot
  reproduce this class of defect.
- Finding B's invariant — recorded historically as *"selecting a section no
  longer drags the room"* — needs a falsifier of its own. It was fixed once and
  lost, with nothing guarding it. **A regression is a defect plus the absence of
  a guard;** repairing only the behaviour repairs half of it.

---

## 5 · Standing

```
Finding A          CENSUS COMPLETE · cause HYPOTHESIZED, not established
Finding B          strongly implicated by the same mechanism · unverified
repair             NOT SCOPED
falsifier change   NOT AUTHORIZED
H2                 e20e32704 · frozen · remains the subject that FAILED §4b
canonical          5b133abcd · unchanged by this document
production deploy  ⛔ HOLD
```

⭐ **Governance consequence, carried forward:** a repaired SHA is a **new
subject.** `H2` stays frozen as the subject that failed §4b. The successor needs
its own machine qualification and its own human acceptance appropriate to the
behaviour it touches. ⛔ A green run on the successor does not retroactively
turn `H2` green, and the merged §4b evidence record stands as written.

---

*This census asserts what the source shows. Where it reasons past the source it
says so, and stops.*
