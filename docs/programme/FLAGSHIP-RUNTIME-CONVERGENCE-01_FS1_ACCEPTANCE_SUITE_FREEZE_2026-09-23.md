# FLAGSHIP-RUNTIME-CONVERGENCE-01 / FS1 — Flagship Acceptance-Suite Freeze

**Date**: 2026-09-23
**Act**: FS1 — instrument freeze only (founder-authorized)
**FS1 base**: `4dade9a68668e3f2148e481859e85b60b172462c` on the active lineage `fix/flagship-ec1-contract-reconciliation-20260923`
**Canonical**: `4d6cc6789342284e833db67e111c6a5c3d691cce` — untouched
**Retired lane**: `claude/trusting-fermat-ju3quz` @ `71c15ec88` — not advanced
**Population**: `tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json` · `scripts/verify-flagship-freeze.ts` · `package.json` (one named command) · this record. ⛔ No product source. ⛔ No frozen artifact modified. ⛔ No contract. ⛔ Production untouched.

## 0. Standing at the top

- **57 law-bearing acceptance artifacts frozen by git blob identity** at `4dade9a68`; manifest SHA-256 `d1fff27d630968ae5d65ee87186864c8c26c2b555443a99340fa9663cb435a68` pinned inside the verifier.
- **Baseline green before the freeze** (§3): flagship base 13/13 · 8/8, five sub-suites green, C1A 9/9 · 8/8 with golden 6/6, C1B 10/10 · 9/9, C1C1 19/19 · 16/16 with D12 dying only on L12, C1C1 strict typecheck PASS.
- **Verifier fail-closed and lethal** (§5): law · candidate · runner · golden edits → RED by exact path; deletion → RED (ABSENT); manifest edited to bless changed bytes → RED (MANIFEST ALTERED); malformed entry → exit 2, nothing certified.
- **Boundary stated explicitly** (§6): a re-freeze changes two files together — the manifest and the digest pinned in the verifier. That co-change is the amendment act and requires founder authorization; the verifier cannot tell an authorized re-freeze from an unauthorized one by itself, so the diff of those two files is the evidence the founder adjudicates.

## 1. Opening census and classification

Every tracked file under the five named paths was inspected. Classification and disposition:

| Class | Count | Disposition |
|---|---|---|
| constitutional law (`laws.ts`, base + 5 sub-suites + C1A/C1B/C1C1) | 9 | frozen |
| defeat candidate registry (`candidates.ts(x)`) | 9 | frozen |
| defeat candidate (standalone host-file candidates) | 6 | frozen |
| matrix runner (`matrix.ts`) | 9 | frozen |
| accepted golden (C1A `golden/*.html`) | 6 | frozen |
| acceptance reference, mechanically required (`engine.ts` · `observeRefusals.ts` · `contract.ts` ×2 · `reference.ts` ×2 · C1A `renderStates.tsx`) | 7 | frozen — the laws import them; the C1A golden is rendered through `renderStates` |
| fixture, mechanically required by the golden (`scripts/witness/flagship/fixtures.tsx` · `developData.ts`) | 2 | frozen — `renderStates` requires the witness fixtures; `fixtures` imports `developData`; changing either changes what the golden law compares |
| witness implementation (`render.tsx` · `c1b-live-write-walk.ts` · `c1c1-discuss-walk.ts` · `c1c1-loopback-inference.ts`) | 4 | frozen — these carry the browser-form acceptance assertions (44/44 · 22/22 · 27/27) whose weakening would weaken accepted claims |
| typecheck instrument (`scripts/typecheck-ws-flagship-c1a.mjs` · `tsconfig.ws-flagship*.json` ×4) | 5 | frozen — the named-allowance runner and its programs; widening an allowance is the way a strict PASS gets manufactured |
| golden regeneration tool (`flagship-c1a/captureGolden.tsx`) | 1 | **excluded** — not a law; running it rewrites the goldens, which the freeze then reports |
| generated captures and result files (`docs/design/contracts/screenshots/**`) | — | **excluded** — output, not law; byte identity is a `git status` fact against the committed state |
| `package.json` | — | **excluded** — named commands only; the file moves for unrelated reasons |
| `scripts/verify-flagship-freeze.ts` | — | **excluded from the manifest by construction** — it pins the manifest; see §6 |

Sub-suites frozen with the base suite: `concurrency` · `facets` · `first-arrival` · `intent-first` · `work-root`. They have no npm command; they run as `npx tsx --tsconfig tsconfig.ws-flagship.json tests/constitutional/writers-studio/flagship/<name>/matrix.ts`.

## 2. Frozen manifest — complete population and blob identities

| Path | Class | Blob |
|---|---|---|
| `tests/constitutional/writers-studio/flagship-c1a/renderStates.tsx` | acceptance reference (mechanically required) | `cce6e2de7f628d06bacc81544e3c0eabb7417f44` |
| `tests/constitutional/writers-studio/flagship/engine.ts` | acceptance reference (mechanically required) | `fb7b3d23a51b5c8bd89447daccb37a3bc3cd00e6` |
| `tests/constitutional/writers-studio/flagship/intent-first/contract.ts` | acceptance reference (mechanically required) | `6c4e8e0a4dccdf03f65c5eec048c9522cce3a095` |
| `tests/constitutional/writers-studio/flagship/intent-first/reference.ts` | acceptance reference (mechanically required) | `b73f7189bce91efebf649c801932dd8ce23867a6` |
| `tests/constitutional/writers-studio/flagship/observeRefusals.ts` | acceptance reference (mechanically required) | `fab4d314eae2fffe80d7330491e8c250824205fe` |
| `tests/constitutional/writers-studio/flagship/work-root/contract.ts` | acceptance reference (mechanically required) | `2dab08e881fa55bba0cbbda69f77411b5e9d4408` |
| `tests/constitutional/writers-studio/flagship/work-root/reference.ts` | acceptance reference (mechanically required) | `c5fcb72ddf7977bbc13c652914ee12162a116d4c` |
| `tests/constitutional/writers-studio/flagship-c1a/golden/1-write-rest.html` | accepted golden | `d0cb6d6cc4964632816974174f28578b1dd7bb8a` |
| `tests/constitutional/writers-studio/flagship-c1a/golden/2-write-maia.html` | accepted golden | `855e09d1e1ef1e4253a661ab0cc478973ae044a2` |
| `tests/constitutional/writers-studio/flagship-c1a/golden/3-write-alternatives.html` | accepted golden | `44a4e7d28aaf0e68fcc1ed1383f2a8dff3f93808` |
| `tests/constitutional/writers-studio/flagship-c1a/golden/4-write-read-in-context.html` | accepted golden | `36e81861ffd4ab6b29308b610ab0f99756f427a0` |
| `tests/constitutional/writers-studio/flagship-c1a/golden/5-write-applied-undo.html` | accepted golden | `d85034700e5d93e27d651f461ddf1df28f12eb61` |
| `tests/constitutional/writers-studio/flagship-c1a/golden/5b-arrived-from-review.html` | accepted golden | `c6a72566716b93a6f84753eb0640064ada42ed80` |
| `tests/constitutional/writers-studio/flagship-c1a/laws.ts` | constitutional law | `0486464892a3a564be75d250655b8f8bb133abbb` |
| `tests/constitutional/writers-studio/flagship-c1b/laws.ts` | constitutional law | `7c8a1a6f70fbfae88af27df37d1891c03e0c33eb` |
| `tests/constitutional/writers-studio/flagship-c1c1/laws.ts` | constitutional law | `254232773958abbbc65f6f8e377b47f1ca61483b` |
| `tests/constitutional/writers-studio/flagship/concurrency/laws.ts` | constitutional law | `e166ea687bb8b2ef0b7cf2589d0040bcf373538e` |
| `tests/constitutional/writers-studio/flagship/facets/laws.ts` | constitutional law | `217aa45ba988d62b1203778356c3d87e6035ddbf` |
| `tests/constitutional/writers-studio/flagship/first-arrival/laws.ts` | constitutional law | `f289cf4f923e8c53d1a220ec9a7d585a3aa24561` |
| `tests/constitutional/writers-studio/flagship/intent-first/laws.ts` | constitutional law | `e8d1198ebd0ba151d5dd3f943035d8b52f8bab60` |
| `tests/constitutional/writers-studio/flagship/laws.ts` | constitutional law | `ffdf5cc159962b27fb14206a620d0cb9ff4f28d0` |
| `tests/constitutional/writers-studio/flagship/work-root/laws.ts` | constitutional law | `8206154e71f6b21884a1cd79d03c5c297ada582d` |
| `tests/constitutional/writers-studio/flagship-c1a/candidates/D2_SaveOwnerFrame.tsx` | defeat candidate | `0c353e0b182cf28dc726440c5307b06cfef8aab0` |
| `tests/constitutional/writers-studio/flagship-c1a/candidates/D3_DeadControlFrame.tsx` | defeat candidate | `71db0cfdebe9e4cf92f3fa0ced4537bda89e9228` |
| `tests/constitutional/writers-studio/flagship-c1a/candidates/D7_StateOwnerFrame.tsx` | defeat candidate | `62501ff57e74dd7a9a2e3bf3d67db3a1da152f0d` |
| `tests/constitutional/writers-studio/flagship-c1b/candidates/D2_SecondSessionHost.tsx` | defeat candidate | `fea5989ea72f4ea9a711ac6818203056000b3b2a` |
| `tests/constitutional/writers-studio/flagship-c1c1/candidates/D3_SecondPassageOwner.tsx` | defeat candidate | `fc5bd09b5a39a95e4be0ffb96c5a210083d592bd` |
| `tests/constitutional/writers-studio/flagship-c1c1/candidates/D4_FlagProbeHost.tsx` | defeat candidate | `2525fc140a6bd96567e078bb2ce5ecd2aefd0d84` |
| `tests/constitutional/writers-studio/flagship-c1a/candidates.tsx` | defeat candidate registry | `fbca281e8d48ae3f992d1ac2bb64979d4546ad66` |
| `tests/constitutional/writers-studio/flagship-c1b/candidates.tsx` | defeat candidate registry | `5f6fcec102ef60943a0851df1d0d8dea3d34e81f` |
| `tests/constitutional/writers-studio/flagship-c1c1/candidates.tsx` | defeat candidate registry | `72740416e0d2d40b124bc466d680d23b84871988` |
| `tests/constitutional/writers-studio/flagship/candidates.ts` | defeat candidate registry | `1783915bf50bede38871c1485c97083dc54877af` |
| `tests/constitutional/writers-studio/flagship/concurrency/candidates.ts` | defeat candidate registry | `61a94e1e9e65533d3397ca119fc72f440ba60a2d` |
| `tests/constitutional/writers-studio/flagship/facets/candidates.ts` | defeat candidate registry | `197ed0c83a3d83a4cecaff039a7e83101e4ca74c` |
| `tests/constitutional/writers-studio/flagship/first-arrival/candidates.ts` | defeat candidate registry | `70894704411993d92b58f0fb391c6da1a399c3e3` |
| `tests/constitutional/writers-studio/flagship/intent-first/candidates.ts` | defeat candidate registry | `55045fb64b666f8108a3f0ac769e63115db5bc81` |
| `tests/constitutional/writers-studio/flagship/work-root/candidates.ts` | defeat candidate registry | `d77c5de94b5c3dba84336bb379af37868c4932c8` |
| `scripts/witness/flagship/developData.ts` | fixture (mechanically required by the golden) | `91cb80d34c0f953a3d7791a093be88563b5755cf` |
| `scripts/witness/flagship/fixtures.tsx` | fixture (mechanically required by the golden) | `ff22872df547ddeb8dafd06c361fa7ce7a553ff5` |
| `tests/constitutional/writers-studio/flagship-c1a/matrix.ts` | matrix runner | `77cb5da489ad488cbd92c78e1842505b8c7fe3b0` |
| `tests/constitutional/writers-studio/flagship-c1b/matrix.ts` | matrix runner | `b0d19ffd81dcb745f9c5de4c434256fd8143fbf6` |
| `tests/constitutional/writers-studio/flagship-c1c1/matrix.ts` | matrix runner | `a75ccaf9a987e544e512b220dd2b108ee2d4e9a9` |
| `tests/constitutional/writers-studio/flagship/concurrency/matrix.ts` | matrix runner | `b222725be89fe1733e006bf4d316ea24c7f922bf` |
| `tests/constitutional/writers-studio/flagship/facets/matrix.ts` | matrix runner | `22d9584a96f52f4a3da6d33777bffaedb9315bf3` |
| `tests/constitutional/writers-studio/flagship/first-arrival/matrix.ts` | matrix runner | `e1ebe60e9d5977a8b11aff3d0ec61a50060ae913` |
| `tests/constitutional/writers-studio/flagship/intent-first/matrix.ts` | matrix runner | `790f3bfb82f1a4cce1461cc64f7d72c532ec5f4b` |
| `tests/constitutional/writers-studio/flagship/matrix.ts` | matrix runner | `5f96ea48ff8f80ab5ac6a681101ff6bcb2b5a3b2` |
| `tests/constitutional/writers-studio/flagship/work-root/matrix.ts` | matrix runner | `9f39f4f6badf2279a4416fe744df2c1c994376df` |
| `scripts/typecheck-ws-flagship-c1a.mjs` | typecheck instrument | `34d5d3b2f7dbb54a8e8e42103e496bc6419fd8ba` |
| `tsconfig.ws-flagship-c1a.json` | typecheck instrument | `79b7bd4388d99793feb07bec8c64628032a1864f` |
| `tsconfig.ws-flagship-c1b.json` | typecheck instrument | `e5dcd1f681f772dae3fdf092247e886b8ab19443` |
| `tsconfig.ws-flagship-c1c1.json` | typecheck instrument | `2de5fb1d8d8476e61bd9198729321c5ca6c29e02` |
| `tsconfig.ws-flagship.json` | typecheck instrument | `12de839efbdab9b6ebbd85262b818e7af6f7c3ff` |
| `scripts/witness/flagship/c1b-live-write-walk.ts` | witness implementation | `692b7416fe94d3f0d76d5c514b4b0a81a66c0116` |
| `scripts/witness/flagship/c1c1-discuss-walk.ts` | witness implementation | `ba191ae16d28b49defec489d84637697ca681992` |
| `scripts/witness/flagship/c1c1-loopback-inference.ts` | witness implementation | `a1800c6233d40577e921e3392199a3c3de76cb42` |
| `scripts/witness/flagship/render.tsx` | witness implementation | `633109da761ce149dadf9a02db7eea29b2f968cb` |
Manifest: `tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json` · SHA-256 `d1fff27d630968ae5d65ee87186864c8c26c2b555443a99340fa9663cb435a68`.

## 3. Baseline proof (before recording the manifest, at `4dade9a68`, clean tree)

| Suite | Result |
|---|---|
| `matrix:ws-flagship` (base) | reference 13/13 · 8/8 dead · LETHAL + DISCRIMINATING |
| `flagship/concurrency` | 12/12 · 12/12 dead |
| `flagship/facets` | 12/12 · 12/12 dead |
| `flagship/first-arrival` | 15/15 · 11/11 dead |
| `flagship/intent-first` | 15/15 · 15/15 dead |
| `flagship/work-root` | 16/16 · 15/15 dead |
| `matrix:ws-flagship-c1a` | 9/9 · 8/8 dead · **C1A-L8 golden 6/6 byte-identical** |
| `matrix:ws-flagship-c1b` | 10/10 · 9/9 dead |
| `matrix:ws-flagship-c1c1` | 19/19 · 16/16 dead · **D12 → L12 only, no collateral** |
| `typecheck:ws-flagship-c1c1` | PASS — 0 diagnostics outside the named inherited allowance |

Nothing was red; the freeze was taken on a green baseline. Every frozen blob was additionally asserted equal to its `4dade9a68` tree blob at manifest generation.

## 4. Verifier design

`npm run verify:flagship-freeze` → `scripts/verify-flagship-freeze.ts`:

1. reads the manifest and **first** checks its SHA-256 against the constant pinned in the verifier — mismatch → exit 1 `MANIFEST ALTERED`;
2. refuses an empty freeze (exit 2);
3. for every entry: malformed blob → instrument error; missing file → `ABSENT`; `git hash-object` failure → instrument error; live blob ≠ frozen blob → `CHANGED`, reported by exact path with both hashes;
4. exit 0 only when every entry resolved and matched; exit 1 on any drift or manifest alteration; exit 2 whenever identity could not be established for every entry ("nothing is certified").

It never writes. It cannot refresh the manifest.

## 5. Falsification (disposable mutations on the working tree, each restored)

| Mutation | Verifier |
|---|---|
| M1 one frozen law edited (`flagship-c1c1/laws.ts`) | RED · exit 1 · path named |
| M2 one defeat candidate edited (`flagship-c1b/candidates/D2_SecondSessionHost.tsx`) | RED · exit 1 · path named |
| M3 one matrix runner edited (`flagship-c1a/matrix.ts`) | RED · exit 1 · path named |
| M4 one golden edited (`flagship-c1a/golden/1-write-rest.html`) | RED · exit 1 · path named |
| M5 one frozen file removed (`flagship/engine.ts`) | RED · exit 1 · `ABSENT` |
| M6 law edited AND manifest edited to bless the new blob | RED · exit 1 · `MANIFEST ALTERED` — not accepted as verification |
| M7 malformed entry (digest re-pinned so only the malformation is under test) | exit 2 · `MALFORMED` · nothing certified |
| restored tree | ✅ 57/57 intact · exit 0 |

## 6. Future amendment law

Changing any frozen artifact requires a separately authorized act stating: **which frozen object changes · why the standing law must change · what prior acceptance claim is affected · what new falsifier or law replaces it.** Additive law at a new address needs no re-freeze. A lawful re-freeze updates the manifest **and** the verifier's pinned digest in the same act; the verifier cannot distinguish that from an unauthorized double edit, so **every change to `FLAGSHIP_FREEZE.json` or to the pin in `verify-flagship-freeze.ts` requires founder authorization**, and the two-file diff is what the founder adjudicates. Ordinary implementation work may not touch either because a test became inconvenient.

## 7. Closing proof (after the freeze landed, same tree)

```
matrix:ws-flagship           exit=0  matrix LETHAL + DISCRIMINATING
matrix:ws-flagship-c1a       exit=0  matrix LETHAL + DISCRIMINATING
matrix:ws-flagship-c1b       exit=0  matrix LETHAL + DISCRIMINATING
matrix:ws-flagship-c1c1      exit=0  matrix LETHAL + DISCRIMINATING
typecheck:ws-flagship-c1c1   exit=0  verdict PASS — 0 diagnostics outside the named inherited allowance
verify:flagship-freeze       exit=0  ✅ FREEZE INTACT — 57/57 frozen files blob-identical to 4dade9a68
git diff --check   clean
population         package.json (one command) · scripts/verify-flagship-freeze.ts · tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json · this record
```

**Source / product changes: none. Production: untouched. Standing: FS1 ✅ CLOSED ON CANDIDATE · STOPPED for founder adjudication. ⛔ No Review wiring, C1C expansion, Revise, Develop, Commission or Observation storage opened.**
