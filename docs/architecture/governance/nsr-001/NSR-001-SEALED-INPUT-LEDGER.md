# NSR-001 — SEALED INPUT LEDGER

> **This ledger establishes what is entitled to enter reconciliation. It does not reconcile it.**
>
> **Sealing the ledger is not permission to begin topology.**

**Status: `NSR_INPUTS_BOUND — RECORD QUALIFIERS REMAIN` · SEALED 2026-08-12**

Canonical referent resolved fresh: `52a3b924b7cf52013c1c8b0d635359c2cad672fc`. Production: `3d1e2734829626e29873a655ee189c9a091d1247`.

**No source artifact was altered to make statuses agree.** Where records conflict, the conflict is carried as an input property.

---

## Repository-side inputs

All on `chore/cmc-001-custody`. **Note the ref split:** local HEAD `2c1cf89f3609ee68cf9e52f68213b26dc8d53d92` (carries the NSR corrections) · **remote HEAD `d487f07530bc1763794013f3a0d7e01fdf8cfeb5`** — the corrections commit is **NOT PUSHED**.

| OBJECT | AUTHORITY CLASS | PATH | BLOB | BINDING | EVIDENCE STATUS | QUALIFIERS |
|---|---|---|---|---|---|---|
| **CMC-001 mandate** | governing method | `governance/cmc-001/JARVIS-CMC-001-…-MANDATE.md` | `8374f1e942c8e4f8b41dab319eb75dabf609681b` | BOUND | frozen 2026-08-12 | freeze record `acfe9ee4…`; 42 evidence blobs |
| **CRD-D return** | discovery evidence | `governance/crd-d-001/MAIA-COGNITIVE-RANGE-DISCOVERY.md` | `f8fac5bf1276ebfb5f1356d6a0bfcd798f548adb` | BOUND | verified, corrections attached | **read with corrections, never alone** |
| **CRD-D corrections** | discovery evidence · corrections | `governance/crd-d-001/CRD-D-CORRECTIONS-AND-RULINGS.md` | `ca029483888364c371256c9516d881f531b4a581` | BOUND | founder-ruled | COR-1 routing≠need · COR-2 EXPANSIVE search too narrow · COR-3 doctrine unreferenced |
| **A0 findings** | runtime evidence | `…/evidence/runtime-witness-a0/00-FINDINGS.md` | `1a5cafcabf4c270b026e7c1200155f448534a8a1` | BOUND | passive observation | scoped to what the instrument witnessed |
| **A1 classification** | runtime evidence | `…/evidence/runtime-witness-a1/A1-CLASSIFICATION-AND-CORRECTIONS.md` | `246df2cbac7613bf19c3f43b732c3caa4cca744c` | BOUND | live encounter | **see A1 claim binding below** |
| **SECREM-001 closure** | remediation evidence | `governance/secrem-001/SECREM-001-CLOSURE-PROVEN-IN-PRODUCTION.md` | `117501f384e9b126c2a18dcb86f8880b15c5d340` | BOUND | production-proven | **see T3 accounting below** |
| **Wrong-host retraction** | correction record | `governance/RETRACTION-RECORD-2026-08-12-WRONG-HOST.md` | `f6640b4f9f945c288c0a59827eb7772ca5f1a4fb` | BOUND | findings, not errata | three retractions preserved |
| **WOI-001** | instrument custody | `governance/woi-001/` @ `chore/woi-001-custody` | commit `18572262ab9ab5947131e1ee40be3f345e61f822` | BOUND | IMPLEMENTED / NOT DEPLOYED | Act 1 unopened |

## External founder artifacts — `EXTERNAL_LOCAL_ARTIFACT`

Deliberately created outside MAIA-SOVEREIGN. **Absent from all 34,272 filenames ever added to the repository** — correctly, not by omission. Bound by SHA-256.

| OBJECT | AUTHORITY CLASS | PATH | SHA-256 | BINDING | QUALIFIERS |
|---|---|---|---|---|---|
| **NS-001** | **founder north star · reconciliation-stage input** | `/Users/soullab/NS-001-DIRECTIONAL-CONSCIOUSNESS-FORMULATION.md` | `ba35996bf551d00c3979d2f42ff0f693d8c9204bea1af6fbad4e5d2328162b3a` | **BOUND BY FOUNDER RULING** | self-declares `AUTHORED / NOT AUTHORIZED / RECONCILIATION-STAGE INPUT`; contains Addenda 1–3; seal condition *"after A1, at reconciliation"* **now satisfied** |
| **CANON-001** | **founder canon · normative constraint** | `/Users/soullab/CANON-001-PLURALITY-HELD-IN-PRESENCE.md` | `8f4e48d18251ff3cce6cdba9683d0cb73333de07eda33b04c46524c2d905e881` | BOUND | placed outside `docs/canon/` deliberately — repo canon contained a false Implementation claim re `CorpusCallosumPrinciple.ts` |
| **CANON-002** | **founder canon · normative constraint** | `/Users/soullab/CANON-002-THE-LIVING-MEMBER.md` | `d7e3fd64f32bc4eaa2651b8165e094a1531c2085a565795c7be263e9942d4449` | BOUND | as above |
| **CRD-SA return** | discovery evidence | `/Users/soullab/artifacts/CRD-SA-001-RETURN.md` | `d95b5ce4103f26248f27622cf5ad4e78c1613d60571b3adfc9726673342c1dea` | BOUND | preserved unmodified; §2 wording refuted, judgment intact |
| **CRD-SA verification** | discovery evidence · verification | `/Users/soullab/artifacts/CRD-SA-001-VERIFICATION-NOTE.md` | `54831f7477fb0fe2bfd1e58891916b3bb555ebbc67a486108d53db8e05d4e2c9` | BOUND | **`INTERNAL_RECORD_CONFLICT` — see below** |
| **CRD-SA custody** | custody record | `/Users/soullab/artifacts/CRD-SA-001-CUSTODY.md` | `a9e501cb405063badd31d883ec38426f82d854e7940187d191d33f1919873ab7` | BOUND | its "all 7 items" claim **overstates** the artifact record |

**Not substituted:** `docs/product/CLIENT_EXPERIENCE_NORTH_STAR.md`, `docs/strategy/CO_LAB_NORTH_STAR.md`, `documentation/05-design-ui/SOULLAB_NORTH_STAR.md` — product and strategy documents, not the founder north star. The uncustodied scratchpad draft `5ee6c7a9…` (8,049 bytes) is a **different, smaller document** with **no competing authority**.

---

## Authority classes — never let one impersonate another

| Class | May establish | May NOT establish |
|---|---|---|
| **Founder canon** | normative constraint | that an implementation satisfies it |
| **Founder north star** | **what we were trying to build** | **what currently exists** |
| **CRD returns** | discovery, with corrections attached | runtime behaviour |
| **A0 / A1** | runtime fact, scoped to the instrument | intent, or influence |
| **SECREM** | remediation and deployment | anything beyond its scope |

> **NS-001 has authority to say what we were trying to build. It does not have authority to say what currently exists.** Founder ruling: binding NS-001 does **not** establish any proposition inside it as true about MAIA. Runtime claims within it remain claims until reconciled against evidence.

---

## Carried qualifiers

### CRD-SA — `INTERNAL_RECORD_CONFLICT`

Established from the artifact itself, not from memory. **Do not resolve by editing either record.**

- Items **1, 2, 5** — explicitly verified (`## Item N` sections, lines 9, 45, 66)
- Items **3, 4** — a verdict was **subsequently reached** (`## Verdict on items 3 and 4`, line 304: SA §2 as written **REFUTED**; unnamed partial equivalents exist; underlying conclusion likely survives; **classification `B` not disturbed**) — **while the header still says they were not run**, and the note also lists their *semantic re-tests* under `## Items NOT run`
- Items **6, 7** — **UNRUN BY DESIGN, not deficiencies.** Item 6 (`span ≠ altitude?`, `HIGH ≠ Weather?`) explicitly *"preserved as `UNRESOLVED`, not forced."* Item 7 (reconciliation with CRD-D / NS-001) deferred by design. **Observed.**
- **Header is stale** relative to the document's own later content — the same pattern found in `IMMUTABLE_SHA_DEPLOY.md`
- **Custody overstates** — "second-method pass, all 7 items" and "independently complete and independently verified" are not supported

**History preserved as a sequence:** partial note → later verification work → custody claims complete → stale partial header discovered → items 6/7 confirmed unrun by intent.

Standing carried forward: **classification `B` undisturbed** · trace verdict **`FIELD_PARTIALLY_PRESERVED`** · and the stream's own discipline at line 252 — *"CANON-001 was not used as evidence for this verdict, per its scope limit. It constrains what the finding means; it did not decide it."*

### A1 — the exact claim, and nothing more

> **"Prior conversation history was appended into the Turn-2 CORE prompt before Claude generation."**

Claude-as-generation-provider is preserved **separately**.

**Prohibited inflations:** all memory layers reached generation · all canonical addenda were composed · long-term memory influenced the answer · continuity improved the encounter · FAST behaves likewise (untested).

Superseded wording preserved with why it was written: *"A1 proves continuity reaches CORE generation."*

### SECREM / T3 — the sequence, not a tidied outcome

> **seven authorized → six implemented → independent scope verification performed**

**Proof 7: `NOT RUN / NOT IMPLEMENTED IN HARNESS`.** The independent scope verification (one differing production-code file, `maiaRuntimeContext.ts`, purely additive, not imported by `maiaVoice.ts`) is preserved **separately** and **must not be converted into a harness proof.**

`d716935dc3382fe41b8d817809e2561010e4425d` — verified content-identical (tree `27606347118461f375490ec0cc77fc4de54c785b`, empty diff). **No deployment standing.**

---

## HARD PRE-IMPLEMENTATION GATE

> **Production `3d1e2734…` contains production-proven SECREM-001. Canonical `52a3b924…` does not.** `3d1e2734…` is **not an ancestor of canonical.**
>
> **No rehabilitation implementation may parent from canonical until that lineage is reconciled into the implementation base.**

Otherwise the rehabilitation could resurrect the client-controlled prompt bypass while implementing consciousness architecture. NSR-001 may reconcile *architecture* while this stands, because NSR is read-only reasoning. **Implementation may not.**

---

## SEALED

Binding unit **CLOSED**. The next unit is the **standing map**, and it begins pre-normatively:

> **what exists → what it denotes → ontological class → evidence status → current standing → warrant**

Only after that is established: **required yield → proposed standing.**

**Still no topology.**
