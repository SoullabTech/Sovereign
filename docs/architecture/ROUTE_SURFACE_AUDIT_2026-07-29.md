# Route Surface Audit — outside the House — 2026-07-29

**Named tree:** `acb757f87` (canonical `clean-main-no-secrets`)
**Assignment (Kelly, 2026-07-29):** extend the navigation-truthfulness discipline to the
route surface the House does not model. Distinguish five states; do not collapse them.
**Predecessor:** `UNMAPPED_ROUTE_INVENTORY_2026-07-24.md` (#717), whose counts are
*reconciled* here rather than assumed to still hold.

> **Status: evidence artifact. No ruling made. Nothing here authorizes a code change.**
> This document classifies. It does not decide what should be exposed.

---

## The three dimensions, kept orthogonal

| Dimension | Governing question | Established by |
|---|---|---|
| **Existence** | Can the software serve this destination? | `app/**/page.tsx` in the tree |
| **Navigability** | Can a member actually reach it through the current product? | native bundle (`capacitor-patch-routes.sh`) + runtime allowlist (`mobileAllowlist.ts`) |
| **Intentional exposure** | Does the product intentionally invite the member to go there? | **an authored artifact naming the route** — a navigation surface that links it, or an access rule that classifies it |

**The load-bearing discipline.** Existence and navigability are facts recoverable from the
tree. *Intentional exposure is not a routing fact — it is a product decision.* The only
honest static evidence for it is an authored artifact. Where no such artifact exists, the
correct value is **NOT ADJUDICATED**, never an inference from the fact that a route
happens to resolve.

This is why the audit does not rank, recommend, or propose. A route being un-adjudicated
is a statement about *the record*, not about the route.

---

## Reconciliation with #717

| | #717 (`bd47a3264`, 07-24) | This audit (`acb757f87`, 07-29) |
|---|---|---|
| Real static page routes | 417 | **418** |
| Unmapped (no accessMatrix rule) | 77 | **79** |
| Dynamic `[param]` routes (excluded) | not counted | 76 |
| Total page files | — | 494 |

**#717's counts substantially hold.** Five days and ~40 merges later the surface moved by
one route and two unmapped entries. The old numbers were not stale; they are now
*verified* rather than inherited.

---

## What the third axis adds that #717 could not see

#717 had two axes — route exists, accessMatrix rule present — so its 77 unmapped routes
were one undifferentiated pile requiring adjudication. Adding intentional exposure
**splits that pile into two sets that need different work**:

| Set | Count | What it means |
|---|---|---|
| **Linked, but no access rule** | **33** | The product *actively sends members here* — an authored surface links it — and no access rule governs it. Exposure is intentional; governance is absent. |
| **NOT ADJUDICATED** | **46** | Neither ruled nor linked from anywhere. Reachable by URL and by nothing else. |

Same 79 routes. Two different questions. The first set asks *"what governs a door we
already opened?"*; the second asks *"is this a door at all?"*

---

## A third mismatch class, outside the House's coverage

`houseDestinations.ts` exists to stop a route being advertised, allowed in-app, and yet
absent from the native bundle — the silent white screen. Its drift guard covers the 15
House destinations.

**35 routes outside the House are in the runtime mobile allowlist but absent from the
native bundle** (18 not-adjudicated · 17 linked). The WebView would permit navigation;
the bundle has no page to serve. That is the same failure the House contract was built to
prevent, in the region the contract does not reach.

Exactly **one** route outside the House is both allowlisted and bundled: `/open-web` —
the web bridge itself, which the drift guard explicitly requires.

> ⚠️ **This is a static finding, not a runtime one.** It says the bundle lacks the page.
> It does not establish that a member can arrive there — that requires a device walk.

---

## Inventory

Legend — `N` in native bundle · `M` in runtime mobile allowlist · `-` absent.

### Set A — Linked, but no access rule (33)

Exposure intentional; governance absent.

```
-M [member]           /astrology/report
-M [internal/steward] /book-studio/book
-M [internal/steward] /book-studio/ready-to-write
-M [internal/steward] /book-studio/workbench
-- [other]            /choose
-- [other]            /community
-- [other]            /helper-fund
-- [other]            /helper-fund/apply
-- [other]            /helper-fund/contribute
-- [other]            /home
-M [member]           /maia/anchor
-M [member]           /maia/anchor/history
-M [member]           /maia/consciousness-computing/feedback
-M [member]           /maia/field-lab/your-threads
-M [member]           /maia/guide
-M [member]           /maia/keep-capture
-M [member]           /maia/library
-M [member]           /maia/living-field
-M [member]           /maia/moments
-M [member]           /maia/portal
-M [member]           /maia/songwriter
-M [member]           /maia/songwriter/songs
-M [member]           /maia/vision-studio
-- [member]           /now-what/field
-- [member]           /now-what/map
-- [member]           /now-what/next
-- [member]           /now-what/position
-- [member]           /now-what/questions
-- [member]           /now-what/reflections
-- [member]           /now-what/themes
-- [other]            /oracle/reflections
-- [member]           /press/manuscript
-- [other]            /signout
```

**Two clusters worth naming, without ruling on either:**

- **House destinations appear here.** `/maia/anchor`, `/maia/living-field`,
  `/maia/keep-capture`, `/maia/vision-studio`, `/press/manuscript` are governed by
  `houseDestinations.ts` — audience, native policy, conditional visibility — and by **no
  accessMatrix rule**. Two governance systems, one surface, neither aware of the other.
  Whether that is a gap or a deliberate division of labour is a founder question.
- **`/now-what/*` — 7 routes, linked, ungoverned.** This is the surface of the Tier 0
  lane. It is named here as inventory only; the invitation-gate repair (`a859479d1`) and
  the sequencing ruling of 2026-07-29 are **not** reopened by this document.

### Set B — NOT ADJUDICATED (46)

Neither ruled nor linked. By kind: 29 other · 8 dev/harness · 8 member · 1 internal.

```
-- [dev/harness]      /chat-test
-- [member]           /commons
-- [other]            /community/chat
-- [other]            /community/commons
-- [other]            /community/events
-- [other]            /community/faq
-- [other]            /community/reality-check
-- [other]            /community/share
-- [dev/harness]      /debug/auth
-- [dev/harness]      /debug/field
-- [dev/harness]      /demo/biometric
-- [dev/harness]      /demo/disposable-pixels
-- [other]            /diag
-- [dev/harness]      /enhanced-chat-test
-- [other]            /first-witness
-M [other]            /library/videos
-M [member]           /maia/field-lab
-M [member]           /maia/field-lab/legacy-field
-M [member]           /maia/field-lab/project-field
-M [member]           /maia/field-lab/relational-navigation
-M [member]           /maia/orientation
-M [member]           /maia/prototype
-M [member]           /maia/soul-mirror
-M [other]            /model-studio/caseload
-M [other]            /model-studio/comms
-M [other]            /model-studio/groups
-M [other]            /model-studio/marketing
-M [other]            /model-studio/media
-M [other]            /model-studio/services
-M [other]            /model-studio/settings
-M [other]            /model-studio/tasks
-M [other]            /model-studio/vault
-- [other]            /offerings
-- [other]            /open-in-web
NM [other]            /open-web
-- [other]            /pitch
-- [other]            /powered-by
-- [other]            /privacy
-M [other]            /research/self-awareness
-- [other]            /sessions
-- [other]            /simple
-- [other]            /status
-- [internal/steward] /studio-on-mobile
-- [other]            /terms
-- [dev/harness]      /test
-- [dev/harness]      /test-sage
```

**`/privacy` and `/terms` are the cleanest illustration of the discipline.** They are
almost certainly *intentionally public*. Nothing in the tree says so. They sit in Set B
not because they are a problem but because **the record is silent** — and this audit
reports the record, not its own guesses. Adjudicating them is a five-second founder act
that produces a durable artifact; inferring them would produce a plausible fiction.

The `/model-studio/*` cluster (9 routes) and `/maia/field-lab/*` (4) are the largest
un-adjudicated groups. Both are allowlisted-but-unbundled.

---

## Method, and its limits

Enumerated `app/**/page.tsx` at `acb757f87`; stripped route groups `(…)`; excluded 76
dynamic `[param]` routes (they need separate treatment — a dynamic segment's exposure
depends on what the parameter admits). Matched against `config/accessMatrix.ts`
(`exact` 188 · `prefix` 61 · `regex` 3), the Capacitor keep-lists, and
`lib/mobile/mobileAllowlist.ts`. Navigation references collected by scanning
`app/`, `components/`, `lib/` for string literals in `href` / `route` / `push()` /
`replace()` position.

**Four limits, stated plainly:**

1. **Static only.** No route here was graded at runtime. #717's warning stands verbatim:
   *grep establishes inventory; runtime establishes truth.* Nothing in this document
   licenses the sentence "N routes are exposed."
2. **"Linked" is a lower bound.** A literal-scan misses computed hrefs, template
   interpolation, and redirect chains. A route in Set B may be linked by a construction
   this scan cannot see. **Set B is a candidate set, not a finding.**
3. **API routes not covered.** 910 `app/api/**/route.ts` files are a separate and larger
   sweep, still not run. #717 said the same; it remains true.
4. **Access rules are not the only gate.** Middleware, layout-level guards, and
   server-side `requireFounder()` all protect routes without appearing in
   `accessMatrix.ts`. **"No access rule" does not mean "unprotected."** Gates are
   inherited from ancestor layouts — the chain must be walked, not the page.

---

## What this document does not do

- It does not rank routes by risk.
- It does not propose which routes should be exposed, withheld, or removed.
- It does not reopen the House decisions ruled 2026-07-27, or the Now What? sequencing
  ruled 2026-07-29.
- It does not claim any route is unprotected.

Adjudication is a founder act. This is the evidence that makes it possible.
