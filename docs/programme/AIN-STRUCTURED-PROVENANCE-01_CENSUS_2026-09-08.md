# AIN-STRUCTURED-PROVENANCE-01 — Census · DISCOVER ONLY

**Status: READ-ONLY CENSUS AND REPAIR DESIGN. NOTHING CHANGED. The structured seam is
untouched.**
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
