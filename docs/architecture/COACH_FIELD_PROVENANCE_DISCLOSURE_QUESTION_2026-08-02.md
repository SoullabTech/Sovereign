# Provenance disclosure — what may reconciliation evidence reveal, and to whom?

**Status: ⏳ UNRULED. Surfaced for founder decision. Deliberately not decided by the corrective lane.**

Raised by: `COACH_FIELD_FOUNDATION_CANONICALITY_2026-08-02.md` §8.4 / §8.8
Held open by: `database/migrations/20260802000004_reconciliation_evidence_contract.sql` §2b

---

## 1. The fact

`practitioner_client_reconciliation.provenance` carries a raw email address:

```sql
jsonb_build_object(
  ...
  'normalized_email', pc.normalized_invitation_email     -- 000002 L486
)
```

The same value already exists on the same row's relationship
(`practitioner_clients.normalized_invitation_email`, reachable via `relationship_id`).
So the queue row holds a **second copy** of person-identifying data — in an open JSONB
column, on a table whose purpose is to be read by a human resolving an ambiguity.

## 2. ⛔ The question is not the one that looks obvious

The convenient framing is *"can we hash the email?"* That question is a schema
technique standing in for a decision that has not been made. Convenience is not a
reason to keep a field, and it is not a reason to transform one either.

The actual question:

> **Does this artifact need the email itself, or only proof that a match occurred?**

And underneath it:

> **What is `provenance` FOR — and therefore, what is it allowed to reveal, and to whom?**

Those are different objects with different obligations, and the answer determines the
schema rather than following from it.

## 3. The options

### Option A — provenance serves AUTOMATED reconciliation

`provenance` exists so the classifier's decision is auditable and re-derivable by
machine. It carries counts and identifiers, never the person.

| | |
|---|---|
| Keys | `verified_email_matches` · `any_email_matches` · `claimed_invitations` · `competing_relationships` · `candidate_relationship_ids` · `match_basis` · `verification_state` / `email_verified` |
| Drops | `normalized_email` |
| Consequence | No second copy of PII. The evidence stays complete for a machine: how many matched, how many competed, whether verification held. |
| Cost | A human resolving the row must open the relationship to see *which* email. That is one join — and it is also an access boundary the queue row currently bypasses. |
| Ruling this means | Reconciliation evidence is machine evidence. Human-legible identity lives on the relationship, reached deliberately. |

### Option B — provenance serves HUMAN review

`provenance` exists so a person resolving the queue sees, in one place, why the row was
queued — including the email at issue.

| | |
|---|---|
| Keys | as today, `normalized_email` retained |
| Consequence | The queue row becomes a small identity-disclosure surface in its own right, duplicated outside the relationship record. It is then subject to the same questions any content surface is: who may read it, is it in backups/logs/exports in plaintext, does it need encryption at rest, does the member's consent reach it. |
| Cost | Structural privacy is not encryption at rest. This is the exact category the #902 merge ruling already refused for note content — accepting it here needs to be an explicit, narrower decision, not an inherited default. |
| Ruling this means | Reconciliation is a human-facing review artifact, and its privacy obligations must be stated rather than assumed. |

### Option C — a middle position, only if Option B's need is real

Keep the row human-resolvable without a second plaintext copy: store a **non-reversible
match token** (e.g. HMAC of the normalized email under a server-held key) that lets a
reviewer confirm *"this is the same address as that relationship"* without the artifact
itself disclosing the address.

⚠️ **This option is only coherent after A vs B is answered.** It is a technique, not a
position. Selecting it first would be exactly the move §8.4 rules out — resolving a
disclosure question by picking the technically convenient transform.

## 4. What the corrective lane did while this stays open

Nothing that pre-empts the answer:

- `normalized_email` is **retained**, unchanged, exactly as the merged function writes it.
- It is **named as unruled** in the closed-key CHECK, in the column comment, and here.
- The closed key set means whichever way this is ruled, the change is one migration
  touching one constraint and one `jsonb_build_object` — it does not become harder by waiting.

Removing the key would have decided the question. Hashing it would have decided the
question *and* disguised the decision as a technique. Both were available and both were
declined.

## 5. What a ruling needs to say

1. Is `provenance` machine evidence or a human review surface? (Everything follows from this.)
2. If human: who may read `practitioner_client_reconciliation`, and does that set differ
   from who may read the relationship it points at?
3. If human: does it require the same encryption-at-rest treatment the foundation
   deferred content-bearing tables to the encrypted lane for?
4. If machine: confirm the reviewer's join to the relationship is the intended access
   path, not a regression in usability to be worked around later.
