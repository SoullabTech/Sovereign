# Development Provider Governance — Candidate

**Status:** CANDIDATE · NOT RATIFIED  
**Programme:** JARVIS-JEV-01 / JEV-INT-01  
**Date:** 2026-09-22  
**Parent canon:** `PROVIDER_GOVERNANCE.md` · `OPTIMIZATION_TOOLING_GOVERNANCE.md`

This candidate governs the **development-time external-provider boundary**: repository-governed
state, source, or constitutional material leaving a sovereign development environment for a
foreign provider or hosted tool.

It does not admit any provider, assign any new capability to a provider, authorize any call,
or alter production standing.

## 1. Governing principle

> Development convenience is not disclosure authority.

A provider may receive development material only when all of the following are independently
true:

1. the provider has standing for the required functional capability;
2. the provider is explicitly assigned the exact data class being disclosed;
3. the Work Unit already holds the required disclosure authority;
4. external network authority already exists;
5. provider spend authority already exists where spend can occur;
6. the outbound representation satisfies the data-class membrane before transport;
7. the call is bounded and attributable in durable provenance.

No one condition implies another.

## 2. Capability vocabulary

Provider capabilities have two distinct kinds:

- **functional capabilities** — what a provider may do: `chat`, `embedding`, `tts`,
  `stt`, `benchmark`;
- **data classes** — what information a provider may receive: `member_data`,
  `member_audio`, `repository_derived_metadata`, `repository_source`,
  `constitutional_canon`.

A functional capability never implies a data class.

A data class never implies provider execution, network authority, spend authority, or another
data class.
### `repository_derived_metadata`

Fixed-schema, non-content state derived from repository-governed work.

Permitted shapes are closed enums, booleans, bounded numbers, opaque fixed-width identifiers,
and arrays or closed records composed only of those forms.

It excludes repository source, source excerpts, diffs, filenames, paths, symbols, commit
messages, prompts, canon text, constitutional text, member content, free-form prose, and
arbitrary strings.

This class is intentionally **shape-defined rather than subject-defined** so conformance can be
mechanically refused before transport.

### `repository_source`

Repository source or representations that disclose repository content or structure, including
source excerpts, diffs, filenames, paths, symbols, commit messages, or semantically equivalent
material.

This class does not include or authorize `constitutional_canon`.

### `constitutional_canon`

Canon, constitutional text, ratification records, constitutional instruments, founder rulings,
or source material whose authority derives from constitutional standing.

This class is separate from `repository_source` even when canon happens to live in the same
repository.

## 3. Default posture

New repository-derived data classes are **unassigned by default**.

Adding a class to the vocabulary creates no permission for any provider. Assignment to a
provider is a separate reviewed governance act.

Lab-tier providers receive no `repository_derived_metadata`, `repository_source`, or
`constitutional_canon` merely by holding `benchmark` or another functional capability.

## 4. Development-lane authority

Every external development call involving a repository data class requires pre-existing:

```text
network.external
provider.spend                  when the provider can incur spend
disclosure.<exact data class>
provider.execute:<provider>     where provider execution is governed as an act
```

A route, judgment, recommendation, confidence score, or model agreement cannot create or
satisfy any of those authorities.

A missing authority produces **no call**.

## 5. Membrane-before-transport

The disclosure membrane executes before request construction can reach transport.

For `repository_derived_metadata`, any unrepresentable value refuses construction. The host
must not stringify, summarize, hash, bucket, clamp, split, substitute, or otherwise coerce
forbidden material into an allowed shape.

Construction refusal is not model abstention and contacts no provider.
For `repository_source` and `constitutional_canon`, future membranes must be separately
defined before either class can be assigned to an external provider. This candidate deliberately
defines the vocabulary without creating such a membrane or grant.

## 6. Provenance

A lawful development-provider event must make inspectable:

- Work Unit identity held locally;
- exact provider identity;
- provider tier;
- functional capability used;
- exact data class disclosed;
- authority grants relied upon;
- membrane result;
- bounded request identity without leaking a cross-provider correlation handle;
- response admission result;
- spend fact where applicable.

Provider output remains evidence. It is never merge, deploy, production, constitutional, or
Founder authority.

## 7. Relationship to JEV

The ratified J1 Jev packet is `repository_derived_metadata`.

JEV-INT-02H may implement eligibility, exact packet construction, construction refusal,
response admission, advice projection, and authority invariance **without transport**.

This candidate does not authorize Jev transport or assign
`repository_derived_metadata` to Jev/TypeSafe.

Transport may be considered only after:

1. this development-lane governance law is explicitly ratified;
2. the canonical provider capability table contains the three repository data classes;
3. Jev/TypeSafe receives a separately reviewed provider/data-class assignment;
4. network, disclosure, spend, and execution authority are separately satisfied.

## 8. 2026-09-20 interim hold

The standing hold blocks routing `repository_source` or `constitutional_canon` to a foreign
Lab-tier provider at development time.

This candidate **authors** the development-lane law but does not ratify itself.

The capability-table edits in the same candidate make the required vocabulary explicit but
assign the new classes to no provider.

Therefore, until Founder ratification and canonical admission:

```text
dev-lane canon       AUTHORED AS CANDIDATE · NOT RATIFIED
capability classes   PROPOSED IN CANDIDATE
interim hold         STILL OPERATIVE
provider assignment  NONE
external execution   NOT AUTHORIZED
```

## 9. Non-authorization

Nothing here authorizes member data disclosure, repository disclosure, constitutional
disclosure, external inference, provider spend, adapter construction, runtime wiring, merge,
deployment, or production mutation.
