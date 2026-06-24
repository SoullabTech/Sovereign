# Guide as Operating Lens
## Current State, Capabilities, Integrations, and Roadmap
### June 2026 — claim-calibrated edition

> Calibrated against [`docs/canon/MARKETING_CLAIM_DISCIPLINE.md`](../canon/MARKETING_CLAIM_DISCIPLINE.md)
> (**Live / Designed / Vision · Center of Gravity · Failure Test**). Every capability
> claim below is stamped by **evidence tier** *and* **deploy state**. Governing line:
> *we do not tell tomorrow's story as if it were today's.*
>
> Pairs with the Co-lab papers and with
> [`AUTHORSHIP_PRESERVING_INTELLIGENCE_v0.9.md`](./AUTHORSHIP_PRESERVING_INTELLIGENCE_v0.9.md).
> Engineering source of truth: [`docs/architecture/GUIDE_ARCHETYPAL_STANDING_SOURCE_2026-06-05.md`](../architecture/GUIDE_ARCHETYPAL_STANDING_SOURCE_2026-06-05.md).
> Doctrine source of truth: [`docs/canon/MAIA_MULTI_ARCHETYPAL_INTELLIGENCE.md`](../canon/MAIA_MULTI_ARCHETYPAL_INTELLIGENCE.md)
> + [`docs/canon/ARCHETYPAL_GRAMMAR.md`](../canon/ARCHETYPAL_GRAMMAR.md).

---

## How to read this paper (two axes, not one)

The earlier draft mixed three categories that need to stay distinct. This edition
separates them — and adds a second axis the first draft did not have.

**Axis 1 — Evidence tier** (maps to the canon's Live / Designed / Vision):

| Tier | Meaning | Canon |
|------|---------|-------|
| **Verified** | Built, runs, and a runtime receipt was obtained. | Live |
| **Implemented, not yet measured** | Built and runs; its *effect on output* has not been demonstrated. | Live (mechanism) / Designed (effect) |
| **Designed, not yet demonstrated** | Specified; no running implementation yet. | Designed → Vision |

**Axis 2 — Deploy state** (orthogonal to evidence tier):

| State | Meaning |
|-------|---------|
| **On branch / dev** | Verified on `chore/marketing-claim-architecture`; **not** on the production deploy. |
| **On production** | Live at soullab.life. |

> **The two axes are independent.** A capability can be *Verified on branch* and
> simultaneously *absent from production*. This is not a footnote — it is the single
> most important correction in this edition.

**The receipt that governs every "capability" claim:**

```
guide present   ≠   guide influential
verified         ≠   deployed
```

---

## Deploy-state reality check (verified 2026-06-06)

The screenshot a member sees today at `soullab.life/maia` — the Wisdom panel with
"Choose Your Guide" and "Current Teaching" — is the **production build**. The entire
Phase 1 *standing-guide persistence stack* is **not in that build**.

Confirmed against a freshly fetched `origin/clean-main-no-secrets` @ `ad23b1a96`:

| Component | On production branch? |
|-----------|----------------------|
| `app/api/members/wisdom-guide/route.ts` (GET/POST/DELETE) | **No — branch-only** |
| `lib/wisdom/wisdomGuidePersistence.ts` | **No — branch-only** |
| `lib/wisdom/wisdomGuidePrompt.ts` (the standing-source addendum) | **No — branch-only** |
| `database/migrations/20260605000001_member_active_guide.sql` | **No — branch-only** |
| The persist/clear wires in `OracleConversation.tsx` | **No — 0 occurrences on prod branch** |

**Production runtime probe (2026-06-06, on minisforum).** The branch diff predicts
absence; the live host confirms it. Running container built `2026-06-05 14:33 UTC`
from checkout HEAD `7a345d170`. Six independent checks converge:

1. Route source **absent** from the deployed checkout (`git ls-files`).
2. Route **not compiled** into the running container (`.next` find returns nothing;
   the `api/health` control returns chunks, so the probe is valid).
3. `buildWisdomGuideAddendum` — **not defined** anywhere on the deployed commit.
4. The deployed sovereign route makes **no** reference to `wisdomGuide`.
5. The deployed `OracleConversation` does **not** send `meta.wisdomGuide` per turn.
6. **Zero** guide-related log lines in the last 72h.

**What this means in plain terms.** On production *today*, choosing a guide writes
`localStorage` and shows a toast — and nothing else. `POST /api/members/wisdom-guide`
404s (caught, non-blocking); the chosen guide is never sent to the server and reaches
the prompt through **no channel at all** — not the Phase 1 persistence stack, and not
any legacy per-turn path (there is none on prod). **On production, "Choose Your Guide"
and "Current Teaching" are cosmetic.** The screenshot reflects pre-Phase-1 behavior.

Everything stamped **Verified** below is therefore *Verified on branch* — proven on
`chore/marketing-claim-architecture`, **confirmed absent on production**. Promotion to
*Verified on production* requires a deploy of `chore/marketing-claim-architecture` →
`clean-main-no-secrets` and reproduction of `🧭 [FAST] Wisdom guide applied` on the
live host. **First roadmap action is therefore: deploy + re-verify on production.**

---

## Executive Summary

The Guide as Operating Lens architecture is the first implementation of MAIA's
transition from a conversational AI toward a **Multi-Archetypal Intelligence
Architecture**.

Rather than treating wisdom traditions as content libraries, role-play personas, or
prompt styles, MAIA treats them as **standing sources of attention**.

The purpose is not for MAIA to *become* Taoist, Jungian, Sufi, Vedic, Christian,
Buddhist, or Indigenous. The purpose is to let a member consciously **invite a
lineage lens into the field of interpretation**.

- A guide shapes what MAIA *notices*. *(design intent — see "Designed, not yet demonstrated")*
- A guide does not determine what MAIA *concludes*. *(sovereignty invariant — enforced)*

A guide has **standing**, not **authority**. The member remains the final authority.
This distinction is foundational and is enforced at the doctrine layer regardless of
how much of the mechanism is yet measured.

---

## The Problem

Most AI systems approach traditions in one of two ways.

**Style layer** — "respond like Jung." Changes tone; rarely changes attention.
Produces role-play.

**Knowledge layer** — a tradition becomes a document collection; the system
retrieves quotations. Improves information; does not create a living lens.

Neither reflects how traditions actually function. Traditions *train attention*,
shape perception, influence interpretation, suggest practices, and reveal
dimensions of meaning. Guide as Operating Lens is designed to model that deeper
function — and the rest of this paper is careful to say which parts of that model
are *running and proven*, *running but unmeasured*, or *designed only*.

---

## Current State — by evidence tier

### Verified *(on branch / dev — not yet on production deploy)*

A runtime receipt exists for each of these on `chore/marketing-claim-architecture`:

- **Guide persistence** — `member_active_guide` + `member_guide_history`; SQL
  smoke-tested end-to-end (upsert / load / deactivate-filter / JSONB round-trip /
  history) against a real member.
- **Cross-device hydration** — `OracleConversation` GETs the persisted guide on
  mount and hydrates when local is empty (server is durable truth; same-session
  local choice wins).
- **Live sovereign-route loading** — `app/api/sovereign/app/maia/list` server-loads
  the persisted guide and builds the addendum on every text tier (FAST/CORE/DEEP)
  via the provenance-preserving `ADDENDA_SPECS` channel.
- **Voice-route integration** — voice reuses `buildWisdomGuideAddendum` (inherited,
  not a second implementation).
- **Sanctuary compatibility** — chosen guide remains active in Sanctuary; retrieval
  / inference / continuity-import remain blocked.
- **Runtime receipt obtained** — server-side marker
  `🧭 [Voice Wisdom Guide] Applied (member-chosen): ARCHETYPAL STANDING SOURCE — <name>`
  fired ×2 under a Sanctuary session, with **0** retrieval markers (the Sanctuary
  wall held).

> Promotion gate to *Verified on production*: deploy + reproduce
> `🧭 [FAST] Wisdom guide applied` on the live host.

### Implemented, not yet measured

Built and running, but the effect on the response has not been demonstrated:

- The guide is **present in MAIA's interpretive context** (injected as a sanitized
  standing-source addendum).
- The guide is **available to response generation** on every path.
- The guide is **available across text and voice modes**.

> These say *the lens is in the room*. They do not yet say *the lens changed what
> was seen.*

### Designed, not yet demonstrated

Specified and intended; **no running evidence yet**, and in some cases no running
implementation yet:

- Guide **shapes attention**.
- Guide **shapes interpretation**.
- Guide **shapes reflection**.
- Guide **influences retrieval** (Phase 3 hook, not built).
- Guide **participates in a standing-source ecology** with developmental thread and
  memory provenance (Phase 3–4, not built).

> These may all ultimately prove true. The honest current state is `guide present ≠
> guide influential`. The **ablation harness** (below) is the instrument that moves
> "shapes attention" from *Designed* to *Verified*.

---

## What actually happens today when a member taps the Wisdom panel

Grounded in the code on `chore/marketing-claim-architecture`
(`components/maia/panels/WisdomPanel.tsx`, `WisdomCouncilPicker.tsx`,
`CurrentTeachingModal.tsx`, `OracleConversation.tsx:9201–9249`):

**Choose Your Guide** → opens the picker (39 traditions grouped by element). On
select: sets local state + `localStorage`, shows a toast, and *(branch only)*
`POST /api/members/wisdom-guide` persists the guide to `member_active_guide` +
history. On the next turn the guide is sent as `meta.wisdomGuide` **and** the
sovereign route independently loads the persisted guide and injects it as a
standing-source addendum (`ARCHETYPAL STANDING SOURCE — <name>`) into the prompt
on FAST/CORE/DEEP + voice.

**Current Teaching** → opens a modal showing the active guide, with "Change guide"
(reopens the picker) and "Step back — continue without a guide" → clears local +
*(branch only)* `DELETE /api/members/wisdom-guide` (deactivate).

> Two honest caveats for outward use: **(1)** the persistence half of the above is
> branch-only (see deploy-state check). **(2)** Each of the 39 traditions currently
> carries a *single archetype string + mantra + principles* rendered as **prose** —
> not yet the two-tier archetypal constellation. The constellation is Phase 2 (see
> "The Archetypal Evolution").

---

## Sanctuary Compatibility *(Verified on branch)*

The guide remains active in Sanctuary — intentionally. **Sanctuary protects against
imported context, not conscious choice.**

| Allowed (conscious choice) | Blocked (imported context) |
|---------------------------|----------------------------|
| chosen guide · chosen voice · chosen mode · chosen orientation | memory retrieval · identity inference · continuity import · retained contextual assumptions |

The guide survives because it is *chosen*, not because it is *remembered*. This is
sealed in [`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`](../canon/MAIA_SOVEREIGNTY_INVARIANTS.md)
§ Sanctuary Scope Clarification.

---

## Architectural Principles *(doctrine — enforced every phase)*

1. **A guide has standing, not authority.** It may influence interpretation; it may
   not possess the field.
2. **The member remains the final authority.** A guide may suggest; it may never
   determine.
3. **MAIA remains MAIA.** The guide informs attention; it does not become identity.
4. **Interpretation preserves provenance.** MAIA should be able to indicate when a
   perspective emerges from a particular lineage lens; the source stays visible.

---

## The Archetypal Evolution

The guide layer is becoming an **archetypal operating layer**. The emerging model:

```
Guide  →  Archetypal Constellation  →  Standing Archetypes  →  Interpretation
```

A tradition becomes a particular *expression* of deeper archetypal patterns. The
grammar is **two-tier** (resolved 2026-06-05): elemental archetypes are primitives;
guide constellations are tradition-specific expressions that point back to them
*relationally* (no premature collapse of Priest → Prophet).

**Grammar authorship status (the bottleneck — be precise):** the structure is
resolved and the format-setting unit is authored — **the Priest (Rig Veda / Fire)**.
The remaining Fire primitives (Visionary / Warrior / Creator / **Prophet**) and the
other three Rig Veda archetypes (Sacrificer / Illuminator / Sovereign) are **not yet
authored**. So the archetypal grammar is at **one archetype of the first lineage**,
not "in progress" in the engineering sense. *(See "Phase 2".)*

---

## Current Integrations *(recast for precision)*

The first draft said the guide "participates alongside elemental state,
developmental thread, natal pattern, memory field." Current reality:

| Standing source | State |
|-----------------|-------|
| **Guide** | ✓ wired (branch) |
| **Elemental state** (Wu Xing) | ✓ live |
| **Natal pattern** | ✓ live |
| **Developmental thread** | partial / dormant on the live route |
| **Memory provenance** | planned (Phase 4) |

So the precise claim is:

> The guide **shares the standing-source architecture that will ultimately support**
> elemental state, developmental thread, natal pattern, memory, and archetypal
> standing.

Same vision, accurate tense. Today the guide *shares the channel* with elemental
state and natal pattern; the full ecology (dynamic standing computed across all
sources) is Phase 3.

---

## Phase 2 — the honest shape of "In Progress"

The first draft implied:

```
Doctrine  +  Engineering   →  progressing together
```

The reality:

```
Doctrine     → active     (Kelly authoring the grammar, one lineage at a time)
Engineering  → intentionally blocked   (encoding must follow authorship)
```

This is a **stronger** story than parallel development: the architecture is being
**constrained by doctrine rather than reverse-engineered from implementation**. The
grammar is the primitive; the encoding is downstream of it. Engineering pauses here
by design — encoding an unauthored grammar would be arbitrary.

---

## Roadmap

| Phase | Title | Status |
|-------|-------|--------|
| **1** | Standing Guide (persisted, server-loaded, ecology-integrated) | **Verified on branch — pending production deploy + re-verify** |
| **1.x** | Production deploy + runtime receipt on live host | **Next action — prod confirmed absent 2026-06-06** |
| **2** | Archetypal Grammar → typed primitive (Tier-1 elementals + Tier-2 Rig Veda constellation) | **Doctrine active (1 archetype authored); engineering blocked until first lineage complete** |
| **3** | Standing Archetypal Field (dynamic ecology: guide ⊕ elemental ⊕ developmental) | **Planned** |
| **4** | Retrieval + Memory provenance (archetype-aware, Sanctuary-respecting) | **Planned** |
| **5** | Practices + Learning pathways derived from the grammar | **Planned** |

Sequence in flight (claims aligned with receipts):

```
1. Calibrate the paper            ← this document
2. Build the ablation harness     ← first measurable evidence that the lens functions
3. Finish the Rig Veda lineage    ← doctrine (Kelly): Prophet first, then the rest
4. Encode the Phase 2 primitive   ← against a real grammar, not a speculative one
5. Measure archetypal standing    ← promote "shapes attention" Designed → Verified
   ( + deploy Phase 1 to production and re-verify )
```

---

## The ablation harness (the next receipt)

The most important future claim is *the guide changes what MAIA notices* — and it is
empirically testable:

```
Input A, guide ABSENT   ┐
                        ├─→  compare:  observations · questions · themes · practices
Input A, guide PRESENT  ┘
```

A measurable divergence is the first evidence that the guide functions as an
**operating lens** rather than a **stored preference**. Per
[GUIDE_ABLATION_PROTOCOL.md](../specs/GUIDE_ABLATION_PROTOCOL.md), **engage and
recede must both pass** — a guide that lights up everywhere is *possessing* the
field, not informing attention.

### First result — 2026-06-06 (N=6/arm/condition, branch, claude-sonnet-4-6)

**The headline is not the +0.83. It is that the system demonstrated _engage_ and
_recede_ as separate behaviors.** That is the constitutional question — *what keeps a
standing source from becoming an authority?* — translated from doctrine into measured
behavior. A captured system can engage; a sovereign one must also recede. The Taoist
guide did both.

- **Taoism — full receipt (engage + recede).** Foregrounds flow / timing /
  constraint on the inner-work prompt (own-lens lift **+0.83**, specificity +1.33),
  and **recedes** on a logistical prompt (lift collapses to **−0.33**; the reply is
  nearly identical to control — no wu-wei forced onto deadlines). Imposition stays
  low throughout (~1.1/5). → *"the guide has standing, not sovereignty"* is
  demonstrated as **behavior**, not just an encoded guardrail — for this lens, on
  branch.
- **Jungian — no measurable engage, because the baseline is already Jungian.** MAIA's
  *default* voice scores highest on the Jungian lens (control 3.0/5 — individuation /
  shadow / "what is it asking of you"). This is not "Jungian doesn't work" — it means
  **Jungian is acting as a hidden control**: the guide has almost nowhere to move a
  voice that is already there. The sharper next question is therefore not *"does
  Jungian engage?"* but **"what is MAIA's native attractor state?"** — because the
  baseline itself appears to be a lens.
- **Vedic — no engage on this prompt, and correctly did not impose.** The Vedic lens
  is irrelevant to "restlessness"; the guide receded to baseline rather than forcing
  duty / Rta / offering. Needs a Vedic-relevant prompt to test engage.

**Scope — do not generalize.** This promotes the *attention* and *sovereignty* beats
to 🟢 **Observed for Taoism, on branch** — not "guides work." It also **confirms the
doctrine's prediction**: the thin tradition payload moves the lens that is both
*orthogonal to MAIA's default* and *lexically concrete* (Taoism), but not the
saturated (Jungian) or the irrelevant (Vedic). The richer, reliable cross-lens
differentiation is expected to come from the **authored grammar (Phase 2)**, not the
current payload.

**Claim status after this run** (the load-bearing row is the last):

| Claim | Status |
|---|---|
| Guide is injected as a standing source | Verified (branch) |
| Taoist guide shifts attention | 🟢 Observed |
| Taoist guide recedes when irrelevant | 🟢 Observed |
| Standing-source architecture *can* preserve sovereignty | **First empirical receipt** |
| *All* guides influence without possessing | **Not established** |

Validated: *a guide can influence without possessing.* Not yet validated: *all guides
influence without possessing.* Those are different claims, and the gap between them is
honest work, not a caveat to bury.

**Doctrine ⇄ behavior convergence (the Prophet thread).** The constitutional question
being worked through the Prophet archetype — *what prevents standing from becoming
authority?* — is exactly what the **recede** condition measures: *can the lens
relinquish authority when it no longer fits?* Taoism passed it **operationally**, not
philosophically. The doctrine thread and the ablation thread met in the same place.

**One-sentence receipt (for Heather / Nathan / a future paper):**

> The first guide ablation suggests that a standing source can alter what MAIA
> foregrounds while still relinquishing influence when the lens becomes irrelevant.
> The initial receipt is strongest for the Taoist guide and supports the core
> architectural claim that guides may enter the room without owning the room.

---

## Where this leaves the architecture — *mechanically standing, constitutionally unfinished*

Three ablation runs converge on one description of the current state:

> **Mechanically standing. Constitutionally unfinished.**

The standing-source *mechanism* exists and is proven (on branch). What does not yet
exist is the **constitutional grammar** that would make the guides genuinely distinct
*ways of attending* rather than distinct *collections of concepts*. Four findings now
look reasonably well established:

1. **The constitutional result, not the magnitude.** The load-bearing finding is not
   Taoism's +0.67 — it is that *engage and recede coexist*: a guide can influence
   what MAIA foregrounds without claiming jurisdiction over it. `engage ≠ authority;
   engage ≠ possession.` That is the Standing/Authority distinction appearing as
   **behavior**. At +0.20 or +2.00 the constitutional significance is identical.

2. **Vedic exposed a design constraint — and passed a sovereignty test doing so.**
   The current payload ships religious *content* (Rta, Agni, sacrifice, cosmic order).
   The question asked of it (leadership, prioritization, obligation) lives in another
   register. The bridge does not exist — so the model **correctly refused to smuggle
   religious vocabulary into a secular problem.** A prevented false positive. The
   implication is a hard requirement: **Phase 2 must *translate* traditions, not
   merely *deepen* them.** The grammar already names the layer: each archetype's
   **`function`** field (*"what this intelligence does / how it attends"* — e.g.,
   Priest → *"consecrates attention"*) **is** the translation from lineage-role to
   domain-general attentional structure. The thin payload fails precisely because it
   carries `principles: [Rta, Agni, …]` (content) with **no `function`** (translation).

3. **The baseline is adaptive, not fixed.** MAIA has no single hidden default guide.
   It **shifts attractor states by domain** — depth-psychological on inner-work,
   practical/flow-oriented on action. The baseline itself is a lens that moves with
   the situation. That is closer to Spiralogic (different situations activate
   different interpretive centers) than to "MAIA is secretly Jungian."

4. **The case for grammar is now empirical, not just doctrinal.** Before these runs it
   was plausible that richer guide *descriptions* would solve differentiation. That
   now looks unlikely. *Thin payload → minor salience shifts; grammar → different
   structures of what counts as signal.* Different orders of magnitude: a paragraph
   about Taoism nudges vocabulary; a constitutional grammar changes what registers as
   a signal at all.

**The convergence.** Four independent threads land in the same place:

| Thread | Says |
|---|---|
| The harness | the payload is not enough |
| The constitutional work | vocabulary is not enough |
| The leadership run | a translation layer is missing |
| The Prophet authoring | the missing thing is restraint structure |

Different paths, one center of gravity — which is why the **Prophet cell keeps
surfacing as the bottleneck.** The forward move is not more ablation; it is the
authored grammar.

## Success Criteria *(Vision — properly future-tense)*

Guide as Operating Lens succeeds if:

- A member experiences the depth of a wisdom tradition **without surrendering
  authority to it**.
- MAIA engages multiple traditions **without becoming any of them**.
- Interpretation becomes richer **while sovereignty remains intact**.

The guide informs attention. The member authors meaning. MAIA coordinates the
relationship between them.

---

## Verification ledger (what receipt backs each claim)

| Claim | Tier | Receipt / gate |
|-------|------|----------------|
| Guide persists across sessions | Verified (branch) | SQL smoke test vs real member |
| Cross-device hydration | Verified (branch) | mount-GET hydration path |
| Loads on the live sovereign route | Verified (branch) | server-load → addendum on FAST/CORE/DEEP |
| Active across text + voice | Verified (branch) | marker `🧭 [Voice Wisdom Guide] Applied` ×2 |
| Sanctuary keeps chosen guide, blocks import | Verified (branch) | marker ×2, 0 retrieval markers |
| **Live on production** | **Confirmed absent (2026-06-06)** | prod @`7a345d170`: route 404s, no injection path, 0 markers/72h — guide is cosmetic on prod |
| Guide present in interpretive context | Implemented, not measured | injection confirmed; effect not isolated |
| Guide shapes attention — *engage* (Taoist) | **🟢 Observed (branch)** | ablation 2026-06-06: own-lens lift **+0.83** (>0.5), specificity +1.33 |
| Guide recedes when lens irrelevant (sovereignty) | **🟢 Observed (branch)** | same run: Taoist lift **+0.83 → −0.33** on neutral prompt; reply ≈ control |
| Guide shapes attention — Jungian / Vedic | **Designed** | Jungian baseline-saturated; Vedic untested-for-engage → Phase 2 grammar |
| Guide influences retrieval | Designed | Phase 3 `rankCandidates` hook (not built) |
| Full standing-source ecology | Designed | Phase 3 (dynamic standing computation) |
| Archetypal constellation per tradition | Designed | Phase 2 (grammar at 1 archetype) |

> Center of Gravity: this paper's center sits at **Verified-on-branch + Designed**.
> Failure Test: if asked "is the guide live and shaping MAIA's attention for members
> today?" the honest answer is **"the lens is built and proven on the branch; it is
> confirmed absent on production (cosmetic there today), and its influence on output
> is designed but not yet measured."**
</content>
</invoke>
