# CMC-001 · Phase 1 · §XXXIV — Artifact 1: Canonical Route / Referent Record

## Mandate binding
- Frozen mandate commit: `dbc4d5df3f0806403ee3d14aba4dd573b637dfb0`
- Path: `docs/architecture/governance/cmc-001/JARVIS-CMC-001-CANONICAL-MAIA-CONTINUITY-CENSUS-MANDATE.md`
- Blob SHA-1 computed by executor: `8374f1e942c8e4f8b41dab319eb75dabf609681b` — **MATCHES** launch authority
- SHA-256 computed by executor: `1b136fdb67a4d20ec570de52fef95f69393b92cad190bf489b01e629ca2f42f4` — **MATCHES**
- Size: 44612 bytes, 979 lines

## Referent (§II)
| Field | Value | How known |
|---|---|---|
| repository | `github.com/SoullabTech/Sovereign.git` (local clone `/Users/soullab/MAIA-SOVEREIGN`) | OBSERVED |
| canonical remote ref | `refs/heads/clean-main-no-secrets` | OBSERVED — mandate header + fetched |
| inspected SHA | `52a3b924b7cf52013c1c8b0d635359c2cad672fc` | OBSERVED — `git fetch origin clean-main-no-secrets` then `git rev-parse origin/clean-main-no-secrets`, resolved fresh at launch 2026-08-12 |
| working-tree branch | `feature/labtools-redesign` — NON-canonical. No source was read from the working tree. All source read via `git show 52a3b92…:<path>`. | OBSERVED |
| route-authority registry (executable) | `lib/maia/maiaRuntimeContext.ts` lines 59–101, `MAIA_ROUTE_REGISTRY` — blob `4e84b2a204559fa6f2d97e8fece7f64ccba5633c` | OBSERVED |
| route-authority registry (documentary) | `docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md` — blob `9ecf7447c6abc169a1e20cc2397c6515dbbc692d` | OBSERVED. Per §III the executable registry outranks the doc for branch behavior; the doc is corroboration only. |
| deployed production SHA | **NOT OBTAINABLE** under static-only authority | `DEPLOYED_REFERENT_UNBOUND` |
| inspected ≡ deployed proven? | **NO** | Not proven |

## Route registry state at 52a3b92
Source: `lib/maia/maiaRuntimeContext.ts:59-101`

| routeId | status | callsMaiaResponse | memoryHealthExpected | atomsExpected |
|---|---|---|---|---|
| `sovereign/app/maia/list` | `canonical-live` | true | true | true |
| `between/chat` | `live-secondary` | false | true | true |
| `sovereign/app/maia` | `dormant` | true | false | false |

Registry `status` enum in code is `'canonical-live' | 'live-secondary' | 'dormant' | 'reference'`
(`maiaRuntimeContext.ts:104`). This is the *code* enum; mandate §VII's `route_status`
enum (`REGISTERED_CANONICAL_LIVE` etc.) is the *census* enum. They map 1:1 but are
distinct surfaces — recorded here so the mapping is not mistaken for identity.

## Evidence classification for the primary referent
- `evidence_basis`: `STATIC_POSSIBLE` (source), `REGISTRY_WITNESSED` (registry declaration)
- `route_status`: `REGISTERED_CANONICAL_LIVE`
- `observed_status`: `NOT_OBSERVED` — no runtime witness authorized (§XXVII), no live-witness performed
- `evidence_date`: 2026-08-12 (this inspection); registry traffic audit carries its own `evidence_date: 2026-05-23` per §XXVI
- `referent_binding`: `origin/clean-main-no-secrets @ 52a3b924b7cf52013c1c8b0d635359c2cad672fc`

## Route ingress binding (§XXXIV.1)
`app/api/sovereign/app/maia/list/route.ts` — blob `04b08a20df52bd71ae05074e095e81abe9661379`, 1769 lines.
Line 1126 passes the literal `routeId: 'sovereign/app/maia/list'` into `buildMaiaRuntimeContext`.
This is the executable binding between the route file and the registry key. OBSERVED.
