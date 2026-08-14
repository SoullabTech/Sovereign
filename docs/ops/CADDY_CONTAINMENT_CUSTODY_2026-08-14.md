# Caddy edge-containment custody reconciliation — 2026-08-14

## The finding

The project's edge-containment instrument, `(deny_disabled_routes)`, was **live in production
but absent from source**. It existed only as an uncommitted modification to the working-tree
`Caddyfile` on minisforum — which is bind-mounted into `maia-caddy` as `/etc/caddy/Caddyfile`,
so the dirty file *was* the serving config.

```
host working tree : ` M Caddyfile`  (clean-main-no-secrets @ 7c9dd5192)
HEAD:Caddyfile    : 0 occurrences of deny_disabled_routes
origin tip 39cc97d87 : same Caddyfile blob (b8c7b8706) — no tip ambiguity
git log --all     : never committed on any branch
```

Consequence: an ordinary `git checkout -- Caddyfile`, reset, clean, backup restore, or any
deploy step that refreshes the working tree from git would have **silently deleted the
containment** — no error, no signal — re-exposing four route families that production denies.

**A live control whose source is not under custody is not a durable control.**

## What this commit does

Makes the *already-live* security boundary reconstructible from versioned source. It changes
**no runtime behavior**: the rules committed here are the rules production is already applying.

Included — the containment instrument as one semantic unit:

| Rule | Defect it contains |
|---|---|
| `/api/members/migrate-data` (+ trailing slash) | unauthenticated cross-account data-transfer primitive |
| `/api/stellium/clients/*` `DELETE` | `?practitionerId=` with no session; deletes third-party PII |
| `/api/commons/contributions` `POST PUT PATCH DELETE` | `created_by !== memberId` taken from body/query |
| `/api/conversations/export` (+ trailing slash) | `?userId=` / `body.userId` with no session resolution |

…plus the matcher/handler structure required for those rules to execute, and the
`import deny_disabled_routes` line in each canonical site block (19 sites).

**Preservation is authorized; redesign is not.** This commit does not change any rule's route
scope, fix any of the underlying APIs, reclassify severity, expand any deny set, or decide
whether these denies should exist permanently. Each remains *contained-but-unfixed* and must be
opened under its own referent and ruling — same defect class is investigation priority, not
present authority.

## Deliberately EXCLUDED host-only changes

The host carries other uncommitted changes. They were **not** absorbed merely for adjacency:

| Excluded | What it is | Status |
|---|---|---|
| `(strip_client_authz)` + 20 imports | `request_header -X-Maia-Roles` / `-X-Maia-Tier` — strips client-supplied role/tier headers | **a second uncustodied live security control**; needs its own unit |
| `staging.soullab.life` site block | SMCC iOS staging → `maia-staging:3000` | unrelated infra; needs its own unit |

`strip_client_authz` is **independently security-relevant**, not incidental adjacency: 40 live
header-delete operations preventing client-forged role/tier headers. It earns its own custody
lane with its own provenance, necessity test, mutation control, and admission decision — it does
not get smuggled into this unit merely because it sits in the same file. Bundling it here would
have converted a 105-line authorized security unit into custody for 136 lines of accumulated
runtime history, which is precisely the substitution this method exists to prevent.

**Why subtraction was the right method.** The candidate was produced by removing the
non-authorized items from the live file, rather than by re-authoring the deny rules against
canonical. Re-authoring would have reproduced the four denies correctly and *silently carried the
adjacent units along with them* — or silently dropped them — with no step at which the difference
had to be named. Subtraction forced every host-only line to be classified as included or excluded
before the candidate existed, which is what surfaced `strip_client_authz` at all.

## What is, and is not, durable after this commit

State the scope precisely — the imprecise version ("edge containment is not durable") understates
what was achieved, and the over-claim ("edge configuration is now under custody") overstates it:

```
DENY CONTAINMENT ................. DURABLE IN SOURCE CUSTODY
    the four deny rules are no longer hostage to the host filesystem

COMPLETE LIVE EDGE CONFIGURATION . NOT YET REPRODUCIBLE FROM CUSTODY
    the combined runtime artifact still is hostage, because two further
    live units remain host-only
```

The distinction matters operationally. A `git checkout -- Caddyfile` on minisforum can no longer
destroy the deny rules *irrecoverably* — they can be reconstructed from source. It would still
destroy `strip_client_authz` and the staging block irrecoverably. So the freeze below is not
belt-and-braces for the denies; it is the **only** thing protecting the other two.

## ⚠️ This commit MUST NOT be deployed over the host Caddyfile

The reconciled file is a strict subset of what is running. Copying it onto minisforum would
**remove** `strip_client_authz` (40 live header-delete ops) and the staging site block. That
fails the semantic-equivalence condition for deployment.

The host `Caddyfile` therefore stays dirty until `strip_client_authz` and the staging block
receive custody in their own units. Until then:

**Edge-config replacement is frozen on minisforum** — no `git checkout -- Caddyfile`, no
reset/clean touching it, no deploy step that refreshes it from git, no backup restore over it.
Ordinary application work that provably leaves the host `Caddyfile` untouched is unaffected.

## Evidence and controls

Live config captured byte-exact before any further change; host file, local snapshot, and the
running in-container config all agreed:

```
sha256(live /etc/caddy/Caddyfile == ~/MAIA-SOVEREIGN/Caddyfile)
  = 24884282a5c869c4dd6743270642d239c5fc318b09ad76f70a6fc88b38e1da8d   (37264 bytes)
sha256(this reconciled Caddyfile)
  = 68ed2b09c2026f5be3c6f00e4ad7e059dcb3519cc884d53dd1ffabb283320eef
```

Secrets scan of the live snapshot: clean (only CORS `Access-Control-Allow-Headers` *names*; no
basicauth hashes, no keys, no tokens).

The candidate was built by **subtraction** from the live file — removing only the excluded
items — so containment semantics are preserved by construction. Verified against canonical as a
**pure addition**: 105 insertions, 0 deletions, every added line belonging to the deny instrument.

Controls, run without touching the live file (candidate staged at `/tmp` in the container):

```
caddy validate (candidate) .................... PASS  "Valid configuration"

Adapted-JSON semantic comparison (live vs candidate):
  deny rule SET identical ..................... TRUE
  /api/conversations/export   GET+POST+slash ... 403, 19 sites (live 20)
  /api/members/migrate-data .................... 403, 19 sites (live 20)  unchanged
  /api/stellium/clients/*  DELETE .............. 403, 19 sites (live 20)  unchanged
  /api/commons/contributions  POST/PUT/PATCH/DELETE
                                    ............ 403, 19 sites (live 20)  unchanged
  only host difference ......................... staging.soullab.life (excluded by design)
  strip_client_authz header-ops ................ live 40 / candidate 0 (correctly excluded)

Mutation control (neutralize the export matcher in a temp copy):
  export deny present in candidate ............. TRUE (19 handlers)
  export deny present in mutant ................ FALSE
  all other rules preserved in mutant .......... TRUE
  => the admitted guard is what causes the refusal
```

Runtime probes against the running config (unchanged by this commit):
`/api/conversations/export` GET+POST, bare and trailing-slash → **403**; `/api/health` 200;
`/api/commons/contributions` read 200; `/api/members/export-data` 401 on POST.

## Removal condition for the conversations/export deny

Strict: the **deployed artifact must independently prove `/api/conversations/export` absent**.
Source-side deletion alone is not sufficient grounds to remove the deny. The route's retirement
(deletion of the route and its two demo components) is held in a separate lane and must be
admitted and deployed **before** any export-widening change.
