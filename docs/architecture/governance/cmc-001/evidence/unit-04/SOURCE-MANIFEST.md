# CMC-001 · Unit 4 + Reconciliation · SOURCE MANIFEST

**Canonical SHA:** `52a3b924b7cf52013c1c8b0d635359c2cad672fc` (`refs/heads/clean-main-no-secrets`)

Per the superseding discipline in `SOURCE-IDENTITY-RESOLUTION-DISCIPLINE.md`, path + blob
establishes *which bytes*; only import lineage establishes *whether they run on the traced path*.
Lineage is recorded in the reconciliation record, not here.

| Source path | Blob SHA-1 | at canonical |
|---|---|---|
| `app/api/_backend/src/services/psiMemoryBridge.ts` | `f13993a3154b91dc5380302e296d2c5619905e20` | yes |
| `app/api/sovereign/app/maia/list/route.ts` | `04b08a20df52bd71ae05074e095e81abe9661379` | yes |
| `docs/architecture/governance/cmc-001/evidence/unit-03/EVIDENCE-DISCIPLINE-BLOB-BINDING.md` | — | **NOT PRESENT** |
| `docs/architecture/governance/cmc-001/JARVIS-CMC-001-CANONICAL-MAIA-CONTINUITY-CENSUS-MANDATE.md` | — | **NOT PRESENT** |
| `lib/ai/multiEngineOrchestrator.ts` | `b07d4b04bdb97a2e39a7d22239afb7356d6ba53b` | yes |
| `lib/ain/awareness-levels.ts` | `03231cb3a4e62779e1cd7a5e1a5d10989b63a94c` | yes |
| `lib/bridges/memory-systems-bridge.ts` | `f92022ff0dcca2872d886969c79b5494666f17d7` | yes |
| `lib/bridges/obsidian-vault-bridge.ts` | `6485d2083355cd66bb036ce50cb3a578d5f622a8` | yes |
| `lib/consciousness/awareness-levels.ts` | `3ee205fcad47c341a513d5ffadd38cd884a127b6` | yes |
| `lib/consciousness/consciousness-layer-wrapper.ts` | `42dd2c210cf22cd2c2d0a3e8a800fa6b9e32c29f` | yes |
| `lib/consciousness/maiaOrchestrator.ts` | `806ad96775ae675f99d2ac74aea02ce2f3345e8d` | yes |
| `lib/learning/enhanced-maia-service.ts` | `d1063af3033f10b91d084914655614eaa60f66cd` | yes |
| `lib/maia/memoryOrchestrator.ts` | `5f353d8956c88a3bb9b3a5ec35fec821c176a6e7` | yes |
| `lib/memory/MemoryOrchestrator.ts` | `940130aec6f55bc86912c1d97094d4af1645ea06` | yes |
| `lib/oracle/ConversationIntelligenceEngine.ts` | `92c6cca21266e6ff32cd8d0ecf93fff0da314e92` | yes |
| `lib/orchestration/consciousness-orchestrator.ts` | `33fce86bfde8f1c01c53588403d7f8753582b9f7` | yes |
| `lib/ritual/sacred-journey.ts` | `6a9a73d42db217b31bbf55c8f4b6ef301b98fd6b` | yes |
| `lib/sacred-oracle-core-enhanced.ts` | `27a8249ea172928b33279c77e34fa1995ead586b` | yes |
| `lib/sovereign/maiaService.ts` | `e8f5bf6d9badcec949f58d8fa0ac9ba0e01954c1` | yes |
| `lib/validation/socraticValidator.ts` | `dfea134d6ffb7053d8a953a35e035ca21bfc3ac2` | yes |
| `lib/wisdom-engines/ai-intelligence-bridge.ts` | `e80573e46bc14db9c0e1c368c5e6b8940bd50540` | yes |

## Note on the two `NOT PRESENT` rows

Both are CMC-001's own governance artifacts. They live on the custody branch
`chore/cmc-001-custody`, not on canonical trunk, and are therefore correctly absent
from a trunk tree listing. Neither is a source-code citation.

- The frozen mandate resolves at commit `dbc4d5df3` to blob `8374f1e942c8e4f8b41dab319eb75dabf609681b`
- The superseded discipline record resolves on the same custody branch

This is expected, not a citation failure.
