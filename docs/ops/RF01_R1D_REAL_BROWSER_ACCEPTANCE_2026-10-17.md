# RF01 R1-D — Actual Next.js browser acceptance and release hold

**Date:** 2026-10-17
**Scope:** Isolated branch fix/rf01-r1d-browser-new-conversation-20261017
**Pinned parent:** 8cda74c6d70743c1c956527cd3f0f09e5b6d747b
**Production data, paid calls, GitHub push/merge/deploy:** NONE.

## Blockers found and corrected

1. New Conversation previously cleared a visible transcript under an
   unchanged session ID. It now awaits authenticated, server-minted identity;
   all three MAIA hosts subscribe to one event and remount with privacy
   unresolved. Prior writing remains untouched when creating a new encounter.
2. The legacy session-start handler trusted the client member claim and
   could update existing ownership. It now requires server-verified actor,
   exact matching claims and owner-scoped session reuse.
3. The actual Next.js browser initially returned HTTP 500: a client inference
   helper imported a PostgreSQL-backed provider-grant through S1-B. The pure
   protected processor refusal is now separate from the server-only grant.
4. Bare /maia is the public threshold. The real member path is
   /maia/encounter and it requires verified authentication.
5. The Arrival portal masked the old privacy panel. The member now crosses
   Arrival first; the unresolved choice appears centered and readable.
   Words typed into Arrival before consent become an unsent draft.
6. Conversation Settings was technically mounted but unreachable from the
   actual Lab Tools menu. A real visible Lab Tools entry now opens Quick
   Settings, and its existing New Conversation button begins the flow.

## Witnessed real browser and authentication

Actual Next.js 16.3.8, local web browser, and disposable PostgreSQL 16 with
one fictional member and a synthetic cookie. Real proxy/session actor and
New Conversation routes; unrelated API calls were intercepted and mocked.
All outgoing external browser requests were blocked, observed as zero.

- Desktop Chrome.
- Desktop WebKit.
- 390×844 mobile WebKit emulation.

In all three browsers, clicked I'm ready, deliberately chose Sanctuary,
entered a fictional message, verified a visible Sanctuary Send refusal without losing the editable draft
before ANY content-free consent preflight or model call, opened the
actual Lab Tools → Conversation Settings → New Conversation buttons,
obtained a different server-created UUID, saw privacy reset, and verified
older fictional writing was preserved. A deliberately failed subsequent
New Conversation left the current session unchanged.

Direct real HTTP denials (six) and positive owner admission (one) verified:
anonymous New/session start 401; client body claim to New 400; foreign member
body claim 403; foreign existing session 409; guessed session 403; and
valid owned registration 200. Database confirmed foreign ownership unchanged.

## Current bounded qualification

- **344/344** selected RF01 unit/security/regression checks passed across
  32 Jest suites. The 21 new R1-D cases include authenticated route and
  client identity handling, refusal and canonical event behavior.
- **Real Next.js 16.3.8** on a loopback-only server passed desktop Chrome,
  desktop WebKit and 390×844 mobile WebKit emulation. The actual Lab Tools
  and Quick Settings buttons were clicked. Sanctuary held-Send refusal
  preserves an editable draft and transmitted no model or preflight request.
- **Seven real HTTP probes** passed: six security denials and one valid member
  registration, all using the synthetic cookie backed by disposable PG16.
- **TypeScript:** UI scope 21 existing diagnostics vs 21 in R1-D; zero newly
  introduced. Provider and session-boundary scopes had zero diagnostics.
- **Desktop:** 410 of 415 Node tests passed. The five failures are the
  previously reported Cabin test-file baseline failures; no R1-D native edits.
- Experience-contract desktop and mobile screenshots, plus separate browser
  evidence, were captured from actual successful Next.js runs.
- Both owned loopback ports (3738 and 55552) were released and disposable
  Next.js/Postgres processes and fictional data cleaned up. The original main
  checkout remains unchanged; no production source, provider, or member
  state was accessed.

## Exclusions and remaining release gates

- This was synthetic authenticated-cookie authority, not real user-facing
  sign-in UX or account issuance. Browser fixtures mocked other app APIs.
- Physical iPhone Safari/WKWebView, native Desktop capture/continuity and
  real microphone behavior are NOT yet witnessed.
- S1-A public Sanctuary processing hold remains enforced. No external
  processing grant, Anthropic call, speech TTS/STT or spending was activated.
- Twenty-four inherited targeted route TypeScript diagnostics and five
  known Cabin test-file failures remain distinct release debt.
- R1 derived influence, actual backup restore/rollback and in-flight
  client cancellation still require final production-grade qualification.

**Standing:** R1-D browser gate locally qualified; full beta and production
deployment still on HOLD until independent release signoff.
