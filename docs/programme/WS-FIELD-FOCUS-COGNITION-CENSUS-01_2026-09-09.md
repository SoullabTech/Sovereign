# WS-FIELD-FOCUS-COGNITION-CENSUS-01

**Read-only census of the act-5/6 Focus → cognition seam.**

```text
classification   Class C · census/docs only
base             canonical 5b133abcd
subject          PR #1275 @ 18d8c7004 (read-only) + the current Canvas cognition path
code changes     NONE
model calls      NONE
member text      NONE
production       NO CONTACT
```

⛔ **No seam is implemented here, and none is authorized by this document.**
PR #1275 is untouched.

**Method:** source reading on canonical `5b133abcd`. Every claim below names the
file and line it was read from. Nothing was executed.

---

## 0 · ⭐⭐ THE CLASSIFYING ANSWER, FIRST

> **Does the current Canvas conversation already send or retrieve manuscript
> content?**

## ⛔ NO. Neither.

The client sends the Work's **id and nothing else**, and *the server never reads
even that.*

```text
CLIENT SENDS      workContext: { workId }          ← id only, no text
SERVER READS      nothing                          ← zero consumers, anywhere
WORK TEXT FETCHED none
```

`StudioConversation.tsx:139-141` carries its own note — *"The Work, by id only. Title
and purpose are re-read server-side from the member's own row"* — and **that
second sentence does not describe the running system.** `workContext` has zero
readers in `lib/**` or `app/api/**`. It lands in the route's `...meta` rest
(`route.ts:310`) and is never taken out again.

⭐ **Therefore the held passage would be a NEW crossing of member-authored Work
into a cognition path, not a narrowing of an already-authorized context.** On the
founder's own test, the eventual implementation is **very likely Class A**, and
it must not be carried inside the Class B integration.

---

## 1 · COMPOSER

```text
component   app/writers-studio/canvas/StudioConversation.tsx
gesture     send() — form submit / send button, writer-initiated
state       draft (trimmed; empty refuses) · turns (in-memory) · identity.memberId
            · conversationId (minted per page session) · work.id
```

The composer owns the gesture and the whole exchange is component state: `turns`
lives in `useState` and is not read back from any store during the session.

## 2 · REQUEST

```text
POST /api/sovereign/app/maia/list            (StudioConversation.tsx:129)

message              string   the writer's typed words, verbatim
sessionId            string   conversationId
userId               string   memberId
conversationHistory  array    every prior turn this session, role + content
workContext          object   { workId }
surface              string   'maia'
```

**Text and ids both cross** — but the only text is what the writer typed into the
composer and what MAIA already said. **No manuscript text crosses today.**

## 3 · SERVER CONTEXT — what is fetched from the ids

⛔ **Nothing about the Work.**

```text
route.ts:310   destructures sessionId, message, includeAudio, voiceProfile,
               userId, timezone, conversationId, exchangeId … ...meta
grep workContext   route.ts        → 0
grep workContext   lib/**, app/api → 0 consumers
grep workSituation route.ts        → 0
```

⭐ **AND THE CAPABILITY TO DO IT EXISTS, UNWIRED.**
`lib/writersStudio/workSituation.ts` exports `resolveSituatedWork()` and
`formatWorkSituationForPrompt()`. **Neither has a caller outside its own tests.**
`lib/writersStudio/situatedProfileContainment.ts` is a guard written for a path
that does not currently execute — its own text refers to *"the route,
`workSituationAddendum`"*, a symbol that exists nowhere in the tree.

⚠️ Classification note: this is **built substrate, not an offence.** It is named
because a future implementer will find it and could reasonably assume the
situated-Work path is live. It is not.

The one surface-conditioned addendum that *is* wired is `studioAddendum`
(`route.ts:784`), composed only when `surface === 'studio'` — a practitioner
prompt cap, carrying no Work text. **This client sends `surface: 'maia'`,** so it
does not reach even that.

> ⭐ **The interface says "In relation to <Work>"** (`StudioConversation.tsx`,
> the `data-studio-conversation="situated"` band) **and the server is told an id
> it never reads.** That is a truthfulness finding in its own right, independent
> of Focus, and it is not this census's to repair.

## 4 · MODEL PATH, and where it diverges

```text
route.ts:1216   buildMaiaRuntimeContext(...)   required contract
route.ts:1365   getMaiaResponse(...)           lib/sovereign/maiaService.ts
prompt          maiaService.ts:1464 — one template literal, ~30 addenda slots
```

**The divergence is not the route.** This conversation posts to the same
`/api/sovereign/app/maia/list` MAIA herself uses. The divergence is *inside* it:
`constructCanonicalTurn` runs here in **shadow mode only** (ruling 2026-09-03,
`route.ts:1255`), with legacy assembly still response-producing and CMT-01 M3
explicitly unauthorized.

⭐ So "the Canvas conversation bypasses CanonicalTurn" is precisely true and
precisely narrow: **it reaches the same cognition as every other surface, and no
surface is on CanonicalTurn yet.** It is not a private pseudo-MAIA path. What it
lacks is the Work.

## 5 · PERSISTENCE — before and after

### ⛔ BEFORE the model call

```text
route.ts:422   TurnsStore.addExchangeTurn(turnPosture, { role: 'user',
                 content: message, exchangeId, sessionId, userId })
```

```sql
-- lib/memory/stores/TurnsStore.ts:215
INSERT INTO conversation_turns
  (user_id, session_id, role, content, exchange_id, seq, created_at,
   posture_at_creation, provenance)
```

⭐ **The member's message is written verbatim to a durable table BEFORE the model
is called.** Idempotent on `(exchange_id, seq)`; refused entirely under Sanctuary
posture (`contentWritable`, S1 boundary-enforced) and refused if provenance
cannot be minted (S5).

### AFTER the model call

```text
route.ts:1552   the same store, role 'assistant', same exchange_id, seq 1
route.ts:1838   persistDetectedSignal(...) — scores only; route.ts:1617 records
                "No raw content persisted"
```

No atom write, no embedding write and no ingestion call was found in this route.
⚠️ **Scope limit, stated rather than glossed:** this census read the route and
`TurnsStore`. It did **not** trace every downstream consumer of
`conversation_turns`, so *"a turn row is not later ingested into memory,
embeddings or atoms by some other process"* is **UNVERIFIED** and must not be
asserted.

## 6 · ⭐⭐ RETENTION OF QUOTED WORK — the decisive finding

> If selected manuscript text were added to the request **today**, by the
> obvious route of putting it in `message`, what would it become?

```text
request-only          ⛔ NO
conversation history  ✅ YES — returned in every later conversationHistory
database state        ✅ YES — conversation_turns.content, verbatim
                              WRITTEN BEFORE THE MODEL IS EVEN CALLED
logs                  partial — content is not logged; ids and lengths are
memory / embeddings   UNVERIFIED — see the scope limit in §5
```

⭐ **There is no ephemeral path here to use.** The naive implementation does not
produce a request-scoped disclosure; it produces a durable row of the member's
book inside their conversation store, written before any model call, and it does
so whether or not the model call then succeeds.

⛔ **This answers the founder's third hard stop directly.** The stop was: *halt if
the apparently ephemeral path cannot be proven not to persist.* It did not need
to be invoked, because the path is **proven to persist** — and that is a finding,
not a blocker.

## 7 · ACT 5 IS NOT ACT 6

```text
ACT 5   "Ask MAIA about this Focus"
        writer supplies attention + a question
        the passage is the OBJECT of the question

ACT 6   "Work with one MAIA observation about it"
        writer takes up something MAIA said
        the observation is the object; the passage is its GROUND
```

⛔ **One gesture must never silently authorize the other.** They differ in what
crosses, in what the writer has consented to, and in what a later reader of the
conversation would find. Act 6 additionally implies MAIA has *already* said
something about the passage — which today she cannot have, because she has never
seen it.

⚠️ **Act 6 is therefore not merely unbuilt; it is not yet coherent** on this
substrate. It presupposes act 5.

## 8 · MINIMUM POSSIBLE SEAM — ⛔ DESIGN CANDIDATE ONLY

Recorded because the census was asked for it. **Not authorized, not designed in
detail, and not to be read as a plan.**

The mapped path admits a request-scoped disclosure only if the passage travels
**beside** `message` rather than inside it, because `message` is the durable
column:

```text
CANDIDATE
  a distinct request field, never concatenated into `message`
  consumed into the prompt for THIS call only
  NOT written to conversation_turns.content
  NOT returned in conversationHistory
  provenance-visible: the writer can see, in the room, exactly what
    was disclosed and that it was theirs
  bounded to the gesture: one ask, one passage, no standing grant

OPEN AND UNANSWERED
  whether the ~30-slot prompt assembly (maiaService.ts:1464) can accept a
    turn-scoped field without it becoming another `meta` open channel
  whether an exchange whose prompt contained text its stored turn does not
    is HONEST or is a hidden record — a governance question, not a technical one
  what a later reader of that conversation is owed
```

⭐ **That last one is the real question, and it is not a Focus question.** A
conversation row that omits what MAIA was actually shown is a different kind of
record from one that includes it. Both are defensible; they are not the same
promise, and the choice belongs to the founder.

## 9 · ⛔ THE WHOLE-WORK LADDER IS NOT A TRANSMISSION LADDER

`heldFocus.ts` widens `selection → paragraph → section → work`, and at `work`
scale `capturedText` is the concatenated whole Work.

⭐ **A visual attention ladder confers no equal permission to transmit each
rung.** Whole-Work transfer is **not authorized**, and any seam built later must
make that structural rather than advisory — a scale ceiling at the boundary, not
a caution in a comment.

---

## 10 · Standing

```text
current Canvas conversation   sends NO Work text · fetches NO Work text
situated-Work substrate       BUILT · UNWIRED · no callers outside its tests
"In relation to <Work>"       an interface claim the server does not honour
CanonicalTurn                 shadow only on this route; no surface is on it
naive Focus implementation    would PERSIST, before the model call
act 5                         a NEW crossing → very likely CLASS A
act 6                         presupposes act 5; not yet coherent
whole-Work transfer           ⛔ NOT AUTHORIZED
minimum seam                  DESIGN CANDIDATE ONLY · not authorized
PR #1275                      UNTOUCHED · frozen at 18d8c7004
production                    ⛔ HOLD
```

⛔ **Nothing here authorizes an implementation.** The census answers what the path
*is*; whether Work text may cross it, under what classification, and what the
conversation record then owes its reader are founder decisions this document
deliberately leaves open.

---

*The interface has been saying "in relation to your Work" to a system that was
never told which words those are. The honest first act is not to start sending
them — it is to notice that the sentence was already ahead of the machine.*
