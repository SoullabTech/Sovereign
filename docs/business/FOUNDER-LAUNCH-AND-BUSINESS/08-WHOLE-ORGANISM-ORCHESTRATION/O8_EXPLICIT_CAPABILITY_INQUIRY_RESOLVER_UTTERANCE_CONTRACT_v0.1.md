# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O8

## EXPLICIT CAPABILITY INQUIRY — RESOLVER + DESCRIPTION-ONLY UTTERANCE CONTRACT

**Status:** DESIGN ONLY · THREE-CAPABILITY PILOT SET · NO RUNTIME CONSUMER · NO MAIA/HOUSE MUTATION

## Governing purpose

Permit one future behavior and only one:

> **When a member explicitly asks what one approved pilot capability is or what it means, return its approved name and approved purpose — and stop.**

This pilot is descriptive, not operational.

## Pilot capability set

Exactly three canonical capability IDs are eligible:

| Capability ID | Approved name | Approved purpose |
| --- | --- | --- |
| `journal.create` | New Journal Entry | Begin a new Journal entry for something you want to write down. |
| `journal.dream` | Record a Dream | Preserve a dream you choose to record in your Journal. |
| `astrology.reading` | Astrology Reading | Explore your birth chart as a symbolic map for reflection, not as a verdict about who you are. |

No other capability may be resolved by this pilot.

The pilot set is an allowlist, not a dynamic query over all APPROVED records.

## Resolver principle

> **Resolve explicit naming, not inferred intent.**

The resolver must be:
- deterministic;
- pure;
- model-free;
- member-state-free;
- route-free;
- entitlement-free;
- side-effect-free.

It must not use:
- embeddings;
- semantic similarity;
- LLM classification;
- conversation history;
- member memory;
- current room;
- House topology;
- legacy voice phrases;
- legacy capability labels;
- behavioral signals.

## Accepted inquiry envelopes

The pilot recognizes exactly two descriptive question forms after harmless normalization:

```text
what is <APPROVED_NAME>
what does <APPROVED_NAME> mean
```

Examples that may resolve:

- `What is New Journal Entry?`
- `What does Record a Dream mean?`
- `What is Astrology Reading?`

Harmless normalization may include only:
- Unicode apostrophe normalization;
- ASCII case-folding;
- trimming outer whitespace;
- collapsing repeated interior whitespace;
- removing one terminal `?` or `.`.

No synonym expansion, stemming, fuzzy match, aliasing, or semantic interpretation is permitted.

## Resolver refusal set

The pilot must return ABSTAIN for:

### Action-shaped requests
- `Start a journal entry.`
- `Record my dream.`
- `Give me an astrology reading.`
- `Open New Journal Entry.`

### Availability questions
- `Can I use New Journal Entry?`
- `Do I have Astrology Reading?`
- `Is Record a Dream available to me?`

### Navigation questions
- `Where is New Journal Entry?`
- `How do I get to Astrology Reading?`

### Ambient life content
- `I had a dream.`
- `I want to write something down.`
- `I've been thinking about my birth chart.`

### Non-pilot capability questions
- `What is Save to Journal?`
- `What is Wisdom Inquiry?`
- `What is Writer's Studio?`

### Ambiguous or fuzzy language
- `What's the journal thing?`
- `Tell me about transits.`
- `What can astrology do?`

## Resolver contract

```ts
type PilotCapabilityId =
  | 'journal.create'
  | 'journal.dream'
  | 'astrology.reading'

type ExplicitCapabilityInquiryResolution =
  | {
      kind: 'DESCRIBE'
      capabilityId: PilotCapabilityId
      matchedName: string
      envelope: 'WHAT_IS' | 'WHAT_DOES_MEAN'
    }
  | {
      kind: 'ABSTAIN'
      reason:
        | 'NO_EXACT_NAME_MATCH'
        | 'NON_PILOT_CAPABILITY'
        | 'NOT_DEFINITIONAL'
        | 'ACTION_SHAPED'
        | 'AVAILABILITY_SHAPED'
        | 'NAVIGATION_SHAPED'
        | 'AMBIGUOUS'
    }
```

`DESCRIBE` contains no route, availability, member state, entitlement, offer, or invocation token.

## Resolver ordering law

Refusal classification happens before name matching where a query is clearly operational.

Conceptual order:

```text
raw utterance
→ harmless normalization
→ reject action / availability / navigation shapes
→ require exact definitional envelope
→ require exact approved pilot name
→ emit DESCRIBE or ABSTAIN
```

This prevents a sentence like:
`Can I use Astrology Reading?`

from resolving merely because the approved name appears inside it.

## Utterance contract

A successful resolution may be rendered by one deterministic composer only.

Input:
```ts
{ capabilityId: PilotCapabilityId }
```

Output:
```ts
{
  kind: 'DESCRIPTION_ONLY'
  capabilityId: PilotCapabilityId
  name: string
  purpose: string
}
```

The rendered text is exactly:

```text
<APPROVED_NAME> — <APPROVED_PURPOSE>
```

No model generation is required or permitted for the pilot description.

## Exact pilot utterances

`journal.create`:
> **New Journal Entry — Begin a new Journal entry for something you want to write down.**

`journal.dream`:
> **Record a Dream — Preserve a dream you choose to record in your Journal.**

`astrology.reading`:
> **Astrology Reading — Explore your birth chart as a symbolic map for reflection, not as a verdict about who you are.**

These strings are documentary candidates for a future pilot. O8 does not authorize their runtime emission.

## Utterance terminality law

> **Description ends the pilot act.**

After emitting name + purpose, the pilot may not append:
- a question;
- an invitation;
- a suggestion;
- a CTA;
- a route;
- a button name;
- availability language;
- an entitlement qualifier;
- “I can…”;
- “you can…”;
- “would you like…”;
- “let me…”;
- an invocation request.

The pilot output must be terminal.

## No hidden fallback

If the resolver returns ABSTAIN:

> **the pilot contributes no capability presentation text.**

It must not:
- fall back to the legacy capability registry;
- fall back to House labels;
- substitute platformKnowledge text as if it were the requested capability;
- call a model to guess what the member meant;
- choose a nearby capability.

A surrounding future MAIA conversation may continue under its already-existing authorities, but the pilot itself contributes nothing.

## No persistence / profiling

The pilot resolver and composer require no:
- member ID;
- session ID;
- history;
- tier;
- role;
- entitlement;
- preference;
- memory;
- telemetry-derived relevance;
- confidence score.

O8 grants no new persistence or analytics authority.

If future operational logging is desired, that requires a separate observability contract.

## Separation from existing capability-offer substrate

Current code contains historical or placeholder vocabulary such as `capability_available` cognition events and `capability-offer` conversation-insight rendering.

O8 must not reuse those types or surfaces.

> **Description-only inquiry is not availability and not an offer.**
## Separation from platform orientation

`platformKnowledge.ts` already supports broad host-style questions such as “What is this place?”, “Where should I begin?”, and “What is Studio?”.

O8 does not modify or replace that path.

The pilot is narrower:

```text
explicit exact capability name
+
definitional envelope
→
exact approved name + purpose
```

It is not a platform router.
## Pilot laws

1. **Three-ID allowlist** — only `journal.create`, `journal.dream`, and `astrology.reading` may resolve.
2. **Exact-name requirement** — exact approved name after harmless normalization.
3. **Definitional-envelope requirement** — only WHAT_IS and WHAT_DOES_MEAN.
4. **Operational-shape refusal** — action, availability, and navigation questions abstain.
5. **No semantic inference** — no fuzzy, model, context, memory, or behavioral resolution.
6. **Description-only payload** — no route, access, offer, or member state.
7. **Exact-copy custody** — composer may not rewrite approved copy.
8. **Terminal utterance** — nothing follows approved purpose.
9. **No offer** — description never becomes CTA or suggestion.
10. **No availability** — no statement about current-member use.
11. **No route** — no navigation or button instructions.
12. **No member context** — resolver and composer are account/session independent.
13. **Abstention is non-substitution** — no nearby capability fallback.
14. **Platform-map witness custody** — bound to O7R2 reconciliation witness until succeeded.
15. **Runtime closed** — O8 design itself authorizes no runtime consumer.
## Falsifier matrix

| ID | Input / mutation | Required result |
| --- | --- | --- |
| F-O8-01 | `What is Save to Journal?` | ABSTAIN / NON_PILOT_CAPABILITY |
| F-O8-02 | `I had a dream.` | ABSTAIN / NOT_DEFINITIONAL |
| F-O8-03 | `Record my dream.` | ABSTAIN / ACTION_SHAPED |
| F-O8-04 | `Can I use Astrology Reading?` | ABSTAIN / AVAILABILITY_SHAPED |
| F-O8-05 | `Where is New Journal Entry?` | ABSTAIN / NAVIGATION_SHAPED |
| F-O8-06 | `What is journal entry?` | ABSTAIN / NO_EXACT_NAME_MATCH |
| F-O8-07 | `What is dream recording?` | ABSTAIN / NO_EXACT_NAME_MATCH |
| F-O8-08 | resolver uses conversation context | CONTEXTUAL_INFERENCE_FORBIDDEN |
| F-O8-09 | output appends a suggestion | DESCRIPTION_NOT_OFFER |
| F-O8-10 | output appends route/button | DESCRIPTION_NOT_ROUTING |
| F-O8-11 | output says “available to you” | DESCRIPTION_NOT_AVAILABILITY |
| F-O8-12 | composer paraphrases approved purpose | EXACT_COPY_REQUIRED |
| F-O8-13 | ABSTAIN falls back to legacy label | ABSTAIN_NON_SUBSTITUTION |
| F-O8-14 | `journal.save` added because APPROVED | PILOT_ALLOWLIST_FIXED |
| F-O8-15 | runtime consumer imported in design act | RUNTIME_CONSUMER_FORBIDDEN |
## Design decision

> **YES — the three COMPATIBLE capabilities are suitable for a first explicit-capability-inquiry pilot, but only under this exact resolver/utterance contract.**

The pilot is intentionally not intelligent. Its safety comes from being small enough that it does not need to infer.

## Standing

> **O8 DESIGN — THREE-CAPABILITY EXPLICIT-INQUIRY PILOT CONTRACT DEFINED · EXACT-NAME / DEFINITIONAL-ONLY RESOLUTION · DETERMINISTIC NAME+PURPOSE UTTERANCE · NO SUGGESTION / ROUTING / AVAILABILITY / MEMBER STATE · RUNTIME STILL CLOSED**
## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O8R1 — EXPLICIT CAPABILITY INQUIRY RESOLVER + UTTERANCE CONFORMANCE MATRIX ONLY**

O8R1 may implement the pure resolver and deterministic composer in a test/governance locus, encode the fixed three-capability pilot fixture, add accepted-query and refusal-query matrices, add defeat candidates for inference/offer/routing/availability/copy drift/allowlist widening, bind to the existing platformKnowledge witness, and record evidence.

O8R1 may not wire the resolver into MAIA, modify platformKnowledge, emit runtime descriptions, touch House, reuse capability-offer or capability-available runtime surfaces, add persistence/telemetry/routes/availability/entitlement logic, or change member-visible behavior.
