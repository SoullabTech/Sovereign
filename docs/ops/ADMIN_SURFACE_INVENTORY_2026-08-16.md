# Admin surface inventory — discovery for JOP-05 / JOP-08

**Date:** 2026-08-16 · **Mode:** read-only · **Status:** `DISCOVERED` — authorizes nothing.
**Amended:** 2026-08-16 (founder refinement) — see §0.
**Purpose:** answer *"could more of our admin monitoring be added to JARVIS?"* from custody rather
than impression. Serves PHASE 8's rule: **prove what each surface owns before consolidating.**

⛔ This is not a consolidation plan. No surface is proposed for deletion, merge, or migration.

---

## 0. AMENDMENT — a corrected claim, preserved rather than erased

**Superseded (first draft of this document):**

> *"14 routes are read-only, therefore they need no auth hardening to aggregate."*

**Corrected:**

> **14 routes require no new MUTATION authority to aggregate.**

⭐ Those are not the same sentence. Read-only clears *authority to change things*. It says **nothing
whatever** about *authority to see things*. A `GET` can still disclose member identity, session and
credential metadata, infrastructure topology, provider telemetry, internal incidents, or secrets.

The screening pass in §2.3 shows the original claim was not merely imprecise but **materially wrong**
for at least three of the fourteen.

## 1. Size of the surface

| | Count |
|---|---:|
| `app/admin/**` pages | **19** |
| `app/api/admin/**` routes | **37** |
| Monitoring-shaped routes outside `/admin` | ~30 (`health`, `ain/telemetry`, `field/status`, `consciousness/health`, `maia/realtime-status`, `build/status`, connector `*/status`, …) |

## 2. Classification — TWO independent axes

```
AXIS 1 — EFFECT              AXIS 2 — DISCLOSURE
  OBSERVE                      PUBLIC
  MUTATE                       OPERATIONAL
                               ADMIN-SENSITIVE
                               MEMBER-SENSITIVE
                               SECRET-BEARING
```

A surface's admissibility into any JARVIS field is the **pair**, never the effect alone.

### 2.1 EFFECT = OBSERVE (14)

```
council/telemetry              maia/engine-comparisons        maia/substrate
members                        monitor/bugs                   monitor/bugs/[id]/attachments/[attachmentId]
monitoring                     monitoring/system              opus-pulse/facet-heatmap
opus-pulse/turns               partners/prelude/[id]          research/overview
security                       voice-lab/health
```

### 2.2 EFFECT = MUTATE — **`mutation_capable_upper_bound = 23`**

```
activity-feed              agent-monitor              auth
command-center/actions     command-center/conversations  command-center/field-engines
command-center/members     command-center/overview    command-center/system
library/videos             library/videos/[id]        maia/engine-comparisons/[id]
members/admin-role         monitor/bugs/[id]          monitoring/run-checks
opus-pulse/summary         research/directives        reset-member-password
security/alerts            security/sessions          settings
voice-lab/evaluations      voice-lab/synthesize
```

⛔ **Recorded as an upper bound, not a count.** Derived from exported HTTP methods. `POST /query`
can be read-only; a badly-designed `GET` can have effects. The `command-center/*` cluster is the
obvious suspect — five routes carrying `GET,POST` where POST may be a filtered query.

The proper classifier is **behaviour**, and it has not been run: *writes DB? · changes external
system? · sends communication? · creates/deletes resource? · changes session? · changes config? ·
invokes command? · causes deployment?*

### 2.3 DISCLOSURE — ⚠️ SCREENING SIGNAL ONLY, **NOT** A CLASSIFICATION

Lexical field-name counts per route source. Ranks routes for the real trace; classifies nothing.

| Route (all EFFECT=OBSERVE) | member | session/cred | infra | content |
|---|---:|---:|---:|---:|
| **`security`** | 4 | **35** | 19 | 3 |
| **`members`** | 4 | 6 | 5 | 0 |
| `opus-pulse/turns` | 2 | 3 | 10 | 0 |
| **`council/telemetry`** | 3 | 3 | 5 | 2 |
| `monitor/bugs` | 0 | 6 | 8 | 0 |
| `maia/substrate` | 0 | 3 | 7 | 1 |
| `maia/engine-comparisons` | 0 | 3 | 5 | 2 |
| `voice-lab/health` | 0 | 3 | 8 | 1 |
| `research/overview` | 0 | 3 | 5 | 0 |
| `opus-pulse/facet-heatmap` | 0 | 1 | 10 | 0 |
| `partners/prelude/[id]` | 0 | 0 | 7 | 0 |
| `monitoring/system` | 0 | 0 | **18** | 0 |
| `monitoring` | 0 | 0 | 4 | 0 |

⛔ **A keyword count in a source file is not proof of what the response body returns.** Those 35 hits
in `security` may be checks, variable names, or comments rather than disclosed fields. This is
exactly the instrument family that has produced five over-reaches in this programme; it is bounded
at the point of measurement instead.

**What it does establish:** the OBSERVE set is **not homogeneous**. `monitoring` and
`monitoring/system` show zero member and zero credential signal; `security` and `members` are dense
in both. Treating all fourteen as one admissibility class is unsafe.

**Provisional ordering for JOP-05A adoption** — lowest disclosure risk first, each still pending a
real response-shape trace: `monitoring` → `monitoring/system` → `partners/prelude/[id]` →
`opus-pulse/facet-heatmap` → `maia/substrate` → … with **`security` and `members` last**.

## 3. Ownership trace — required BEFORE any surface is called a duplicate

`monitor` · `monitoring` · `ops` · `command-center/system` · `platform-overview` all *sound* like
"system health." Names do not establish duplicate ownership. They may own different layers —
product incidents vs service uptime vs deployment operations vs control-plane execution vs
architectural topology. **Merging them because they look untidy would destroy distinctions the
Living Spiral will need**, where these become different *kinds of assertion about the same
entities*, not four collapsed dashboards.

Per surface, JOP-05 must establish:

```
QUESTION IT ANSWERS · DATA SOURCE · AUTHORITATIVE OWNER · FRESHNESS
MUTATION? · SENSITIVE DATA? · CALLERS · UNIQUE INFORMATION · OVERLAP
```

## 4. Auth surface

| Idiom | Occurrences |
|---|---:|
| `isAdmin` | 62 |
| `requireAdmin` | 22 |
| `admin_role` | 19 |
| `checkAdmin` | 17 |
| `ADMIN_PASSWORD` | 16 |
| `adminAuth` | 8 |
| `x-admin-*` header | 6 |

```
AUTH IMPLEMENTATION DIVERSITY ......... ESTABLISHED
NUMBER OF DISTINCT AUTHORITY MODELS ... NOT YET ESTABLISHED
```

⛔ Seven spellings are not seven authorities. Several are likely wrappers over one secret or role
rule. JOP-09 must trace each to its root — `route → helper → credential/session source → identity
resolution → authorization predicate` — and may find two real models, or seven. Recording the
distinction prevents another premature consolidation.

## 5. What this does and does not license

- ⭐ Supports **JOP-05A — Operator Observation Fabric**: one read-only adapter layer consuming the
  existing owners, never replacing them, and never creating a second telemetry store merely so
  JARVIS can display a common shape. Every observation retains: *source owner · endpoint ·
  observation time · source freshness · classification · raw status · normalized JARVIS meaning.*
- ⛔ Does **not** authorize consolidating, deleting, or migrating any `/admin` surface.
- ⛔ Does **not** establish the true mutation count (§2.2) or any disclosure class (§2.3).
- ⛔ Does **not** establish that any two surfaces are duplicates (§3).
