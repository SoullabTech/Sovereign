# R20 PostgreSQL 16.13 two-target fictional witness — review only

Class A engineering reference — October 22, 2026 — HOLD.

This PR introduces one Python-standard-library witness and a dedicated GitHub Actions workflow. It does not modify production application code, original Writer files, existing R20 restore scripts, mail providers, credentials, or backup retention. Every test identifier and file is fictional.

## Why this exists

The October 16 founder-authorized real-backup rehearsal passed on the database-only R20 procedure. Separately, an offline package passed 116 fictional TAR preflight, vault staging, and SQLite model tests. This candidate adds actual PostgreSQL 16.13 execution for a two-target FICTIONAL model, rather than treating SQLite as equivalent to PostgreSQL.

## Exact CI behavior

GitHub Actions creates a temporary postgres:16.13-bookworm Docker container with networking disabled, no published ports or bound volumes, and tmpfs storage for the database and /tmp. The witness refuses an unexpected container identity, image, network mode, mount, or version.

1. Seed fictional deleted and surviving manuscripts, Works and session fragments in PostgreSQL.
2. Capture an OLD pg_dump before a fictional delete.
3. Generate a NEWER independent synthetic HMAC deletion ledger and high-water.
4. Restore the old SQL twice into separate EMPTY replacement PostgreSQL databases.
5. Apply the newer deletion metadata and actual PostgreSQL INSERT/UPDATE triggers refusing deleted manuscript IDs, Work IDs, session scopes, and new/rewritten Work references to deleted manuscripts.
6. Recreate a strictly whitelisted FICTIONAL vault archive in each private stage; erase doomed bytes and verify the unaffected file survives.
7. Assert policy-specific PostgreSQL refusal messages (not merely any SQL error), unchanged survivor identity/content/reference and unchanged tombstone counts. The receipt separately confirms the doomed fictional vault bytes are absent.
8. Remove temporary data and the Docker test container.

The witness requires --fictional-only and suppresses raw database command errors in output. It does not access actual member data, real signatures, real recovery archives, or services.

## Scope limitations / review HOLD

The reference is NOT the unpublished Writer/JARVIS coherent recovery script or production database schema. Its fictional ledger uses a test-generated HMAC key, not the real Ed25519 signing custody/high-water. Its tar handling is fixture-specific, NOT the production-grade archive preflight and stager under issue #1919. It does not prove full R20 vault recovery, crash recovery, live mount identity, worker pause, ownership/TOCTOU security, production release or consented email deliverability.

The previous INSERT-only triggers could be bypassed by UPDATE reassignment and by a surviving Work pointing at a deleted manuscript. The negative control was deliberately added before the fix; the corrected fixture requires PostgreSQL 16.13 to reject these writes. This neither tests nor changes live Soullab code.

A passing workflow would be real PostgreSQL execution for THIS FICTIONAL MODEL ONLY. It is never a production authorization. Independent Class A exact-source review, real protected vault custody, full two-target coherent recovery, and a separate founder release decision remain required.

Related HOLD: Mail #1803, R20 crypto #1914, vault path #1915, archive #1919, and draft vault PR #1916. Do not reactivate Resend.
