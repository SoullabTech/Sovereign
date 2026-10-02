# SAFETY-DELIVERY-01 — Canonical Live Crisis Census

**Date:** 2026-10-01
**Evidence base:** commit:`a999932df7aa3d4052ee78f044878026aa4f680b`
**Ingress:** `/api/sovereign/app/maia/list`
**Posture:** census only — no notification authority added

## Question

What deterministic safety behavior is actually reachable when a member expresses crisis or self-harm language on the canonical live MAIA chat path?

## Finding

The canonical live path has a **field-safety boundary**, but no deterministic crisis/self-harm response or human-escalation contract was established by this census.

This is not the S1 prototype defect. The canonical live route does not traverse that prototype pipeline.

## What the live route does have

### Field-safety gate

`app/api/sovereign/app/maia/list/route.ts` loads a cognitive profile and calls `enforceFieldSafety()`.

`enforceFieldSafety()` delegates to `routePanconsciousField()`. Its contract is readiness for symbolic/field work. It does not inspect the current utterance for suicidal or self-harm language.

When field work is refused, the route returns a mythic/grounding boundary response before model cognition.

This is a real safety mechanism, but it governs **depth/readiness**, not crisis escalation.

## Crisis mechanisms found elsewhere

The repository contains several crisis-aware mechanisms, including:

- `lib/sovereign/teachingRouter.ts` — distress patterns, including suicidal language, force `REGULATING` mode;
- `lib/maia/MaiaSystemRouter.ts` — explicit crisis-word detection and crisis routing;
- `lib/maia/response-quality-metrics.ts` — detects crisis language and checks whether responses contain resources;
- older oracle and prototype modules with crisis/referral behavior.

Presence in the repository is not evidence of live execution.

## Reachability adjudication

### Teaching router

No importer or caller of `decideMode()` / `getModePromptKernel()` was found in `app/` or `lib/` outside the module itself.

Its crisis-aware `REGULATING` behavior is therefore not established as part of the canonical member-turn path.

### MAIA system router

No importer/caller of `MaiaSystemRouter` was found from the active application/library graph census.

Its crisis detection is therefore not established as live canonical behavior.

### `crisisSafetyAddendum`

`lib/sovereign/clientPromptAuthority.ts` explicitly strips `crisisSafetyAddendum` from client metadata because it is prompt-bearing.

That proves a useful authority law: the client cannot invent a safety instruction.

But the census found no server-side producer on the canonical `/list` call site. The route spreads `withoutClientPromptAuthority(meta)` and then adds many server-authored fields, but it does not add `crisisSafetyAddendum`.

So the key currently demonstrates **blocked injection authority**, not a live crisis-safety layer.

### `maiaService`

The live service applies the same field-safety concept and can consume teen support context if supplied. The source census did not establish a deterministic present-utterance crisis detector, a guaranteed crisis-resource response, or a human-notification call in the canonical path.

## What this census does NOT conclude

It does not conclude that MAIA will necessarily answer a crisis utterance badly. A model may produce an appropriate response from its general behavior or other prompt context.

It does not conclude that Soullab should automatically notify a human whenever crisis language appears.

It does not authorize practitioner, guardian, founder, team, emergency-service, or other disclosure.

Those are separate authority and consent questions.

## Constitutional boundary

Three responsibilities must remain distinct:

1. **Recognition** — determine whether the current utterance crosses a crisis/safety threshold.
2. **Member response** — provide an immediate, bounded response appropriate to the situation, including resources when warranted.
3. **Human disclosure/escalation** — transmit information about the member to another human or service.

A system may lawfully implement recognition and member response without automatically acquiring disclosure authority.

Human escalation requires its own recipient, consent/legal basis, scope, delivery witness, failure semantics, and audit trail.

## Classification

**OPEN DESIGN GAP — canonical live crisis contract not yet explicit or mechanically witnessed.**

This is not entered into `NON_DELIVERY_REGISTER.md` because no canonical live mechanism was found that claims to deliver a crisis alert and then fails. The issue is absence/ambiguity of the live contract, not failed delivery.

## Next governed act

Define and test the minimal live crisis contract at the canonical `/list` boundary:

- deterministic recognition before ordinary symbolic/depth processing;
- deterministic member-facing safety posture;
- no client-authored safety prompt authority;
- explicit separation between member response and human disclosure;
- tests that defeat ordinary distress false positives and prove serious crisis language cannot fall through as an ordinary teaching/symbolic turn;
- only after a separate authority ruling, design any human-notification channel.

Until that contract is ratified, existing prototype crisis systems must not be treated as evidence that the live member path is covered.
