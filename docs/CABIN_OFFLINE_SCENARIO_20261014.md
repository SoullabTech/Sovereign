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
