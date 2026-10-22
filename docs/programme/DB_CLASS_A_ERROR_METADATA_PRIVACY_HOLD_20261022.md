# Shared Postgres metadata diagnostic — Class A expected-RED proof

**REVIEW ONLY / HOLD / DO NOT MERGE / NO DATABASE SOURCE CHANGE.**

- Original published source: `clean-main-no-secrets` `ffcab520e346cf2d7cee1f293e509c68afc44ab3`; `lib/db/postgres.ts` Git blob `be8639085eb8190f336590087ea7b5cd2ccc2609`.
- Tests only, no runtime patch. Both `describeDbError` and `query()` in the unchanged actual module execute with a fully mocked `pg.Pool`.
- **Three independently RED negative assertions expected:** untrusted metadata string copying; a hostile getter escaping error formatting; and actual caught query failure emitting fictional marker to `console.error`. Positive controls still enforce redacted query arguments, excluded free-text error message/detail/hint, and 42P01 missing-table propagation.
- Existing `paramRedaction.test.ts` intentionally permits ordinary structural fields `name/code/severity/table/constraint` for recognized database errors. Any correction must preserve useful, truly structural diagnostics while refusing arbitrary/error-shaped strings; do not simply invert old positive assertions.
- High scope: source module is shared by many unrelated services. No source fix can be accepted without designated Class A DB/privacy owner and review of query log sinks, schema/constraint cardinality, SQLSTATE vocabulary, hostile metadata/traps, useful incident observability, and exact rollback.
- Do not collapse a failed query into empty rows or a failed disclosure confirmation into success. Source-only red proof cannot establish an incident or real driver behavior.
- Keep separate from Writer receipt/policy [draft #1931](https://github.com/SoullabTech/Sovereign/pull/1931), negative source #1925, governed router #1922; coordination issue #1934.

**No live SQL, protected Work, account, source original, model call, keys, CI secret, production change, merge or deployment.**
