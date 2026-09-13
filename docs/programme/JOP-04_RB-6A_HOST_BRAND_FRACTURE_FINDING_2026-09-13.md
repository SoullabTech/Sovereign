# JOP-04 · RB-6A — Host Witness Result · ⛔ **STOP — RUNTIME DEFECT IN RB-6A**

**Run:** 2026-09-13, founder-executed, real JARVIS Electron renderer, Mac Studio
**Disposition:** ⛔ **RB-6B Condition B NOT witnessed at the IPC boundary. RB-6A host-boundary
acceptance REOPENED.**

```text
SUBJECT          fd543df1b43ab9a8d45a8bf374febc60257346a7   clean detached checkout
APP BUILD SHA    fd543df1b                                  bound substrate, dirty=false
JUDGE            4267e12b
APPARATUS        scripts/jop04/rb6b-host-witness.js         ⛔ NOT modified during the run
```

---

## 1 · Real IPC results

| Arm | Result | |
|---|---|---|
| **CONTROL** — no routing declaration | `refused_not_routable` · not executed | ✅ **RB-6A's negative arm holds at the real boundary** |
| **ARM A** — `routing { satisfied: true, basis: 'operator_submission' }` | `refused_not_routable` · `execution_lane: null` | 🔴 **PRECONDITION-UNMET** |

```text
p1 route was legitimate                FALSE
p2 no independent host decision        TRUE
p3 execution nevertheless occurred     FALSE
```

⛔ **Condition B was not reached, so it could not be witnessed.** The founder stopped and did not
repair or modify the apparatus. ⭐ **Correct: a surprising result is evidence.**

**Custody clean.** `HEAD` unchanged, worktree clean, and the host events ledger **byte-identical**
before and after (`sha256 3adcdc4f…` both sides) — **no capability executed and no event was
written.**

## 2 · ⭐⭐ Root cause — a module-identity fracture, and it is mine

`jarvis-desktop/src/main.js:740` mints through a **cache-busted** import:

```js
const { declareRoutingEligibility } = await import(`file://${eligPath}?t=${Date.now()}`);
```

`scripts/builder/router.mjs:14` tests through a **static** import:

```js
import { isRoutable } from './routing-eligibility.mjs';
```

And the brand is deliberately module-private (`routing-eligibility.mjs:21`):

```js
const BRAND = Symbol('jarvis.routing-eligibility');
```

**Two module URLs → two module instances → two Symbols.** Reproduced deterministically:

```text
same module instance:                                    false
minted by cache-busted, tested by static  → isRoutable:  false
minted and tested by same instance        → isRoutable:  true
```

> ⭐ **The private brand did exactly what it was designed to do — refuse an object it did not mint.
> The host accidentally created two minters.**

**This is a defect in my RB-6A implementation.** I copied the surrounding cache-busting idiom
(`router.mjs?t=`, `deterministic.mjs?t=`) onto a module whose whole purpose is a **stable private
identity**. Cache-busting is correct for stateless code and fatal for a minter.

## 3 · What this does and does not change

```text
CONDITION A   registration alone does not grant routing        ✅ STILL DEFEATED
              (control arm confirmed it at the REAL boundary)

RB-6A HOST    registered ∧ legitimate eligibility → NOT routable   🔴 UNINTENDED
ACCEPTANCE    REOPENED — the positive state is unreachable in production
```

⭐ **RB-6A is over-refusing, not sovereignly discriminating.** A gate that refuses *everything* is not
a gate. `registered ∧ ¬routable` is reachable; `registered ∧ routable` is **not** — so the
discriminating pair RB-6A was closed on does not exist at the host boundary.

⛔ **Condition B remains witnessed only in-process** (CAL-3a RED), never at the real IPC path.

## 4 · ⭐⭐ The methodological finding — why no in-process test could see this

**The judge and the host used different module-loading disciplines.**

```text
INSTRUMENT   imports the subject's router AND eligibility from one graph  → ONE instance
HOST         cache-busts each import independently                         → TWO instances
```

The harness's loading discipline was **more favourable than production's**, so every probe — RB-F2,
CAL-2a, CAL-2b, the full M1/M1-full mutation set — passed against a composition the host cannot
reproduce.

> **New falsifier class: an instrument that does not reproduce the host's module-loading discipline
> cannot see identity fractures.**

⭐ **This is the strongest possible vindication of requiring the real IPC witness.** The defect is
invisible to source inspection, invisible to unit tests, invisible to the composed-in-process Layer B
— and immediately visible at the boundary. It was found *before* RB-6B was designed on top of it.

## 5 · Reconciliation options — analysed, ⛔ NOT authorized

**Requirement:** restore legitimate routability **without** making the brand forgeable and **without**
weakening the proven negative arm.

### ⭐ Option A — drop the cache-buster on the eligibility import only (smallest)

`main.js` imports `routing-eligibility.mjs` with **no query**. `router.mjs` is still cache-busted, but
its **static** import resolves to the unqueried URL — so both reach one instance.

**Empirically verified at this SHA:**

```text
registered + eligible                 → C0                     ✅
registered + no eligibility           → refused_not_routable   ✅ negative arm intact
registered + forged {satisfied:true}  → refused_not_routable   ✅ brand still unforgeable
fresh cache-busted router reload      → C0                     ✅ brand stable across reloads
```

⚠️ Depends on a convention someone must remember: *never add `?t=` to this one module.*

### ⭐⭐ Option B — the router re-exports the producer (structural)

`main.js` obtains **both** `route` and `declareRoutingEligibility` from the same cache-busted router
graph. One instance **by construction** — the fracture becomes impossible rather than merely avoided.

⚠️ Slightly widens `router.mjs`'s surface; must not let the router *call* the producer (that would be
CAL-3d's auto-mint counterfeit one layer down).

### ⛔ Option C — a cross-instance brand (`Symbol.for`, global registry)

**REFUSED.** `Symbol.for` is a global registry key: anyone can forge the brand. This would restore
routability by **destroying the unforgeability** RB-6A was built on — trading a proven property for a
convenience.

### ⛔ Option D — signature/HMAC validation

Over-engineered, and a shared secret inherits the same instance problem.

**Reading:** **B is structurally correct; A is minimal and verified.** ⛔ Neither is selected here.

## 6 · ⭐ Acceptance obligation the repair must carry

Any reconciliation must be judged by a probe that **reproduces the host's loading discipline** — a
**cross-instance witness**:

```text
mint through one module instance  →  test through the instance the router actually uses
```

⛔ **A probe that mints and tests within one graph will pass a fractured system**, exactly as every
existing probe just did. This is a new obligation on the instrument, and it must be added **before**
the repair, per the pattern that closed RB-6A the first time.

## 7 · Standing

```text
RB-6A CONDITION A         DEFEATED — confirmed at the REAL boundary (control arm)
RB-6A HOST POSITIVE ARM   🔴 BROKEN — registered ∧ legitimate eligibility is unroutable
RB-6A                     HOST-BOUNDARY ACCEPTANCE REOPENED

RB-6B CONDITION B         in-process RED (CAL-3a) · ⛔ real IPC NOT REACHED
RB-6B DESIGN              ⛔ NOT OPEN

HOST WITNESS              STOPPED CORRECTLY · apparatus unmodified
SUBSTRATE                 UNCHANGED · events ledger byte-identical
RB-6 EMBARGO              ACTIVE

NEW FINDING               the routing-eligibility private brand fractures across
                          cache-busted vs static ESM module instances
NEW FALSIFIER CLASS       an instrument that does not reproduce the host's
                          module-loading discipline cannot see identity fractures
```

> **The apparatus was built to witness Condition B and instead caught a defect in the repair it was
> standing on. That is the system working.**
