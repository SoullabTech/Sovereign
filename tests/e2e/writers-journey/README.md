# Writer's Studio journey test (WJ-1)

Drives a real browser through a built copy of the app against a throwaway, local-only database seeded with fictional writers (journey_alice, journey_bob on the beta roster; journey_carol off it). No production data, no real credentials, no network beyond localhost.

Run: `bash tests/e2e/writers-journey/run-journey.sh [--build] [--defeat MODE] [--keep]`

## What it checks
- S01-S09 Alice signs in, begins a Work, writes, sees it saved on the server, returns and finds it, imports by paste.
- S13-S18 Bob and Carol (and signed-out visitors) cannot reach Alice's words; Carol is refused the studio and the Writer corridor's API.
- S19 no uncaught page errors during the journey.

## Regression test: KD-1
KD-1 (fixed): typing immediately after "Just start writing" keeps the first characters in order; kept as a regression test.

## Proof the test can fail (`--defeat`)
- `no_roster`: Alice removed from the roster -> fails at S02.
- `bad_password`: wrong password -> fails at S01.
- `block_autosave`: saves blocked -> fails at S06.

## Not covered
Original-file import (DOCX/PDF), mobile, the invitation email path, load, anything involving real members.
