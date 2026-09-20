# Sovereignty Dependency Ledger

**Status:** Canon — descriptive instrument. **Ratified:** not yet (founder act).
**Created:** 2026-09-20
**Authority:** ⛔ This document authorizes nothing. It records what is, so that questions
about sovereignty can be adjudicated against a record rather than re-derived each time.

---

## 1. Why this exists

"Sovereign, privacy-first architecture" is one phrase covering roughly a dozen
independent dependency relationships, each with a different gatekeeper and a
different failure mode. Stated as a single property it is neither verifiable nor
falsifiable — and under `MARKETING_CLAIM_DISCIPLINE.md` an unfalsifiable claim
has no claim state.

**Sovereignty is per-layer.** This ledger names each layer, the party who can
interfere with it, what that party can actually do, and the current standing.

It is the instrument that makes a question like *"should we run MAIA over amateur
radio?"* answerable in one reading, instead of adjudicated from scratch.

### What this is not

- ⛔ Not a threat model. It names *who holds power over a layer*, not who is
  likely to use it.
- ⛔ Not a roadmap. Nothing here is a commitment to remove a dependency.
- ⛔ Not an authorization. No lane is opened, no repair is authorized, no
  configuration is changed, no public claim is edited by this document.

---

## 2. The instrument

Each layer is recorded with:

**GATEKEEPER** — the party who can interfere. `none` means no third party stands
between MAIA and the capability.

**POWERS** — what the gatekeeper can actually do, from a closed vocabulary:

| Power | Meaning |
|---|---|
| `READ` | can observe member content or metadata crossing the boundary |
| `CUT` | can terminate the capability |
| `SEIZE` | can take control of the asset itself |
| `REFUSE` | can decline to serve without taking anything |
| `DEGRADE` | can impair without terminating |

**STANDING** — one of:

| Standing | Meaning |
|---|---|
| `SOVEREIGN` | no third party holds any power over this layer |
| `PROVISIONED` | a sovereign alternative exists, is reachable, and is **not currently selected** — with a named reason |
| `DEPENDENT` | a third party holds power and no sovereign alternative is built |
| `UNMAPPED` | not yet examined |

**EVIDENCE** — repository or runtime evidence. A row with no evidence is `UNMAPPED`.

⚠️ Rows below are **repository truth as of the stated date**. Production runtime
was not read for this edition. Where a row depends on deployed configuration it
says so.

---

## 3. The ledger

### 3.1 Compute

| | |
|---|---|
| **Gatekeeper** | none — self-hosted (minisforum, Docker) |
| **Powers** | — |
| **Standing** | `SOVEREIGN` |
| **Evidence** | `docker-compose.production.yml`; CLAUDE.md → Infrastructure |

### 3.2 Data at rest

| | |
|---|---|
| **Gatekeeper** | none — self-hosted PostgreSQL (`maia-postgres`) |
| **Powers** | — |
| **Standing** | `SOVEREIGN` |
| **Evidence** | `lib/db/postgres.ts`; `npm run check:no-supabase` enforced in pre-commit |

### 3.3 Text cognition ⭐

| | |
|---|---|
| **Gatekeeper** | Anthropic (API) |
| **Powers** | `READ` `CUT` `REFUSE` `DEGRADE` |
| **Standing** | `PROVISIONED` |
| **Evidence** | `docker-compose.production.yml:159-165`; `lib/maia/assertProviderAvailable.ts`; `lib/maia/providerCognition.ts`; `lib/ai/modelService.ts:53` |

A local cognition path exists and is not hypothetical: Ollama is configured
against the host (`host.docker.internal:11434`) with `qwen2.5:7b` for
FAST/GENERAL and `qwen2.5:14b-instruct` for DEEP; `LOCAL_TIER_ENABLED: "true"`.
`assertProviderAvailable.ts` guards the local branch (reachability + installed-model
check), and `providerCognition.ts` observes which provider actually served each
turn, distinguishing *fallback fired* from *local is the intended state*.

**`MAIA_TEXT_PROVIDER: "local"` is present and commented out**, carrying its own
blocking reason in the file:

> `# enable when route timeout raised; 7b@5.8tok/s = ~30s/turn`

⭐ **This is the load-bearing distinction in the whole ledger.** The dependency on
Anthropic for text cognition is a **latency decision, not an architectural gap**.
It is reversible by configuration under a named, measured condition, not by a build.

⛔ It remains the only layer where a member's words leave the perimeter as an
ordinary condition of use.

### 3.4 Embeddings

| | |
|---|---|
| **Gatekeeper** | none — local Ollama (`nomic-embed-text`) |
| **Powers** | — |
| **Standing** | `SOVEREIGN` |
| **Evidence** | `docker-compose.production.yml:290-338`; `lib/ai/localEmbeddingClient.ts` |

The embed-worker's healthcheck hard-depends on Ollama reachability, so this is
not a dormant path: if local embeddings are down, the worker reports unhealthy.

### 3.5 Speech-to-text

| | |
|---|---|
| **Gatekeeper** | none — self-hosted faster-whisper (`maia-whisper`) |
| **Powers** | — |
| **Standing** | `SOVEREIGN` |
| **Evidence** | `docker-compose.production.yml:141` |

### 3.6 Text-to-speech

| | |
|---|---|
| **Gatekeeper** | none in the selected path — Kokoro (`kokoro-tts`) |
| **Powers** | — (OpenAI TTS: `READ` `REFUSE`, consented fallback only) |
| **Standing** | `SOVEREIGN` |
| **Evidence** | `docker-compose.production.yml:172-180`; `lib/tts/ttsRouter.ts` (R15); `docs/adr/012` |

Zero-OpenAI doctrine is the selected production posture. `sesame` is explicitly
not a qualified audio provider (CI text-shaping only).

### 3.7 Client delivery — web

| | |
|---|---|
| **Gatekeeper** | none beyond transport (§3.9–3.11) |
| **Powers** | — |
| **Standing** | `SOVEREIGN` |
| **Evidence** | PWA served from `maia-sovereign` via Caddy |

### 3.8 Client delivery — iOS

| | |
|---|---|
| **Gatekeeper** | Apple (App Store review + distribution) |
| **Powers** | `CUT` `REFUSE` `DEGRADE` |
| **Standing** | `DEPENDENT` |
| **Evidence** | `scripts/build-ios.sh`; `scripts/capacitor-patch-routes.sh`; `ios/*` |

Mitigation already in the architecture: the PWA is a complete alternative surface.
The dependency is on *convenience of distribution*, not on access. ⚠️ That holds
only while PWA parity holds; parity is not measured by any gate today.

### 3.9 Transport — DNS / registrar ⭐

| | |
|---|---|
| **Gatekeeper** | domain registrar (`soullab.life`) |
| **Powers** | `SEIZE` `CUT` `REFUSE` |
| **Standing** | `DEPENDENT` |
| **Evidence** | CLAUDE.md → Infrastructure; `Caddyfile` |

⭐ **The cheapest single point of total failure in the system.** A registrar
action terminates every member's access instantly, requires no access to our
hardware, and has no documented fallback ingress. Compute, data and cognition all
remain intact and entirely unreachable.

### 3.10 Transport — TLS

| | |
|---|---|
| **Gatekeeper** | Let's Encrypt (ACME CA) |
| **Powers** | `REFUSE` |
| **Standing** | `DEPENDENT` |
| **Evidence** | Caddy automatic TLS |

Bounded: certificate refusal degrades trust presentation, it does not surrender
content. Any ACME-compatible CA substitutes.

### 3.11 Transport — IP transit

| | |
|---|---|
| **Gatekeeper** | ISP + consumer router |
| **Powers** | `CUT` `DEGRADE` |
| **Standing** | `DEPENDENT` |
| **Evidence** | CLAUDE.md → Infrastructure; LAN IP drift trap |

`READ` is not listed: TLS terminates at our Caddy, so transit observes metadata,
not content.

### 3.12 Transactional email

| | |
|---|---|
| **Gatekeeper** | Resend |
| **Powers** | `READ` `CUT` `REFUSE` |
| **Standing** | `DEPENDENT` |
| **Evidence** | CLAUDE.md → Members System / Recovery; MAIL lane |

Scope is narrow (passkey recovery, notifications) and carries no conversational
content — but §3.13 depends on it.

### 3.13 Member identity & authentication

| | |
|---|---|
| **Gatekeeper** | none for authentication; Resend for recovery |
| **Powers** | (recovery path inherits §3.12) |
| **Standing** | `SOVEREIGN` (auth) · `DEPENDENT` (recovery) |
| **Evidence** | `members` table; WebAuthn (`WEBAUTHN_RP_ID: soullab.life`) |

⚠️ `WEBAUTHN_RP_ID` is bound to the domain, so §3.9 is also an identity
dependency: a domain change invalidates existing passkeys.

---

## 4. Findings

**F1 — Cognition is the perimeter, and the perimeter is a config line.**
Every other content-bearing layer (embeddings, STT, TTS) is already sovereign and
running locally in production. Text cognition is the sole ordinary crossing, and
the local alternative is provisioned, guarded, observed, and unselected for a
measured latency reason (`~30s/turn` at 7b). ⛔ Not authorization to flip it.

**F2 — Sanctuary is a persistence boundary, not a transmission boundary.**
`lib/sanctuary/sanctuaryGuards.ts` states its own scope precisely: *"nothing from
a Sanctuary session enters persistence."* But a Sanctuary turn still crosses to the
cognition provider (§3.3) — it must, or MAIA cannot answer.

⚠️ **Amended 2026-09-20 after verification — the enforcement is not where the law is
written.** `sanctuaryGuards.ts` has **zero non-test importers**. The invariant is
enforced today by three separate mechanisms, none of which routes through it:

| Vector | Enforcement | Evidence |
|---|---|---|
| Session summary | boundary-enforced, by an **inline duplicate** of the guard | `lib/memory/stores/SessionSummaryStore.ts:57` |
| Turns | **caller-enforced** — route returns early, sovereign service checks per tier; the store writes unconditionally | `sanctuaryGuards.ts` header, self-reported |
| Library keep | route-level check before any DB write | `sanctuaryGuards.ts` header, self-reported |

⛔ This is **not** a claim that the invariant is violated — no violation was looked
for or found. It is a claim about *where the invariant lives*: the named, testable
form of the law is dead code, and enforcement is carried by duplication and caller
discipline. That is the defect class this programme names repeatedly — law written
at one address, applied at another.

The canon's UI copy reads:

> *Sanctuary Mode — This session won't be remembered. Speak freely.*

*Won't be remembered* is accurate. ⚠️ *Speak freely* may be read by a member as
*this stays here*, which is true of MAIA's memory and not true of the provider
boundary. **The transmission point is a claim-discipline question, not an implementation
defect**; the enforcement-location point above is a separate, structural
observation —
and the one place in the system where the gap between the two could matter most to
a person. Routed to founder; ⛔ no copy changed here.

**F3 — The registrar is the cheapest total outage, and it is unmitigated.**
§3.9. There is no documented alternative ingress. ⛔ No lane opened.

**F4 — Inverse drift: the sovereignty story under-reports the sovereignty.**
Four content-bearing layers are fully local in production and none is named in the
canon's sovereignty language. This is the failure mode named 2026-05-25 —
*live infrastructure stays invisible until explicitly measured* — running in the
direction that costs us credit we have actually earned.

---

## 5. Using this ledger

When a proposal claims to increase sovereignty, it must name **which row it moves
and from which standing to which**. A proposal that cannot name its row is not a
sovereignty proposal.

Worked example — *long-range radio transport (HF / amateur bands)*, assessed
2026-09-20: moves §3.11 only, the least consequential `DEPENDENT` row; leaves
§3.3 and §3.9 untouched; and **forces §3.3's content into the clear**, because
amateur-band rules forbid obscuring meaning. Net: one weak row improved, the
strongest boundary in the system broken. ⛔ Declined.

*(Transport-agnostic networking with cryptographic identity as the address —
Reticulum over IP, not radio — moves §3.9 without touching §3.3. That is a
different proposal and is not assessed here.)*

---

## 6. Standing

`UNRATIFIED · DESCRIPTIVE · NO AUTHORITY CONFERRED`

Rows are repository truth as of 2026-09-20; production runtime was not read.
A production witness is owed before any row is cited as evidence of deployed state.
