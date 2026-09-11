# MEMBER-ACCESS-01 · STAGE 0 — CURRENT TRUTH

**Read-only census. No repairs.** Present in the codebase at `ad81bfea`.
⚠️ **Presence in code is not liveness.** Nothing here asserts a path is reachable,
used, or wired in production. Liveness is Stage 1 work.

---

## 1 · The headline

| | count |
|---|---|
| paths that `INSERT INTO members` — ways to **become** a member | **10** |
| paths that call `createSession()` — ways to **get a session** | **17** |
| modules in `lib/auth/` | **39** |
| routes under `app/api/members/` | **40** |
| routes under `app/api/auth/` | **41** |

> **Ten front doors, seventeen ways in, thirty-nine libraries deciding who you are.**

The member experiences one door. That gap is the lane.

## 2 · The ten ways to become a member

```
app/api/members/register                      passkey + password
app/api/members/register-email                email code / magic link → generated password
app/api/members/register-local                username + password, local
app/api/members/enter                         (entry path — semantics unread)
app/api/now-what/register                     Now What? instance
app/api/team/invite/[token]/register          team invitation
app/api/auth/signin/google/callback           ⚠️ third-party IdP (web)
app/api/auth/google/native-callback           ⚠️ third-party IdP (native)
app/api/auth/signin/apple/callback            ⚠️ third-party IdP (web)
app/api/auth/apple/native-callback            ⚠️ third-party IdP (native)
```

Each writes a member row with its own defaults. `register-email` sets
`onboarding_step='faq'`; `register-local` sets `onboarded: true`; others unread.
**Account semantics differ by which door you came through** — a member's state
depends on their entry path, which no member knows or chose.

## 3 · The seventeen ways to get a session

```
password            members/signin
email code          members/email-code/verify
magic link          members/magic-link
webauthn/passkey    auth/webauthn/authenticate/verify
native biometry     auth/native-biometry/verify
dev login           auth/dev-login                      ⚠️ verify production gating
google              auth/signin/google/callback · auth/google/native-callback
apple               auth/signin/apple/callback · auth/apple/native-callback
at registration     members/register · register-email · register-local
                    now-what/register · team/invite/[token]/register
now-what signin     now-what/signin
entry               members/enter
```

## 4 · 🔴 SOVEREIGNTY FINDING — third-party identity providers are in the account path

Four of the ten account-creation paths are **Google or Apple OIDC**. CLAUDE.md's
infrastructure doctrine states the architecture exists so that *"no third party sits
between users and their data"* and names no-managed-hosting, no-managed-database,
no-CDN-MITM as the expression of that. **An identity provider sits in exactly that
position and is not currently named by the doctrine.**

This is a **finding, not a ruling.** Whether Soullab retains social sign-in is a
Stage 6 decision. Recorded now because it is the largest gap between stated
architecture and present code that this census found.

### 4.1 · The distinction that matters, and is easy to collapse

Founder input 2026-09-11 — *biometric identity is wanted; Google and third-party
surveillance exposure is not.* These are **not in tension**, but only if three
different things stop being called "Face ID sign-in":

| | what leaves the device | third party in the path | sovereignty |
|---|---|---|---|
| **WebAuthn, device-bound** (Face ID / Touch ID unlocking a key in the Secure Enclave) | a **public key**. The biometric never leaves the device and Soullab never receives it | **none** | ✅ fully compatible |
| **Synced passkey** (iCloud Keychain / Google Password Manager) | public key to Soullab; the **private key syncs through the vendor's account** (E2E-encrypted; vendor holds the sync channel and its recovery path) | vendor holds **backup + recovery**, not authentication | ⚠️ real tradeoff — recoverability bought from a vendor |
| **Sign in with Apple / Google** (OIDC) | the **identity assertion itself** — the IdP decides who you are and can revoke it | **IdP is the authority** | ❌ contradicts the doctrine |

**Face ID as a WebAuthn authenticator is not Apple sign-in.** Soullab stores a
public key; the biometric template never leaves the enclave, and Apple learns
nothing about the login. Conflating the two would either discard the best available
authenticator or admit an IdP by the back door.

Device-bound vs synced is a **genuine open question** for Stage 4: device-bound is
maximally sovereign and maximally losable (lost phone = lost credential, so recovery
must be excellent); synced is recoverable but rents that recoverability from Apple
or Google.

### 4.2 · What the device-compromise concern can and cannot buy

Stated concern: commercial spyware targeting phones. Handled honestly —

- WebAuthn's phishing resistance defends against **remote credential theft**:
  the credential is bound to `soullab.life` and cannot be replayed elsewhere. This
  is the property NIST SP 800-63B and OWASP single out; passwords and
  manually-entered OTPs have it and neither does.
- It does **not** defend a fully compromised device. Nothing at the auth layer does.
  Claiming otherwise would be the inflation drift this project already names.
- What Soullab **can** control is the number of third parties in the auth path, and
  that lever serves the concern regardless of which actor one worries about:
  no IdP, no third-party SDK in the auth surface, no analytics on the door,
  self-hosted verification. This is an argument for **minimising parties**, which is
  checkable, rather than for assessing vendors, which is not.

## 5 · Other Stage 0 observations (carried, not repaired)

- **`/api/members/progress` POST is unauthenticated** — `memberId` from the request
  body, no session check. `onboarded`, `onboarding_step`, `youth_onboarded` settable
  by any caller with a member UUID. `youth_onboarded` is teen-environment state.
- **`auth/dev-login` mints sessions** — production gating unverified by this census.
- **Documented flow ≠ code.** CLAUDE.md's onboarding section says new users start at
  `/begin`; `lib/onboarding/state.ts:52` says `/begin` was deprecated 2026-05-16 and
  `/signin` is canonical. Anyone debugging signup from the anchor debugs a dead flow.
- **The FAQ step is written but never visited.** `register-email` writes
  `onboarding_step='faq'`; `getNextOnboardingStep` maps `faq`→`/faq`; `UnifiedAuth`
  sends new members to `/onboarding`. Nobody is at `onboarding` in production.
- **Onboarding completion is fire-and-forget** (`app/onboarding/page.tsx`), so
  localStorage can say onboarded while the server disagrees.
- **7 welcome/begin-shaped pages** exist (`/begin`, `/welcome`, `/welcome-back`,
  `/welcome-flow`, `/beta-welcome`, `/beta-onboarding`, `/partner-welcome`).

## 6 · What Stage 0 has NOT established

Liveness of any path · which populations exist in production and how large ·
whether the OAuth routes are reachable · production gating of `dev-login` ·
what `members/enter` does · session lifetime and multi-device behaviour ·
what happens on mail failure end-to-end. All Stage 1.
