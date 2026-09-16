# SOURCE-CUSTODY-PII-01 · R12 Pre-Merge Record

**Date:** 2026-09-16
**Base:** `98542ff06e863ee07c7a5d7f105989a56913dd02`
**Branch:** `fix/source-custody-r12-20260916`
**Act:** replace recoverable invitation credentials with one-way lookup custody.

## Ruling carried

Invitation plaintext exists only at issuance and in the recipient/member's possession. The system persists a domain-separated SHA-256 lookup hash, never a recoverable copy. Prefix or historical membership never constitutes invitation authority.

Existing member passkeys remain returning-member identifiers only. They do not admit a new person, validate the beta gate, or grant practitioner portal standing.

## Production precondition

Before implementation, production held exactly **1 pending invite**. Shape-only classification established:

- strong current invite format: **1**;
- weak/legacy pending format: **0**.

The R12 migration therefore may hash-migrate the one pending invite. It refuses before mutation if any weak pending credential appears.

## Storage and admission law

New issuance:

1. generate a cryptographically strong `SOULLAB-…` credential;
2. normalize and hash with domain `soullab-invite-v1:`;
3. persist `passkey = NULL` and `passkey_hash = <64 hex>`;
4. return plaintext only in the create response with `no-store`;
5. later list/revoke paths never select plaintext.

Both Next and standalone `maia-api` carry the same normalization/hash law and a shared test vector.

The two public legacy admission oracles no longer contain credential corpora. They authorize only a real pending, unexpired invite. The practitioner beta path is grounded in the authenticated member's governed `ops_contacts` beta record; `SOULLAB-*` possession has no portal authority.

## Deployment-order composition

Production deploy order is `build → swap reader → apply migrations`. R12 therefore cannot assume `passkey_hash` exists at first process start.

The bounded bridge is:

- existing invite reads attempt hash first;
- only SQLSTATE `42703` / specifically missing `passkey_hash` permits a temporary legacy read;
- all other lookup failures remain fail-closed;
- invite creation probes for `passkey_hash` and returns **503** before generating or writing a credential when schema is behind;
- after migration, plaintext is cleared and the bridge becomes unreachable.

## Invitation-room experience evidence

The changed member-facing surface is governed by `docs/design/contracts/invitations-threshold.md`.

Real `InviteManager` code was served locally and walked in system Chrome at:

- desktop: **1440 × 1000**;
- mobile: **390 × 844**.

The harness intercepted only the identity/invite API facts needed for a coherent synthetic session and pinned the synthetic local identity against the app's identity-healing cleanup. It did not mutate production or alter application source for the walk.

Both captures show simultaneously:

- transient `Copy this passkey now` plaintext handoff with copy gesture;
- explicit statement that only the one-way hash is stored;
- `I've saved it — hide this passkey` dismissal;
- persistent invite row saying `Passkey hidden after creation` with status/recipient/dates and no recoverable credential.

Evidence:

- `docs/design/contracts/screenshots/invitations-threshold-desktop.png`
- `docs/design/contracts/screenshots/invitations-threshold-mobile.png`

The first mobile capture was rejected because an unrelated transient audio toast overlapped the invite card; the committed evidence is the clean recapture after the toast cleared.

## Final exact-tree witnesses

- focused suites: **5 / 5 PASS**;
- focused tests: **50 / 50 PASS**;
- root TypeScript: **229 errors vs baseline 239 · 0 regressions**;
- standalone `apps/api` typecheck: **PASS**;
- standalone `apps/api` build: **PASS**;
- provider governance: **PASS**;
- no-Supabase: **PASS**;
- design canon: **PASS** with one experiential contract;
- `git diff --check`: **PASS**;
- full Next production build: **RC = 0** on the final tree.

The Next build emitted existing warn-only unresolved internal imports and the existing SWC-version/Browserslist warnings; none failed the build.

## Holds after merge

Merge does not itself establish production completion. Production witness must verify the migration applied, pending plaintext count is zero, pending hashes are populated, admission works by hash, and create/list/revoke obey one-time-reveal custody.

Only after that witness may the remaining tracked human-record sources and their obsolete consumers be removed. Corpus rebuild/history remediation remain separate acts.

## Independent PR review amendments

Review after PR creation found two R12-specific defects before merge:

1. **Issuance atomicity.** Hash-only invite insertion and invite-allowance decrement were separate commits. A decrement failure after insertion would leave an unrecoverable pending invite while returning 500. They now execute in one database transaction, with a conditional allowance update; failure rolls the insert back.
2. **Database enforcement.** Clearing plaintext did not by itself prevent a future writer from storing it again. The migration now adds `invites_plaintext_forbidden CHECK (passkey IS NULL)`, making plaintext invite persistence structurally invalid after R12.

After these amendments, the full focused set is **50 / 50 PASS** and the exact amended tree again completes a full Next production build with **RC = 0**.

A repo-wide writer census found exactly one application writer of `invites`: `app/api/invites/create/route.ts`, now hash-only and transactional. No trigger or sibling writer repopulates `invites.passkey`.

The review also clarified scope: historical `members.passkey` remains a returning-member identifier/recovery artifact. Password sign-in authenticates with username/password, and an existing-member passkey is refused as a new-person registration credential. R12 retires those historical values from invitation admission and portal authorization; it does not claim to erase every member identity field.
