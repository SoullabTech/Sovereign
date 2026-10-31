# Writer's Studio journey test (WJ-1)

Drives a real browser through a built copy of the app against a throwaway, local-only database seeded with fictional writers (journey_alice and journey_bob on the beta roster and marked for the Writer pilot; journey_carol off the roster; journey_dave an active beta tester NOT marked for the pilot). No production data, no real credentials, no network beyond localhost.

Run: `bash tests/e2e/writers-journey/run-journey.sh [--build] [--defeat MODE] [--keep]`

## What it checks
- S01-S09 Alice signs in, begins a Work, writes, sees it saved on the server, returns and finds it, imports by paste.
- S13-S18 Bob and Carol, Dave (a beta tester without the Writer marker) and signed-out visitors cannot reach Alice's words; Carol and Dave are refused the studio, and Carol the Writer corridor's API.
- S19 no uncaught page errors during the journey.

## Regression test: KD-1
KD-1 and KD-2 (both fixed) are kept as regression tests: first characters stay in order when typing right after "Just start writing"; the caret stays on its line after a space at the end of a paragraph.

## Proof the test can fail (`--defeat`)
- `no_roster`: Alice removed from the roster -> fails at S02.
- `no_marker`: Alice stays an active beta tester but loses the Writer pilot marker (ops_contacts.metadata.writers_studio_beta) -> fails at S02.
- `bad_password`: wrong password -> fails at S01.
- `block_autosave`: saves blocked -> fails at S06.

## Not covered
Original-file import (DOCX/PDF), mobile, the invitation email path, load, anything involving real members.
