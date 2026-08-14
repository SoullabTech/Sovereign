# `strip_client_authz` custody — 2026-08-14

Second custody unit arising from the finding in
[`CADDY_CONTAINMENT_CUSTODY_2026-08-14.md`](./CADDY_CONTAINMENT_CUSTODY_2026-08-14.md): the
minisforum `Caddyfile` is bind-mounted into `maia-caddy` and held live controls that existed
nowhere in source. That document custodied the deny instrument. This one custodies the second
live security control it deliberately excluded.

**Stacked on PR #1051.** Base is `fix/caddy-containment-custody-2026-08-14` @ `2a6e5ed9e`, not
canonical. Both PRs edit the same region of `Caddyfile`; stacking keeps this unit's diff to the
strip instrument alone and avoids a hand-merge of two security instruments — the exact class of
operation this work exists to prevent. Merge #1051 first.

## What is being custodied

```caddyfile
(strip_client_authz) {
    request_header -X-Maia-Roles
    request_header -X-Maia-Tier
}
```

…plus `import strip_client_authz` at each of the 19 canonical site blocks. **23 insertions,
0 deletions.**

The instrument removes client-supplied `X-Maia-Roles` and `X-Maia-Tier` request headers before
the request reaches the application, so a caller cannot assert its own role or tier by setting
them. It is **independently security-relevant** — not incidental adjacency to the deny rules —
and is therefore admitted as its own unit with its own provenance, necessity test, mutation
control, and admission decision.

This commit changes **no runtime behavior**. It commits the header deletions production is
already performing.

## Referents bound before extraction

```
host ................. soullab / 192.168.0.104
container ............ 67555df0b792b6fcf8de2d46ff4db252acc05565eee1f80591a957924a45ef48
image ................ sha256:fce4f15aad23222c0ac78a1220adf63bae7b94355d5ea28eee53910624acedfa
bind mount ........... /home/soullab/MAIA-SOVEREIGN/Caddyfile -> /etc/caddy/Caddyfile
live config sha256 ... 24884282a5c869c4dd6743270642d239c5fc318b09ad76f70a6fc88b38e1da8d
                       (host file == in-container == snapshot; UNCHANGED since the #1051 bind)
canonical tip ........ 39cc97d87   (Caddyfile blob b8c7b8706)
base (#1051 head) .... 2a6e5ed9e   (Caddyfile blob 858cb0865, sha256 68ed2b09…)
#1051 merged? ........ NO — canonical still has 0 occurrences of deny_disabled_routes
                       and 0 of strip_client_authz
```

## Construction — subtraction, again

Candidate = **live config minus the `staging.soullab.life` block**, nothing else. The strip
instrument is preserved by construction rather than re-authored, so it cannot silently drift
from what runs.

Verified as a pure addition against the base:

```
diff(base #1051, candidate) : 23 added, 0 removed
  19x  import strip_client_authz
   1x  (strip_client_authz) {
   1x      request_header -X-Maia-Roles
   1x      request_header -X-Maia-Tier
   1x  }
secrets check on the added lines : clean
```

**Round-trip proof.** Removing the strip instrument from the candidate yields a file that is
**byte-identical** to the admitted #1051 artifact (`sha256 68ed2b09…`). The unit is therefore
exactly and only the strip instrument — nothing else rode along.

```
sha256 candidate (this commit) = 17de4fda6849241b11deb553099d2df57312c895a7561987de42ff22b442a04f
```

## Controls

```
caddy validate (candidate) ........................ PASS "Valid configuration"

STRIP SEMANTICS — request-header-delete ops (adapted JSON)
  RUNNING ......... 40   {X-Maia-Roles: 20, X-Maia-Tier: 20}
  candidate ....... 38   {X-Maia-Roles: 19, X-Maia-Tier: 19}
  #1051 base ......  0   NONE
  header SET identical (running vs candidate) ..... TRUE
  every header differs by exactly 1 site .......... TRUE  (the excluded staging host)

MUTATION CONTROL — neutralize the instrument in a temp copy
  strip ops in candidate .......................... 38
  strip ops in mutant ............................. 0
  => removing the instrument removes the deletions . TRUE

NON-DISTURBANCE — the #1051 deny unit must be untouched
  deny handlers   base=76  candidate=76  mutant=76
  deny rule set identical (base vs candidate) ..... TRUE
```

## Excluded

| Excluded | Why |
|---|---|
| `staging.soullab.life` site block (SMCC iOS staging → `maia-staging:3000`) | operational, not security. Gets its own custody lane; it is not mixed into a security admission. |

No other host-only state exists: after removing the staging block, the live file and the
candidate differ in nothing.

## ⚠️ Still do NOT deploy, and this does not change that

The candidate remains a **strict subset** of the running config — it omits the staging block.
Replacing the host `Caddyfile` with it would delete that block. Deployment authorization
requires semantic equivalence to what is running, and that condition is **not met**.

Deployment is withheld because its authorization condition is unmet, **not** because it is
postponed. Custodying `strip_client_authz` does not authorize replacing the live `Caddyfile`;
full source/runtime congruence still requires the staging unit to be accounted for.

**The edge-config replacement freeze on minisforum remains in force**: no
`git checkout -- Caddyfile`, no reset/clean touching it, no deploy step refreshing it from git,
no backup restore over it.

## What changes once this merges

```
BEFORE                                   AFTER
deny rules ....... custodied             deny rules ....... custodied
strip_client_authz  HOST-ONLY            strip_client_authz  custodied
staging block .... HOST-ONLY             staging block .... HOST-ONLY
```

A mistaken checkout could still destroy the staging configuration irrecoverably. It would no
longer be capable of destroying **either live security control** irrecoverably. The freeze stops
being the only thing standing between an ordinary git operation and the loss of a security
control, and becomes protection for an operational unit that can then be custodied on its own
schedule.

Full source/runtime congruence remains **not established**.
