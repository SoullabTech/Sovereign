# MAIA-DESKTOP-BETA-01 — Release candidate and beta gate

**Date:** 2026-09-16  
**Release:** MAIA Desktop 0.1.0-beta.1  
**Bundle:** `life.soullab.maia.desktop` · macOS arm64  
**Status:** local founder candidate; external distribution not yet authorized

## Governing release invariant

MAIA Desktop is a governed native doorway into the current canonical Soullab
platform. It is not a frozen copy of the website and it does not own a parallel
member, conversation, memory, or studio.

The beta therefore receives the improved MAIA memory, voice surface,
cross-surface continuity, Writer's Studio, Reflections, Pro Studio, and later
canonical additions from the deployed platform. The native host owns only the
desktop boundary: secure session custody, containment, microphone capture,
native voice supervision, diagnostics, lifecycle, and packaging.

## Candidate contents

- Authenticated launch into canonical `https://soullab.life/maia`.
- Current in-page House navigation, including `/writers-studio`.
- Canonical member session and conversation adoption; no Desktop-only identity.
- Explicit `maia-desktop/<version>` runtime marker for sovereign voice routing.
- Native microphone permission boundary and local-Whisper transport.
- Voice liveness, long-pause, tail-salvage, playback, and turn coordination.
- Privacy-safe JSONL voice witness; no transcript or member speech is written.
- Native Help menu command: **Open Beta Diagnostics Folder**.
- Clear retry state and 30-second bound for unreachable sign-in requests.
## Evidence recorded for this candidate

| Gate | Evidence | State |
|---|---|---|
| Desktop domain/containment suite | 358 Node tests | PASS |
| Canonical House route drift | dedicated Jest test against current registry | PASS |
| Package metadata | bundle id, version, arm64, microphone declaration | PASS on prior candidate; rerun required after final build |
| Code signature integrity | strict `codesign` verification | PASS with Apple Development identity |
| Gatekeeper distribution | Developer ID + notarization | BLOCKED |
| Authenticated platform handoff | restored member session opens `/maia` | PASS on founder Mac |
| Current House | House exposes Reflections, Pro Studio, Writer's Studio | PASS on founder Mac |
| Writer's Studio | native-contained navigation reaches `/writers-studio` | PASS on founder Mac |
| Desktop voice route | runtime UA matches platform detector | rerun required after final build |
| Human voice + continuity walk | founder protocol below | REQUIRED |
| Clean second Mac | install, sign-in, continuity, diagnostics, relaunch | REQUIRED |

A green source test is not substituted for a human or second-device witness.

## Founder acceptance walk

Use normal speech and do not open Terminal during the walk.

1. Launch the exact candidate and confirm it restores or accepts the member login.
2. Confirm the first visible member surface is canonical MAIA, not local scaffolding.
3. Start continuous listening and allow microphone access.
4. Speak five natural turns, including one quiet opening and one reflective pause
   longer than ten seconds.
5. Confirm each transcript is recognizably accurate and each relevant reply is
   audible; confirm MAIA does not end the listening session during the pause.
6. Type one turn, then speak the next turn; both must remain in one conversation.
7. Open House, enter Writer's Studio, then return to MAIA.
8. Quit and relaunch. Confirm the same member and latest conversation resume.
9. From Help, open the diagnostics folder and retain the newest witness file.
## Clean-device rehearsal

Perform on a second Apple-silicon Mac using a fresh macOS user where practical.

- Verify the artifact checksum before opening it.
- Install without copying any Application Support state from the founder Mac.
- Confirm first-run sign-in, microphone consent, five-turn voice, Writer's Studio,
  quit/relaunch continuity, sign-out, and diagnostics-folder access.
- Record macOS version, hardware, artifact checksum, start/end UTC, and any defect.
- Treat a crash, false-listening state, lost speech tail, wrong member/thread,
  silent response, containment escape, or unbounded sign-in as a stop-ship.

## Feedback record

For each beta report capture only:

- beta version and build SHA;
- macOS version and hardware;
- route/surface and concise reproduction steps;
- expected versus observed result;
- timestamp and privacy-safe diagnostic filename;
- severity: stop-ship, major, minor, or observation.

Do not paste conversation text, tokens, `session.bin`, or raw member speech into
an issue. Diagnostics are metadata-only by design.

## Distribution ruling

**Local founder use:** eligible after the rebuilt runtime marker check and founder
voice/continuity walk pass.

**Named external testers:** no-go until all of the following are true:

- a **Developer ID Application** certificate is installed;
- the app is hardened, signed, notarized, and stapled;
- Gatekeeper accepts the untouched artifact on the clean second Mac;
- an update channel and rollback owner are named;
- the second-device rehearsal passes;
- tester consent, feedback route, and incident contact are ready.

An Apple Development signature is valid for local engineering but is not an
external beta distribution credential.
## Release and rollback

The release artifact is produced from a clean git commit. The packaged
`maiaBuildSha` must equal that commit, and the verifier result travels with the
artifact. Builds and staging live on the external APFS build volume because the
internal disk does not currently have safe packaging headroom.

Until the signed update channel exists, beta updates are full replacement
artifacts. Rollback means quitting MAIA Desktop and restoring the immediately
preceding notarized artifact; member memory and conversations remain canonical
server state and must not be copied, rewritten, or deleted as part of rollback.

## Go/no-go authority

- Any automated, package-integrity, voice, identity, continuity, or containment
  failure is **NO-GO**.
- The founder may authorize the local candidate only after the founder walk.
- External beta authorization requires the distribution and clean-device gates.
- Absence of evidence is OPEN, never PASS.
