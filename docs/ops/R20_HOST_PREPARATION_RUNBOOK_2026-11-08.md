# R20 host preparation runbook (2026-11-08)

```
STATUS:    Candidate document, on branch claude/ops-r20-host-preflight-20261108. Nothing in
           it has been run on the host. It establishes no host fact. Edited in place on
           2026-11-08 by PR-C (a draft candidate, branch claude/ops-r20-compose-wiring-20261108,
           stacked on the branch above) to carry the decided names (section 0a) and the
           witness step (step 4b). Those names are decisions TAKEN UNDER DELEGATION, NOT
           FOUNDER RULINGS, and are revisable.
STANDING:  R20 was reported NOT configured on the app container (REPORTED: founder readout of
           2026-11-06, names only; not re-read since; .env.production is not in the repository,
           so its contents are not established). Register line C1
           (docs/ops/NON_DELIVERY_REGISTER.md) stays OPEN. This runbook, and the preflight
           script it names, configure and deploy nothing and change nothing that persists
           (the script's one write is a probe file it creates and removes, step 4).
OUTCOME:   Followed in full, R20 is intended to become FUNCTIONAL, NOT INDEPENDENT (section 0,
           point 1). That it does depends on the compose wiring (PR-C, a draft candidate: not
           merged, not applied), the host mapping, and Compose recreating a service whose
           env_file changed; none is witnessed.
```

Source reads in this document are at commit:`b46113f8d41cce7703b631b614b1bb2e99742c1d`, the canonical commit this branch was
built on, unless another commit is named. Evidence classes are the register's: **SOURCE** (read
in code or a tracked file at a named commit), **RECORD** (stated in a programme or ops record,
cited by path), **REPORTED** (said by the founder or another session; not located in source). A
claim about the live host carries one of these labels or is marked **not established**. Angle
brackets are placeholders, never values. The only host paths in this document are the three
decided host-side names of section 0a (and the two directories that hold them), which are
names and not secrets. It contains no host name, key or secret, and nothing recorded from its
steps may contain a key, a member, Work or file identifier, or any path other than those names.

## 0. Read this first

1. **At most R20 becomes functional; it does not become independent.** Getting the seal to
   work is not the same as getting an independent witness. In the layout proposed in lane record 6.10 the app container
   would hold both the key and the authority directory, and the caveat that governs this is
   already on record:
   - Lane record section 6.10, note (e): "The R104 and R105 caveat stands. The app, and any
     container sharing the key, holds both the key and the authority directory, so the ledger
     is not an independent trust boundary in this layout; R105 requires an independent R20
     authority to remain a separate hold. This change would make the seal work. It would not
     make it independent."
   - R104 (`docs/ops/WS_R104_LIVE_R20_COMPOSE_CONFINEMENT_REVIEW_20261023.md`, line 9): "A
     read-only key mount protects against mutation of that mounted file, **not against using
     the credential's contents**." Line 24: "Nor can it make R20 administration independent
     while the main app still shares the ledger key and authority directory."
   - R105 (`docs/ops/WS_R105_ERASURE_LIVENESS_AND_REDACTED_ERROR_REVIEW_20261023.md`, line
     27, acceptance item 3): "even after worker R20 mounts are removed, the main app retains
     the R20 key/authority. Separate R20 signer and monotonic nonrollbackable deletion
     highwater remain Class A HOLD."

   Nothing in this runbook, in the preflight output, or in any record of a run may describe the
   result as independent. Section 3, step 8 lists what it does not give you.

2. **This runbook and the preflight change nothing that persists.** They read and they instruct;
   the preflight's only write is one probe file that it creates and removes (step 4). The wiring
   that gives the app its three R20 names and its two host mounts is a **separate change
   (PR-C, a draft candidate)** and it, not this document, binds the names of section 0a. PR-C
   must not merge until the preflight has passed on the host under the exact host-side names
   that PR-C's compose binds (step 4), and until that run is recorded as the witness file of
   step 4b. While the witness is absent or does not match, PR-C's own check fails, so its CI is
   red by design (where that check runs in a gate pull requests must pass) and the change cannot
   be merged, or auto-merged, by mistake. The witness is a
   gate on a deliberate act, not proof of the host (step 4b). Merging is not applying, but it is
   latent deploy authorization: a later full `deploy` or `update` of a commit that carries the
   compose applies it without a further act (lane record sections 6.11 and 6.13; the 2026-09-07
   finding).

3. **The deploy tooling has no host-prerequisite check.** Nothing in
   `scripts/deploy-production.sh`, `scripts/deploy-context.sh` or `scripts/pre-deploy-gate.sh`
   checks that a bind-mount source exists before the swap (SOURCE: a search of those files for
   the SMTP and KMS file names, `create_host_path` and `/run/secrets` finds no check; its one
   hit is an unrelated comment about alert mail, `deploy-production.sh` line 403). The only
   guard is `create_host_path: false` on the two credential binds
   (`docker-compose.production.yml` lines 212-217 and 219-224 at the base commit), which turns a
   missing source into a failure when the container is created. PR-C adds two more binds that
   lean on exactly that guard and nothing else (the authority directory and the key, section
   0a). In `deploy` that moment is `up -d`
   (`scripts/deploy-production.sh` line 760), which comes AFTER the image build (739), the
   committed migrations (754) and the rollback-tag rotation (757); `update` runs the same order
   (build 828, migrations 841, tags 844, `up -d` 846). `set -e` (line 27) then ends the script
   with compose's own message, and the recovery hint at lines 766-775 prints only when the
   post-swap provenance check fails, not when `up -d` itself fails. **Whether the old `maia`
   container is already stopped when that happens is not established**: the repository records
   no observation of a missing `create_host_path: false` source. `rollback` composes from the
   shared checkout's `docker-compose.production.yml` (lines 31 and 1134), so a bind source added
   to that file would be inherited by it (an inference; no rollback with a missing bind source is
   recorded). `docs/ops/IMMUTABLE_SHA_DEPLOY.md` lines 239-242 records, under "Not repaired",
   that `rollback` and the hot-swap paths launch with the checkout's compose because they have
   no snapshot; that passage is about launch provenance and does not list bind sources. So
   every host prerequisite below must be true BEFORE the wiring is deployed, and today the only
   thing that checks is a person running the preflight.

4. **Labels.** This document was written from a repository checkout, with no access to the host
   or to production. Every host-facing line below says what to run and what to record. Record
   **names, counts, modes and owner uids only**: no path, no key, no key length beyond a check's
   pass or fail, no member, Work or file identifier, no file content. The ledger holds
   identifiers (member, session and object ids, a manifest's authorized-by and note), not prose
   (`lib/recovery/r20DeletionLedger.ts` lines 19-37, 189, 228-258): treat it as private.

## 0a. The names (decided under delegation, not founder rulings, revisable)

These are decisions D1 to D4 of lane record section 6.13, **taken under the founder's delegation
and not ruled by the founder**. Any of them can be changed, but a change to a name means a change
to the compose in PR-C, a rerun of the preflight under the new names and a new witness (step 4b),
because the witness binds the names.

| What | Host side | Container side | Notes |
|---|---|---|---|
| R20 home directory | `/home/soullab/.config/soullab-r20` | not mounted | Created in step 2. Holds the authority directory and the key as siblings. Mode 0700, owner uid 1000 |
| Authority directory | `/home/soullab/.config/soullab-r20/authority` | `/run/r20`, read-write | The bind source. Mode 0700, owner uid 1000. A DIRECTORY, because the module writes a temp file and renames it in the same directory |
| Ledger file, `R20_LEDGER_FILE` | `/home/soullab/.config/soullab-r20/authority/ledger.json` | `/run/r20/ledger.json` | Not a bind source. Must not exist before the first seal creates it (step 2) |
| High-water file, `R20_HIGH_WATER_FILE` | `/home/soullab/.config/soullab-r20/authority/high-water.json` | `/run/r20/high-water.json` | Not a bind source. Same rule as the ledger |
| Key file, `R20_LEDGER_KEY_FILE` | `/home/soullab/.config/soullab-r20/ledger.key` | `/run/secrets/r20_ledger_key`, read-only | The bind source. A sibling of the authority directory, never inside it. Mode 0600, owner uid 1000 |

- The precedent in the compose file is the SMTP and KMS binds of `maia`: long-form binds with
  `create_host_path: false` under `/home/soullab/.config/soullab-*/`.
- `R20_LEDGER_ALLOW_INITIALIZE` is **never** in the tracked compose. It is a one-shot line in the
  untracked `.env.production`, set and removed in step 6.
- **The compose is the authority for these names.** `node scripts/check-compose-r20-wiring.mjs
  --print-preflight-command` prints the preflight command with the three host paths derived from
  the compose, and `--print-names-digest` prints the digest of the same three paths. If the
  printed paths differ from the table above, the compose governs and this table is stale: stop
  and correct the document.
- That the home directory is mode 0700 is a choice made in this runbook, not a decided name; the
  preflight does not check the home directory, only the authority directory and the key.
- Nothing in this table says that anything exists on the host. Step 0 finds out.

## 1. What the code needs (SOURCE)

All from `lib/recovery/r20DeletionLedger.ts` at the base commit. The file contains a NUL byte;
read it with `grep -a`, or a search will skip it.

- **Three names**, each set and an absolute path, checked in this order: `R20_LEDGER_FILE`,
  `R20_HIGH_WATER_FILE`, `R20_LEDGER_KEY_FILE` (lines 87-90, 262-268). Unset or relative gives
  `R20_LEDGER_FILE_MISSING`, `R20_HIGH_WATER_FILE_MISSING` or `R20_LEDGER_KEY_FILE_MISSING`.
- **The key** is re-read on every seal and every verify (lines 273, 287): there is no caching,
  so a fixed key file takes effect on the next seal. Any read error is
  `R20_LEDGER_KEY_UNAVAILABLE`; a decoded length other than 32 bytes is
  `R20_LEDGER_KEY_INVALID` (lines 92-106). **There is no ownership or mode check in the
  module**: the host's modes are the only protection, and the preflight is where they get
  checked. Accepted forms, from lines 99-104:

  | Form of the key file | Result |
  |---|---|
  | 64 hexadecimal characters, either case, surrounding whitespace trimmed (the `openssl rand -hex 32` shape; the form one repository witness uses, `scripts/witness/ws-legacy-source-recovery-pg16.sh` lines 142-143) | accepted, 32 bytes |
  | base64 of 43 characters plus one `=` (the `openssl rand -base64 32` shape), whitespace trimmed | accepted, 32 bytes |
  | base64 of 44 characters with no padding | **always rejected**: it decodes to 33 bytes, so that branch of the code can never succeed |
  | raw bytes | accepted only if exactly 32; a 32-byte raw key plus a trailing newline is 33 bytes and is rejected |
  | base64url, or an empty file | rejected |

- **Writes.** Only the ledger and the high-water file are written; the key never is. Every
  write (lines 135-149): create the directory if absent (mode 0700); create a temp file named
  from the target, in the SAME directory, with flags `wx` and mode 0600; fsync it; rename it
  over the target; open the directory and fsync it. The ledger is written first and the
  high-water file second, as two separate writes (lines 322 and 326). So the process needs
  read, write and search on the DIRECTORY, and the mount must be the directory, not a single
  file (an inference from rename semantics; not tested in the repository). A failed write
  leaves its temp file behind. Nothing chmods or chowns.
- **The first seal.** `R20_LEDGER_ALLOW_INITIALIZE` is honoured only when its value is exactly
  `true`, and only when both files are absent (lines 288-304):

  | Ledger file | High-water file | Flag | Result |
  |---|---|---|---|
  | absent | absent | unset | `R20_HIGH_WATER_MISSING` |
  | absent | absent | `true` | generation 1 is written from every manifest, scope and tombstone row |
  | present | absent | any | `R20_HIGH_WATER_MISSING` |
  | absent | present | any | `R20_LEDGER_MISSING` |
  | present | present | any (ignored) | the verify path runs |

  The flag is read from `process.env` at call time, so it cannot be unset in a running
  container without recreating it.
- **Verify** (lines 270-282, 158-183) needs the ledger's HMAC, its payload hash and the
  high-water HMAC to be valid, the two generations equal (`R20_LEDGER_STALE_GENERATION`) and
  the SHA-256 of the ledger file's exact bytes to equal the high-water digest
  (`R20_LEDGER_STALE_DIGEST`). Rolling back ONE of the two files is therefore detected. A
  consistent, validly signed OLD pair is not. A seal also refuses with
  `R20_LEDGER_DATABASE_REGRESSION` if a row it sealed earlier is missing or changed in the
  database (lines 206-226, 309).
- **An unchanged payload writes nothing** (lines 308-312). A directory the container cannot
  write therefore fails only at the first seal whose payload has changed, not at startup.

## 2. What changes for members once the seal works (SOURCE)

- **A writing Delete** answers 200 `{removed:true, workRemoved}` instead of 500
  `custody_incomplete` with `unconfirmed.deletionRecord`, provided the original file and the
  image were also confirmed destroyed (`app/api/sovereign/manuscripts/[id]/route.ts` lines
  263-282; `lib/manuscript/source/eraseManuscript.ts` lines 291-309). The member stops seeing
  the notice that says the independent record of the deletion could not be confirmed. Remove
  and the X8 cleanup do not call the seal and are unaffected (register C4).
- **The two unfinished-upload discard paths change too.** `discardUnclaimedArrival` (line 113) and `discardIncompleteLanding` (line 142)
  seal BEFORE they destroy bytes. Today the seal throws, they return `erasure_pending`, and
  `app/api/sovereign/manuscripts/unfinished-uploads/discard/route.ts` (lines 62-87) answers
  202 `removal_pending` with no bytes destroyed in that call. Once the seal works they go on to
  `destroyVaultBytes`, clear the queue row and answer 200 `{result:'removed'}`. The retention
  sweep calls `discardIncompleteLanding`, but nothing schedules it (its script header says
  "NOT WIRED"). Step 5 counts what these doors could act on.
- **The seal runs after the delete transaction commits.** Deletions are committed either way
  (`eraseManuscript.ts` lines 103-110 against 291-301). What a failed seal changes is what the
  member is told, not whether the rows are gone.
- Operators lose the repeated log line `[MAIA/press] R20 recovery seal still owed { code }`
  (`eraseManuscript.ts` line 299). **No retry and no alert for a failed seal exists**; that is
  the second half of C1's closure condition and this runbook does not supply it.

## 3. Steps, in order

Do these on the host, in your own terminal, as the person who will own the files. The key in
step 3 must never pass through a chat or a session: generate it where it will live, and do not
run step 3 through any tool that records its output. Each step says what to run, what to record,
and when to stop. Every command only reads, except steps 2, 3 and 6, the delete in step 7, and the
preflight in step 4, which changes nothing that persists: it creates and removes one probe file.

**Step 0. Discover what already exists (read-only).** The October 2026 live override
`docker-compose.r20-v5.override.yml` is not in Git (RECORD: R104 line 7), and R104 (dated
2026-10-23) recorded that the running app and worker mounted an R20 authority directory and key
through it. Whether that directory, a ledger and high-water pair, or a key still exist on this
host is **not established**. The statement in lane record 6.10(b) that the two files "must not be
pre-created" assumes a clean host. Find out first:

```
# 0a. Names (never values) starting R20_ in the running app container, or "none"
docker exec <app-container> sh -c 'env | cut -d= -f1 | grep "^R20_" || echo none'

# 0b. Mount type, destination and read-write flag of the app container (no sources printed)
docker inspect <app-container> --format '{{range .Mounts}}{{.Type}} {{.Destination}} rw={{.RW}}{{"\n"}}{{end}}'

# 0c. File NAMES (not directories) of the compose files the container was started with
#     (Compose records them in a container label; if the label is empty, record that instead)
docker inspect <app-container> --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}' | tr ',' '\n' | sed 's|.*/||'

# 0d. Compose files beside the project (names only)
ls -1 <compose-project-dir> | grep -E '^docker-compose.*\.ya?ml$'
```

If the earlier override or a mount shows an R20 directory, read the override on the host
yourself (it names the real paths; do not paste it anywhere) and, for that directory only:

```
id -u                                              # your uid
stat -c '%F %a %u' <candidate-dir>                 # type, mode, owner uid
if test -r <candidate-dir> && test -x <candidate-dir>; then echo readable; else echo UNREADABLE-STOP; fi
ls -1A <candidate-dir> | wc -l                     # number of entries
test -e <candidate-ledger-file>     && echo ledger-present     || echo ledger-absent
test -e <candidate-high-water-file> && echo high-water-present || echo high-water-absent
stat -c '%F %a %u' <candidate-key-file>            # type, mode, owner uid (never the content)
```

The decided names of section 0a are candidates too. Run the same block with the candidate
directory `/home/soullab/.config/soullab-r20/authority`, ledger
`/home/soullab/.config/soullab-r20/authority/ledger.json`, high-water file
`/home/soullab/.config/soullab-r20/authority/high-water.json` and key
`/home/soullab/.config/soullab-r20/ledger.key`, and also look at the home directory itself:

```
test -L /home/soullab/.config/soullab-r20 && echo home-is-symlink      # a symlink here is a finding
test -e /home/soullab/.config/soullab-r20 && echo home-present || echo home-absent
stat -c '%F %a %u' /home/soullab/.config/soullab-r20      # prints an error and nothing else if absent
```

On a clean host all of them are absent. Anything present at those names is a finding that goes
through the table below; none of them is yours to reuse silently. Because the names are decided,
"a new directory and a new key" in the table's second row means a new directory and a new key at
**different names**, and that is a change to PR-C, a rerun of step 4 and a new witness (section 0a),
not something to do on the host by yourself.

**A directory you cannot search shows every file in it as absent.** If any line above printed
`Permission denied` or `UNREADABLE-STOP`, or the directory's owner uid is not yours, or a parent
directory of any path is not searchable by you, then "absent" and `0` mean *unknown*, not *none*.
Read the directory as its owner or as root (a read, not a write), or treat it as the last row of
the table below. Do not go on to step 2 on an unreadable reading.

Record: the R20 names found (or none); the compose file names; whether a candidate directory
exists; its entry count; ledger present or absent; high-water present or absent; key present or
absent with its mode and owner uid. REPORTED, and relevant only to the container: the founder's
read-only readout of 2026-11-06 found no `R20_` variable names on `maia-sovereign` (lane record
6.9.2). That says nothing about the host filesystem.

| What step 0 found | What it means | What to do |
|---|---|---|
| No R20 directory, no ledger, no high-water, no key | The clean host this runbook assumes | Continue at step 1 |
| A directory or a key exists; neither ledger nor high-water | Provenance of that directory and key unknown | Do not reuse silently. Tell the founder. A new directory and a new key (steps 1 to 3) are lawful; leave the old ones untouched |
| Exactly one of ledger and high-water exists | The seal will throw `R20_HIGH_WATER_MISSING` (ledger only) or `R20_LEDGER_MISSING` (high-water only) whatever the flag, and the module has no repair path | Stop. Founder decision. Do not delete the one that exists and do not create the one that is missing |
| `Permission denied`, `UNREADABLE-STOP`, an owner uid that is not yours, or a parent you cannot search | Contents unknown, not absent: a pair may exist that you cannot see | Stop. Read it as the owner or as root first, then use the rows above. Treat it as the last row until then |
| Both exist | The first seal takes the verify path, `R20_LEDGER_ALLOW_INITIALIZE` does nothing, and the key must be the one that sealed them, or every seal gives `R20_LEDGER_HMAC_INVALID` | Stop. Steps 1 to 3 do not apply. Founder decision on which pair and which key are current. Do not overwrite or remove a found pair to make the clean-host steps apply |

**Step 1. Check the location.** The location is decided (section 0a, under delegation); deciding it
makes none of the following true. The authority directory and the key must be on a location that
satisfies all of these. Record, for each, only yes or no, plus the filesystem type name. If any
answer is no, stop: the names are revisable, but changing one means a compose change in PR-C and a
new witness (step 4b), so take it to the founder rather than work around it:

- Outside every path that a restore overwrites: the database restore (`scripts/restore-db.sh`,
  `scripts/restore-governed.sh`; SOURCE: neither mentions the ledger, the high-water file or
  any `R20_LEDGER` name), the vault volume, and the application checkout. A ledger rolled back
  together with the thing it guards guards nothing, and the module cannot see that (section 1).
  The repository's own witness model keeps "The separate authority" outside the rolled-back
  plane (`scripts/witness/ws-legacy-source-recovery-pg16.sh` line 167).
- Outside the Docker data root and not a Docker named volume. Check without recording the
  answer: `docker info --format '{{.DockerRootDir}}'`, then record only "inside" or "outside".
- Not inside the git checkout of the project (an untracked directory there is exposed to
  checkout and clean operations; an inference).
- A local filesystem whose rename and directory fsync are honest. The module fsyncs the
  directory after the rename (lines 147-148), and a failure after the ledger rename leaves a
  permanent mismatch. **Directory fsync on CIFS or NFS is not established**; the repository
  models a CIFS backup destination only in an offline fixture
  (`scripts/ops/ws-backup-exact-shell-preflight-oci.sh` lines 55-63), which is not evidence
  about this host. Record the type: `findmnt -no FSTYPE -T /home/soullab/.config`. Do not use
  tmpfs or any volatile location. (The directory does not exist yet at this step, so ask about
  its parent; `/home/soullab/.config` is where the SMTP and KMS credential binds already sit.
  Whether it exists on this host is not established here.)
- Whether any backup job copies the location is **not established**. The installed backup
  writer is not in the repository (only its hash is pinned,
  `scripts/ops/verify-ws-held-backup-source-order.mjs` lines 23-27). Find out before you rely
  on it either way, and read step 8.

**Step 2. Create the R20 home directory and the authority directory** (writes on the host; both
mode 0700, owner uid 1000; names in section 0a). The compose comment at `docker-compose.production.yml` line 210 says the credential files are
owned by uid 1000 and that the host user with that uid is `node` in the container. The Dockerfile
says a user-namespace-remapped Docker
maps container uid 1000 to a different host uid and that ownership is therefore unpredictable
(`Dockerfile` lines 162-167). **The two statements disagree, and neither has been checked on
this host.** Verify the mapping before choosing an owner:

```
id -u                                       # the host uid you are running as
docker exec <app-container> id -u           # the container user's uid (SOURCE: USER node, Dockerfile line 169)
docker exec <app-container> cat /proc/self/uid_map
```

A line `0 0 4294967295` in the last output (the spacing may differ) means no remapping: container
uid 1000 is host uid 1000. Any other first line means remapping is on, and the owner needed is
the host uid that container uid 1000 maps to; stop and take it to the founder rather than guess.
If the mapping is the identity and you are the host user with uid 1000:

```
if test -e /home/soullab/.config/soullab-r20 || test -L /home/soullab/.config/soullab-r20 \
   || test -e /home/soullab/.config/soullab-r20/authority || test -L /home/soullab/.config/soullab-r20/authority; then
  echo "EXISTS: stop and go back to step 0's table."     # nothing was created or changed
else
  umask 077
  mkdir -m 0700 /home/soullab/.config/soullab-r20 &&      # refuses an existing path; /home/soullab/.config must already exist
    mkdir -m 0700 /home/soullab/.config/soullab-r20/authority &&
    stat -c '%F %a %u:%g' /home/soullab/.config/soullab-r20 /home/soullab/.config/soullab-r20/authority
    # expect two lines: directory, 700, 1000:<gid>
fi
```

If the first `mkdir` succeeds and the second does not, the home directory is left behind. A rerun
then prints `EXISTS`, and that is step 0's second row (a directory, no pair): do not remove it, and
take it to the founder.

If you must act as root, run the same test first and, only when it does not print `EXISTS`, use
`install -d -m 0700 -o <uid> -g <gid> <dir>` in place of each `mkdir` (the home directory first, then
`authority`), with the uid from above (`install -d` on a path that already exists would change its
owner and mode). Every ancestor of the directory (`/home/soullab`, `/home/soullab/.config`, the
home directory) must also let that uid in (search permission), or the preflight in
step 4 cannot reach it and its pair-state line is then not to be trusted (it reads files it cannot
see as absent; the result is still FAIL, because the directory check is false); the container
itself sees only the mounted directory. If the test prints `EXISTS`, list what is there as its
owner or as root (`ls -la /home/soullab/.config/soullab-r20` and, if it exists,
`ls -la /home/soullab/.config/soullab-r20/authority`; a `Permission denied` is *unreadable*, not
*empty*): a symlink, or any entry at the ledger or high-water name, means stop and go back to
step 0's table. The preflight reads a symlink that leads nowhere as absent (it mirrors the module's
existence test), so it cannot be relied on to tell you. Do **not** create the ledger or the
high-water file, now or later: an empty or
garbage file in their place sends the first seal down the verify path and fails with
`R20_LEDGER_MISSING_INVALID` or `R20_HIGH_WATER_MISSING_INVALID`, and one file without the other
fails as the table in step 0 shows.

**Step 3. Generate the key ON THE HOST** (a write on the host; mode 0600, owner uid 1000, outside
the authority directory; the name is `/home/soullab/.config/soullab-r20/ledger.key`, section 0a).
It is generated on the machine that will hold it so that it never
passes through a chat, a session, a clipboard or another machine's disk.

```
(
  umask 077
  if test -e /home/soullab/.config/soullab-r20/ledger.key || test -L /home/soullab/.config/soullab-r20/ledger.key; then
    echo "REFUSED: the key file already exists. Stop."          # a literal; nothing was created or changed
  elif ! command -v openssl >/dev/null 2>&1; then
    echo "STOP: openssl is not installed. Nothing was created."
  else
    tmp="$(mktemp /home/soullab/.config/soullab-r20/.r20-key-new.XXXXXX)" &&
      openssl rand -hex 32 > "$tmp" &&
      ln "$tmp" /home/soullab/.config/soullab-r20/ledger.key &&
      echo "created"
    rm -f "$tmp"                            # the temporary name goes whether or not the link was made
  fi
)
```

`/home/soullab/.config/soullab-r20` is the R20 home directory that step 2 created (it must exist
and be writable by you; the temporary name is made in it, so it is on the same filesystem as the key
file, which `ln` needs). The temporary name is in the home directory and never in the authority
directory. The key is written to a new private temporary name and then hard-linked to the key path. `ln`
without `-f` refuses an existing path, a dangling symlink included, so the existence test and the
write are one step and no empty or half-written file is ever left at the key path if `openssl`
fails. `mktemp` creates the temporary file with mode 0600, and the link shares that mode.

Only if that printed `created`, check the file (these three print modes, a count and a literal,
never the key). If you did step 2 as root and are not the container user's host uid, make the key
that uid's: `chown <uid>:<gid> /home/soullab/.config/soullab-r20/ledger.key`, then read the owner uid from the first line below;
a key owned by root with mode 0600 cannot be read by the container user:

```
stat -c '%F %a %u' /home/soullab/.config/soullab-r20/ledger.key               # expect: regular file, 600, the uid from step 2
wc -c < /home/soullab/.config/soullab-r20/ledger.key                          # expect: 65 (64 hex characters and a newline)
grep -Eqx '[0-9a-f]{64}' /home/soullab/.config/soullab-r20/ledger.key && echo hex64-ok     # prints only the literal
```

The block refuses to overwrite because an existing key may be the only thing that can verify a
sealed pair, and there is no rotation path (step 8), so a clobbered key cannot be recovered.
If it printed `REFUSED`, stop: the file is a step 0 finding. Go back to step 0's table (a key
that exists is its second row, or its third or fourth if a ledger or high-water file exists
too), do not overwrite, move or delete the file, and take it to the founder. A new key at a path
that does not exist is lawful only on the second row, which leaves the old key untouched. If it
printed `STOP`, or an error and no `created`, fix the cause (install `openssl`, or make
the home directory of step 2 exist and be writable) and run the block again: this step leaves nothing at the key
path unless it printed `created`.

The hex form is chosen because the module trims surrounding whitespace before it matches it
(line 99), so the newline `openssl` adds is harmless. **A raw key file must not carry a
trailing newline** (33 bytes, rejected), and the unpadded 44-character base64 form is rejected
whatever you do. Keep the key outside the authority directory: PR-C mounts the directory
read-write and the key read-only as separate things, and a copy or restore of the authority
directory then does not carry the key with it. (A copy of the whole home directory would carry
both; the key is a sibling of the authority directory, not on another filesystem.) Never print, paste, screenshot, commit or
mail the key, and never put it in `.env.production` or any environment value. Whether and where
the key is copied for safekeeping is a founder decision this document does not make: the key is
the only thing that can verify the ledger, and there is no rotation path (step 8).

**Step 4. Run the preflight.** `scripts/ops/check-r20-host-prerequisites.sh` is part of the same
change as this document. The command line, exit codes and output below were read from the script's
own header and source; the script was **not run** when this runbook was written, and where its
header and this text differ the header governs and this text is to be corrected. Read the header
first. The script changes nothing that persists. Its one write is a probe file,
`.r20-preflight-probe.<pid>`, which it creates (exclusive create) and removes inside the authority
directory, and only when the invoking uid equals `--expect-uid`; otherwise that check is UNKNOWN,
and UNKNOWN is never a pass. (If it were killed in a way a shell cannot trap, such as SIGKILL,
between the create and the remove, that one file would stay behind. That is an inference from how
traps work, not an observation; remove such a file yourself, because step 7 counts the directory's
entries.) It reads at most 4096 bytes of the key file to classify its form and keeps no copy. Run
it **as the host-side uid of the container user, not as root** (root bypasses mode bits, and as any
other uid the write check cannot be evaluated), from a checkout that contains the script (whether
the host's checkout does is not established), and invoke it with `bash`, so that it does not depend
on the file's executable bit (it needs bash 4 or newer and refuses otherwise).

The command is **derived from PR-C's compose, not typed**. On any machine that has the PR-C commit and
Node (the checker reads only the compose and prints text; it touches no host), print it, then copy
that one line to the host:

```
node scripts/check-compose-r20-wiring.mjs --print-preflight-command
```

It must print exactly this line (section 0a; if it prints other paths the compose governs and this
runbook is stale, so stop and correct it):

```
bash scripts/ops/check-r20-host-prerequisites.sh --ledger /home/soullab/.config/soullab-r20/authority/ledger.json --high-water /home/soullab/.config/soullab-r20/authority/high-water.json --key-file /home/soullab/.config/soullab-r20/ledger.key
```

Run **exactly the printed line**, as the host-side uid of the container user and not as root:

```
# as the host-side uid of the container user (step 2), not as root; paste the printed line, do not retype it
<the printed line>
echo "exit=$?"
```

The printed line carries no `--expect-uid`. The script's default is 1000 and the witness of step 4b
records `expect_uid` 1000, so this runbook covers the host whose container uid 1000 is host uid 1000
(step 2). If step 2 showed a remapped host, stop: the owner needed is another uid, and the witness
and the command are not written for it.

The ledger and high-water paths are the names the app's two variables will carry inside the
authority directory, as they appear on the host; neither file exists yet and neither is to be
created (step 2). **The pair-state result is only meaningful for the exact file names the app will
use.** It, and the owner check on any pair file, speak only about the paths it was given, and
`both_absent` for names the app never uses says nothing about the names it does. That is why the
command is derived from the compose: the names are decided and bound by PR-C, a change to a name in
the compose changes the printed command and the digest of step 4b, and so makes an earlier run stop
counting. A run typed by hand with other paths does not count toward PR-C's gate, and the witness
cannot tell the difference (step 4b); do not do it.

Exit 0 is PASS, 1 is FAIL (a named check is false), 3 is UNKNOWN (none false, at least one not
determinable), 2 is misuse. Its output is one `<check_id> true|false|UNKNOWN` line per check, plus
`ledger_pair_state` and `key_form` lines, two advisory lines about the Docker data root (they never
change the result, and they do not replace the manual check in step 1), and a final
`r20_host_preflight result=` line; this runbook does not rely on the order of the lines before the
last. By its header it prints no path, file name, key byte or error text.

**What a clean host reads.** On a clean host (step 0's first row, or its second row with a new
directory and a new key) every `<check_id>` line reads `true`, and these lines read:

```
ledger_pair_state both_absent
key_form hex64
authority_dir_under_docker_data_root false
key_under_docker_data_root false
r20_host_preflight result=PASS          # and exit=0
```

**Any other value means stop and return to step 0's table.** A PASS does not make another value
acceptable: the preflight scores a consistent pair as true, so `result=PASS` can sit beside
`both_present`, and the advisory lines never change the result. The readings you are most likely to
meet (`ledger_pair_state` is one of `both_absent`, `both_present`, `one_present`, `wrong_kind` or
`UNKNOWN`; where the script's header differs, the header governs):

| Reading | What it means | What to do |
|---|---|---|
| `ledger_pair_state both_present` | A ledger and a high-water file already exist at those names. The pair counts as consistent, so a PASS can accompany it | Stop. Step 0's "Both exist" row: founder decision; steps 1 to 3 do not apply |
| `ledger_pair_state one_present` | Exactly one of the two exists; the seal would throw whatever the flag | Stop. Step 0's "Exactly one" row. Do not delete the one that exists and do not create the missing one |
| `ledger_pair_state wrong_kind` | A path at one of the two names exists but is not a plain regular file: a directory, a symlink, a FIFO or a socket. The script scores it as a failed check. The module's existence test would count it as present and its read would then fail; a symlink would be replaced, not written through, by the module's rename | Stop. Not in step 0's table: founder decision. Do not remove it |
| `ledger_pair_state UNKNOWN` | Absence could not be told from presence, for example a directory the invoking uid cannot search. The script tests only that directory itself: if a PARENT of it is not searchable by you, `ledger_pair_state` can read `both_absent` for a pair that exists, while `dir_exists` and `key_exists` read `false` and the result is FAIL, never PASS. Treat any such combination as unknown, not as a clean host | Stop. Fix the way you ran it (the uid, search permission on every ancestor) and rerun |
| `key_form` other than `hex64` | Step 3 makes `hex64`. `base64_43` and `raw32` are forms the module also accepts, but then this is not the file step 3 made; `invalid` is a form the module rejects; `UNKNOWN` was not determined | Stop. If the key was there before step 3, step 0's table; otherwise find out why before going on |
| An advisory line reads `true` | The directory or the key lies under the Docker data root, which step 1 excludes | Stop. Choose another location (step 1) and rerun |
| Any `<check_id>` line reads `false` or `UNKNOWN` | The result is FAIL or UNKNOWN | Stop. Fix the host, or the way you ran it, and rerun |

Keep only that output and the exit code, and read it before you paste any of it.
A compose render is not a substitute: measured for this change on a Compose client with no
daemon, `docker compose config` exits 0 although the SMTP, KMS and AIN sources are absent, but only
when `TURN_STATIC_AUTH_SECRET` and `TURN_EXTERNAL_IP` are supplied; without them it exits 1 on a
parse-time `${VAR:?}` requirement (`docker-compose.production.yml` line 1012 at the base commit;
lane record 6.12). So it cannot see a missing bind source (not reproduced here; the server's
Compose is v5.1.1, R104 line 22, and its behaviour is unmeasured).

A pass establishes only what the script's header says it checks, at the moment it ran: one
directory holding both authority files, that directory's owner, mode and a probe write as the
expected uid, a consistent pair state (both absent is the reading this runbook expects; both
present is scored as consistent and is still a stop, see above), and a key file of the right
kind, owner, mode and form. It does **not** establish: that the container will see the same
directory and key, because the mounts are declared by PR-C's compose and neither rendered by Docker
nor applied; which uid the container really runs as
(step 2 reads that); that any file's contents verify, since no HMAC is computed and the key is never
used; that directory fsync is honest on this filesystem; that the key is the one that sealed an
existing pair; that no backup or restore will roll the pair back; that the deploy lane will not meet
another missing bind source; or anything about independence. Rerun it immediately before the deploy
in step 6: a pass is a reading at a time.

**Step 4b. Record the witness.** Do this only when step 4 printed all three of
`ledger_pair_state both_absent`, `key_form hex64` and `r20_host_preflight result=PASS` with
`exit=0`: the clean-host reading. Any other combination is step 4's table, not a witness, and
`result=PASS` beside `both_present` is a stop. The witness is a committed file,
`docs/ops/R20_HOST_PREFLIGHT_WITNESS.json`, which PR-C's check requires (its law W8). While the file
is absent or does not match, that check fails, so PR-C's CI is red by design and the change cannot be
merged, or auto-merged, by mistake. (That holds only where the check runs in a gate that pull
requests must pass and the merger honours; whether it does is lane record section 6.13's to say,
and a check that runs in no gate fails nothing.)

1. Copy the three lines named above, the exit code and the time of the run. They are the script's own
   vocabulary: they contain no path and no key, and nothing else from the run is to be kept.
2. On a machine with the PR-C commit checked out and the preflight script unmodified (the next
   command hashes the working-tree file, and the checker hashes the committed bytes, so they agree
   only on a clean tree), compute the two values the file binds:

   ```
   node scripts/check-compose-r20-wiring.mjs --print-names-digest     # names_digest: SHA-256, 64 hex characters
   git hash-object scripts/ops/check-r20-host-prerequisites.sh        # preflight_script_blob: git blob SHA-1, 40 hex characters
   ```

   `names_digest` is the SHA-256 of the three host-side paths **as the compose binds them**, so a
   name changed in the compose no longer matches. `preflight_script_blob` is the blob hash of the
   committed script, so an edit to the preflight no longer matches.
3. Write the file and commit it on PR-C's branch (placeholders in angle brackets):

   ```
   {
     "schema": 1,
     "result": "PASS",
     "names_digest": "<64 hex characters printed by --print-names-digest>",
     "preflight_script_blob": "<40 hex characters printed by git hash-object>",
     "expect_uid": 1000,
     "run_at": "<ISO-8601 UTC time of the preflight run>",
     "run_by": "<a role, not a name or a secret>",
     "output": [
       "ledger_pair_state both_absent",
       "key_form hex64",
       "r20_host_preflight result=PASS"
     ]
   }
   ```

   The file contains no path and no key: `names_digest` is a hash of three paths, not a path, and the
   `output` lines are the three above and nothing else.

   The checker requires, beyond the digest and the blob hash: `result` `PASS`; `output` containing the
   exact lines `ledger_pair_state both_absent`, `key_form hex64` and `r20_host_preflight result=PASS` (the
   clean first-configuration reading; a pair that already exists is a step 0 stop, not a witness);
   `expect_uid` an integer of at least 1 (uid 0 bypasses the permission checks the preflight exists to
   make); and `run_at` an ISO-8601 UTC timestamp such as `2026-11-08T12:00:00Z`. It does not judge `run_by`
   and cannot tell a real run from a typed one.

**What the witness is, and is not.** It is evidence for a deliberate act: someone ran the
preflight under the names the compose binds, saw a clean PASS, and wrote that down in a form the
checker compares with the compose and with the script. It is a plain file that anyone can write or
edit by hand, and the checker cannot tell a real run from a typed one. It proves nothing about the
host at deploy time: a pass is a reading at a time, the directory and the key can change the next
minute, and the container may not see what the preflight saw. It is not host state, not a
deploy authorization, not a witness of independence, and not a substitute for the rerun that step 6
requires on the day of the deploy. Committing it does not authorize the merge, which is the
founder's decision, and merging is latent deploy authorization (section 0, point 2). If the compose
changes a name, or the preflight script changes by a byte, the file stops matching and this step is
done again from step 4.

**Step 5. Read-only counts before the first seal.** When R20 is configured the two
unfinished-upload discard paths stop answering 202 `removal_pending` and start destroying bytes
and answering 200 (section 2). Count what they could act on. These two statements mirror the
member-facing list (`listMemberUnfinishedUploads`,
`lib/manuscript/source/discardIncompleteLanding.ts` lines 180-196) with the member filter removed,
and each only counts:

```
docker exec <postgres-container> psql -q -At -U <db-user> -d <db-name> \
  -c "SET default_transaction_read_only = on" \
  -c "SELECT count(*) FROM manuscript_source_arrivals WHERE manuscript_id IS NULL AND source_kind = 'artifact_extraction'"

docker exec <postgres-container> psql -q -At -U <db-user> -d <db-name> \
  -c "SET default_transaction_read_only = on" \
  -c "SELECT count(*) FROM writer_source_landing_intents WHERE state <> 'ARRIVAL_RECORDED'"
```

Record two integers: unclaimed arrivals, and incomplete landing intents. (`discardUnclaimedArrival`
itself tests only `manuscript_id IS NULL`; the list, and so the door a member is offered,
also requires `source_kind = 'artifact_extraction'`.) A non-zero count is not a stop. It means a
member who uses the discard door after R20 is configured destroys those bytes irreversibly,
which is what the door is for, and the founder should know the number before it changes.
RECORD: `writer_source_landing_intents` held 0 rows on 2026-11-01 (section 5 of the KMS runbook,
`docs/programme/WRITER_SOURCE_KMS_RULING_AND_INTAKE_LIFT_RUNBOOK_2026-11-01.md`), which
is old and was a different observation. The count of `vault_erasure_queue` rows is register line
C2 and is not part of this step.

**Step 6. The first seal** (the host and the deploy lane change here; only after the witness of
step 4b is committed and PR-C's CI is green, after the preflight has been run again that same day
with the same printed command, and only with PR-C reviewed and merged by the person who owns that
decision). The container-side names are decision D1 (section 0a) and PR-C's compose carries them.
**The initialise flag is one-shot, and it lives only in the untracked `.env.production`, never in
the tracked compose (decision D3).** Its whole life is: set it (item 1); recreate `maia` through a
lane deploy (item 2); wait for the first successful seal (item 4 and step 7); **remove it** (item
5); recreate `maia` again through a lane deploy (item 5); read back that it is gone (item 5). Do
items 1 to 4, then step 7, then items 5 and 6.

1. Put exactly one line in `.env.production` (untracked; the `maia` service reads it as
   `env_file`, `docker-compose.production.yml` lines 107-108): `R20_LEDGER_ALLOW_INITIALIZE=true`.
   Edit it on the host, with an editor, and do not paste the file. The other services that read
   the same file (the workers) will carry the name too; only the app calls the seal (in
   `lib/manuscript/source/`: `eraseManuscript.ts`, `discardUnclaimedArrival.ts`,
   `discardIncompleteLanding.ts`, and `legacyRetirement.ts`, which only a witness script calls).
2. Take it through **one lane deploy** of the PR-C commit: `scripts/deploy-production.sh deploy
   <SHA>`, or the pair `scripts/pre-deploy-gate.sh prepare-maia <SHA>` then `cutover-maia <SHA>`
   when only `maia` is meant to change (`deploy-maia` is retired in this tree,
   `scripts/pre-deploy-gate.sh` lines 319-324; `cutover-maia` recreates only `maia`, line 305).
   The full `deploy` runs a bare `up -d`, which recreates every service whose definition or
   image changed (RECORD: nine containers in `docs/programme/S3-O1_PRODUCTION_OBSERVATIONS_2026-09-14.md`
   lines 18-30). ⚠️ **Never recreate `maia` by hand** with `docker compose` to pick up the new
   values; that bypasses the lane (the KMS runbook cited in step 5, section 4 step 2; the 2026-09-07
   finding).
3. Read back, names only: `docker exec <app-container> sh -c 'env | cut -d= -f1 | grep
   "^R20_"'` should show the three names (`R20_LEDGER_FILE`, `R20_HIGH_WATER_FILE`,
   `R20_LEDGER_KEY_FILE`) and the flag; the step 0b command should show `/run/r20` read-write
   (`rw=true`) and `/run/secrets/r20_ledger_key` read-only (`rw=false`). Then three literals, which
   print no path content: `docker exec <app-container> sh -c 'test -d /run/r20 && echo dir-present;
   test -w /run/r20 && echo dir-writable; test -r /run/secrets/r20_ledger_key && echo key-readable'`
   should print all three (`test -w` only asks; it writes nothing). If a name, a mount or a literal
   is absent, the deploy did not apply it, or the container user cannot use what it was given:
   stop. Do not hand-edit the container.
4. **The first seal happens at the next member deletion that reaches it.** No operator command
   seals on demand (SOURCE: the only callers of `sealR20DeletionLedger` are the four named
   above and two witness scripts under `scripts/witness/`; the only callers of
   `importR20DeletionLedger` and `verifyR20DeletionLedger` are witness scripts). Until a
   deletion happens, no pair exists. A real member's deletion may be that first seal, and that
   is lawful. **Do not remove the flag before the pair exists:** with both files absent and the
   flag unset, every seal throws `R20_HIGH_WATER_MISSING`.
5. After step 7 shows the pair, **remove the flag**: delete the line from `.env.production` and
   take **a second lane deploy**. It is read from `process.env` at call time and cannot be unset
   without a container recreate; while it stays set, a loss of both files makes the next seal
   silently re-initialise at generation 1, which defeats the high-water record without any
   error. Read back with `docker exec <app-container> sh -c 'env | cut -d= -f1 | grep -c
   "^R20_LEDGER_ALLOW_INITIALIZE$"'`; the answer must be 0. Whether Compose recreates a service
   whose `env_file` content changed is Compose behaviour not witnessed here, so verify it; if the
   name is still present the container was not recreated. `cutover-maia` forces the recreate
   (`up -d --force-recreate --no-deps maia`, `scripts/pre-deploy-gate.sh` line 305), so it does not
   depend on Compose noticing a changed `env_file`; the read-back is decisive either way.
6. ⚠️ If a deploy fails on a missing bind source, do not assume `rollback` rescues it: it
   composes from the shared checkout (section 0, point 3).

**Step 7. Witness (fictional data only).** With a test member and a fictional writing created for
this purpose (no original file and no image, so the seal is the only obligation that can fail),
delete it through the product's own Delete door.

- Expect the response to be 200 with `removed: true` and no custody notice. Record the status and
  that boolean, nothing else.
- Count the log line, not its content:
  `docker logs <app-container> --since <time-before-the-delete> 2>&1 | grep -c 'R20 recovery seal still owed'`
  should be 0.
- The pair appears on the HOST, not only in the container:
  `ls -1A /home/soullab/.config/soullab-r20/authority | wc -l` should be 2 and
  `ls -1A /home/soullab/.config/soullab-r20/authority | grep -c '^\.'` should be 0 (no leftover
  temp file); `stat -c '%a %u' /home/soullab/.config/soullab-r20/authority/ledger.json
  /home/soullab/.config/soullab-r20/authority/high-water.json` should show 600 and the uid from
  step 2 for each.
- Record the generation, from the **high-water file only** (it carries no identifiers; the ledger
  does): `python3 -I -c "import json,sys; print(json.load(open(sys.argv[1]))['generation'])" /home/soullab/.config/soullab-r20/authority/high-water.json`.
  After the first seal expect 1; each later seal whose payload changed advances it by one.

This is the first half of C1's closure condition: a production writing delete answers 200 with
the pair advancing, witnessed. It does not cover the second half (a failed seal retried or raised
to a human). It does not exercise the two discard doors. A 200 whose pair is missing on the host
would mean the ledger went into the container's own layer; that is why the host is checked.

**Step 8. What this does NOT give you.**

- **Independence.** The app container holds the key and the directory read-write. Anyone who can
  act as the app can read the key and rewrite the pair consistently (section 0, point 1).
- **Key rotation.** None exists. A different key cannot verify an existing pair
  (`R20_LEDGER_HMAC_INVALID`); the only way on is to remove both files and initialise again,
  which restarts at generation 1 and discards the high-water history. No procedure for that is
  sanctioned anywhere in the repository.
- **Recovery from a ledger and high-water mismatch.** A crash, or a failed directory fsync,
  between the ledger rename (line 322) and the high-water rename (line 326) leaves ledger
  generation N+1 against high-water generation N, and every later seal throws
  `R20_LEDGER_STALE_GENERATION` (or `R20_HIGH_WATER_MISSING` on a first seal). The module has no
  repair code and no runbook covers it (a search of `docs/` and `scripts/` finds
  `STALE_GENERATION` only in the module and in `scripts/witness/r20-ledger-physical-current.ts`).
- **Protection from a coordinated rollback of both files.** A consistent, validly signed old pair
  passes verification and generation numbers repeat. The witness records
  `coordinatedLedgerAndHighWaterRollbackTested: false` and `externalHighWaterCustodyRequired: true`
  (`scripts/witness/r20-ledger-physical-current.ts` lines 132-133).
- **An operator seal, verify or import command.** None exists.
- **A coherent backup.** The comment at `eraseManuscript.ts` lines 104-107 refers to a coherent R20
  backup that holds the recovery-capture advisory lock while it seals the ledger; no caller exists
  in the tree (lane record 6.9.1). If the pair is ever copied, both files must be captured at one
  instant: the module writes them one after the other, so a copy between the two writes is a
  mismatched pair. Restoring one file without the other wedges the seal (`R20_LEDGER_STALE_GENERATION`
  or `R20_LEDGER_STALE_DIGEST`). Restoring the database without the ledger gives
  `R20_LEDGER_DATABASE_REGRESSION` until the rows are back.
- **Retry or alert.** A failed seal is neither retried nor reported to a human.
- **A check of the host at deploy time.** The witness of step 4b is a committed file that keeps PR-C's
  CI red until someone records a run. It is hand-editable, it is checked only against the compose
  and the script, and it says nothing about the host when the deploy runs. The deploy tooling still
  has no host-prerequisite preflight (section 0, point 3); a failed `up -d` after the build, the
  migrations and the rollback-tag rotation, and a `rollback` that composes from the shared
  checkout, leave a state this runbook cannot establish or repair.
- **A cleaned authority directory.** A failed write leaves its temp file behind; it is harmless to
  correctness and accumulates.

## 4. Failure map

When the app has the three names but the host side is wrong. A thrown code is caught in
`eraseManuscript`, logged as `[MAIA/press] R20 recovery seal still owed { code }` (a bounded code,
no path), and the member sees the custody notice: HTTP 500 `custody_incomplete` with
`unconfirmed.deletionRecord` true; the rows have already committed (SOURCE: `eraseManuscript.ts`
lines 291-301, `route.ts` lines 263-278, `lib/writersStudio/deleteWork.ts` lines 216-231). A
discard door answers 202 `removal_pending` instead. A non-R20 error surfaces as its errno, sliced
to 48 characters (`r20LedgerErrorCode`, lines 81-85).

| Host condition | Where it first shows | Code in the log | What the member sees |
|---|---|---|---|
| Authority directory or key file missing, with a bind declared `create_host_path: false` | At container creation (`up -d`), not at the seal | None from the app; compose's own error at deploy time | Not established: it depends on what compose did to the old `maia`, which the repository does not record |
| The three names set but no mount behind the directory | Not established | Most likely `EACCES` from creating the directory under a root-owned parent (an inference); if the parent were writable, none | The custody notice; or, worse, a 200 whose pair sits in the container's own layer and is lost at the next recreate (inference) |
| Directory root-owned or otherwise not writable by uid 1000 | At the first seal whose payload CHANGED (an unchanged payload writes nothing) | `EACCES` at the temp-file open | The custody notice on a writing delete |
| Read-only mount or filesystem | Same moment | `EROFS` | The custody notice |
| Directory without search permission | At the first seal: `existsSync` swallows the error and reads both files as absent | `R20_HIGH_WATER_MISSING` without the flag; with the flag an initialise attempt then `EACCES` | The custody notice |
| Directory restored from an older backup: one file older | At the next seal | `R20_LEDGER_STALE_GENERATION` or `R20_LEDGER_STALE_DIGEST` | The custody notice, on every writing delete until repaired; no repair path exists |
| Both files restored from the same older instant | Not detected | None; generation numbers repeat | Nothing wrong is shown |
| Database restored, ledger not | At the next seal | `R20_LEDGER_DATABASE_REGRESSION` until the rows are re-applied | The custody notice |
| Key file wrong length or encoding (raw plus newline, unpadded base64, base64url, empty) | Every seal; the key is re-read each time | `R20_LEDGER_KEY_INVALID` | The custody notice |
| Key file unreadable, missing, a directory, or not readable by uid 1000 | Every seal | `R20_LEDGER_KEY_UNAVAILABLE` | The custody notice |
| A valid 32-byte key that did not seal the existing pair | Every seal | `R20_LEDGER_HMAC_INVALID` (or `R20_HIGH_WATER_HMAC_INVALID`) | The custody notice |
| Only one of the pair present, or empty or garbage files pre-created | Every seal | `R20_HIGH_WATER_MISSING` or `R20_LEDGER_MISSING`; `..._INVALID` for a file that is not JSON | The custody notice |
| First seal with the flag unset (or not exactly `true`) | The first seal | `R20_HIGH_WATER_MISSING` | The custody notice |
| Crash or failed fsync between the two writes | Every later seal | `R20_LEDGER_STALE_GENERATION` | The custody notice, permanently |
| Names unset or not absolute (today's state) | Every seal | `R20_LEDGER_FILE_MISSING`, `R20_HIGH_WATER_FILE_MISSING` or `R20_LEDGER_KEY_FILE_MISSING` | The custody notice |

## 5. Open questions (none decided here)

- Do the R20 host directory, a ledger and high-water pair, and a key already exist from the October
  2026 live override? Step 0 answers it; the answer decides whether steps 1 to 3 apply.
- Is Docker on the host user-namespace remapped? Step 2 reads it; it decides the owner of the
  directory and the key.
- Does any backup job capture the chosen directory, and does any restore overwrite it?
- Which filesystem backs the directory, and is its directory fsync honest?
- Is the production app a single Node process? The concurrency reasoning (a ledger and high-water
  pair written by two synchronous calls with no await between them, `r20DeletionLedger.ts` lines
  322-327) assumes so; it was not verified. Overlapping seals from two processes could interleave
  the pair and give `R20_LEDGER_STALE_DIGEST` (an inference).
- Are there unclaimed arrivals or incomplete landings in production now, and is the
  unfinished-uploads discard route reachable by members through the edge? Step 5 counts the first;
  the second is not established.
- Does `.env.production` set any `R20_` name? The 2026-11-06 readout found none on the container,
  and the file is not in the repository.
- Is a first seal on demand wanted? No operator command seals, so the ledger does not exist until a
  member deletes something. This document does not decide it.
- Does the deploy lane get a host-prerequisite preflight of its own? Until it does, this runbook's
  preflight is a ritual a person must remember (lane record section 6.12), and PR-C's witness file
  is a gate on a merge, not a check at deploy time (step 4b; lane record section 6.13).
- Do the decided names stand (section 0a)? They are decisions D1 to D4 taken under delegation, not
  founder rulings; the founder may change any of them, at the cost of a compose change, a rerun of
  step 4 and a new witness.

⛔ Not authorized by this document: running any step on the host, creating the directory or the
key, editing `.env.production`, setting or removing the initialise flag, merging PR-C or any
compose change, committing a witness that was not produced by a run of the preflight, deploying or
recreating any container, claiming that R20 is independent, lifting
the R105 hold on worker deployment or any upload hold, or closing register line C1, C2 or C4. It
records what to do, in what order, and what each step does and does not establish.
