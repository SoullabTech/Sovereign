# FOCUS RECEIPT SUBSTRATE CENSUS

**2026-09-09 · READ ONLY · steps 1–3 of the authorized five.**
No receipt shape. No write. No placement chosen. `#1275` frozen.

## 0 · The rulings this census serves

Founder, 2026-09-09, on the `conversation_turns` census:

> **Persistence provenance is not disclosure provenance.**
> **A receipt is minted where the disclosure occurs, not where the conversation
> turn is stored.**
> **A disclosure receipt records the fact and scope of disclosure, never the
> disclosed content itself.**
> **The evidence that content crossed a boundary must not itself become another
> copy of the content.**
> **Retention may be shared by decision. It may not be shared by accident.**

Three truths, three authorities: *the turn records what was said · S5 provenance
records why the turn may persist · the disclosure receipt records what boundary
was crossed.* Ruled out already: `conversation_turns.provenance` (constitutionally
occupied, wrong moment, append-only lifecycle) and `conversation_turns.meta`
(live AIN-digest surface).

---

## 1 · Inventory — content-free audit/receipt substrates in the organism

~75 tables carry audit-adjacent names. Filtering to those that are (a) content-free
by design and (b) record *that something happened* rather than *what was said*
leaves six real candidates. The rest are telemetry of product events
(`*_events`), member-owned content under an audit-sounding name, or scoped to
another domain entirely.

| Substrate | Records | Content-free? | Mutability | Custody |
|---|---|---|---|---|
| `runtime_consent_state` | posture in force for a request | **yes, by constitution** | **immutable — trigger-enforced `BEFORE UPDATE`** | **no automatic pruning; no deletion path; not in account-deletion; not in migrate** |
| `memory_transition_records` | per-turn, per-source: available / retrieved / eligible / offered / injected counts + `selection_reasons` sentences | **yes — counts and policy sentences only** | no trigger; **no UPDATE or DELETE exists** | no pruning; not in account-deletion; not in migrate |
| `deletion_manifests` + `_scopes` + `provenance_tombstones` | that a governed deletion happened, and which ids may never be resurrected | yes (`note` is "content-free description") | append-only in practice | no pruning; consumed by restore refusal |
| `conversation_memory_uses` | which memory was used for which message, `used_as`, scores | **NO** — carries `user_feedback` + `feedback_note` free text | has an `UPDATE` path (feedback) | **in account-deletion under label "conversations"; in migrate-data** |
| `audit_logs` | security actions, `phi_accessed`, `consent_verified` | yes, but carries `ip_address`/`user_agent` | append-only | no pruning; not in account-deletion |
| `practitioner_file_access_log` | who viewed/downloaded/shared a file | yes, but carries `ip_address`/`user_agent` | append-only | no pruning; scoped to practitioner files |

---

## 2 · Which of these has *disclosure* semantics — not consent, provenance, telemetry or memory

**The distinction that matters:** a disclosure receipt answers *"what member-owned
context crossed into cognition for this encounter?"* Consent answers *under what
authority*; provenance answers *why this object may persist*; telemetry answers
*what the system did*; memory answers *what is remembered*.

- ⛔ `runtime_consent_state` — **wrong axis.** It records the posture governing
  persistence, resolved once per request at the serving boundary, before any
  Work context is assembled. It is the founder's cited *precedent*, and the
  census confirms why: content-free by constitution, immutable, unpruned,
  separate from the content whose permission it records. ⭐ **Precedent, not
  container.** Adding a disclosure fact would repeat inside a second table the
  exact collapse just ruled out on the turn.

- ⭐ `memory_transition_records` — **the closest existing semantics in the
  organism, and the most instructive.** It already answers *"of what was
  available, what crossed into prompt assembly, and why"* — per turn, per source,
  content-free, reasons as sentences and **never as scores**, with `null` as a
  first-class "not measured". Its own charter states *"nothing on the
  conversation path reads it"*, and the census confirms **zero readers** —
  a pure accountability artifact. Three gaps stand between it and a Focus receipt:
  1. its `source_type` is a **closed CHECK** over four memory sources; a Work
     passage is not one of them and is not a memory source;
  2. it is **quantitative** (counts per source), where a disclosure receipt must
     identify *scope* — which Work, which selection — by reference;
  3. it is **fire-and-forget and failure-tolerant by design** (rule 3: never
     block or alter the conversation). ⛔ An audit fact that may silently fail to
     record is acceptable for observability and **is not obviously acceptable as
     the evidence that a boundary crossing occurred.** That is a ruling, not a
     detail.

- ⛔ `conversation_memory_uses` — **disqualified twice.** It is not content-free
  (`feedback_note` is member free text), and it is enumerated in account deletion
  under the member-legible label *"conversations"*. A receipt placed there would
  inherit exactly the accidental shared retention the second ruling forbids.

- ⛔ `audit_logs`, `practitioner_file_access_log` — security/access lanes carrying
  `ip_address` and `user_agent`. Wrong domain, and they would import identifiers
  the disclosure fact does not need.

- ⛔ `deletion_manifests` / `provenance_tombstones` — custody of *forgetting*, the
  mirror of this question. Relevant later (§3) as the mechanism by which a receipt
  could be deliberately, rather than accidentally, ended.

---

## 3 · Retention · deletion · restore behaviour

**Finding R1 — the wanted custody property already exists, and exactly once.**
`runtime_consent_state` is the only substrate in the organism whose comment states
its lifecycle as constitution: *"immutable once minted (trigger-enforced); first
write wins on retry; no automatic pruning (audit substrate); included in backups
(content-free, safe to restore)."* ⭐ That sentence is the shape of the custody
ruling a Focus receipt needs — **written down, enforced by a trigger, and decided
rather than inherited.**

**Finding R2 — "no deletion path" is not the same as "intentional retention".**
`memory_transition_records`, `audit_logs` and `practitioner_file_access_log` all
survive account deletion — but by **omission**, not by ruling. None is named in
`GOVERNED_CONTENT`, whose own header admits it is *"everything currently known",
not "everything"*. ⛔ A receipt placed in any of them would be retained **by
accident**, which the second ruling forbids as directly as it forbids accidental
erasure. *Retention may be shared by decision. It may not be shared by accident.*

**Finding R3 — restore is already governed, and would govern the receipt too.**
The S5 restore-refusal triggers consume manifests + scopes + tombstones. A
disclosure receipt inside that regime could be ended deliberately (a manifest
naming its table and scope) rather than pruned incidentally. **This is the
existing mechanism for "ended on purpose".**

**Finding R4 — the four unanswered custody questions are genuinely open.** Nothing
in the organism implies an answer for a disclosure receipt under (i) account
deletion, (ii) Sanctuary, (iii) a member-requested purge, (iv) an audit-retention
limit. ⭐ Sanctuary is the sharp one: a sanctuary encounter must leave no content
— but a receipt is a content-free fact that a boundary was crossed. Whether
Sanctuary forbids even that fact is a **constitutional question about Sanctuary**,
not a storage decision, and this census does not answer it.

---

## 4 · What the census establishes (step 4 is the founder's)

1. **No existing substrate has disclosure semantics.** The closest,
   `memory_transition_records`, is an *observability* artifact — closed to four
   memory sources, quantitative, and explicitly permitted to fail silently.
2. **`runtime_consent_state` is the architectural precedent and not the
   container** — its value is its declared, trigger-enforced lifecycle.
3. **Every reuse candidate would inherit custody by accident**, in one direction
   or the other: `conversation_memory_uses` deletes with conversations;
   the audit tables survive account deletion because no one listed them.
4. Therefore the census **points toward a dedicated disclosure substrate** whose
   custody is stated in its own table comment and enforced in its own triggers —
   ⛔ **recommendation, not a decision.** Step 4 is a founder ruling, and step 5
   (receipt shape) does not open until placement is ruled.
5. ⭐ One question is owed *before* placement and is larger than placement:
   **may a disclosure receipt fail silently?** `memory_transition_records` says
   observability must never block the conversation. If the receipt is evidence
   rather than telemetry, the fire-and-forget posture may not simply be inherited.

**Standing: steps 1–3 COMPLETE · step 4 NOT DECIDED · step 5 NOT OPENED ·
no substrate created · no receipt shape · no write · `#1275` frozen.**
