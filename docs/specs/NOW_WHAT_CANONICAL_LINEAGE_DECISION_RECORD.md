# Now What? — Canonical Lineage Decision Record

**Status:** ✅ **AUDIT COMPLETE — decision recommended, not ruled.** 2026-08-04.
**Purpose:** the bridge between the design work and the pixels people see.

---

## 0. 🔴 CORRECTION — the premise of this audit was wrong, and I introduced the error

> **I reported "~240 commits of design and code never reached trunk / the delivery chain
> failed." That is FALSE.**

It was measured against a **local `clean-main-no-secrets` ref that is 243 commits stale.**

| | |
|---|---|
| local `clean-main-no-secrets` | `f9a7326f1` — **243 behind** |
| **origin/clean-main-no-secrets** | **`8148dca2f`** — the real trunk |

⭐ This is the exact failure class this project spent a week naming: **a stale referent
producing a confident measurement.** The strategic framing built on it — *delivery chain
failure*, *a sixth stranded version* — does not survive the corrected numbers.

⛔⛔ **Always measure branch position against `origin/`, never a local trunk ref.**

---

## 1. Corrected position — measured against `origin/clean-main-no-secrets`

| Branch | Ahead | Behind | What it uniquely holds |
|---|---|---|---|
| `chore/home-arrival-founder-observation` | **0** | 5 | ✅ **nothing — fully merged** |
| `feature/my-work-field-phase-1` (`78358f979`) | **1** | 4 | the contextual-Home `ClientHome.tsx` commit |
| `feature/now-what-invitation-loop` | **9** | 4 | invitation routes · `MemberInvitations.tsx` · `lib/nowWhat/expression.ts` + tests · `invitationService.ts` · a `ClientHome.tsx` |
| `feature/client-home-executive-copy` | **10** | 6 | a `ClientHome.tsx` — **and nothing else** |

**The design work reached trunk.** What remains unmerged is **9–10 commits on two small
branches**, not a stranded corpus.

### Lineage shape — two lines, not four

```
home-arrival-founder-observation  ⊂  my-work-field-phase-1  ⊂  now-what-invitation-loop
                                                                (merge-base 5e8f8a5bb)
client-home-executive-copy  ── separate line, converges only at 5e8f8a5bb
```

**The entire contested surface is ONE file: `components/now-what/ClientHome.tsx`**, edited
independently on both lines.

---

## 2. 🔴 The real delivery gap — and it is not what we thought

| | |
|---|---|
| Production `95b21ce42` | **is on trunk**, 27 commits behind tip |
| `ClientHome.tsx` prod vs trunk | **byte-identical — empty diff** |

> **The screenshot is not stale. It accurately shows trunk.**

And trunk contains **none** of the S1 experience:

```
welcome back    0 occurrences
continue where  0
maia            0
what is alive   0
```

### ⭐⭐⭐ The corrected diagnosis

⛔ Not: *"the work was built and never delivered."*

> ✅ **The design work landed. The S1 experience was never written — in any branch, at any
> point.** The specs describe an environment that no one has implemented.

That is better news and a different task: **S1 is greenfield work on trunk, not a merge
problem.**

---

## 3. What IS unmerged and worth having

### `feature/now-what-invitation-loop` — 9 commits ⭐ the valuable line

| File | Why it matters |
|---|---|
| `components/now-what/MemberInvitations.tsx` | 🔴 **the invitation surface I measured ABSENT at `78358f979`.** It exists — one branch further along |
| `lib/nowWhat/expression.ts` + tests | 🔴 **the vocabulary/expression seam** — the CF-D5b layer, apparently already begun |
| `app/api/now-what/invitations/route.ts`, `app/api/practitioner/invitations/route.ts` | the two-sided invitation path |
| `lib/practiceField/invitationService.ts` | service layer |

⚠️ Both files need reading against the rulings before merge — **`expression.ts` must implement
read-time resolution, never write-time substitution**, and CF-D5b's language governance layer
is ruled *required and undesigned*, so anything claiming enforcement is out of scope.

### `feature/client-home-executive-copy` — 10 commits, one file

Only `ClientHome.tsx`. Its value is copy, and its cost is a conflict with the invitation
line's version of the same file.

---

## 3A. Capability audit — RUN 2026-08-04

⭐ Terminology, per founder: `invitation-loop` is the **capability base**, ⛔ **not** the
canonical product base, until this audit clears it.

### `components/now-what/MemberInvitations.tsx` — ✅ PASSES all four criteria

| Criterion | Result |
|---|---|
| no consent shortcut | ✅ **accept AND decline** both rendered · reversible after the fact (*"a declined invitation is not a closed door, and an accepted one is not a debt"*) · ⛔ no completion state, *"because none exists"* |
| no account creation | ✅ no register / createAccount path |
| no practitioner ownership of member meaning | ✅ **accepting opens no text field** — an insight written afterward is stored with **no link back to the invitation**. The surface ends at the gesture |
| no hidden telemetry | ✅ none found |

⭐ It already separates **three voices, never collapsed** — system / practitioner (verbatim,
attributed) / member (gesture only). And it is explicitly additive: *"add the bridge; do not
rebuild the house."*

### `lib/nowWhat/expression.ts` — ✅ PASSES, with one real defect

| Criterion | Result |
|---|---|
| render-time resolution only | ✅ enforced and well-reasoned — it even argues **"render", not "read"**, because *read* is ambiguous (db read, API read, memory retrieval) while **render names the exact boundary: where interpretation enters experience** |
| no vocabulary becoming ontology | ✅ **enforced in the type system.** `UNIVERSAL_VERBS` is a closed set and labels are `Partial<Record<UniversalVerb, string>>` — a lens may **rename or omit, never add.** CF-D5a made unrepresentable rather than merely documented |
| no unsigned Larry vocabulary exposure | ✅ `rightsCleared: false` on the leadership lens, and `resolveExpression` **fails safe to universal** — enforced in the function, not left to the caller to remember |

It also implements lens release: `lensAttribution` returns `null` once `relationshipLive` is
false — *"a line that outlives its context has become identity."*

### 🔴 DEFECT E1 — `authoredBy: 'practitioner'` is false, and it leaks through attribution

```ts
const NOW_WHAT: Expression = {
  authoredBy: 'practitioner',        // ⛔ these strings are OURS
  rightsCleared: false,
  labels: { current_work: 'Leadership focus', practice: 'Leadership practice', … },
};
```

*Leadership focus · Leadership practice · Leadership insights · Leadership commitments · Coach
relationship* are **variants of our own synthesis** in `AIN_CLIENT_FIELD_UNIVERSAL_ARCHITECTURE.md`
§3 — not Larry's authored words. The file's own comment says *"nothing here is authored by
engineering on a practitioner's behalf."* **These are.**

**Why it is not cosmetic:** `lensAttribution` gates on `authoredBy === 'practitioner'` and
**does not check `rightsCleared`**. So on a founder walk with `allowUnclearedRights: true`, the
surface renders:

> *"Within your work with Larry"* — over labels Larry never wrote.

That is **unattributed absorption**, produced by the system, in the exact encounter the
practitioner instrument was built to observe.

**Fix before merge — small:**

1. `authoredBy: 'platform_draft'` (or add `provisional: true`) for `NOW_WHAT` until Larry
   authors his own labels.
2. `lensAttribution` must also require `rightsCleared` — fail closed on both axes.

⚠️ **Stale comment, not a defect:** the header says *"CF-D5b … is UNRULED."* CF-D5b **was
ruled 2026-08-03**. The implementation is nonetheless consistent with the ruling (provisional
code table, substrate earned by an **observed** second practitioner). Update the comment; keep
the design.

⚠️ **Known gap, not a violation:** resolution here is a **flat key lookup**, while the ruled
attachment model is a **chain** (member → practice field → program → universal). The chain was
ruled *after* this was written. Not a merge blocker; it is Sprint 2 work.

---

## 4. Recommendation — canonical lineage

> ### ⭐ Capability base (audit CLEARED, with E1 to fix): `feature/now-what-invitation-loop`

**Reason — evidence, not recency:** it is the only line carrying capability the others lack
(invitation surface, expression seam, service layer, tests), it already **contains** both
`my-work-field-phase-1` and `home-arrival-founder-observation`, and it is only 4 behind trunk.

`client-home-executive-copy` is **not** a lineage. It is a **copy patch to one file** and
should be treated as such: cherry-pick or hand-port its copy improvements onto the canonical
`ClientHome.tsx`, then close the branch.

### Reconciliation order

```
1. rebase feature/now-what-invitation-loop onto origin/clean-main-no-secrets   (4 behind)
2. resolve the ONE contested file, ClientHome.tsx, by hand
     ⛔ never --ours / --theirs — epistemic conflict, not file conflict
3. port the executive-copy copy improvements onto it, then close that branch
4. merge my-work-field-phase-1's single commit if not already carried
5. gate: npm run typecheck && npm run preflight
6. → this becomes the S1 foundation
```

⛔ **No giant four-way merge.** That recreates the accumulation problem.

---

## 5. Then, and only then, S1

⛔ **Do not build S1 before step 6.** A beautiful S1 on today's trunk would fork the
`ClientHome.tsx` conflict a third way.

| Slice | Build |
|---|---|
| **S1a** Arrival | Welcome back · Continue · MAIA presence · What is alive. **No backend.** |
| **S1b** Flourishing areas | ⛔ **not** generic *Growth / Purpose / Leadership* — those are generic coaching categories. Domains must come from **Larry's actual framework**, and per the unsigned agreement that content is **not available yet**. Ship structure, not invented domains. |
| **S1c** Continuity | *What you were exploring → what became clearer → what you are practising → what is next.* The member returns to a thread. |
| **S1d** Navigation | six tabs → four. Defined in `components/now-what/NowWhatShell.tsx` (`name: 'Session room'` …). ⚠️ Session room is marked `primary` by an arc ruling of 2026-07-12 — **check that ruling before removing the tab.** |

### Acceptance criteria

| Slice | Done when |
|---|---|
| **S1a** | a first-time visitor understands: this is about my leadership life · this is not a task tracker · this continues something meaningful · I know where to begin |
| **S1b** | a person cannot mistake the page for a CRM |
| **S1c** | the first question is *"what would I like to continue exploring?"* — not *"what button should I click?"* |
| **S1d** | the navigation disappears psychologically |

### CC3 implementation rule — carried from the strategy

⛔ **Never:** `if user = successful executive → show post-achievement mode`. That is
interpretation becoming identity.

✅ **Member declaration** — *"What season are you in?"* · Building · Transitioning · Exploring ·
Renewing · Contributing — **only if the member chooses it.**

✅ **Or practitioner attribution**, disposable by the member:

```
Your coach identified this focus:  Transition
[ Explore ]   [ Not mine ]
```

**The person owns the meaning.**

---

## 6. What the screenshot actually proved

⭐ The architecture work **succeeded** — which is why the mismatch is now legible. Before it,
we would have polished the wrong thing: nicer cards, better colours, a cleaner dashboard.

> **The defect is not aesthetic. The interface has not caught up to the product identity.**

The governance work was never the product. It was the guardrail system that prevents the
product from becoming an AI coach, a leadership scorecard, a practitioner dashboard, or a
predictive identity engine. **S1 is where what survived those constraints becomes visible.**

---

## 7. Not authorized here

- ⛔ No merge before the `ClientHome.tsx` conflict is resolved by hand.
- ⛔ No S1 build before the canonical base exists.
- ⛔ No invented flourishing domains — Larry's framework is gated by the unsigned agreement.
- ⛔ No inferred developmental phase (CC3).
- ⛔ No branch-position claim measured against a local trunk ref (§0).
