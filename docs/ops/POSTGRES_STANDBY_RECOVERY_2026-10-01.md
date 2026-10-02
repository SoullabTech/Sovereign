# Postgres Standby Recovery — O2

**Date:** 2026-10-01  
**Status:** PREPARED · host recovery required before reseed  
**Primary:** minisforum · Tailscale `100.119.226.84`  
**Standby:** `ubuntu-8gb-fsn1-2` · last known Tailscale `100.118.111.37`

## Current witnessed state

Read-only production witness on 2026-10-01 established:

- primary `pg_stat_replication` count = **0**
- standby is **offline**, last seen 7 days ago in Tailscale
- direct SSH to `100.118.111.37:22` times out
- primary is replication-capable: `wal_level=replica`, `max_wal_senders=10`, `listen_addresses=*`
- primary `pg_hba.conf` admits replication user `replicator` from the standby address
- primary Postgres is published on the minisforum Tailscale address
- there are **no replication slots**
- `wal_keep_size=64MB`

Because the standby has been absent far longer than the WAL retention window, recovery must assume a **fresh base backup is required**. A simple service restart is not a valid recovery plan.

### 2026-10-02 read-only revalidation

The current-base successor reran `scripts/witness/postgres-standby-recovery-preflight.sh` without mutation.

Observed:

- running production artifact: `12b461bd8778c148060250c002a54079f4f58221`
- primary Tailscale bind: `100.119.226.84:5432`
- `wal_level=replica`
- `max_wal_senders=10`
- `wal_keep_size=64MB`
- `pg_stat_replication` count = **0**
- SSH to `100.118.111.37:22` still times out
- preflight exit = **2**, exactly at the host-reachability gate

Current standing therefore remains:

**PREPARED · PRIMARY REPLICATION-READY · STANDBY HOST UNREACHABLE · NO RESEED AUTHORIZED**

This revalidation updates current runtime identity without rewriting the October 1 witness above.

## Governing rule

Do not touch standby Postgres data until the host itself is reachable and its actual runtime shape has been discovered.

The repository does not contain authoritative standby container/data-directory configuration. Therefore this runbook deliberately refuses to invent:

- standby Postgres service/container name
- `PGDATA`
- package-vs-Docker deployment
- replication credential storage location
- systemd unit names
- disk layout

Those facts must be read from the recovered host first.

## Phase 0 — restore the host, not Postgres

Bring `ubuntu-8gb-fsn1-2` back online through the infrastructure/provider control plane.

Then run from the Mac Studio:

```bash
scripts/witness/postgres-standby-recovery-preflight.sh
```

Expected before proceeding:

```text
primary replication posture ... readable
standby_host=ubuntu-8gb-fsn1-2
pg_basebackup=...
PASS · host is reachable
```

If the script exits 2, stop. No reseed work is authorized by an unreachable machine.

## Phase 1 — read-only standby discovery

On the recovered standby, determine the real deployment shape before stopping anything:

```bash
hostname
date -u
tailscale ip -4
df -h
free -h
ps aux | grep '[p]ostgres'
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' 2>/dev/null || true
systemctl list-units --type=service | grep -Ei 'postgres|docker' || true
pg_basebackup --version
psql --version
```

Then identify, without printing passwords:

- Postgres major version
- service/container that owns the standby
- actual `PGDATA`
- filesystem containing `PGDATA`
- where replication credentials are supplied (`.pgpass`, environment, secret file, container secret)
- whether `standby.signal` exists
- current `primary_conninfo` hostname/address
- whether the existing standby is in recovery

Read-only examples once `PGDATA` is known:

```bash
test -f "$PGDATA/standby.signal" && echo standby_signal=present || echo standby_signal=absent
grep -n '^primary_conninfo' "$PGDATA/postgresql.auto.conf" 2>/dev/null | sed 's/password=[^ ]*/password=<redacted>/g'
psql -Atc 'SELECT pg_is_in_recovery();' 2>/dev/null || true
```

### Stop conditions

Stop and investigate rather than reseeding if:

- standby Postgres major version differs from primary
- disk cannot hold both the old cluster and a complete fresh base backup
- replication credentials are absent or cannot authenticate
- the recovered machine is not actually the intended standby
- another process is actively using the standby data directory
- primary settings differ materially from the recorded witness

## Phase 2 — re-witness primary immediately before reseed

From minisforum:

```bash
docker exec maia-postgres psql -U soullab maia_consciousness -Atc "
SELECT 'wal_level=' || current_setting('wal_level')
UNION ALL SELECT 'max_wal_senders=' || current_setting('max_wal_senders')
UNION ALL SELECT 'wal_keep_size=' || current_setting('wal_keep_size')
UNION ALL SELECT 'replication_rows=' || count(*)::text FROM pg_stat_replication;
"
```

Also verify the primary still listens on the intended Tailscale bind and that the replication `pg_hba` entry still admits `100.118.111.37`.

Do not rotate replication credentials as part of the same act unless evidence says the existing credential is invalid. Host recovery and credential rotation are separate causes.

## Phase 3 — preserve the old standby before replacement

This phase is intentionally not copy-paste automatic because the host runtime shape is presently unknown.

Once `PGDATA` and the owning service are established:

1. Stop only the standby Postgres service/container.
2. Verify no Postgres process still owns `PGDATA`.
3. Preserve the old cluster by rename/snapshot rather than deletion, e.g. conceptually:

```text
<PGDATA>  →  <PGDATA>.pre-reseed-20261001T...
```

4. Create a new empty target directory on the same intended filesystem.
5. Re-check free disk space after preservation.

**Never run `rm -rf $PGDATA` as the first recovery act.**

The preserved cluster is evidence and rollback material until streaming is re-established and witnessed.

## Phase 4 — fresh base backup

Use the recovered host's existing replication credential mechanism. Do not place the replication password in shell history or a process argument.

The canonical shape is:

```bash
pg_basebackup \
  -h 100.119.226.84 \
  -U replicator \
  -D "<NEW_PGDATA>" \
  -Fp \
  -Xs \
  -P \
  -R
```

Meaning:

- `-Fp`: plain cluster directory
- `-Xs`: stream WAL during the copy
- `-P`: visible progress
- `-R`: write standby configuration and `standby.signal`

Do **not** create a replication slot as an incidental part of this recovery. The current architecture has no slots; adding one changes WAL-retention semantics and requires a separate decision.

A failed or interrupted `pg_basebackup` is not a usable cluster. Discard only the incomplete **new** target after confirming the preserved pre-reseed directory is intact.

## Phase 5 — start and prove recovery

Start the standby service/container using its existing deployment mechanism.

On the standby:

```sql
SELECT pg_is_in_recovery();
SELECT status, sender_host, sender_port, latest_end_lsn, latest_end_time
FROM pg_stat_wal_receiver;
```

Required:

- `pg_is_in_recovery() = true`
- one WAL receiver row
- receiver status indicates streaming
- sender host resolves to the minisforum primary

On the primary:

```sql
SELECT application_name, client_addr, state, sync_state,
       sent_lsn, write_lsn, flush_lsn, replay_lsn
FROM pg_stat_replication;
```

Required:

- exactly the expected standby appears
- `client_addr = 100.118.111.37`
- `state = streaming`
- replay/flush positions advance under normal write traffic

## Phase 6 — lag witness

Measure actual replay lag rather than declaring streaming sufficient.

Primary:

```sql
SELECT pg_current_wal_lsn();
```

Standby:

```sql
SELECT pg_last_wal_replay_lsn(), pg_last_xact_replay_timestamp();
```

Record the observations with UTC timestamps.

Do not call O2 closed merely because the TCP connection exists.

## Phase 7 — closure and rollback material

O2 may close only when:

1. standby host is online and stable
2. `pg_stat_replication` shows the expected streaming standby
3. standby reports recovery mode + active WAL receiver
4. replay is advancing
5. no unexpected replication slot was introduced
6. preserved pre-reseed cluster remains available until the witness is accepted

After acceptance, disposition of the preserved old standby directory is a separate cleanup act.

## What this runbook does not authorize

- deleting the old standby data before preservation
- modifying the primary schema
- promoting the standby
- creating replication slots
- changing replication authentication policy
- changing the production primary bind address
- treating off-host backups as a substitute for re-established streaming replication

The Mac Studio off-host dumps are valid disaster-recovery evidence, but they do not satisfy O2's claim that a streaming standby exists.
