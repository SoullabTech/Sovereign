# Materials door — migration and browser verification

Status: read-only review; NO execution, preparation or cutover.

## Compared versions

- Reported production: `c9e4f7f7e` (not revalidated from production in this pass).
- Requested target: `937bc77ea` (base of local protection branch).
- Local protection branch head: `6c15edc18`; contains beta access, fail-closed source POST/PATCH and protocol notes.
- Git diff finds one newly added SQL migration between reported production and target: `database/migrations/20261002000002_writer_studio_chapter_overview_lens.sql`.

## Static migration findings

- SQL transaction uses `SET LOCAL lock_timeout = '5s'`, changes `developmental_readings_commissioned_lens_check`, and replaces `developmental_readings_observations_check()`.
- The constraint extends accepted lens enum to `overview`; trigger validates the nine lenses including overview. No row rewriting DML is present in inspected file.
- This is **not old-reader compatibility proof**. Live production migration ledger, prior trigger semantics, already-saved row compatibility, downgrade behavior and lock/writer interaction require admission through REVIEW-CUSTODY gate.
- The proposed eventual Sanctuary authority will need its own migration and explicit old/new writer overlap evaluation; it is not present in this target.

## Browser witness

- Headless Google Chrome via installed Playwright successfully loads `http://localhost:3100/writers-studio`.
- Browser ends at `/signin?next=%2Fwriters-studio&reason=no_session_cookie...` with HTTP 200 for sign-in page and **zero Materials doors**.
- This proves unauthenticated redirect only. No member login was performed, no cookie was forged, and no Bring/Keep/Explore interaction was witnessed.
- The local server on port 3100 has **not** been verified to execute the isolated protection branch. Browser certification requires running that branch in a dedicated environment and an authorized test session.

## Go / no-go

NO-GO: persistence is intentionally HTTP 423. Release cannot be certified until server-controlled posture, race/crash evidence, migration compatibility and authenticated browser evidence are admitted.
