# JOP-04 · RB-CAL-4 — Host-Loader Identity Continuity · Calibration Record

**Date:** 2026-09-13 · ⭐ **CALIBRATION SUCCESS on both subjects · 0 mismatches**
⛔ **No repair authorized. Nothing in the host or router was changed.**

```text
BASELINE      e1c6f527   no identity-bearing module exists
SUBJECT       fd543df1   RB-6A repair, host acceptance REOPENED
JUDGE         8a62ea93   CAL-4 amendment
```

---

## 1 · The frozen law

> **Identity-bearing modules may not be independently re-instantiated across a trust boundary that
> expects their private identities to interoperate.**

```text
STATELESS MODULE          may be independently cache-busted
IDENTITY-BEARING MODULE   must have ONE authoritative identity lineage
                          for every producer/consumer that exchanges its values
```

⭐ **Freshness semantics and identity semantics cannot be treated alike.** The same defect could
recur with private classes, WeakSets, closures, branded capabilities, or any module-local authority
token — so the law is stated over *identity-bearing modules*, not over `Symbol`.

### The semantic requirement — deliberately not an assertion about the mechanism

> **Legitimately minted routing eligibility survives production-equivalent module reloads without
> becoming forgeable.**

⭐ The implementation stays free to replace the branding mechanism later **without rewriting the law**.

## 2 · Results on `fd543df1` — the three-way discrimination

| Arm | Predicted | Observed | What it establishes |
|---|---|---|---|
| **CAL-4a** cross-loader (production-shaped) | RED | 🔴 **RED** | *"a LEGITIMATELY minted object was refused because producer and consumer hold different identity lineages"* — **the defect** |
| **CAL-4b** same-lineage positive control | GREEN | 🟢 **GREEN** | ⭐ *"the brand mechanism itself works — the defect is lineage, not design"* |
| **CAL-4c** forgery negative control | GREEN | 🟢 **GREEN** | ⭐ *"unforgeability holds: identical visible fields are not identity"* |
| **CAL-4d** reload stress, 5 fresh routers | RED | 🔴 **RED** | 🔴 *"fresh router instances reject the value the host mints — the fracture is not a startup accident"* |

```text
legitimate cross-instance    REJECTED   ← the defect
legitimate same-instance     ACCEPTED   ← the brand itself works
unbranded counterfeit        REJECTED   ← unforgeability remains
```

⭐ **Much stronger than "does routing work?"** These three together localize the fault precisely: the
authority mechanism is sound and its *lineage topology* is broken. A repair that merely restored
routing without holding 4c would be trading the proven property away.

**Baseline `e1c6f527`:** all four `PRECONDITION-UNMET` — *"no identity lineage exists to test."* ⭐ The
honest verdict; there is no identity-bearing module there to fracture.

## 3 · Supplementary checks (⛔ discharge nothing)

```text
Symbol.for canary            uses_global_symbol_registry: false   ✅ clean
router self-mint tripwire    router_calls_producer:       false   ✅ clean
```

The canary forbids the known dangerous repair — `Symbol.for` keys a **global** registry, so anyone
can forge the brand. ⛔ It is a **tripwire, not the proof**: only CAL-4c's behavioural forgery arm
establishes unforgeability.

## 4 · The Option-B law, frozen before the repair is authorized

```text
same graph                                                   YES
router self-mints                                            NO
caller mints                                                 NO
trusted host uses producer with caller-requested routing facts  YES (RB-6A semantics)
```

⛔ **The router may make the producer AVAILABLE to the trusted host. It may never do:**

```ts
const eligibility = declareRoutingEligibility(...)   // from facts the router derives itself
return route(task, eligibility)
```

⭐ That would repair the module-identity fracture **while reintroducing RB-6A's original
constitutional defect** — and it is CAL-3d's auto-mint counterfeit relocated one layer down.

## 5 · Post-repair requirement

The repaired architecture must make this pair **simultaneously** true:

```text
LEGITIMATE CROSS-LOADER OBJECT   →  recognized     (CAL-4a GREEN)
CALLER-FORGED LOOKALIKE          →  refused        (CAL-4c GREEN)
N FRESH ROUTER INSTANCES         →  all recognize  (CAL-4d GREEN)
```

⭐ **The property is not "the producer and consumer happen to share an instance." It is that their
identities are obtained from one authoritative module graph *by construction*** — which is why
Option B is the architectural target and Option A, though empirically verified, makes correctness
depend on remembering a loading convention.

## 6 · Standing

```text
RB-6A CONDITION A          DEFEATED — confirmed at the real boundary
RB-6A HOST POSITIVE ARM    🔴 BROKEN — now CALIBRATED (CAL-4a RED, CAL-4d RED)
RB-6A                      HOST-BOUNDARY ACCEPTANCE REOPENED

BRAND MECHANISM            ✅ SOUND (CAL-4b GREEN)
UNFORGEABILITY             ✅ INTACT (CAL-4c GREEN)

RB-6B CONDITION B          in-process RED · ⛔ real IPC NOT REACHED
RB-6B DESIGN               ⛔ NOT OPEN

REPAIR                     ⛔ NOT AUTHORIZED — step 4 of the sequence
IPC WITNESS APPARATUS      UNCHANGED and FROZEN, awaiting the post-repair run
RB-6 EMBARGO               ACTIVE
```

> **A test can faithfully exercise the right functions and still test the wrong organism if it does
> not reproduce the host's module-identity topology.**

⭐ That is a genuinely new falsifier class for this programme, and CAL-4 is its first instrument.
