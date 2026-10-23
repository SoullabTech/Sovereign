# Shared PostgreSQL diagnostic Class A source candidate — independent review ONLY

**DRAFT / HOLD / NO MERGE / NO PROD / NO LIVE DB.**

## Evidence custody
- Original published `clean-main-no-secrets` SHA `ffcab520e346cf2d7cee1f293e509c68afc44ab3`; `lib/db/postgres.ts` Git blob `be8639085eb8190f336590087ea7b5cd2ccc2609`.
- Original [draft #1936](https://github.com/SoullabTech/Sovereign/pull/1936) test-only exact-head `28496f93d46ee70269fcb296ada80272abb4f135`: **5 intentional RED privacy assertions, 17 GREEN controls** in [run 39874308453](https://github.com/SoullabTech/Sovereign/actions/runs/39874308453) against unchanged source.
- This **stacked but isolated candidate** changes only the shared `lib/db/postgres.ts` runtime in separately frozen review commits `5cc5455` and `fec5de2`; the second corrects a regex literal in the newly introduced operation helper. It also adds a new hardening suite and a supplemental no-secret functional CI. Original five negative cases are unchanged.
- The chosen data contract is unapproved. Do not merge or present its engineering tests as constitutional acceptance.

## Proposed diagnostics
- Exception diagnostic values are exact matches against hardcoded, small, server-owned sets, never raw arbitrary metadata. Value-bearing `name`, `code`, `severity`, `schema`, `table`, `column`, `dataType`, `constraint` and `routine` cannot enter logs by accident. Missing/invalid metadata is replaced by `{name:'unknown'}`.
- Hostile properties, accessors and proxies cannot force a formatter exception: only own data descriptors are considered; throwing descriptor traps return a fixed `unknown`.
- Only allowlisted SQL operation verbs (SELECT/INSERT/etc.) are printed on failures and slow-query observations. No raw SQL string, comment, literal, prefix or value is logged.
- Preserve `describeParams` coarse-string protection and `query` error propagation. A PostgreSQL table that cannot be queried is **not** reported as an empty result. Explicit expected SQL trigger refusals still yield `{refused:true}` and emit no log.

## Source-review tradeoffs and open risks
- Existing historic source-custody T7 expects exactly `table:'members'` and `constraint:'members_email_key'` for a known case. This candidate admits these two fixed schema identifiers, while omitting unknown names. Operational usefulness may be reduced; adding names requires explicit privacy-reviewed static provenance and must not use regex truncation or correlation hashes.
- The original SQL statement was often useful for diagnosis but cannot be logged safely when generated dynamically or embedding unparameterized literals. This review prefers a finite operation label and preserved safe parameters' *types*.
- `queryWithExpectedRefusal` still accesses an error's message to identify a declared trigger refusal. That is a **decision predicate, not logged content**; hostile getter, spoofed/refused message and transaction honesty merit separate source regression before deployment.
- This changes a shared infrastructure module used outside Writer; independent cross-service and Docker/build acceptance and actual log pipeline/retention review are mandatory. No complete-system or genuine SQL integration result is claimed.

## Nonwaivable Class A gates
- [ ] Verify exact proposed source Git blob and all original five #1936 negative tests turn green with all existing PostgreSQL regression tests.
- [ ] Independent shared-DB privacy/observability and R20/source-custody review.
- [ ] Review SQLSTATE/status and whitelist operational adequacy, stale indexes and required monitoring without leaking values.
- [ ] Inspect `queryWithExpectedRefusal` string decision, transaction rollback, slow queries, and any other server SQL emitters.
- [ ] Founder-Steward explicitly approves source+rollback **before** any merge/deploy.
- [ ] Apply to one reviewed integrated Writer source with independent router/receipt/policy pins and signoff, consent, archival custody, R20 terminal revocation, iPhone Safari and signed image acceptance.
- [ ] Do not enable Writer Free/Pro invitations, R86P Source ingress, a live MAIA provider, checkout, production database or data migrations.

Rollback of this review is closing the unmerged draft or reverting its review-only source commits; no member data or production exists in this review branch.

Owner [#1934](https://github.com/SoullabTech/Sovereign/issues/1934); neighboring [#1931](https://github.com/SoullabTech/Sovereign/pull/1931), [#1922](https://github.com/SoullabTech/Sovereign/pull/1922), [#1800](https://github.com/SoullabTech/Sovereign/issues/1800).
