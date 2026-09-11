# MEMBER-ACCESS-01 · STAGE 2 — EXTERNAL RESEARCH

**Opened** 2026-09-11 by founder act, with Stage 1 marked *complete enough to
proceed*; the six historical questions remain `UNKNOWN` and are not blocking.

**Research question (founder):**
> What architecture gives Soullab **one coherent member identity, one
> understandable doorway, phishing-resistant effortless return, truthful failure
> states, sovereign operation, and recovery that does not depend on Kelly?**

**Governing criterion (founder):**
> The winning architecture is not the one with the most authentication features. It
> is the one that lets Soullab have **fewer authentication concepts.**

---

## 0 · Method, and the limits of this pass

**Evidence classes, kept separate:**

| class | meaning | strength |
|---|---|---|
| `SOURCE-READ` | read in the project's own source, cloned | strong |
| `SEARCH-SUMMARY` | from search result summaries, primary page not retrieved | weaker |
| `FOUNDER-CITED` | citation supplied by the founder's own scan | as given |
| `NOT READ` | named but not examined | no weight |

⚠️ **Egress is restricted in this environment.** `web.dev` and `pages.nist.gov` are
blocked by the network proxy, so the NIST and web.dev claims below rest on the
founder's citations and on search summaries — **not** on primary text read here.
Git clone works, so **OSS source is readable**, which is the evidence class this
stage most needed.

⚠️ **Only Better Auth has been read at source.** Ory Kratos, ZITADEL, SuperTokens
and Keycloak are `NOT READ` in this pass. **No comparison table is offered for
them**, because a comparison built from marketing pages is exactly the feature-count
reasoning the governing criterion forbids. Reading them is the remaining Stage 2
work.

---

## 1 · The doorway: what conditional mediation actually requires — `SEARCH-SUMMARY`

The one-field door is real but has **hard preconditions**, and they matter because
each is a place FR-A can return.

Conditional UI requires **three things together**: a **discoverable (resident)
credential**, an input with `autocomplete="username webauthn"`, and a `get()` call
with `mediation: 'conditional'`.

Constraints that bear on Soullab:

- **Non-discoverable credentials cannot autofill at all.** Authenticators do not
  store user data for non-resident keys, so those members can never appear in the
  autofill list.
- **`isConditionalMediationAvailable()` must be called first**, or unsupported
  browsers surface user-visible errors — i.e. failing to feature-detect produces an
  FR-A failure at the door itself.
- **A modal path must always remain**, for security keys and non-discoverable
  authenticators. The guidance is explicit that autofill never fully replaces it.

> **Consequence for the hypothesis:** conditional mediation **reduces** the choice
> the member faces; it does not eliminate the fallback surface. "One field" is
> achievable for the common case, not universally. The door must therefore degrade
> **silently and honestly** — showing a plain email field when no passkey is
> offerable, and never claiming a passkey was offered when it was not.

`SOURCE-READ`: Better Auth supports this — `packages/passkey/src/client.ts:48,80`
exposes `autoFill?: boolean` → `useBrowserAutofill`.

## 2 · Identity ≠ authenticator, read in source — `SOURCE-READ`

The founder's hypothesised separation is **exactly how Better Auth is modelled**.
Core tables are `user` · `account` · `session`, with `account` holding the
authenticator and `user` holding the durable identity; passkeys are a **separate
table in a separate package** (`packages/passkey`), added without altering who the
member is.

This is the structural answer to **FR-C** and to **F4**: a member's capability is a
question about the credential substrate, never a boolean on the member row.

### 2.1 · 🔴 And the same defect class lives in the leading candidate

`packages/better-auth/src/db/schema.ts`, in their own words:

> `FIXME: Plugin-contributed fields are input-by-default, so a plugin-owned
> authority field is writable through generic input routes (e.g. /update-session)
> unless it sets input: false.`

**That is the same shape as Soullab's `/api/members/progress`** — an authority field
about a member, writable through a generic route. Found by reading source; it
appears in no feature comparison.

> **Adopting a mature framework does not immunise Soullab against FR-A. It
> relocates it.** This is the single most important finding of the pass.

### 2.2 · Enumeration protection is built in — `SOURCE-READ`

`buildSyntheticUserOutput` exists specifically so *"synthetic and real user
responses [are] indistinguishable."* Soullab's non-enumeration constraint is a
first-class concern there, not an add-on.

## 3 · Mail sits behind the boundary the charter drew — `SOURCE-READ`

Better Auth **never talks to a mail vendor.** `emailVerification.sendVerificationEmail`
is a callback the application supplies; absent it, the flow errors rather than
pretending. This is charter §12's contract already implemented by a candidate —
authentication asks for delivery and the application owns transport.

⚠️ **But the contract is thinner than §12 requires.** What was read is
`accepted | rejected` at call time. §12 also demands
`queued | delivered | bounced | failed` **after** the call. Whether any candidate
models post-acceptance delivery state is **UNANSWERED** — and it is precisely the
gap that produced **FR-B**. Carry to Stage 3 as a distinction question, not a
feature request.

## 4 · Attempting to DISPROVE the provisional hypothesis

Per instruction, the hypothesis (`MEMBER → passkey | recovery | legacy → one session
authority → one lifecycle state`) was attacked rather than confirmed.

### D1 · 🔴 The hard acceptance test defeats device-bound passkeys — **NOT RESOLVED**

The lane's own acceptance test: *enter, leave, **return six months later on a new
device**, recover if necessary, without Kelly.*

A **device-bound** passkey is on the previous phone. The new device therefore
authenticates by **recovery**, which means email — so **email is back in the
critical path for exactly the scenario the test is built around**, and with it FR-B.
The three exits each cost something real:

| exit | cost |
|---|---|
| **synced passkeys** | recoverability rented from Apple/Google; vendor holds the sync channel and its recovery path. NIST recognises syncable authenticators to **AAL2** with a deliberate tradeoff (`FOUNDER-CITED`) |
| **email recovery** | FR-B returns at the recovery boundary — the least-exercised, worst-instrumented path |
| **recovery codes** | sovereign and phishing-resistant, but a secret the member must keep for six months — cognitive burden, and it violates *never ask for a credential the member never established* unless established at enrollment |

**The hypothesis diagram writes `sovereign email?` with a question mark, and the
question mark is load-bearing.** This is the lane's central unresolved decision, and
it is a **sovereignty** decision, not a UX one.

### D2 · The door still has a fallback surface — **SURVIVES, WEAKENED**
Per §1. The claim "one obvious action at a time" holds; "one field, always" does not.

### D3 · 🔴 Adoption does not reduce concept count — **SURVIVES ONLY WITH A RETIREMENT PLAN**

Soullab has **10 account-creation paths**. Introducing any framework initially
creates an **11th**. Concept count falls only when the other ten are **retired**, and
retirement is Stage 7. **The candidate must therefore be judged on migration and
retirement cost, not on adoption cost** — under the governing criterion, a framework
adopted beside the existing ten makes Soullab strictly worse.

### D4 · Extraction relocates the sovereignty question — **OPEN**

Kratos-style extraction is the right shape for FR-C, and it is self-hosted, so no
third party enters. But it is **another service on a stack already running seven
containers**, and Soullab's `members` table is entangled with spiral state,
onboarding, tiers and roles. **Extracting identity means splitting that table** —
the dominant term in migration cost. `NOT READ`; Stage 2 remainder.

### D5 · "One session authority" meets Capacitor — **CONSTRAINT, NOT REFUTATION**

`SameSite=Lax` cookies are not sent from the iOS WebView; Soullab uses `x-member-id`
via `apiFetch()` (CLAUDE.md trap). **Any candidate must support header-based session
carriage on native**, or iOS members lose the door. This is a named filter for
Stage 4, and it eliminates any candidate that assumes browser cookies.

### D6 · The eight cannot be migrated by a flag — **REINFORCES the hypothesis**

F4's eight accounts hold `has_webauthn = true` with no credential, attributable to
no writer in the current tree. Under a derived model the state is **unrepresentable**
— capability is a query against the substrate. This is the hypothesis's strongest
confirmation, and it arrives from Soullab's own failure record rather than from
research.

### Verdict

> **The hypothesis is NOT refuted. It is UNDER-SPECIFIED AT EXACTLY ONE NODE —
> RECOVERY — and that node is where the lane's own acceptance test lands.**

D3 and D5 are binding constraints on any candidate. D1 is the decision Stage 4 must
actually make.

## 5 · Standing

```
STAGE 2   OPEN · PARTIAL
  READ AT SOURCE     Better Auth
  NOT READ           Ory Kratos · ZITADEL · SuperTokens · Keycloak
  BLOCKED            web.dev · pages.nist.gov (network egress)
  UNANSWERED         post-acceptance delivery state in any candidate
                     what mature systems do for passkey-only recovery

DO NOT (founder, honoured): choose vendor · rewrite auth · activate email-first
                            migrate members · delete social auth · change WebAuthn state
```
