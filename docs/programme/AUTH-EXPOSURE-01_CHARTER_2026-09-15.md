# AUTH-EXPOSURE-01 — Member / Practitioner Authorization Boundary

**Lane opened**: 2026-09-15 (founder act)
**Subject SHA**: `1a555430` — *Merge pull request #1295 from SoullabTech/claude/ws-disclosure-orientation-transport-01*
**Standing**: OPEN · FIRST ACT (bounded census + witness) · **STOP BEFORE REPAIR**

---

## 0. Why this lane exists

P1-02 Domain I found implementation evidence suggesting that practitioner-facing
authorization may not consistently derive **actor identity**, **member relationship**,
**consent**, and **practitioner status** from an authenticated authority boundary.

P1-02 did not prove exploitability and did not authorize repair.

This lane exists to determine, path by path, whether the observed implementation
produces an actual authorization exposure.

⚠️ **Custody note on the opening evidence.** No `P1-02` record is present in
`docs/` at the subject SHA (searched: `docs/**` for `P1-02`, `Domain I`). The lane's
opening evidence is therefore the founder's statement of what P1-02 Domain I
observed, not a committed artifact. **`NONE LOCATED` is not `ABSENT`** — the record
may exist outside this checkout. Recorded so that no later reader mistakes this
lane's census for a re-derivation of a document it never read.

## 1. Relationship to the Phase 1 whole-organism census

This lane is **independent**.

- P1-02 Domain I is **opening evidence only**.
- This lane does **not** alter, complete, or repair P1-02.
- Its later findings may return to the whole-organism programme as **new evidence**,
  never as a retroactive change to what P1 observed at its census subject.
- **P1-07 is untouched.** No worker, branch, or record of the P1 lane is read,
  written, or disturbed by this lane.

## 2. First act — bounded census and witness only

For every implicated practitioner/member path, establish:

1. Who is the authenticated caller?
2. Where does actor identity come from? — authenticated session · URL parameter ·
   query parameter · request body · fallback/mixed source
3. Whose member identifier controls the requested resource?
4. Is a practitioner↔member relationship checked?
5. Is member consent checked?
6. Does middleware explicitly refuse the route, or does it pass as
   unmapped/default-permissive?
7. What member data or metadata can cross the boundary?
8. Can practitioner status or `is_practitioner` be created/elevated without an
   authorized actor?
9. Is the suspicious path actually reachable at the subject?

## 3. Classification per path

| Class | Meaning |
|---|---|
| `PROVED EXPOSURE` | A witness established that the boundary yields what it must not |
| `PROVED REFUSAL` | A witness, or a read that leaves no branch open, established refusal |
| `WIRED-BUT-UNOBSERVED` | The implementation reads as open; no witness has been run |
| `NOT REACHABLE` | The path cannot be reached at the subject |
| `UNKNOWN` | Not determined by this act |

## 4. Evidence discipline

- Synthetic / test identities and metadata **only**.
- **Do not inspect or expose real member content** merely to prove an
  authorization boundary.
- A suspicious implementation is **not a proved vulnerability** until the relevant
  actor/resource boundary is **witnessed**.
- **`NONE LOCATED` is not `ABSENT`.**
- **Implementation does not establish authorization.** Neither does the absence of
  a grep hit establish the absence of a gate — the census instrument names its own
  vocabulary, and a gate written outside that vocabulary reads as silence.

## 5. NOT AUTHORIZED

- access-model redesign
- consent-architecture redesign
- role-system redesign
- schema changes
- broad middleware rewrite
- repair of any exposed path
- production mutation
- deployment
- use of real member content as witness material

## 6. First return

A custody/census record identifying: exact subject SHA · implicated route families ·
actor-identity source per path · authorization/relationship/consent gates per path ·
reachability standing · witness status · classification · unresolved unknowns.

→ `docs/programme/AUTH-EXPOSURE-01_CUSTODY_CENSUS_2026-09-15.md`

**STOP before repair.**
