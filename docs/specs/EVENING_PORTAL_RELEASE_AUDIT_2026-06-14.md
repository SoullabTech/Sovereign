# Evening Portal — Phase 0: Release Path Audit

- **Date**: 2026-06-14
- **Governed by**: Sanctuary Mode invariants (`CLAUDE.md`), `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`
- **Parent**: `EVENING_PORTAL_SPEC_2026-06-14.md` (Phase 0 of Kelly's implementation plan)
- **Status**: COMPLETE — **verdict: PASS (conditional)**. Two live fixes required regardless.

---

## The question

Can the **Release** gesture be made truly non-persistent — member text never stored, logged, sent into retained model context, or converted to memory? **Pass** = at most `release_event: true` + timestamp, no content. **Fail** = an unavoidable persistence path exists → redesign Release as a purely browser-side ritual with no server submission.

## Verdict

**PASS — and the cleanest design is *stronger* than the fail-condition fallback.** Persistence is **not** entangled in shared middleware: every capture sink lives in the post-response writeback tail of `getMaiaResponse` (`lib/sovereign/maiaService.ts:2867–3429`) plus a few orchestrator preview-log lines — all individually avoidable by a dedicated path. `buildMaiaRuntimeContext` (`lib/maia/maiaRuntimeContext.ts`) is read-only.

**Recommended design: Release transmits no content at all.** The text lives only in the browser, is shown, then discarded on submit; the server receives `release_event: true` + a timestamp, nothing else. Non-persistence is then guaranteed by the content *never leaving the device* — not by trusting a server to discard it. MAIA's **refusal to read it** is the feature, and a stronger proof of the belief than any personalized acknowledgment.

---

## Two live findings — fix regardless of the Evening Portal

**1. Sanctuary Mode currently leaks raw member text into training data (live consent-invariant violation).** The Sanctuary guard closes at `maiaService.ts:3101`, but two sinks run *after* it:
- `logMaiaTurn` → **`maia_turns`** (raw `userText`, training-data table) — `maiaService.ts:3108`, INSERT `lib/sovereign/maiaTrainingDataService.ts:194`. **Always-on, not Sanctuary-gated.**
- `detectAndPersistExpansion` → **`expansion_events`** (`content = userText.slice(0,2000)`) — `maiaService.ts:3231`, INSERT `lib/.../expansionEventService.ts:290`. **Not Sanctuary-gated.**

This violates the canon: *"No training data — Sanctuary content never enters any model training pipeline."* Right now it does. **Fix:** wrap both in `if (!isSanctuary)`. (Route-level relational-signal persist at `route.ts:1349` also lacks the gate on its branch.) Small change; affects **every** Sanctuary session today, not just the Evening Portal.

**2. Sentry is wired but `beforeSend` doesn't strip request bodies.** Dormant today (no `SENTRY_DSN` in any env), so nothing leaks now — but `@sentry/nextjs` auto-attaches request data (incl. bodies) to exceptions, and `beforeSend` (`lib/monitoring/sentry.ts:31–65`) only drops dev/noise events. **Fix:** drop `event.request.data` in `beforeSend` now, so enabling a DSN later cannot retroactively start capturing content.

---

## The leak map (evidence)

### Database sinks on a normal turn
| Sink → table | Auto? | file:line | Sanctuary-gated? |
|---|---|---|---|
| `conversation_turns` (raw input+text) | yes | `maiaService.ts:2887` | ✅ |
| MemoryWriteback (durable memory) | significance-gated | `route.ts:1200–1223` | ✅ |
| `semantic_memory_vectors` | longterm+elevate | `maiaService.ts:3075` | ✅ |
| lattice `integrateEvent` | longterm+elevate | `maiaService.ts:3003` | ✅ |
| **`maia_turns` (training data)** | **yes** | `maiaService.ts:3108` | ❌ **leaks** |
| **`expansion_events`** | growth-marker | `maiaService.ts:3231` | ❌ **leaks** |
| `member_theme_signals` | theme-detected | `maiaService.ts:3429` | ✅ |
| state vector | conditional | `maiaService.ts:2786` | ✅ |
| relational signal | conditional | `route.ts:1349` | ⚠️ ungated branch |
| Corpus Callosum `agent_runs`/`integration_passes` | yes | `maiaService.ts:3265` | stores MAIA **output only**, never raw user text ✓ |

### Non-database vectors
| Vector | Leaks? | file:line | Avoidable? |
|---|---|---|---|
| forward-readiness `preview` (120ch) | yes | `route.ts:897`, `route.ts:260` | ✅ dedicated endpoint skips orchestrator |
| context/recall preview logs | yes | `route.ts:638,489` | ✅ |
| Sentry request body | latent (dormant) | `lib/monitoring/sentry.ts:31` | scrub `beforeSend` (do now) |
| Postgres error `Params` log | if text queried | `lib/db/postgres.ts:72–73` | ✅ never query the text |
| Analytics / telemetry | no | — | clean |
| `runtime_events` / observability | no | `lib/maia/substrateObservability.ts:117` | counts/flags only ✓ |
| `OracleConversation` localStorage (last 50 msgs) | yes | `components/OracleConversation.tsx:2949` | ✅ bypass `messages`/localStorage |
| Claude/Ollama client logs | no (counts only) | `lib/ai/claudeClient.ts` | use local Ollama to keep content on-box |

---

## Recommended Release architecture

- **Client-side ritual; content never transmitted.** Text lives only in component state; discarded on submit. Acknowledgment is **content-free** ("Take a breath. That's set down now.").
- **Server receives metadata only:** optional `POST /api/maia/release` writing nothing but `release_event` (timestamp + member-id-prefix; **no content**) — or no server call at all.
- **Must NOT:** run `getMaiaResponse`'s writeback tail; touch `OracleConversation`'s `messages`/localStorage; parameterize the text into any query; run the forward-readiness/preview logs.
- **If a content-aware acknowledgment is ever wanted** (not recommended for v1): local model (Ollama) only, never `logMaiaTurn`, never persist prompt/response. The content-free ritual is the stronger design.
- **Gate:** mandatory `security-auditor` pass on no-content-write / no-content-log / no-client-persist / Sentry-scrub-in-place.

## Bottom line for the build

Release is the **smallest possible server surface** (a metadata ping, or nothing). The hard part is **discipline, not engineering** — keeping the content out of a pipeline built to capture everything. The two fixes above are prerequisites for the platform being honest about non-persistence at all, so **do them first.**
