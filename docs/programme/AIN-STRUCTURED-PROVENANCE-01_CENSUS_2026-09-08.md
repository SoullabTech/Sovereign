# AIN-STRUCTURED-PROVENANCE-01 — Census · DISCOVER ONLY

**Status: REPAIR CLOSED — self-closing conditions met (§12).** Census accepted · repair
implemented (§9) · seam baseline moved by founder act, not weakened (§10) · transparent-proxy
finding folded into an explicit operator attestation (§11).
Date: 2026-09-08 · Branch: `claude/studio-bring-work-back-icvfaa`
Authorizing act: founder ruling 2026-09-08 (WS2-ENCOUNTER-01 · G8) — discovery only.

**Ownership**, as ruled: this is a defect of the shared authority
`AIN-STRUCTURED-INFERENCE-SEAM-01`. Encounter *discovered* it because G8 needs stronger
provenance than the seam supplies. **That does not give Encounter ownership of the shared
contract**, and no repair is proposed inside `encounter/*`.

> **Configured** is what the system intended to ask for.
> **Reported** is what the provider says actually answered.
> **Authorized** is whether that inference occurred through the product's constituted
> authority.
> None is a substitute for the other. **G8 needs all three.**

---

## 1 — The finding is confirmed, and it is deliberate

`lib/ai/structured/anthropicStructuredAdapter.ts`:

```ts
provenance: {
  provider,
  /* THE MODEL ACTUALLY SENT. Reported from the request that went up the
     wire, so provenance can never drift from what was asked for. */
  model: req.model,
  ...
}
```

⭐ **This is not an oversight — it is a ratified choice, stated in the code.** The field means
*the model the caller pinned and the adapter sent*, and it was written that way precisely so
provenance could never drift from the request. That is exactly why the one-line change is
forbidden: **the field is doing its job; it is simply not doing the other job G8 needs.**

So the current G8 check `configured === provenance.model` reduces to
`req.model === req.model` and **cannot falsify substitution.** The founder's reading is
correct.

---

## 2 — Q1/Q2 · Who consumes it, and what does each believe it means?

| Consumer | Path | Believed meaning | Persisted? |
|---|---|---|---|
| `developmentalReader/read.ts:123` | `readerIdentity(provenance.model)` | **the resolved model actually sent** — the type's own comment: *"never the default's name"* | → yes |
| `structure/readerProvenance.ts` `ReaderIdentity.model` | frozen reader identity | same | — |
| `developmentalReading/freeze.ts` → `store.ts:82` | `JSON.stringify(reading.provenance.reader)` → **`reader_provenance` JSONB** | same, now **immutable history** | ⭐ **YES — database** |
| `writersStudio/developPresentation.ts:305` | `readerModel` | shown to the **member** as what read their Work | member-visible |
| `lib/manuscript/encounter/*` | — | **no consumer.** Encounter reads provenance only in the G8 witness | no |
| `structured/__tests__/requestEquivalence.test.ts:158,195` | `expect(r.provenance.model).toBe('claude-opus-5')` | calls itself resolved-model provenance while asserting only that the **requested** value survived | — |

⛔ **The blocking consequence.** Every frozen `DevelopmentalReading` already in the database
carries this field under the meaning *requested/pinned*. Redefining it in place would
**retroactively change what every existing row asserts**, and those rows are the record of
what read someone's Work. A load-bearing provenance field must not silently change semantics
because a later lane discovered it needs a different fact.

**Therefore the repair must be ADDITIVE.** The census answers the founder's question the
same way the founder predicted.

---

## 3 — Q3 · Does the provider response expose model identity?

**Yes, for both execution mechanisms, and the adapter already holds the object.**

```ts
const message = req.execution?.completion === 'long-running'
  ? await (client.messages.stream(params)).finalMessage()   // → Anthropic.Message
  : await client.messages.create(params);                   // → Anthropic.Message
```

`Anthropic.Message` carries `model: Model` (`@anthropic-ai/sdk/resources/messages.d.ts:93`),
and `.finalMessage()` resolves to the same `Message` shape. The adapter already reads
`message.content`, `message.stop_reason` and `message.usage` from it — **`message.model` is
in scope at the exact line that currently writes `req.model`.** No new call, no second
request, no provider round-trip is needed.

---

## 4 — Q4 · Additive representation

```text
provenance {
  provider                     unchanged
  model                        UNCHANGED MEANING — the model requested and sent
  latencyMs                    unchanged
  reportedModel?  string|null  NEW — what the provider says answered
                               (null where a provider cannot report it)
  modelAgreement? 'agreed' | 'differs' | 'unreported'   NEW — derived, not asserted
}
```

Existing consumers keep reading `model` and keep meaning what they always meant; frozen rows
keep asserting what they already assert. `reportedModel` is optional, so no persisted shape
becomes invalid. **Nothing is redefined.**

⚠ Naming matters here: the current field must **not** be renamed to `requestedModel` even
though that is what it means. A rename would force every consumer and every frozen row into
a migration to fix a *documentation* problem. Correct the comment; add the fact.

---

## 5 — Q5 · Distinguishing the authorized channel from a compatible proxy

The deeper law the founder drew out: **matching model names do not make the act lawful.**

```text
correct model + wrong inference authority   = WRONG ACT
authorized authority + different model      = WRONG ACT
```

⛔ **A returned model string cannot answer this**, because any compatible proxy can return
any string. What distinguishes the channel is *where the request went and under whose
credential* — and **no secret may be stored to prove it.**

The honest options, smallest first:

1. **Operational, not persisted.** The witness records the resolved **base URL host** and
   whether the credential came from the deployment's configured secret — a host name is not a
   secret. `api.anthropic.com` versus a session proxy host is the whole distinction, and it
   is observable without storing anything sensitive. ⭐ **Recommended: this answers G8's
   question at the moment of witnessing, which is where the question is actually asked.**
2. **A declared authorized-endpoint allowlist** in platform configuration, with the adapter
   refusing an unlisted base URL. Stronger, but it is a **policy change to the shared seam**
   and would need its own ruling — sovereignty policy currently governs *mode*, not endpoint.
3. ⛔ **Storing or hashing the credential.** Rejected: it puts secret-derived material into a
   provenance record that already reaches the database and the member.

**The census's position:** G8 needs (1). Option (2) is a separate constitutional question
about whether the seam should police endpoints, and this act does not open it.

---

## 6 — Q6/Q7 · The falsifiers the repair would owe

| | |
|---|---|
| **SP-1** a fixture provider returning model **B** when **A** was requested → `provenance.model === 'A'` (unchanged meaning) **and** `reportedModel === 'B'` **and** `modelAgreement === 'differs'` | the substitution the current field cannot see |
| **SP-2** a provider that reports no model → `reportedModel === null`, `modelAgreement === 'unreported'` — **never silently equal to the request** | the failure that would recreate today's blindness |
| **SP-3** existing consumers unchanged: `readerIdentity()` still receives the requested model; a frozen reading's `reader_provenance` shape still validates | no retroactive redefinition |
| **SP-4** ⭐ **the negative control the founder named** — a matching model name returned through an **unauthorized/borrowed** endpoint does **not** satisfy G8: the witness records the resolved host, and a host that is not the deployment's configured inference endpoint fails the run **even when `modelAgreement === 'agreed'`** | *a witness that borrows a credential is witnessing a different act*, proven rather than asserted |
| **SP-5** the seam's own test stops calling a requested value "resolved-model provenance" | the mislabel that let this survive |

---

## 7 — Smallest compatible repair (⛔ NOT AUTHORIZED, NOT WRITTEN)

1. `types.ts` — add optional `reportedModel` and `modelAgreement`; **correct the comment on
   `model`** to say plainly that it is the requested and sent model.
2. `anthropicStructuredAdapter.ts` — read `message.model` at the line that already reads
   `message.usage`; derive agreement. **One added fact, no changed fact.**
3. `requestEquivalence.test.ts` — relabel, and add SP-1/SP-2.
4. The G8 witness — compare against `reportedModel` when present, and record the resolved
   endpoint host (SP-4). *This is the only Encounter-side change, and it is witness-only.*

Not touched: `provenance.model`'s meaning · every existing consumer · `readerIdentity` ·
frozen `reader_provenance` rows · sovereignty policy · any database schema.

---

## 8 — Standing

⛔ Nothing changed. The seam is untouched, and no repair is written.

**Encounter G8 standing, restated precisely:**

```text
G8 instrument failure path      ✅ verified
G8 live perception              ⏳ not run
G8 model/channel provenance     ⛔ prerequisite — this census's subject
```

A G8 run with the present witness would still be useful diagnostic evidence. **It cannot
close G8**, and the rule must not be weakened to let it.

Owed to the founder: a ruling on §4 (additive shape), §5 (option 1 versus opening the
endpoint-policy question), and authorization for §7.

> The seam was right about the fact it recorded. It was wrong only about the name it gave it,
> and that name is what made a check look like proof.


---

## 9 — Repair, as implemented

Per the ruling, with the amendment that the new fields are **required**.

**`types.ts`** — `model`'s documentation corrected to say plainly *the model requested and
sent*, with the reason it must never move (it is carried into already-persisted frozen reader
provenance). Added **required** `reportedModel: string | null` and `modelAgreement: 'agreed' |
'differs' | 'unreported'`, plus **one shared `deriveModelAgreement()`** so no adapter spells
the three-way comparison its own way. An optional field would have let *nobody supplied the
fact* look indistinguishable from normal — the shape of the defect being removed.

**`anthropicStructuredAdapter.ts`** — reads `message.model` from the same returned `Message`
already read for content, stop reason and usage. **No second request.** `reportedModel` is
never populated from `req.model`, which would recreate the defect under a second field name.

**Falsifiers — 27 passed in the seam suite:**

| | |
|---|---|
| **SP-1** provider answers with a different model → `model` unchanged · `reportedModel` differs · `differs` | ✅ |
| **SP-2** no model identity → `null` / `unreported`, never silently equal to the request; empty, non-string and `undefined` all included; **the long-running path reports identically** | ✅ |
| **SP-3** `readerIdentity()` still receives the requested/sent model; frozen provenance shape unchanged (**468 DEVELOP + Studio tests green**) | ✅ |
| **SP-5** the seam's own tests no longer call a requested value *"resolved-model provenance"* — the mislabel that let this survive | ✅ |
| **SP-6** agreement derivable only from the two facts; aliases deliberately **not** normalized (`claude-opus-5` vs `claude-opus-5-20260101` → `differs`); the adapter is asserted not to spell the comparison itself | ✅ |

**G8 witness** — reports inference mode · configured model · requested/sent · reported ·
agreement · resolved endpoint **origin** (scheme + host + port) · whether a credential is
present. It never prints, hashes or derives from the key, and it states in its own output
that **whether the key is the product's is the operator's attestation, which the process
cannot determine.** Model acceptance stops on `unreported` or `differs` *before* adjudication;
channel acceptance (**SP-4**) refuses a non-canonical origin **before any inference** —
verified: `https://proxy.internal:8443` refuses with no call made.

**Gates:** Encounter **90** · PT-3 **39** · DEVELOP + Writer's Studio **468** · typecheck 229
vs baseline 239, 0 regressions.

---

## 10 — ⛔ BLOCKED: the repair collides with a ratified seam-isolation instrument

`lib/ai/structured/__tests__/seamIsolation.test.ts` pins the seam's four source files
**byte-identical to the merge commit `8b31d931`**, under a stated invariant:

> *A CALLER MIGRATION MUST BEND THE CALLER TO THE SEAM, NEVER THE SEAM TO THE CALLER. A
> migration that "worked" by loosening the router, or by teaching the adapter about one
> caller's shape, would have migrated nothing — it would have moved the vendor coupling one
> file inward.*

Two of the four are modified by this repair, so **that guard now fails.** It is the only
failure.

⛔ **I have not touched `MERGED`, and will not.** Re-pinning it would be a lane deciding to
re-baseline a constitutional instrument in order to pass — the same error pattern this
repository has ruled on before (*never re-baseline to absorb*), and precisely the move the
guard exists to catch.

**The distinction the guard cannot make.** Its subject is *a caller bending the seam to
itself*. This is not that: it is the seam's own lane adding a fact to the shared contract
under its own ruling, and **Encounter consumes nothing new** — the only Encounter-side change
is witness code. But the guard pins bytes, not intent, and it is right not to guess.

**⭐ RULED (founder, 2026-09-08): the guard was RIGHT TO FAIL.** Not a stale test — *a
constitutional stop asking who authorized the seam itself to change.* The pin is **not**
weakened. The baseline **moves**, and moving it is itself a governed act:

```text
ORIGINAL_SEAM_MERGE     = 8b31d931…   preserved as history, never deleted
GOVERNED_SEAM_BASELINE  = 35d0f81d…   the active pin
```

The amended invariant, recorded in the guard: *a caller migration must bend the caller to the
governed seam, never the seam to the caller. The seam itself may change only through an
explicitly authorized amendment of its governing contract. Such an amendment establishes a new
governed baseline; moving that baseline is itself a governed act, never an automatic test
repair.*

⛔ **No exception was added** — no caller exception, no branch inspection, no *"if this belongs
to the seam lane, skip the comparison"*. Any of those would gut the instrument. Two new
controls hold the shape: the original merge is asserted preserved **and** genuinely different
from the active baseline (equal values would mean no amendment ever happened), and **the
comparison body is asserted unconditional** — it hashes, resolves and expects, with nowhere for
an exception to live.

⚠ *That second control failed on its first run, by matching its own title and its own regex —
the C21 lesson for the fifth time in this lane. It now asserts the property rather than
scanning for words.*

The authorization is narrow, as ruled: **those four seam-file states at `35d0f81d`** are the
baseline. No unrelated file gains constitutional status by having travelled in the same commit.

---

## 11 — ⚠ A further finding: the origin check cannot see this environment's proxy

SP-4 works. But running it here surfaced something the ruling should know:

```text
ANTHROPIC_BASE_URL (this authoring session) → origin https://api.anthropic.com
```

**The authoring-session proxy presents AT the canonical origin.** So the origin check —
correct and worth having — would **not** have caught the borrowed channel I declined to use.
It catches an obviously foreign endpoint; it cannot catch a transparent one.

That does not weaken the ruling; it confirms the part of it that was already right:

> *credential identity remains an operator responsibility · do not manufacture that proof*

But it means the operator attestation is carrying more weight than "belt and braces" — in an
environment like this one, **it is the only thing standing between a real witness and a
plausible-looking counterfeit.**

**⭐ RULED: confirmed, and SP-4 is split rather than discarded.**

```text
SP-4A  configured base URL origin observably foreign  → refuse BEFORE inference
SP-4B  origin canonical but channel transparent       → machine verdict INSUFFICIENT
                                                        → operator attestation supplies it
```

**Wording corrected throughout**: the value is the **configured base URL origin**, never a
"resolved endpoint" or channel identity. *A machine can tell us what endpoint was configured;
it cannot, in this architecture, tell us who authorized the channel that actually carried the
request.*

**The attestation is now an explicit act**, because it carries real acceptance authority and
must not sit implicit in whoever runs the command:

```text
ENCOUNTER_G8_CONFIRM                  I intend to execute cognition (a real, paid call)
ENCOUNTER_G8_PRODUCT_CHANNEL_ATTEST   I attest, as a person, that this execution context
                                      is the product-authorized one
```

Deliberately not collapsed — they are different acts. Without the attestation the witness
exits non-zero **before inference**, and its own output states that this is human attestation,
not machine verification. Verified: foreign origin refuses (SP-4A); canonical origin without
attestation stops (SP-4B). The credential is read exactly once, as a boolean — never printed,
hashed, fingerprinted or persisted.

⛔ **And the environment rule stands: G8 must not be run from the authoring session**, even if
a key appears there, because its transparent proxy makes this context unsuitable for
acceptance evidence unless the channel is separately constituted — which has not occurred.

⛔ Endpoint policy remains unopened: no TLS pinning, no DNS verification, no allowlist, no
credential-provenance infrastructure. None is needed to finish G8 on the direct-Anthropic
path.

---

## 12 — Self-closing conditions

seam pins to `GOVERNED_SEAM_BASELINE` ✅ · `ORIGINAL_SEAM_MERGE` preserved ✅ · no caller/lane
exception ✅ · SP-1 · SP-2 · SP-3 · SP-5 · SP-6 green ✅ · SP-4A refuses before inference ✅ ·
SP-4B attestation explicit and required ✅ · no claim of network-channel proof ✅ · key never
printed, hashed or persisted ✅ · **seam suite 60/60** ✅ · Encounter, DEVELOP and Writer's
Studio **618 passed** ✅ · PT-3 **39** ✅ · typecheck 229 vs baseline 239, **0 regressions** ✅.

> A guard refusing a governed amendment is not a broken guard. It is the guard demanding the
> amendment's authority be made explicit.
