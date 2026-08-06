# P2 — Evidentiary Note 02 (CORRECTION)

**Prepared 2026-08-06. Evidential only. ⛔ No ruling, no recommendation, no ratification language.**

## What this note corrects

**Supersedes two factual claims** made in the P2 packet (`a7d8ab624`) and in Evidentiary Note 01
(`c87897f17`). ⛔ **Neither artifact is edited.** Both stand as the record of what was known when.

| Superseded claim | Where | Correct state |
|---|---|---|
| "All five governing documents are **absent from trunk**" | Packet §2 table, §3 | ❌ **False.** All five are **on trunk.** |
| "`dd8917b08` is **NOT an ancestor of trunk**" | Note 01 §4 | ❌ **False.** It **is** an ancestor. |

## Root cause — a stale local ref, not a repository state

Both measurements compared against the **local** `clean-main-no-secrets` ref, which was
**402 commits behind** `origin/clean-main-no-secrets` and had not been fetched.

| Ref | Tip | Date |
|---|---|---|
| local `clean-main-no-secrets` (what was measured) | `f9a7326f1` | 2026-08-03 08:47 |
| `origin/clean-main-no-secrets` (actual trunk) | `ced4ab513` | 2026-08-06 10:29 |

The local tip **predates the commits that created these documents**, so the absence was guaranteed
by the observation point. ⭐⭐⭐ **The absence was a property of the observer's ref, not of trunk.**

⚠️ Note the precise form: the stale ref was the **local trunk ref**, not the feature branch. The
feature branch was measured as *ahead of* local trunk, which is true and was not the issue.

## Verified state on `origin/clean-main-no-secrets` (`ced4ab513`)

| Canonical path | On trunk | Blob | Matches Record §5 restore-from |
|---|---|---|---|
| `docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md` | ✅ | `71a2b1218a84` | ⚠️ = **`dd8917b08` (v0.3)**, *not* `72945d1eb` (v0) |
| `docs/governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md` | ✅ | `f87e8b394ed1` | ✅ `6a521eb5f` |
| `docs/governance/PRACTITIONER_WISDOM_CAPTURE_PROTOCOL_v1.md` | ✅ | `7791bc87f532` | ✅ `51deb4b2d` |
| `docs/reviews/LARRY_IP_CORPUS_INVENTORY_AUDIT_2026-08-03.md` | ✅ | `858db3073f54` | ✅ `51fea00ad` |
| `docs/governance/LARRY_ATTACHMENT_A_INSTRUMENT_v0.md` | ✅ | `58e431d9f719` | ✅ `51fea00ad` |

Ancestry: **both** `72945d1eb` and `dd8917b08` are ancestors of trunk.

Trunk's Constitution reads `# Practitioner Wisdom Field — Product Definition v0.3`,
status `CANDIDATE`.

## Consequences for the sequence — stated, not ruled

1. **Record §5 custody repair may already be satisfied.** Four of five blobs match their named
   restore commits exactly; the fifth is present at a **later** commit than §5 names. ⛔ Whether
   that constitutes satisfaction of §5, or a deviation requiring disposition, is **not ruled here.**
2. **Packet §1a's referent is superseded on trunk.** §1a names `72945d1eb` (v0); trunk carries
   `dd8917b08` (v0.3). The two candidate referents are not equally current.
3. **Note 01's fingerprint work stands.** Its §1–§3 are unaffected: the `dd8917b08` fingerprint and
   the independent §3-axes byte-identity verification
   (`0b25888c00aaea3f…`, identical in both commits) remain correct. Only §4 is superseded.

## Method finding

⭐⭐⭐ **Content integrity is not referent currency.** Every hash in the packet and Note 01 was
correct. Hashing proves *this object is unchanged*; it cannot detect *this is no longer the object
the act should attach to*. A referent goes stale **without the object changing at all**.

⛔ **A ref name is not a measurement.** `clean-main-no-secrets` and
`origin/clean-main-no-secrets` are different objects. Any trunk claim must name the **tip SHA it was
measured against** and be fetched first.

## Scope

- Read-only; `git fetch` only. Nothing committed, restored, or modified in the objects under review.
- **Verified:** local/remote ref divergence · presence and blob of all five paths at `ced4ab513` ·
  ancestry of both candidate commits · trunk Constitution title and status line.
- **Not verified:** whether trunk's content equals the §5-named blobs for the Constitution (it does
  not — it is the later one) beyond what the table states · anything about N7/N8/N11 · the Authority
  Schema's contents.
- **Not established:** any Tier 1 / Tier 2 distinction · negative scope · deferred-questions list.
