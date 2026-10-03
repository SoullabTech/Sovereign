# KELLY'S WORLD — LIVING FIELD LIBRARY 01 · R9 Deliberative Work Unit Census · 2026-10-01

## Governing question

Can slower, stronger local Grokker synthesis reuse canonical W0.v2 / E1 Work Units without changing C1 or inventing a new execution lane?

## Existing substrate

The canonical Work Unit system already supplies the capabilities Grokker needs:
- task shape `EVIDENCE_SYNTHESIS`;
- evidence class `E1_REPOSITORY_LOCAL`;
- posture `local_only`;
- review pressure `high_value_uncertain`;
- exact canonical SHA binding;
- read-only repository authority;
- no shell / write / merge / deploy / production authority;
- canonical provider routing and transport;
- local `ollama-direct` provider realizations;
- 10-minute provider runtime bound;
- durable provider result custody;
- independent-review and founder-review semantics.

No new "Grokker lane" or C2 vocabulary is needed.

## Precision blocker

Grokker R5 source packets authorize exact excerpts:

`docs/programme/X.md:3-7`

W0.v2 currently accepts that syntax at the renderer spec boundary but `canonicalInputFromSpec()` applies `stripLineSelector()` before writing `scope.allowed_paths`.

The resulting canonical scope becomes:

`docs/programme/X.md`

E1's `materializeCanonicalEvidenceSandbox()` then uses `git show <sha>:<path>` and copies the **entire file**.

Therefore:

> A Grokker source packet cannot currently enter canonical Work Unit execution without evidence-scope widening.

This is not acceptable merely because the wider file is still read-only.

## Falsifier

`field-library-deliberative-work-unit.test.mjs` proves:

1. the proposed work uses only existing canonical vocabulary;
2. W0.v2 strips both exact line ranges in the test packet;
3. the Grokker adapter refuses with `WORK_UNIT_EVIDENCE_PRECISION_LOSS`;
4. refusal occurs before Work Unit creation, grant mutation, provider execution, network use, or filesystem write.

Dedicated R9 falsifiers: **3/3 PASS**.

## Standing

**Deliberative Work Unit reuse is architecturally suitable but not yet admissible.**

The sole blocker identified by R9 is preservation of bounded evidence selectors through W0.v2 → E1 materialization.

The next act must first determine whether line-selector stripping is an explicit canonical law or an implementation remainder. No execution, timeout change, provider change, merge, or deploy is authorized by this record.
