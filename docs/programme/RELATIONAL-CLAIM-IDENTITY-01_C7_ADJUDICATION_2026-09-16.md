# RELATIONAL-CLAIM-IDENTITY-01 — C7 Adjudication

**Status:** COMPLETE · STOP AFTER THIS RECORD

## Question

Is claim-level identity stable enough to improve standing/referral precision without manufacturing antecedent identity?

## Adjudication

**YES for structurally grounded shadow use; NO as a complete future authority.**

The final deterministic candidate passes 16/16 claim-identity falsifiers plus 1/1 serving-isolation gate (17/17 total tests) and survived two out-of-band production transcript witnesses. Claim identity is source-bound to turn + exact span + exact bytes; semantic similarity cannot merge claims. Fresh production re-fetch reproduced both governing C6 final replay artifacts byte-for-byte.

### WITNESSED capabilities

- A quoted member phrase is a first-class `quotation` claim.
- `that is exactly it. MAIA!` bound only to the quoted phrase when—and only when—the prior turn contained a deterministic quotation-confirmation frame (`quotation` followed by `Does that sound like the one...?`).
- `I already told you` bound only to the unique atomic question claim in the prior MAIA turn; neighboring assertions were untouched.
- `we keep starting this conversation over and over` remained `META_PATTERN / NO_TARGET`; a whole-conversation complaint was not collapsed onto one question by adjacency.
- Opaque `what was that phrase...?` remained `AMBIGUOUS`; claim identity does not itself solve antecedent retrieval.

### Coverage ceiling

Across 57 witnessed MAIA turns, deterministic retrospective parsing produced 275 claim units: 176 atomic and 99 composite. The system therefore deliberately abstains from automatic claim-level standing on a substantial fraction of natural output.

Retrospective parsing is accepted as a compatibility/shadow reader, not as the sole future claim-authority mechanism.

## Candidate adjudication

A simpler conservative prototype was rejected as canonical because it lacked first-class quotation structure and collapsed the broad restart complaint too locally. The stronger candidate was then tightened: quotations receive privileged confirmation binding only through a deterministic quotation-confirmation frame; a quotation by itself does not become the default referent.

## Architectural finding

Future standing-safe interaction should use **prospective claim identity**: MAIA synthesis produces claim objects before or alongside fluent prose, carrying stable identity, speech-act class, and evidence/relation references. The natural-language surface can remain fluid while the epistemic substrate knows exactly which proposition each span realizes.

Opaque reference and standing change are now visibly the same problem class:

`gesture class ≠ antecedent identity`.

Claim identity gives the system addressable objects. A separate antecedent resolver decides which object a later gesture actually targets.

## Engineering gates

```text
claim-identity Jest       17 passed · 0 failed
repo type-health          PASS · 229 errors vs baseline 239 · zero regressions
typecheck:scripts         RED on existing repository debt
lane-source script errors 0
serving file diff         none
raw production IDs        absent from committed telemetry
raw transcript content    absent from committed telemetry
weaker duplicate          removed
canonical candidate       lib/maia/claimIdentityShadow/
```

`typecheck:scripts` is not claimed green. Its reported diagnostics remain in pre-existing repository files; none occur under `lib/maia/claimIdentityShadow/` or `scripts/research/relational-claim-identity/`.

## Candidate successor — NOT OPEN

`PROSPECTIVE-CLAIM-PLAN-01`

Research a structured response plan in which Free Synthesis yields claim objects such as `GROUNDED`, `CANDIDATE`, and `QUESTION`, each with stable IDs and evidence/relation references before member-facing rendering. No production behavior is authorized here.

## STOP

`RELATIONAL-CLAIM-IDENTITY-01` ends here. No serving-path integration, prompt change, cognition exposure, schema migration, or production response change follows automatically.
