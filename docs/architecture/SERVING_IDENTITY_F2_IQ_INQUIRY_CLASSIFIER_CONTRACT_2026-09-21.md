# SERVING-IDENTITY / F2-IQ — EXPLICIT IDENTITY-INQUIRY CLASSIFIER CONTRACT

**Status:** CONTRACT + EXECUTABLE FALSIFICATION ONLY · NO RUNTIME CLASSIFIER · NO D2/D1 WIRING
**Opening canonical:** `4c097b4c81402c62e42613e83ae28180fef46f08`
**Parent law:** `SERVING-IDENTITY / F1 — DISCLOSURE FACT-PRODUCTION CONTRACT`

## 1. Governing question

F2-IQ answers one question only:

> **Does the accepted current-turn member utterance explicitly ask about the cognition that served or is serving the member?**

The output vocabulary is exactly:

```text
explicit
not_explicit
ambiguous
```

with the F1 mapping:

```text
explicit
  -> explicitIdentityInquiry = known(true)

not_explicit
  -> explicitIdentityInquiry = known(false)

ambiguous
  -> explicitIdentityInquiry = unknown
```

F2-IQ does not decide disclosure.

F2-IQ does not inspect or classify identity mismatch, material capability effect, or capability-contract satisfaction.

## 2. Input authority

The only admissible raw semantic input is the **accepted current-turn member utterance**.

On the authoritative live route this is the validated `message` after the route's TURN ACCEPTANCE BOUNDARY.

F2-IQ may not use:

- conversation history;
- prior-turn utterances;
- memory;
- Serving Identity / `servingTruth`;
- provider telemetry;
- Trust Drawer metadata;
- operator configuration;
- routing mode;
- provider/model outcome;
- assistant response text;
- distress state;
- Sanctuary state.

A separately governed future unresolved-inquiry state could later widen this scope. F2-IQ does not create one.

Preserve:

> **Current-turn inquiry classification may not become cross-turn inference by quietly reading history.**

## 3. What "identity" means in F2-IQ

F2-IQ is about the identity/state of the **cognition serving the response**, not identity generically.

In-scope targets are:

```text
serving_provider
serving_model
execution_domain
serving_substitution
serving_capability_state
```

Examples:

- which provider is serving;
- which model is answering;
- whether cognition is local or external/cloud;
- whether the serving model/provider changed or fell back;
- whether the current serving cognition is in a named reduced/degraded/full state.

The target may be expressed without the literal words `provider` or `model`.

Example:

> "Are you running locally right now?"

is an explicit inquiry about execution domain.

Preserve:

> **Lexical absence is not semantic absence.**

## 4. Explicit inquiry

Classify `explicit` only when the accepted current-turn utterance itself makes a direct information-seeking act whose resolution requires truth about an in-scope serving-cognition target.

Qualifying speech acts include:

```text
direct question
confirmation question
direct request for identity information
question about a serving substitution
question about the reason for a named/claimed serving substitution
```

Examples:

```text
"Which model is answering me right now?"
"Are you using Claude for this?"
"Is this running locally?"
"Did you switch models for that answer?"
"Tell me which provider handled that."
"You're using Claude right now, correct?"
"Why did you switch to local for that response?"
"Are you in a reduced mode right now?"
```

A grammatical question mark is neither necessary nor sufficient.

## 5. Not explicit

Classify `not_explicit` only when the current utterance is semantically complete enough to establish that it does **not** seek serving-cognition identity information.

### 5.1 Selection/instruction is not inquiry

```text
"Use Claude for this."
"Please use a local model."
```

These may matter to a future commitment lane.

They do not themselves ask what served.

### 5.2 Preference is not inquiry

```text
"I prefer local models."
"I don't like Claude."
```

### 5.3 Statement/claim is not inquiry

```text
"Claude is answering me."
"You switched models."
"Local models are slower."
```

A claim may be true or false. F2-IQ does not correct it unless the member also asks for serving identity information.

### 5.4 General model/provider discussion is not inquiry

```text
"Compare Claude and GPT."
"Tell me about Anthropic."
"Which model is best for coding?"
```

The object of inquiry is general knowledge, not what is serving this member now/for the referenced response.

### 5.5 Other identity/provider domains are out of scope

Clear inquiries about these are `not_explicit` for F2-IQ:

```text
persona identity
TTS / voice provider
video provider
member/account identity
memory source
```

Examples:

```text
"Are you MAIA?"
"Which voice are you using?"
"Is Zoom handling the call?"
"What do you remember from yesterday?"
```

These may have separate governance elsewhere.

## 6. Ambiguous

Classify `ambiguous` when the utterance appears to seek identity/change information but the serving-cognition target or reference cannot be established from the accepted current utterance alone.

Examples:

```text
"Are you still the same one?"
"Did something change?"
"Who is answering me?"
"Was that the other one?"
"Is this the full one?"
```

Also classify `ambiguous` when a named identity could reasonably denote either a product/persona or a serving cognition provider/model and the current utterance does not resolve which.

Example:

```text
"Are you ChatGPT?"
```

F2-IQ must abstain rather than borrow context from conversation history.

Preserve:

> **Unresolved reference is uncertainty, not false.**

and:

> **Unresolved reference is uncertainty, not permission to guess true.**

## 7. Presupposition and rationale questions

A question may presuppose a serving identity and still qualify as `explicit` when answering it truthfully requires establishing current/actual serving identity.

Example:

```text
"Why did you switch to local for that answer?"
```

This qualifies even if the member's premise is wrong.

F2-IQ does not accept the premise as fact.

It classifies only that the member has explicitly raised the serving-identity question.

Preserve:

> **Inquiry classification may recognize a question without ratifying its premise.**

## 8. Negative and confirmation forms

Negation does not invert inquiry status.

Examples:

```text
"You're not using Claude, are you?"
"Didn't you switch to local?"
```

are explicit inquiries if their target is otherwise resolved.

The future producer must not confuse:

```text
question polarity
```

with:

```text
whether an inquiry exists
```.

## 9. Output contract

A future runtime producer may return only bounded machine-readable classification data, for example:

```ts
type ExplicitIdentityInquiryClassification =
  | {
      classification: 'explicit';
      target:
        | 'serving_provider'
        | 'serving_model'
        | 'execution_domain'
        | 'serving_substitution'
        | 'serving_capability_state';
      basis:
        | 'direct_question'
        | 'confirmation_question'
        | 'information_request'
        | 'substitution_question'
        | 'substitution_rationale_question';
      classifierVersion: string;
    }
  | {
      classification: 'not_explicit';
      basis:
        | 'selection_or_instruction'
        | 'preference'
        | 'statement'
        | 'general_model_discussion'
        | 'out_of_scope_identity_domain'
        | 'other_non_inquiry';
      classifierVersion: string;
    }
  | {
      classification: 'ambiguous';
      basis:
        | 'target_unresolved'
        | 'reference_unresolved'
        | 'product_or_provider_ambiguous'
        | 'insufficient_current_turn_semantics';
      classifierVersion: string;
    };
```

The classifier output must not contain raw member text.

No persistence is authorized by F2-IQ.

## 10. No confidence threshold as truth

F2-IQ does not define a numeric confidence score whose threshold silently converts uncertainty into true or false.

If semantics remain unresolved, output:

```text
ambiguous
```

A future implementation may use internal model confidence diagnostically, but confidence cannot override the three-state contract.

## 11. Independence from nearby facts

F2-IQ must remain independent of:

```text
serving divergence
actual provider/model
identity commitment
identity mismatch
material capability effect
capability-contract satisfaction
provider fallback
latency
distress
Sanctuary
```

In particular:

```text
serving divergence
  != explicit inquiry

member preference
  != explicit inquiry

member provider selection
  != explicit inquiry

provider mention
  != explicit inquiry

question mark
  != explicit inquiry
```

## 12. Falsifier requirements

The executable F2-IQ matrix must kill at minimum:

1. keyword mention -> explicit;
2. no provider/model keyword -> not_explicit;
3. question mark -> explicit;
4. interrogative grammar only, missing information-request commands;
5. general model question -> current-serving inquiry;
6. persona identity -> serving-cognition inquiry;
7. TTS/video provider -> cognition inquiry;
8. provider selection/instruction -> inquiry;
9. preference -> inquiry;
10. ambiguous reference -> not_explicit;
11. ambiguous reference -> explicit;
12. conversation-history rescue of unresolved current-turn reference;
13. only "what/which" questions count, missing confirmation/rationale forms;
14. question polarity/negation changes inquiry existence;
15. serving divergence can manufacture an inquiry;
16. current-turn claim about provider is treated as inquiry without an information-seeking act.

Each defeat candidate must die on its intended falsifier without undeclared collateral kills.

## 13. Positive contract requirements

The matrix must prove:

- provider question -> explicit;
- model question -> explicit;
- local/external execution-domain question -> explicit;
- substitution/fallback question -> explicit;
- serving capability-state question -> explicit;
- confirmation form -> explicit;
- direct information request without question mark -> explicit;
- rationale question about a claimed serving substitution -> explicit without ratifying the premise;
- clear selection/preference/statement/general discussion -> not_explicit;
- clear persona/voice/video/memory question -> not_explicit;
- unresolved target/reference -> ambiguous;
- F1 mapping remains exactly explicit -> known(true), not_explicit -> known(false), ambiguous -> unknown.

## 14. Structural guards

F2-IQ must prove:

- F1 canonical fact-production law remains unchanged;
- D2 remains unchanged;
- D1 remains unchanged;
- R2 remains unchanged;
- no runtime classifier module is created;
- no live route wiring is added;
- no D2 invocation is added;
- no D1 invocation is added;
- no persistence is added;
- no member-facing copy/UI/voice change is added;
- diff remains design + matrix + package registration only.

## 15. Still not authorized

F2-IQ does not authorize:

- runtime classifier implementation;
- model call for classification;
- regex/heuristic production classifier;
- conversation-history inspection;
- unresolved-inquiry persistence;
- commitment registry;
- capability evaluator;
- capability-contract registry;
- D2 runtime invocation;
- D1 runtime invocation;
- disclosure copy;
- disclosure UI;
- disclosure voice behavior;
- provider routing changes;
- production deployment.

## 16. Standing after design

```text
Serving Identity
  CANONICAL
  REAL-PROVIDER WITNESSED

F1
  CANONICAL

F2-IQ contract
  DESIGNED
  EXECUTABLE FALSIFICATION REQUIRED

runtime identity-inquiry producer
  NOT BUILT

D2
  RUNTIME CLOSED

D1
  RUNTIME CLOSED

disclosure
  CLOSED
```

## Controlling law

> **Classify only the question the member actually asked in the accepted current turn. Do not manufacture an inquiry from keywords, history, telemetry, preference, or ambiguity.**
