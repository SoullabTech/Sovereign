# SAFETY-DELIVERY-01 R1 — Live Crisis Contract Witness

Date: 2026-10-01
Branch: fix/safety-delivery-live-crisis-r1-20261001
Base: aa3bc543b755f6236a41cc612c8d132a13a845d9

## Scope

This unit repairs the canonical live /api/sovereign/app/maia/list crisis-response gap identified by SAFETY-DELIVERY-01_CANONICAL_LIVE_CRISIS_CENSUS_2026-10-01.md.

It does not adopt the prototype MAIASafetyPipeline.
It does not add human notification.
It does not authorize practitioner, guardian, founder, team, emergency-service, or third-party disclosure.

## Contract

The live route now performs deterministic crisis recognition:

1. after the member turn crosses the durable F1 acceptance boundary;
2. before pure-command handling;
3. before field/symbolic safety routing;
4. before memory retrieval and contextual enrichment;
5. before provider/model generation.

Detected crisis language receives a deterministic member-facing response and exits the ordinary cognition path.
## Shared authority

The pre-existing voice crisis detector was moved into lib/safety/liveCrisisContract.ts.

lib/voice/voiceCommands.ts now imports/re-exports that contract.

The canonical server route imports the same detector.

This prevents voice and server safety vocabulary from drifting independently.

## False-positive tightening

The older voice stopgap contained overbroad high-risk fragments including ordinary-language forms equivalent to:

- "this is it"
- "I wrote letters"
- "tonight is the night"
- possessing a knife without self-harm intent
- being on a roof without jump intent

Those fragments are no longer sufficient.

The ambiguous/soft tier was also tightened so ordinary phrases such as "what's the point of this exercise?" or "I don't want to be here at this meeting" do not create a crisis override.

High-risk classification now requires explicit plan, self-harm intent plus means, or an already-started attempt.
## Executable detector witness

The pure shared contract was executed directly with cached tsx.

Result:

live crisis detector witness PASS { negative: 16, positive: 10 }

Negative cases included ordinary completion, farewells, project frustration, meeting/location language, ordinary knife possession, roof maintenance, and previously overbroad fragments.

Positive cases included active suicidal ideation, explicit plan, already-taken pills, suicide note, NSSI language, and bounded soft-risk language.

## Route-order witness

A source-order falsifier established:

- durable member write precedes crisis evaluation;
- crisis evaluation precedes pure command acceptance;
- crisis evaluation precedes enforceFieldSafety;
- crisis evaluation precedes getMaiaResponse.

Result:

route-order/disclosure witness PASS

The crisis block explicitly carries humanDisclosureAttempted: false and contains no alertSoullabTeam, sendAlert, or sendSafetyConcernNotification call.
## Voice compatibility witness

The existing voice module was imported through the repository tsconfig and its re-exported detector executed.

Result:

voice shared-detector compatibility PASS high

## Jest limitation

A targeted Jest attempt could not run locally because this clean worktree has no installed ts-jest dependency. An ephemeral Jest invocation cannot satisfy the repository preset's local module resolution.

This is tooling unavailability, not a passing test result.

The committed tests must therefore be executed by repository CI before admission.

## Acceptance gates

R1 is admissible only if CI proves:

- existing voice crisis speech-act regression remains green;
- new live-crisis contract tests pass;
- TypeScript no-regression gate passes;
- build passes;
- sovereignty/covenant gates pass.

## Non-delivery register effect

This unit does not close S1, S2, S3, or S4.

It establishes a separate live member-response contract where the census found no explicit one.

Human-world delivery remains a separate governed question.
