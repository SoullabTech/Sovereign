# P2 — Evidentiary Note 01

**Prepared 2026-08-06. Evidential only.**

⛔ **No ruling. No recommendation. No proposed ratification language.**

## Relationship to the packet

**Extends; does not amend.** `docs/governance/P2_RATIFICATION_PACKET_2026-08-06.md` remains
historically untouched at commit `a7d8ab624`. This note is a separate, dated artifact. If P2
attaches to `dd8917b08`, the constitutional act cites **the packet *and* this note** — the
preparation that led to the act is preserved rather than rewritten.

## Why this note exists

The packet establishes its own evidentiary convention: an immutable referent is identified by
**commit + blob hash + byte size**, applied to all five documents in §1a and §2.

`dd8917b08` appears in the packet at **§3** (the drift finding), identified by commit, date, branch,
version, status and diff shape — but **not** by content fingerprint. That is an asymmetry in
evidentiary completeness, not in constitutional standing. This note restores the symmetry by
supplying the missing fingerprint at the same standard, rather than lowering the standard for one
document.

⛔ It does not argue for or against selecting `dd8917b08`.

---

## 1. Fingerprint — `dd8917b08`

**Path:** `docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md`

| Field | Value |
|---|---|
| Commit (full) | `dd8917b08f657989cdd1ad863f8fced857157a08` |
| Commit (short) | `dd8917b08` |
| Authored | 2026-08-05 21:14:28 −0400 |
| Subject | *docs(practitioner-field): absorb the 2026-08-05 founder custody ruling — store the relationship, not the material* |
| **Blob** | `71a2b1218a84bb43309a5242bc92eb821018fab0` |
| **Bytes** | 42,805 |
| **SHA-256 of content** | `67f3e0ee248bdefa9a52abd0236989dce7709c81627b8a13a339baaabdbbd381` |
| Document title | `# Practitioner Wisdom Field — Product Definition v0.3` |
| Status line | `**Status:** CANDIDATE product definition. Cat 1 (preserved direction) + Cat 2 (canonical primitive target).` |

## 2. Comparison — the packet §1a referent

**Same path**, at the commit the packet names as the primary proposed referent.

| Field | `72945d1eb` (packet §1a) | `dd8917b08` (this note) |
|---|---|---|
| Blob | `19d65f207a9ee750ca209b5af0a4030ca71ae60b` | `71a2b1218a84bb43309a5242bc92eb821018fab0` |
| Bytes | 38,185 | 42,805 |
| SHA-256 | `78fdd2e204fce7e7444441cd93bfd2e3e93661c8de24b8f23c836e69aeb675cc` | `67f3e0ee248bdefa9a52abd0236989dce7709c81627b8a13a339baaabdbbd381` |
| Version | v0 | v0.3 |
| Status | CANDIDATE | CANDIDATE |

Both referents are now identified at the same standard.

## 3. Independent verification of the packet's §3 byte-identity claim

The packet §3 states that the **§3 authority axes — the portion P2 ratifies — are byte-unchanged**
between the two commits. That claim was originally derived from diff-hunk locations. It is
re-verified here directly, by hashing the section itself in each commit:

| Commit | SHA-256 of `## 3.` … `## 4.` |
|---|---|
| `72945d1eb` | `0b25888c00aaea3f94e98e87ae22db1c230edd73a8eb5cf8e9fd749260d01122` |
| `dd8917b08` | `0b25888c00aaea3f94e98e87ae22db1c230edd73a8eb5cf8e9fd749260d01122` |

**Identical.** The packet's §3 claim is confirmed by a second, independent method.

## 4. Reachability

`dd8917b08` is reachable from several branches, including
`chore/practitioner-field-custody-ruling` (and its `origin/` counterpart).

⚠️ **`dd8917b08` is NOT an ancestor of trunk** (`clean-main-no-secrets`). This matches the packet's
finding that all five governing documents are absent from trunk; it is the same open custody gap,
not a new one. Record §5 custody repair is sequenced after P2 and is unaffected by this note.

## 5. Scope of this verification

- Read-only. Nothing committed, restored, moved, or modified in the repository state under review.
- **Verified:** commit identity · blob hash · byte size · SHA-256 of full content · document title ·
  status line as written · trunk ancestry · byte-identity of the §3 section across both commits.
- **Not verified:** the *content* correctness of any document · whether §3's axes say what the
  Record assumes · the Authority Schema (`6a521eb5f`) beyond what the packet already records ·
  anything about N7/N8/N11 beyond the packet's §1b.
- **Not established by this note:** any Tier 1 / Tier 2 distinction · any negative-scope statement ·
  any deferred-questions list. Those are absent from the packet; if needed they must be cited from
  the Record (§7) or established elsewhere — ⛔ not imported by implication.
