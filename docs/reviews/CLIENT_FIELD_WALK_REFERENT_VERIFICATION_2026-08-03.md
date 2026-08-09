# Client Field Walk — Referent Verification

**Verified:** 2026-08-03, **before** D9 and before any participant sat down.
**Scope:** queue item 2 — *exact SHA · visible capabilities · no accidental promotion.*
**Authorization note:** verifying a tree is not approaching a participant. ⛔ This document
does **not** authorize the encounter. **D9 remains the gate.**

> **The encounter is against a specific surface, not the architecture in abstraction.** A
> walk on a tree that lacks a capability generates evidence about **that tree**, not about
> the intended system.

---

## 1. Exact SHA — ✅ verified

```
78358f9792c84aeb50df43ec2f18a82957c8407c
2026-08-03 18:37:57 -0400
feat(now-what): replace the Home shell with a contextual work field
```

⭐ **The commit touches exactly ONE file** — `components/now-what/ClientHome.tsx`
(216 insertions / 212 deletions). Everything else on the walk tree is trunk.

> **The redesign under test is one component.** Not a branch of accumulated work. This is
> narrower than "the Phase 1 architecture" and the encounter must be described accordingly.

---

## 2. Visible capabilities — ✅ intact and self-consistent

| Element | State at `78358f979` |
|---|---|
| Mount point `app/now-what/home/page.tsx` | ✅ present |
| Component `components/now-what/ClientHome.tsx` | ✅ present — the redesign |
| Composition route `app/api/now-what/home/route.ts` | ✅ **present** |
| Data path | ✅ **live** — `apiFetch('/api/now-what/home')` at line 242 |

### ⚠️ Correction to a carried-forward note

An earlier note recorded Phase 1 as *"verified against a stubbed payload."* That described
**how it was verified**, not how it runs. The component issues a **real member-scoped call**.

**Consequence for the walk:** the content Larry sees **is** the test member's actual field
state. ⛔ There is no fixture to arrange the encounter around, and no stub to mistake for
content. **The controlled test member's field state IS the walk content** — it must be
constructed deliberately and recorded in the evidence packet, because a different field state
is a different encounter.

---

## 3. 🔴 Referent finding — the tree is a hybrid

`78358f979` carries **12** `/now-what/*` pages. The redesign replaced the six-section Home;
**it did not remove the surfaces that model served.**

**Reachable from the Home under test** — these are part of the walk surface:

| Door | Target |
|---|---|
| *Explore →* / *Continue →* | `/now-what/room` |
| inline | `/now-what/field` |

**Present on the tree but not linked from the Home** — reachable by direct URL only:
`/now-what/arrive · map · next · position · practice · questions · reflections · themes ·
welcome`.

### Why this matters for Q3 and Q4

Q3 is *"Where would they go next?"* — a navigation question. If the participant follows a
door, he lands on a surface that **predates the redesign**. His answer would then describe a
**mixed environment**, not the intended system.

⛔⛔ **This is a FINDING, not a defect to fix.** Per the instrument, no change may be made in
response — including obvious ones. It is recorded here so that:

1. the evidence packet states which surfaces were reachable during the encounter, and
2. no Q3/Q4 answer is later cited as evidence about the redesign when it was evidence about
   a hybrid.

⚠️ It is also the **inverse** of the distortion the instrument guards against: not *showing
him something more mature than the test surface*, but showing him a surface **less coherent**
than the architecture that has been ruled.

### ⛔ Not a defect — a disclosed variable

| If the purpose were | the hybrid topology is |
|---|---|
| **shipping** | likely a **blocking implementation issue** |
| **learning** | a **controlled variable that must be disclosed** |

The purpose is learning. The danger is not that old routes exist — it is that the
participant's interpretation of the new Home may be **shaped by an ungoverned door after they
leave it.** Q3 does not ask about the Home; it asks about **the environment they believe they
entered.**

### ⭐⭐⭐ The interpretation boundary — RULED

> **The walk may reveal the coherence of the CURRENT TREE. It may not be used to infer the
> coherence of the INTENDED ARCHITECTURE.**

### What this encounter can and cannot test

| ✅ Legitimately tests | ⛔ Cannot yet test |
|---|---|
| arrival comprehension | complete Now What? navigation |
| orientation | full field topology |
| perceived purpose | mature invitation experience |
| whether the Home creates a coherent first impression | final architecture |

### The claim, stated correctly

⛔ *"We are testing the Now What? experience."*

✅ **"We are testing the `ClientHome.tsx` Phase 1 expression, rendered against a deliberately
constructed member field state, inside a tree that still contains legacy `/now-what/*`
surfaces."**

Those are different claims. ⛔⛔ **Do not let a prototype branch be treated as if it
represents the entire product.**

---

## 4. No accidental promotion — ✅ verified

```
production GIT_COMMIT  =  95b21ce42     (unchanged)
walk referent          =  78358f979     (local dev tree only)
```

Production is untouched and continues to serve the six-section Home. ⛔ Nothing from this
encounter may be cited about production.

---

## 5. Carried-forward claims — status corrected

Two items were previously carried as established for the walk. Neither is verified against
this referent, and both are recorded here as unverified rather than dropped:

| Claim | State |
|---|---|
| **Invitation bridge** | reported built in conversation. **Referent for the `78358f979` walk: UNVERIFIED.** Invitation surfaces on the walk tree are **byte-identical in inventory to trunk** — the tree neither adds nor lacks anything here relative to trunk, which is *not* the same as confirming the bridge is present and functional |
| **Relationship initiation architecture** | decision-record work reported. **Implementation state for the walk environment: UNVERIFIED** |

⛔ Neither may be described to the participant as available, and neither may be counted as
present when reading a Sufficiency finding. If he names either as missing, that is a finding
about **this tree** and is recorded as such.

---

## 6. Preconditions still outstanding

- [ ] **D9 ruled** — ⛔ **hard blocker, unruled**
- [ ] Controlled test member created with a **known, recorded** field state (§2)
- [ ] Executor, observer and acceptance authority named; overlaps declared in advance
- [ ] Referent re-verified at encounter time — this document expires if the tree moves

> ⛔⛔ **Readiness does not create its own authorization.** The environment being ready is not
> permission to run the encounter.
