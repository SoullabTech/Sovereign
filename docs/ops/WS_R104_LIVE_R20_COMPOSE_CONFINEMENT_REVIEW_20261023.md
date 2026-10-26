# R104 — Live R20 authority mount provenance and isolated Compose confinement review

**October 23, 2026 | READ-ONLY production observation; SYNTHETIC Compose only | Production and Writer beta HOLD**

## Observed production configuration (no key or manuscript opened)

The running `maia` and `maia-media-worker` containers were inspected via read-only Docker metadata on Minisforum. The active Compose input chain includes `docker-compose.production.yml` plus `docker-compose.r20-v5.override.yml`; the worker also includes `docker-compose.worker-b.review-only.yml`. All those active files exist on the server, but **the R20 override and review-only worker file are not in the frozen R103 Git tree**, and the running server's base production Compose SHA differs from that branch's tracked Compose SHA.

The effective **media worker** has the R20 authority directory read-write, the R20 ledger-key mount read-only (with effective read access independently noted in R98), the original manuscript vault read-write, and media read-write. The **main application also retains the R20 authority and ledger-key mounts**. This shows the R20 deletion/signing key and file authority are **not administratively independent of the running application and media worker**. A read-only key mount protects against mutation of that mounted file, **not against using the credential's contents**. No misuse or member-content disclosure was demonstrated.

Exact hash-bound observations are in `docs/ops/WS_R104_LIVE_R20_DOCKER_AUTHORITY_MOUNTS_20261023.json` (no host source paths, credentials, member IDs or file contents).

## What the offline counterexample proves—and does NOT

This lane constructed only three *clearly synthetic* small Compose files under `scripts/ops/fixtures/r104/`. The first two reproduce the same **mount classes** seen live, using imaginary paths and image names. A third, **review-only** Compose `!override` keeps the worker's media mount but removes its R20 key, writable authority and manuscript vault mounts.

`docker compose config --format json` on Docker Compose v5.6.1 confirms:

- The risky fictional configuration gives the worker four mount targets: media, R20 authority, R20 key, vault.
- Adding the proposed `!override` gives the fictional worker **only media**, retaining the main application's own mounts unchanged.
- No container was created, no actual runtime configuration was read into the fixture, no network requests made, and **nothing was deployed**.
- Server Docker Compose was separately observed at v5.1.1, but **no real deployment-config render or media-worker functional smoke test has yet been approved or conducted**. This is a syntax/convergence hypothesis, not release authority.

The synthetic result cannot prove the worker's actual media processing, existing jobs, thumbnails or any Source-dependent workload functions without the vault. Nor can it make R20 administration independent while the main app still shares the ledger key and authority directory.

## Class A remediation sequence — requires a separately approved owner decision

1. **Freeze the effective *live* Compose provenance:** independently review all three active source-file hashes and why the R20 override and worker review-only overlay were deployed outside the reviewed Git tree. Review with secrets redacted and pin one governed composition chain. No blind deploy from the older base YAML.
2. **Understand workload use:** establish whether the media worker legitimately requires any private Source vault or signer access. Identify substitute narrowly scoped capability/queue grant if needed, and cover the media ingest/transcode failures and all author privacy access paths.
3. **Narrow the worker:** under approved Class A change control, generate the reviewed *real* Compose candidate with explicit mount-replacement semantics. Before applying it, prove rendered worker targets contain **only approved mounts** and that no inherited override can silently re-add R20 material. Carry out a controlled worker-only canary with actual permission-negative tests, workload health, prepared rollback and output-integrity receipts. Don't delete key material or historical archives.
4. **Independent governance still required:** move real R20 grant/consent/deletion monotonic highwater and signing authority to an independently administered trust boundary with separate keys, identities, admin accounts and revocation/evidence storage; even removing worker mounts does **not** by itself make the main app an independent witness.
5. **Source and recovery also remain red:** actual production uses the unchanged SQL→gzip plaintext backup, old SQL archives, WAL archive off and multiple persistent vault/media/audit stores outside SQL-only backup. A separate, deletion-safe full backup and cold-restore witness must pass before accepting unpublished manuscripts.
6. **No automatic production rollout:** a security reviewer and founder must approve exact source, operator, functional and restore evidence, reversible change, and then a distinct beta release decision. First only two individually verified authors; wider beta and paid Free/Pro remain HOLD.

## Acceptance evidence of this lane

The R104 TypeScript runtime-snapshot gate always returns **HOLD** even when a synthetic worker override renders correctly. It refuses forged source identity, absent/altered mounts, claims of independent administration, and any attempt to unlock Writer original uploads. Its tests and synthetic Compose rendering are reviewed before committing; existing R102/R103 signed fictional author/reader checks remain unchanged.

**Disposition: independent live source/mount finding confirmed, proposed fictional worker reduction rendered; no production fix or beta admission performed.**
