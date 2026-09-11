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

⚠️ **CORRECTED 2026-09-11 (founder): the delivery contract is TWO layers, and the
auth system is only owed the first.** Asking an auth framework for recipient-delivery
truth would select Soullab's identity architecture on which project happens to
contain the fanciest SMTP subsystem.

```
AUTH  →  REQUEST STATE          MAIL  →  DELIVERY LEDGER
        created                         accepted by transport
        queued                          delivered
        submission attempted            temporary failure
        accepted | rejected             permanent bounce · complaint
                                        expired · unknown
```

**MEMBER-ACCESS-01 demands a good delivery SEAM and the request layer** — enough
that the system can never say *"we sent it"* when no message exists. **MAIL-xx owns
deliverability truth.** A candidate is tested on the seam, never on its SMTP stack.

⚠️ And one precision that survives into both layers: **"sent" means the transport
accepted the handoff. It does not prove a mailbox received anything.** An SMTP server
accepting a message and a member seeing it are different events, and collapsing them
is FR-B in miniature.

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
via `apiFetch()` (CLAUDE.md trap).

⚠️ **CORRECTED 2026-09-11 (founder).** The test was written as *"eliminates any
candidate that assumes browser cookies"*, which is too blunt — it would wrongly
eliminate systems whose **browser** flow uses cookies while their **API** flow issues
a bearer token. The test is **native-session competence**, not cookie abstinence:

> **Eliminated: any candidate that cannot provide a first-class native/API session
> path independent of browser-cookie semantics.**

The preferred Stage 4 shape follows from this, and it is strictly better than
carrying `x-member-id` forever as a parallel notion of identity:

```
WEB     secure cookie  ─┐
                        ├─▶  SAME SESSION AUTHORITY  ─▶  SAME MEMBER
NATIVE  session token  ─┘
```

`x-member-id` is a **parallel identity concept**, and under the governing criterion
(*fewer concepts*) retiring it is part of the product value.

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

## 5 · The other four, read at source — **NOT SCORED** (founder: finish reading first)

Answers only. No ranking, no recommendation.

### Ory Kratos — `SOURCE-READ`

| test | finding |
|---|---|
| **Identity** | ✅ Structural. **13 credential types** hang off the identity: `password · oidc · totp · lookup_secret · webauthn · code · passkey · profile · saml · deviceauthn · identifier_first · link_recovery · code_recovery` (`identity/credentials.go:91-149`) |
| **Credential truth** | ✅ Credentials are **records**. No capability flag observed — F4's state is unrepresentable |
| **Session authority** | ✅ One `Session` model carrying **AMR** — *"a list of authentication methods used to issue this session"* — plus AAL (`session/session.go:77-153`) |
| **Native** | ✅ `Session.Token` is a bearer token distinct from the cookie (`session.go:151`) — **passes the corrected D5** |
| **Recovery** | `code` strategy spans **login · recovery · registration · verification** in one mechanism (`selfservice/strategy/code/`) |
| **Doorway** | ⭐ **`idfirst` is a first-class, configurable login strategy** (`selfservice/strategy/idfirst/`, `SelfServiceLoginFlowIdentifierFirstEnabled`). *Identity first, authentication method second* is not a pattern to build — it is a supported flow |
| **Mail seam** | ✅ `courier` has **both `smtp_channel.go` and `http_channel.go`** — Soullab can own delivery over HTTP **without forking the core** |
| **Failure truth** | ⚠️ Four states: `Queued · Processing · Sent · Abandoned` (`courier/message.go:26-29`). **Layer 1 only** — exactly as predicted. "Sent" = handed to transport |
| **Observability** | Durable courier records with retry counts; session AMR is itself an auth-event record |
| **Operational weight** | A separate Go service |

### SuperTokens — `SOURCE-READ`

| test | finding |
|---|---|
| **Identity** | ✅ Shared `authRecipe` layer beneath per-method recipes: `emailpassword · passwordless · webauthn · mfa · oauth · saml` |
| **Credential truth** | ⭐ **`webauthn` IS in core** (`io/supertokens/webauthn`, plus its own web API) — an earlier doubt in this pass was wrong |
| **Session authority** | One session model, **access + refresh token** (`io/supertokens/session/`) |
| **Native** | ✅ Token-based by construction — **passes corrected D5** without a cookie/native split |
| **Mail seam** | ⭐ **No SMTP in core at all.** Delivery is entirely the application's — the cleanest seam of the four |
| **Failure truth** | Seam only; no ledger. Layer 1 by the application's own implementation |
| **Observability** | `auditlog` is a core module |
| **Migration** | ⭐ **`bulkimport` exists as a core concern** — the only candidate where import is a named subsystem |
| **Operational weight** | Core service (Java) + backend SDK + frontend SDK — three moving parts |

### ZITADEL — `SOURCE-READ`

| test | finding |
|---|---|
| **Identity / credential truth** | Passkeys and WebAuthn are first-class domain objects (`internal/domain/human_web_auth_n.go`, `user_v2_passkey.go`) |
| **Observability** | ⭐ **Event-sourced core** (`internal/eventstore/` — aggregates, events); notification is built on **projections**. The strongest observability substrate of the four, and directly answers FR-D |
| **Mail seam** | `internal/notification/` with `channels · senders · handlers · messages` |
| **Failure truth** | Not established in this pass — `NOT READ` at the state-machine level |
| **Operational weight** | Full identity platform; heaviest of the self-hostable Go options |

### Keycloak — `SOURCE-READ` (partial) + `FOUNDER-CITED`

| test | finding |
|---|---|
| **Identity / credential truth** | ✅ Credentials are separate records behind an SPI: `CredentialModel · CredentialProvider · CredentialInputValidator · UserCredentialStore` |
| **Native** | OIDC bearer tokens — passes corrected D5 |
| **Failure truth** | ⚠️ `DefaultEmailSenderProvider` calls `transport.sendMessage()` and returns success or throws `EmailException` (`FOUNDER-CITED`). **SMTP submission truth only** — no recipient-delivery state machine |
| **Operational weight** | JVM; heaviest of all candidates |

### What the four reads establish jointly

1. ⭐ **The founder's identity ≠ authenticator hypothesis is not novel — it is the
   consensus.** All four model credentials as records against a durable identity.
   **Soullab's `has_webauthn` flag is the anomaly, not the design.**
2. ⭐ **No candidate provides layer-2 delivery truth**, and the best of them (Kratos)
   stops precisely at "handed to transport." This **confirms the charter §12
   split** rather than exposing a gap: deliverability belongs to MAIA's mail lane.
3. **Native-session competence is universal** once D5 is stated correctly. It
   eliminates nobody — which is why the correction mattered.
4. **Kratos answers the doorway question directly** with `idfirst`.

## 6 · 🔴 MIGRATION IS AN ACCEPTANCE CONDITION, NOT A PHASE

**Founder ruling 2026-09-11**, and it changes what the candidates are tested for:

> **No architecture wins if its migration experience is worse than the system it
> replaces.** That may eliminate otherwise elegant solutions.

> **Migrate the system around the member, not the member around the system.**

Both populations must improve **simultaneously**:

```
EXISTING   "I came back and it just worked."
NEW        "I joined and never had to understand the authentication system."
```

The dangerous outcome is a cleaner architecture bought with current members' pain.

### 6.1 · Existing-member invariants (binding)

- No mass password reset · No forced new account creation
- **No duplicate identities because someone used a different sign-in method**
- No loss of profile, history, memory, programme state or permissions
- Existing password members still enter by password **during** migration
- Existing OTP members still enter by email code
- Retained Apple/Google members are not locked out mid-transition
- **A stronger authenticator is offered once safely inside — never a migration
  ceremony at the front door.** Passkey enrollment reads as *"make returning easier
  with Face ID"*, never *"your account has changed; fix it now"*
- **Recovery must work before any old path is retired**

### 6.2 · Progressive migration, not a cutover

```
1  new architecture alongside a compatibility layer
2  existing member signs in with whatever already works
3  once safely authenticated, link/migrate that credential to the durable identity
4  offer the preferred future authenticator
5  verify recovery works
6  retire a legacy path only when nobody depends on it
```

> **Compatibility is temporary; identity continuity is permanent.** Legacy plumbing
> behind the scenes is tolerable. A member *experiencing* that plumbing is not.

### 6.3 · Migration acceptance suite — every population, before anything goes live

```
returning password member · returning email-code member · Apple member
Google member · existing passkey member · broken has_webauthn member (the eight)
partially onboarded member · member returning after 6 months · member on a new phone
member who lost the old device · new member joining for the first time
```

Each must end at **the same person, the same account, the same history, safely
inside.** And **half-failed migration must be tested explicitly** — the answer may
not be *"Kelly fixes the database."* That is the rescue-cost metric from Stage 1
appearing as a design requirement.

### 6.4 · New members inherit none of it

```
INVITATION / JOIN → identify yourself → verify once → ONE Soullab identity
   → onboarding → offer easiest strong return method → inside
```

They should never learn that Soullab had ten creation paths and seventeen session
minters.

## 7 · Standing

```
STAGE 2   SOURCE READING COMPLETE · NOT SCORED
  READ AT SOURCE     Better Auth · Ory Kratos · SuperTokens · ZITADEL · Keycloak
  BLOCKED            web.dev · pages.nist.gov (network egress; founder citations stand)
  NOT ESTABLISHED    ZITADEL notification state machine
                     what mature systems do for passkey-only recovery on a new device
  UNRESOLVED         D1 — the recovery node. Stage 4 decides; Stage 2 must not.

NEXT   stop Stage 2 · compare architectures (Stage 3 distinctions, then Stage 4)

DO NOT (founder, honoured): choose vendor · rewrite auth · activate email-first
                            migrate members · delete social auth · change WebAuthn state
                            score candidates before comparison
```

### The comparison criteria, as they now stand

Eleven tests (§5) plus three criteria that can each eliminate on their own:

1. **Fewer concepts** — judged on **retirement power**: which of the 10 creators,
   17 session minters, 39 auth modules and `x-member-id` actually disappear.
2. **Migration experience** — §6. No architecture wins if migration is worse than
   what it replaces.
3. **Sovereignty** — no identity provider in the path; the D1 recovery decision.
