# Escape hatch pointer interception — repair verification

**Fix**: `2806858af` on `fix/escape-hatch-pointer-interception` (off trunk `32ddc1257`)
**Verified**: 2026-08-02, real browser, repaired build served from `/Users/soullab/wt-ptr`
**Fixture**: `ptr.v1` / `eb1f4ce5-c0c0-4f69-bde2-b56759ea2d58` — fresh, bcrypt credential, restored after

⛔ **This is NOT Correction 3 acceptance evidence.** It is repair verification for a
prerequisite defect that was discovered *while attempting* the Correction 3 feature walk. The
evidence chains stay separate:

```
escape hatch fix → THIS verification → fresh C3 fixture → F1–F10 → feature acceptance
```

⛔ The tempting collapse — *"we fixed the thing blocking F5, therefore the walk proceeds"* — is
refused. A fixed obstruction restores the walk's **preconditions**; it produces none of its
evidence.

---

## Finding under repair

The #735 escape-hatch wrapper (`components/OracleConversation.tsx:9623`) is `fixed`,
full-width, 44px tall, at `z-below-nav` (z-index 59). It centres a single pill. The pill
already declared `pointer-events-auto` — **a no-op, because the ancestor never opted out** — so
the wrapper owned hit surface across its entire width and swallowed clicks aimed at anything
beneath it.

Measured before the fix: `elementsFromPoint` at the capsule review panel's primary action
returned the **wrapper first, the button second**. Zero network requests dispatched.

---

## Verification — same probe that caught the defect

Signed in through the real password form; `/maia`; repaired build confirmed live
(`div.pointer-events-none.fixed.left-0.right-0` present).

| Property | Measured |
|---|---|
| wrapper geometry | `x=0 y=776 w=1265 h=44` — **unchanged**; layout was never the problem |
| wrapper `pointer-events` | **`none`** |
| pill `pointer-events` | **`auto`** |
| pill geometry | `x=593 w=79 h=44` |

### 1. Wrapper no longer intercepts

Probe at `(60, 798)` — inside the strip, far from the pill. Top of stack:

```
DIV "oracle-conversation relative min-h-screen overfl…"   ← underlying content
```

`wrapperIsTopOffPill: false`. The wrapper is no longer returned at all.

### 2. Underlying surfaces regain pointer access

Same measurement. The conversation surface beneath now receives the point that the strip
previously owned.

⭐ The strip claimed **1265px** of hit surface for a **79px** pill — ~94% of it wrongly owned.

### 3. The pill still works

- `pillIsTopAtItsCentre: true` — hit-testable.
- **Real pointer click** on the pill: the escape hatch unmounted (`showChatInterface` flipped)
  and the text composer appeared — `TEXTAREA placeholder="What's on your mind? Let's talk..."`.

Opting the parent out did **not** disable the control it exists to expose.

---

## Regression guard

`components/__tests__/escapeHatchPointerEvents.test.ts` — 4 cases: wrapper still exists (guards
a silent rename), wrapper opts out, pill stays opted in, pill keeps its 44px target.
**Mutation-verified**: removing `pointer-events-none` fails that assertion and only that one.

⚠️ It asserts **source text, not a rendered tree**. The defect is a stacking and hit-testing
property; jsdom performs neither, so a render test would pass in the broken world too. The
browser measurement above is the real evidence — the test guards the character whose loss
reintroduces the defect.

---

## Fixture restored

capsules 0 · atoms 0 · member deleted. Credential never rewritten (bcrypt ⇒ no SHA256 upgrade).

---

## What this does and does not authorize

✅ Supports reviewing/merging the escape-hatch fix **on its own merits**.
⛔ Does **not** advance Correction 3. The feature walk restarts **from F1** on a fresh fixture
against a reconfirmed candidate SHA — F1–F4 were performed against a destroyed fixture in an
environment with a known interaction obstruction, and do not carry forward.
⛔ Phase 1 remains **FAILED at W8**. Deployment unauthorized.
