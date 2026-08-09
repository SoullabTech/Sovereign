# P2 — Ratification Packet **v2**

**Supersedes** `P2_RATIFICATION_PACKET.md` (v1, retired: stale referent — it named constitution
**v0.2** after trunk had advanced to **v0.3**). **P2 has not been performed.** No outcome is
recorded; no prohibition is in force; the Record is untouched.

**Purpose:** Step 1 of four — assemble → **ratify** → record outcome → proceed to P3 only if
ratified.

> ⛔ **This packet contains no verdict.** Claim data only; the ratification block is deliberately
> unsigned. Authored 2026-08-06.

## 0. Referent-currency verification (the check v1 omitted)

Every object below was resolved **against trunk at assembly time**, not against the commit a prior
session happened to read.

- **Trunk:** `origin/clean-main-no-secrets`, tip **`ced4ab513`** at verification.
- Each row states the **commit that last touched that file on trunk**, its **content sha256**, and
  its **byte and line size** — three independent handles, so a mismatch is detectable even if one
  is transcribed wrongly.
- ⚠️ If trunk has advanced past `ced4ab513` when you rule, the constitution row must be re-verified
  before the act. **Integrity alone is insufficient when the canonical referent may have advanced.**

## 1. What P2 ratifies — the exact objects

| # | Document | Commit | Bytes | Lines | sha256 |
|---|---|---|---|---|---|
| **1** | `docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md` — **v0.3**, the constitution | **`dd8917b08`** | 42,805 | 665 | `67f3e0ee248bdefa9a52abd0236989dce7709c81627b8a13a339baaabdbbd381` |
| **2** | `docs/governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md` — v1 | `6a521eb5f` | 21,930 | 378 | `38f96376d817c2542319dc7a90011e4946b17737f96826fea4b126243cf962c4` |

Status of each: **CANDIDATE.** Constitution §9: *"Is not canon. It is a candidate product
definition awaiting founder ratification."* Schema header: *"SCHEMA / DESIGN — NOT IMPLEMENTED…
This document authorizes nothing to run."*

**Row 2 is unchanged from v1** — the schema you already read carries this exact hash. **Row 1 is
the correction**: the object is now v0.3, which is what trunk carries and what your prior rulings
are already written into.

### What v0.3 adds over the v0.2 you were shown

Ruled **not** to be split from the act — it extends the same authority model rather than forming a
second referent:

- **§13 Source custody (founder ruling, 2026-08-05)** — *AIN persists the RELATIONSHIP to a source,
  never the source itself.* Four custody states defaulting to **external reference**; custody named
  as a **third independent dimension** (custody ⊥ authority ⊥ expression), explicitly not a
  redesign of the authority schema; §13.2 claim discipline — the promise is *"does not persist,"*
  never *"never touches,"* with the **Anthropic API transit caveat** named; §13.3 Obsidian
  `/AIN Approved` folder as the crossing surface, sketch only; §13.4 the Harvard guard restated.
- **A sixth ⛔ line in §9** (see §3 below).

## 2. What ratification changes

One act covering the authority model **and** the three Tier 2 prohibitions, which acquire force
through it:

| Prohibition | Source section (v0.3) | Verified verbatim |
|---|---|---|
| **N7** — cross-practitioner aggregation; anonymization is not a permission | §12.4 | yes — *"that grant does not exist and cannot be manufactured by aggregation"*; class laundering structurally impossible |
| **N8** — consensus/popularity may not harden into canon | §12.10 | yes — *"the commons hardens into a canon"* |
| **N11** — no MAIA readiness nudges | §5 (promotion rule, binding) | yes — MAIA *"may show… may not tell them it is ready"* |

Accepting these three and ratifying the model are the **same act**. **Tier 1 — N5, N9, N10, N16 —
is already binding on prior rulings and is unaffected.**

## 3. What ratification does NOT do — v0.3 §9, complete

- ⛔ does not authorize any migration, schema change, or code;
- ⛔ does not authorize ingesting any Larry material (agreement unsigned; Attachment A empty);
- ⛔ does not re-open `corpusIsComposable()`;
- ⛔ does not rule on the Language Field (§6.6) or on client-derived input (§6.3);
- ⛔ does not authorize any Commons contribution surface, scope axis, or cross-practitioner
  composition path (§12) — *"the upward arrow is described, not opened"*;
- ⛔ **does not authorize any custody connector, bridge, or excerpt-promotion surface (§13). The
  custody model is design only.** ← *absent from the v1 packet; the §13 counterpart*
- ⛔ does not resolve the five-domain language in `about_practice` — only Larry can answer it;
- ⛔ is not canon absent this act.

Also outside P2: general **Field Object versioning**, structural containment of the slug
composition path, **P7's IA location**, responsibility for **Captured → Understood**.

## 4. Custody repair — MATERIALLY CHANGED, re-rule before executing

⚠️ **The custody ruling as written is no longer an accurate description of the world.** All five
governing documents are **already present on trunk**, verified this session:

| Document | Trunk commit | sha256 |
|---|---|---|
| Constitution v0.3 | `dd8917b08` | `67f3e0ee…` |
| Authority schema | `6a521eb5f` | `38f96376…` |
| Capture protocol v1 | `e028a6334` | `b96b22e9…` |
| Larry IP audit | `2d8a0a23e` | `fa9354ae…` |
| Attachment A instrument | `2d8a0a23e` | `771c35f0…` |

The observed absence was **this working branch (`feature/labtools-redesign`) predating them** — a
stale-checkout condition, ⛔ not a trunk gap.

⭐⭐⭐ **The constitutional consequence, stated precisely (founder, 2026-08-06):**

> **The factual condition that justified the original custody-repair sequence no longer exists. Any
> subsequent custody action requires a fresh ruling against the current repository state.**

⛔ This is **not** "the repository changed, so skip the step." The earlier ruling stands intact and
is not overturned — its **triggering predicate has disappeared**. The rationale it rested on (*a
constitutional control whose governing reasoning is absent from the working tree is not adequately
recoverable*) still names a real hazard; the remedy for that hazard is branch currency, not
restoration. ⛔ Do not execute the repair as specified; ⛔ do not treat this note as a new custody
ruling.

## 5. Ratification block — for the founder

**Act:** ratify the practitioner authority model — the two documents at the commits, sizes, and
hashes in §1, the constitution being **v0.3 at `dd8917b08`** — **including** N7, N8, N11 per §2,
within the boundaries of §3.

**Recommended accompanying sentence for the Record** (founder's own, from the v1 review):
*This ratification applies only to the authority model expressly identified by this packet. Other
candidate material contained in the same source documents remains candidate unless explicitly named
by this act.*

Ratified by: ______________________  Date: ____________

⛔ A refusal or an amendment is an outcome to record, not a failure to re-run.
