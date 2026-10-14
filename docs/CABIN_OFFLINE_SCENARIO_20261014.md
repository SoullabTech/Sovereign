# Cabin offline scenario — first engineering evidence
Date: 2026-10-14
Founder authorization: build Cabin as the local sovereign scenario; continue engineering.
Baseline: bdf95a8e19d53d0e78dc6fcd200addf208dcc6b1.
Branch: feature/cabin-offline-scenario-20261014.
Follow-up: MAIA-SOVEREIGN-auq.

## Intended acceptance
Open Cabin without internet, converse with MAIA, refine a chapter, apply or undo,
restart the application, and recover the saved work with consent and provenance intact.
Kelly remains the founder reviewer. Technical separation does not imply independent
human custody or certification.

## Observed foundation
Mac Studio: Apple M4 Max, 48 GB unified memory.
Ollama loopback service available. Downloaded models include Qwen2.5 7B, Qwen3 32B,
GPT-OSS 20B, Qwen3 Coder 30B, and nomic embeddings.
Existing Cabin has SQLite member/session authority, turns, manuscript sections,
context mounting, and a supervised loopback runtime.
All 49 existing maia-desktop/test/cabin-*.test.mjs tests passed on the baseline.
These are component and structural checks, not desktop acceptance.

## Component pilot
scripts/cabin-local-scenario.mjs uses only fictional input and a disposable SQLite file.
It calls literal http://127.0.0.1:11434 with redirects rejected and a bounded timeout.
It makes no cloud calls or cloud fallback and modifies no installed application.
A local Qwen2.5 7B response was persisted through the existing CabinLocalStore.
A separately spawned process recovered two turns and the original manuscript section.
Other-member manuscript access returned no sections.
Successful run: localInference PASS; freshProcessRecovery PASS; duration 3480 ms.
The initial harness run failed because a URL-encoded pathname was passed to the child;
fileURLToPath corrected it. The successful rerun exercised actual child-process recovery.
Temporary fictional data is removed on completion or failure.

Reproduction on the observed host:
```sh
cd '/Volumes/T7 Shield/cabin-offline-scenario-20261014'
'/Volumes/T7 Shield/maia-desktop-cabin-artifact-20261001/node_modules/.bin/tsx' scripts/cabin-local-scenario.mjs
```

## Remaining integration
The baseline MAIA POST route deliberately returns CABIN_COGNITION_NOT_LOCAL in offline mode.
Preserve this guard until an authenticated local handler is qualified.
The pilot does not implement MAIA canons, context admission, local Send, transactional
exchange persistence, application recovery, streaming, voice, or manuscript Apply/Undo.
It does not prove network isolation: the Mac remained connected during the run.
It does not evaluate model relational quality or certify recovery custody.
The continued pilot now uses CabinLocalStore.addExchange: both completed turns commit in one SQLite transaction. This storage primitive is not yet an authenticated application Send handler.

## Next bounded implementation
1. Integrate a local authenticated Send handler using server-owned local sessions.
2. Carry Sanctuary posture and consent-scoped context through every writer and reader.
3. Permit pinned local inference only; preserve fail-closed behavior on model failure.
4. Add atomic exchange persistence and durable retry behavior.
5. Implement manuscript revision history, Apply/Undo, and original Source protection.
6. Exercise the actual desktop candidate with external networking denied, then restart.
7. Obtain Kelly's experiential acceptance of MAIA receiving, correction, and editorial voice.

No production deployment, installed app replacement, network shutdown, real manuscript
import, paid service, or recovery certification was performed.

## Atomic exchange continuation
CabinLocalStore.addExchange now commits a completed user/assistant pair atomically.
Exact retries reuse both turn identities. Changed content, session, owner, and incomplete
legacy exchanges are refused. Missing/forged posture and Sanctuary persist neither half.
A forced assistant insert failure rolls back the user half; retry succeeds after removal
of the fictional failure trigger. No schema change was required.
All 56 Cabin tests passed (49 existing plus seven atomic-exchange tests).
The local model pilot passed again using this primitive and fresh-process recovery;
observed total duration was 2955 ms. A scoped TypeScript check of localStore.ts passed.
This does not change the conversation UI, offline cognition route guard, or production.
Before connecting Send, resolve canonical MAIA prompt/context participation and local
conversation ownership rather than bypassing them with a generic model endpoint.

## JARVIS Cabin entry flow continuation
Founder authorized JARVIS flow on 2026-10-14. Candidate Home now offers Check readiness
and Open Cabin. Two narrow, zero-payload preload channels are documented in the existing
authority allowlist. MAIN accepts only its own top-level window/frame.
Readiness probes fixed loopback URLs with timeouts and redirects denied. It requires
a stamped offline Cabin health response before opening; this is not cryptographic
runtime identity attestation. Opening rechecks readiness rather than trusting the UI.
The candidate Cabin view has no preload or Node integration, is sandboxed, uses an
isolated session partition, denies popups/external navigation, and denies requests
outside the fixed Cabin origin. This window restriction does not attest server egress.
Conversation, writing, voice, recovery, and resume stay UNVERIFIED. No manuscripts
or conversations are read by JARVIS readiness. No runtime is spawned or installed.
Five flow tests passed. Existing JARVIS alpha-floor proof: 97 passed, zero failed.
Live observation: local completion models AVAILABLE; runtime NEEDS_SETUP; canOpen false.
The initial external-browser opening implementation failed the reveal-only main guard;
it was replaced with the bounded sandboxed view, and the unchanged guard passed.
An actual Electron-window automated test now passes as recorded below. Founder visual acceptance and integration with the current installed JARVIS revision remain outstanding. This older Cabin baseline is an isolated candidate, not
a replacement for newer JARVIS work. Resume-work selection is not implemented.

## Actual JARVIS window canary
The source candidate was launched using Playwright Electron and the observed available
Electron binary. appData and userData were set under a disposable directory before
JARVIS initialized. The candidate used its own single-instance lock and repository
binding; installed JARVIS was not restarted or replaced.
The positive opening test used an explicitly fictional loopback Cabin fixture because
the real standalone Cabin runtime was not running. It verifies the actual renderer,
preload, MAIN handlers, and sandboxed child window; it is not real Cabin acceptance.
Results: actualJarvisWindow PASS; isolatedStorage PASS; fictionalFixtureOpen PASS;
externalNavigationBlocked PASS; externalFetchBlocked PASS;
stoppedRuntimeDisablesOpen PASS. Captured process exit: 0.
The first captured attempt timed out waiting for a navigation deliberately denied by
the guard. The harness was corrected to avoid waiting for that denied navigation,
and the complete rerun passed. An earlier launch failed because the Electron executable
was initially absent; the available package then supplied its binary.
The canary closes its own app, fixture server, and temporary storage. No listener
remained on the fixture port after the successful run.
Next integration: qualify the real isolated Cabin runtime, local authenticated Send,
and saved-work resumption. Voice, manuscript Apply/Undo, and full network-disconnected
acceptance remain unverified.

## Two-Cabin selected sharing pilot
Founder requested a Soullab member network and authorized continuing on 2026-10-14.
Existing circle-sharing/consent services were inspected: sharing requires manual
consent and does not mutate the source. Those services depend on PostgreSQL; this
pilot does not replace them or claim shared production consent authority.

The reproducible scripts/cabin-two-peer-pilot.mjs creates two disposable CabinLocalStore
databases and a separate received-item inbox. One authenticated local session explicitly
selects one manuscript section and manually consents. No selection or consent means
no export. The other source section and the recipient's private memory are excluded.
The selected copy travels through a real loopback HTTPS connection requiring TLS 1.3,
mutual certificate validation, and pinned test sender/recipient certificate fingerprints.
Node's standard TLS/OpenSSL supplies transport encryption; no new cryptographic
message protocol is invented. TLS is point-to-point: an eventual terminating relay
would see plaintext, so multi-hop/relay E2E encryption remains a separate design task.

Fictional test certificates and private keys exist only in a temporary directory and
are removed on completion. The disposable test CA simulates already-verified enrollment;
it does not prove real member identity or implement invitations/key management.
Inbox permissions are receive-only: MAIA recall, execution, and resharing are false.
The pilot rejects permission escalation and keeps received data outside memory stores.
It cannot guarantee a recipient will not copy content; permission flags are application
constraints, not remote control over a recipient's possessions.

Verified: two isolated stores, manual consent, exact selected-section export, TLS 1.3,
unapproved identity rejection, untrusted server rejection, escalation rejection,
durable duplicate rejection after reopening the inbox, unchanged source, and no
automatic conversation/developmental-memory creation.
Not implemented: real member enrollment, invitations, key custody/rotation/revocation,
revoked-content recovery, cross-device transfer, UI, federation, relay E2E, radio,
large-file synchronization, conflict resolution, or physical-network outage acceptance.

Reproduce with node_modules/.bin/tsx scripts/cabin-two-peer-pilot.mjs.
Only loopback is bound and requested. No real member material, radio transmission,
paid resource, or installed application is used.
Next milestone: join this selected-sharing seam to a reviewable Cabin invitation and
send/receive interface, then test two physical devices before expanding to a circle.

## Direct Cabin desktop launcher
Founder requested direct desktop access on 2026-10-14. Created a distinct local app
at /Users/soullab/Applications/Cabin.app and opened it after packaged-window testing.
macOS refused Desktop-folder access, so no Desktop shortcut was created.
The launcher is explicitly labelled Setup in progress; it checks readiness and opens
only the fixed loopback Cabin workspace after a fresh check. It does not supply the
missing runtime, local Send, Apply/Undo, or resume integration. It has its own userData
directory (Soullab Cabin), bundle identity, single-instance lock, two narrow bridge
methods, and sandboxed renderer. The workspace view blocks external requests.
The app is ad-hoc signed for this Mac; codesign verification passed. It is not
notarized or qualified for distribution to members. Existing apps were not replaced.
Playwright tested the actual packaged executable: window PASS, readiness button PASS,
isolated app storage PASS, narrow bridge PASS, Node integration DISABLED; exit 0.
Observed UI: local workspace not running yet. A normal launch was left open afterward.
Source and no-overwrite builder are in apps/cabin-desktop. Builder uses an already
available Electron.app and copies the existing JARVIS cabin-flow module.
The conversation integration remains active unfinished work; this launcher is an
entry point, not a declaration that the complete Cabin scenario is delivered.
