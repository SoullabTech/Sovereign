**READ-ONLY RUNTIME TRACE — BUILDING CLOSED** · 2026-08-14

# RF — Relational Surface and Identity Runtime Trace

Binding: production SHA `22200f967` (`docker exec maia-sovereign printenv GIT_COMMIT` → `22200f967`,
observed 2026-08-14). All source citations are `git show 22200f967:<path>`. The working tree
(`d41b8b355`, dirty) was not read. Host `ssh soullab@minisforum`, DB `maia-postgres/maia_consciousness`.

Writes performed: **none**. All DB access was `SELECT`. No account created, no credential entered,
no form submitted, no message sent. Member `ce284751-…` was never rendered, read as content, or
traced; that prefix appears below only as an aggregate row count already visible in group-by output.

---

## 0. Blocker — authenticated runtime walk is NOT CONSTRUCTIBLE TODAY

**FACT.** `/api/relationships`, `/api/relationships/[id]`, `/api/relationships/[id]/entries` and
`/api/relationships/[id]/checkin` all authenticate through `getCurrentSession()`
(`app/api/relationships/route.ts:16`, `app/api/relationships/[id]/route.ts:22`).

**FACT.** `getCurrentSession()` is **cookie-only**: `lib/auth/serverSessions.ts:279-283` calls
`getSessionFromCookie()` (`:225-229`), which reads `cookies().get(SESSION_COOKIE_NAME)` and nothing
else. It never inspects request headers.

**FACT.** The `x-member-id` header is **not** honoured as an identity claim at this SHA. The shared
helper states it explicitly: `lib/auth/getMemberFromRequest.ts:50` — "No verified session → do NOT
trust a bare x-member-id / maia_member_id"; `:59-65` rejects a header claim that does not match an
already-verified session. `lib/auth/session.ts:54` — "Method 3 (x-member-id without session token)
REMOVED for security." Regression tests assert the rejection
(`lib/auth/__tests__/getMemberFromRequest.test.ts:58,69`). Independently of that helper, the
relationships routes do not call it at all — they are cookie-only.

**FACT.** The designated fixtures hold **no usable session**:
`SELECT count(*) FILTER (WHERE expires_at > now() AND revoked_at IS NULL) FROM auth_sessions WHERE member_id::text LIKE 'deadbeef%'`
→ `0` live of `8` total rows.

**Conclusion.** The only ways to obtain an authenticated session at `22200f967` are (a) signing in
with a password, or (b) reusing one of the 69 live `auth_sessions` tokens, all of which belong to
real members. Both are prohibited by this mandate. **A rendered, authenticated walk of
`/relationships` is therefore NOT CONSTRUCTIBLE TODAY** and is reported as a blocker, not worked
around. Everything below is established from source at the exact SHA plus production database and
`runtime_events` reads — not from a browser session.

⚠️ Standing caveat, applied throughout: **rendering a component in source is not rendering it at
runtime.** Where the claim is runtime, it is backed by `runtime_events` or `docker logs`; where it is
not, it is labelled.

---

## 1. What `/relationships` renders for a fixture identity

**FACT.** `app/relationships/page.tsx:26` fetches `GET /api/relationships`, sets
`relationships = data.relationships` (`:29`), groups by `realm` defaulting to `'outer'` (`:54-59`),
and renders one section per realm under the headers at `:11-15`:
`outer → "People in your life"`, `inner → "Inner figures"`, `transpersonal → "The larger field"`.
Each item renders a `RelationshipCard` (`:125-130`); the card renders `relationship.name` verbatim
(`components/relationships/RelationshipCard.tsx:50`) plus optional `bondType`, `lastCheckinAt`, and a
`FieldToneIndicator`. The card does **not** render `note`.

**FACT (DB).** Each of the five `deadbeef-0000-4000-8000-00000000000{1..5}` fixtures holds exactly
one non-archived `member_relationships` row, and in every case that row is named
`Unresolved Relational Field`, `realm = 'outer'`:

```
left(member_id,8) | visible | catchall | outer_visible
deadbeef          |    5    |    5     |      5          (5 fixtures × 1 row each)
```

**INFERENCE (source + DB, no runtime render).** For a fixture identity, `/relationships` renders
exactly one section — `People in your life` — containing exactly one card labelled
**`Unresolved Relational Field`**, with no bond type, no check-in timestamp, and a null field tone
(`relationship_field_state` has 0 rows joined to any catch-all row; see §2).

---

## 2. ⭐ Does the catch-all appear under "People in your life"? — **YES**

**FACT.** The list query in `app/api/relationships/route.ts:21-30` filters on
`WHERE r.member_id = $1 AND r.archived_at IS NULL` only. There is **no** `name <> 'Unresolved
Relational Field'` predicate, and no other name/kind filter anywhere in the route.

**FACT.** The one place that predicate exists — `lib/relationships/relationshipContextService.ts:87`
— sits inside the *auto-detect fallback* branch, which is unreachable: `:78` returns `null` unless
`opts.allowRecentThreadFallback` is true, and a repo-wide grep at the SHA finds no call site that
ever passes it (`git grep -n "allowRecentThreadFallback" 22200f967` → only the interface declaration
`:61`, the guard `:78`, a comment in `app/api/sovereign/app/maia/list/route.ts:868`, and a
verification script asserting it is *not* set to true). So the exclusion protects a code path that
never runs, and does not protect the list the member sees.

**FACT.** The catch-all rows carry `realm = 'outer'` by construction:
`lib/consciousness/relationalObserver.ts:172-178` inserts `{ name: 'Unresolved Relational Field',
realm: 'outer', bond_type: null, note: 'Auto-created by relational observer…' }`. `'outer'` maps to
the header `People in your life` (`app/relationships/page.tsx:12`).

**FACT (DB, production).** None are archived, so none are filtered out:

```
name                        | realm | count | archived
Unresolved Relational Field | outer |  31   |    0
```

**FACT (DB, production) — the scale of it.** Of the 31 members holding any non-archived
relationship, **30 see nothing but the catch-all**:

```
members_with_visible_rels                 | 31
members_whose_ONLY_visible_is_catchall     | 30
total_visible_rows                         | 38
total_catchall_visible                     | 31
```

**FACT (DB).** Every catch-all row has accumulated content but no sensed field:
`catchall_with_entries = 31`, `catchall_with_field_state = 0`.

**Classification.** ⭐ **The catch-all is member-visible.** For 30 of 31 members with any relational
row, the entire `/relationships` surface is a single card headed *"People in your life"* and named
*"Unresolved Relational Field"* — a system-authored container, presented in the position reserved for
a person. The only member for whom that is not the whole surface is the excluded real member.

*Absence re-derived a second way:* the first derivation was a read of the route's SQL. The second was
structural — `git grep -n "Unresolved Relational Field" 22200f967` returns exactly four code sites:
the observer's lookup (`relationalObserver.ts:164`), the observer's insert (`:174`), the unreachable
service exclusion (`relationshipContextService.ts:87`), and a prior audit document. No filter exists
in the list route, on the client, or in the card.

---

## 3. What `/relationships/[id]` renders

**FACT.** `app/relationships/[id]/page.tsx:53` fetches `GET /api/relationships/${id}` and renders:
editable name (`:169-176`), realm chip when `realm !== 'outer'` (`:177-179`), bond type + field-tone
indicator (`:181-186`), note (`:187-189`), a **"Take this to MAIA"** button (`:192-204`),
*Current Field* (`:208-258`) with a **Check in** toggle, *Something remains open* /
`unresolvedThreads` (`:261-272`), *Timeline* with an inline `+ Add entry` composer (`:274-321`),
*Next Movement* derived from the latest entry's `suggestedMovement` (`:323-337`), and *Open with a
tool* — three deep links to `/labtools/{relational-field,dynamics-map,repair-path}?relationshipId=${id}`
(`:339-377`).

**FACT.** The detail route returns relationship + `relationship_field_state` + the 20 most recent
`relationship_entries`, all scoped `AND member_id = $2` (`app/api/relationships/[id]/route.ts:29-58`),
plus `unresolvedThreads` computed in-process by `detectUnresolvedThreads` (`:92-97`).

**INFERENCE.** Opened on a fixture's catch-all row, the room shows: title *Unresolved Relational
Field*, no realm chip (realm is `outer`), no bond type, an **unknown** field tone, the observer's
auto-created note, *"No field state yet. Check in to begin sensing the field."* (`:236-238`), a
timeline of observer-written entries, and *"Check in to receive a grounded next step."* (`:332-334`).

---

## 4. Does entering the room establish a `relationshipId`?

**Answer: no — entering establishes only a page-local id.**

**FACT.** `app/relationships/[id]/page.tsx:30` reads `id` from `useParams()`. It is used for the
detail fetch, the entries POST, the PATCH rename, the `CheckInFlow` prop, and the labtools query
strings. It is **not** written to any cross-surface channel on mount.

**FACT.** The only thing that establishes a relationship identity beyond this page is the explicit
button at `:192-204`:
`seedFromSource('relationships:thread', 'I want to bring this into our conversation.', { contextId: id, tone: 'supportive' })` followed by `router.push('/maia')`.

**FACT.** `seedFromSource` (`lib/maia/seedPrompt.ts:247-256`) writes localStorage keys
`maia_seed_prompt`, `maia_seed_ts`, `maia_seed_meta` (`:74-90`). The seed expires after
`SEED_MAX_AGE_MS = 10 * 60 * 1000` (`:57`) and is consumed one-shot — cleared before it is returned
(`:154`).

---

## 5. ⭐ Does the room invoke MAIA?

The prior lane's claim ("the production room calls no MAIA route") is **partly right and materially
incomplete**. Treated as a hypothesis and tested, it splits in two.

**FACT — no MAIA *route* is called from the room.** Every `fetch` in the room's component tree targets
the relationships API: `app/relationships/[id]/page.tsx:53,83,108`;
`components/relationships/CheckInFlow.tsx:46` → `/api/relationships/${relationshipId}/checkin`;
`components/relationships/CreateRelationshipModal.tsx:69` → `/api/relationships`.
`RelationshipCard`, `RelationshipTimeline`, `FieldToneIndicator`, `EmptyRelationalField` contain no
`fetch` at all. Nothing in the room posts to `/api/sovereign/app/maia/list`, `/api/between/chat`, or
any `/api/maia/*` route.

**FACT — but the room does invoke Claude, out of band.** `Check in` →
`app/api/relationships/[id]/checkin/route.ts:16` imports `performRelationalCheckin` from
`lib/consciousness/relationalCheckin.ts`, which constructs an Anthropic client directly
(`:15` `import Anthropic from '@anthropic-ai/sdk'`; `:203` `new Anthropic({ apiKey })`) and calls
`claude-sonnet-5` with `max_tokens: 400`, `thinking: { type: 'disabled' }` and a prompt built by the
module's own `buildPrompt` (`:204-215`).

**Classification.** The room reaches a model, **not MAIA**. It bypasses the sovereign serving
boundary entirely: no `maiaService` / `maiaVoice` prompt stack, no `MAIA_RUNTIME_PROMPT`, no mode
adaptation, no memory addenda, no sanctuary gate at that call site, no `runtime_events` row. The
member sees the result of that call rendered as `maia_reflection` and `suggested_movement` inside
MAIA's product surface. **The room speaks in MAIA's name through a channel MAIA's own constitution
does not govern.**

**FACT (DB, production).** That path has fired 14 times, ever:
`relationship_entries` = 1190 rows — `note:592, reflection:286, threshold:189, rupture:107, checkin:14,
repair:2`; `entries_with_maia_reflection = 14`; `entries_with_suggested_movement = 14`;
`relationship_field_state` = 10 rows. The other 1176 entries are observer-written, never
member-authored through the room's own composer or check-in.

---

## 6. Which route receives the turn, if any

**FACT.** `/maia` renders `OracleConversation` with `apiEndpoint="/api/sovereign/app/maia/list"`
(`app/maia/page.tsx:831,1528`). The component default is `/api/between/chat`
(`components/OracleConversation.tsx:624`) but `/maia` overrides it. Other overrides at the SHA:
`app/field/talk/page.tsx:415`, `app/studio/maia/page.tsx:118`,
`components/maia/presence/MaiaPresence.tsx:239` (all the same route);
`app/partners/onboarding/prelude/page.tsx:556` still targets `/api/oracle/conversation` — the lane
retired 410 on 2026-07-17.

**FACT.** `components/OracleConversation.tsx:1707-1723` consumes the seed on mount and, **only if**
`seed.source === 'relationships:thread' && seed.contextId`, assigns
`sessionRelationshipContextId.current = seed.contextId` — a `useRef` declared at `:1664` and
documented `:1659-1663` as session-persistent, not one-shot, "latest explicit handoff always wins."

**FACT.** `:5266-5269` spreads `relationshipContextId: sessionRelationshipContextId.current` into the
POST body of every turn while the ref is set.

**FACT.** The receiving route reads it: `app/api/sovereign/app/maia/list/route.ts:874`
`const handoffId = (body as any)?.relationshipContextId;`, gated `:873` on `userId && !isSanctuary`.

---

## 7. Does the relationship identifier survive the boundaries?

| # | Boundary | Carried `relationshipId` in | Came out | Class | Evidence |
|---|---|---|---|---|---|
| B1 | URL → room page state | route segment `[id]` | `id` | `PRESENT` | `app/relationships/[id]/page.tsx:30` |
| B2 | Room → relationships API | `id` in path | member-scoped row | `PRESENT` | `app/api/relationships/[id]/route.ts:29-58` (`AND member_id = $2`) |
| B3 | Room → localStorage (button press only) | `id` | `maia_seed_meta.contextId`, 10-min TTL, one-shot | `TRANSFORMED` | `[id]/page.tsx:194-198`; `lib/maia/seedPrompt.ts:74-90,57,154` |
| B4 | localStorage → OracleConversation | `contextId` | `sessionRelationshipContextId` ref | `TRANSFORMED` (conditional on `source==='relationships:thread'`) | `OracleConversation.tsx:1707,1721-1723` |
| B5 | Client → POST `/api/sovereign/app/maia/list` | ref value | body `relationshipContextId` | `PRESENT` | `OracleConversation.tsx:5266-5269` |
| B6 | Route → context service | `handoffId` | `getMemberActiveRelationalContext(userId, { relationshipId })` | `PRESENT` (member-scoped) | route `:874-879`; `relationshipContextService.ts:69-71,98-121` |
| B7 | Service → prompt addendum | `relCtx` | prose block `relationalContextAddendum` | `TRANSFORMED` (id → prose) | route `:881`; `formatRelationalContextForPrompt` |
| B8 | Route → `meta.relationalContextId` | `relCtx.relationshipId` | nothing | **`IGNORED`** | Declared `:872`, assigned `:882`, emitted `:1248`. `git grep -n "relationalContextId" 22200f967` (repo-wide) returns **only those three lines**. No reader exists. |
| B9 | Addendum → model prompt | prose block | FAST interpolation / CORE `MaiaContext` / DEEP consultation | `PRESENT` **in source**; **NOT ESTABLISHED at runtime** | `lib/sovereign/maiaService.ts:1350` (FAST), `:1640`/`:2274` (CORE), `:2148` (DEEP); `lib/sovereign/maiaVoice.ts:123,430`. Runtime: §8 — 0/10 turns. |
| B10 | Turn write-back → `member_relationships` | *(nothing)* | catch-all row, unconditionally | **`REPLACED`** | `observeRelationalContent(userId, message, orchestratorResult.text, { isSanctuary })` — route `:1642` — takes **no** relationship argument; `relationalObserver.ts:161-181` resolves or creates `Unresolved Relational Field` regardless of which relationship the member handed off |
| B11 | Turn N → turn N+1 (same mount) | ref | ref | `PRESENT` (client memory only) | `useRef` `:1664`, spread every POST `:5266` |
| B12 | Turn N → turn N+1 (reload / remount / >10 min) | ref | nothing — seed already consumed and cleared | **`NULL`** | `seedPrompt.ts:154` clears on read; `:57` 10-min staleness; ref is component-local, not persisted |

**Where the identifier dies:** in two places, for two different reasons.

- **B10 is the load-bearing death.** The member's handed-off relationship is *replaced* at the write
  boundary. MAIA reads the named relationship (B6-B7, when a handoff exists) but writes every
  observation back into the anonymous catch-all. This is the mechanism that manufactures the 31
  `Unresolved Relational Field` rows in §2: the write side has no relationship identity at all.
- **B12 is where continuity dies.** Nothing server-side persists the handoff. The bridge lives in one
  React ref inside one mounted component; a reload, a remount, or a return after ten minutes drops it
  to `NULL`, with no stored state to recover it from. **B8** guarantees this — the one field that
  would have recorded which relationship a turn belonged to is written and never read.

---

## 8. Does anything persist, and can a later turn retrieve it? — runtime evidence

**FACT.** `runtime_events.prompt_block_layers` is a boolean map: `lib/maia/maiaRuntimeContext.ts:314`
sets `relationalContext: !!addenda.relationalContext`, fed from route `:1139`
(`relationalContext: relationalContextAddendum`). `true` = the addendum reached the prompt-block
accounting; `false` = it was absent.

**FACT (production).** Across all 1665 `runtime_events` rows (`2026-05-24 02:08` → `2026-08-14 02:01`),
the `relationalContext` key appears on **10** rows, and its value is `false` on **all 10**:

```
key               | type    | value | rows
relationalContext | boolean | false |   10
conversational    | boolean | true  | 1389   (false: 260)
atoms             | boolean | true  |  746   (false: 919)
episodic          | boolean | true  |  150   (false: 363)
```

**FACT.** The key exists only on rows built after the read side shipped. Every event since
`2026-08-13 10:00Z` carries it: `total_since = 10, with_key = 10`. The first is
`2026-08-13 10:51:41Z`, the last `2026-08-14 02:01:55Z`; all on `sovereign/app/maia/list`.

**Classification — B9 at runtime: NOT ESTABLISHED, trending negative.**
The relational context bridge has produced a prompt block on **0 of the 10 production turns** that
have occurred since its read side deployed. That is a genuine negative observation, not an absence of
instrumentation — the counter fires, and reports zero. But **10 turns is not a verdict**: the sibling
layers on the same rows prove the instrument works (`conversational` reads `true` 1389 times), so the
zero is real; it is the *window* that is too small to call the mechanism broken versus merely
unexercised. What is established is that **no member has handed a relationship to MAIA and had it
land in a prompt since the capability shipped.**

**FACT (logs, second derivation).** `docker logs maia-sovereign` since container start
(`2026-08-14T00:53:51Z`) contains **0** occurrences of `[MAIA/sovereign] relational-context` (the
success marker at route `:883`). ⚠️ The container has served roughly one turn in that window, so this
grep is evidence about the window, not about the mechanism — it is recorded as corroboration of the
`runtime_events` reading, not as independent proof.

**Retrieval by a subsequent turn:** `PRESENT` within a single mounted `OracleConversation`
(B11); `NULL` across reload, remount, or a return after the 10-minute seed TTL (B12); and **never
reconstructible from the server**, because B8 discards the only identifier that could have anchored
it. No table stores which relationship a turn belonged to.

---

## 9. NOT ESTABLISHED

Explicit completion states, not gaps to be filled by assumption:

1. **Rendered pixels.** No authenticated browser walk of `/relationships` or `/relationships/[id]`
   was performed — see §0. Everything in §1 and §3 is source + DB derivation. *Rendering a component
   in source is not rendering it at runtime.*
2. **Whether B9 works at all.** 0/10 is consistent with "no member has pressed the button since
   2026-08-13" and equally consistent with a defect between B5 and B7. Nothing in this trace
   discriminates between them; a single authenticated turn with a handoff would.
3. **Whether any member has ever pressed "Take this to MAIA."** No client-side telemetry exists for
   the button, and B8 means no server-side record survives. Unknowable from present instruments.
4. **What the member experiences on encountering a card named "Unresolved Relational Field."** This
   trace establishes that it is displayed and how it got there; member phenomenology is a separate
   evidence class and was not gathered.
5. **Whether the `note` text ("Auto-created by relational observer…") is ever seen.** The list card
   does not render `note` (`RelationshipCard.tsx:50-63`); the detail page does (`[id]/page.tsx:187-189`).
   Whether a member has ever opened the room to see it is not established.
6. **Sanctuary coverage of the check-in Anthropic call.** §5 notes the call bypasses the sovereign
   boundary; whether any sanctuary gate applies elsewhere on that path was not traced.
7. **Whether the 14 check-in entries and 10 field-state rows belong to fixtures, the excluded member,
   or others.** Not attributed — attribution would have required reading the excluded member's rows.
8. **DEEP / CORE tier behaviour for B9.** Source registration is cited (`maiaService.ts:1640,2148,2274`);
   no runtime tier breakdown exists because no turn produced `true`.
9. **`/api/maia/relational-signal` and the signal lane.** Out of the traced path — the room never
   calls it. Its relationship to `member_relational_signals` was not traced.

---

## 10. Recommendations (RECOMMENDATION — no authority claimed, nothing authorized)

1. The `relationalContext` layer flag is the right instrument and it is already deployed. Leave it
   running and re-read `runtime_events` after a period with real traffic before drawing any
   conclusion about B9. **Do not manufacture a turn to make the counter read `true`.**
2. B8 (`relationalContextId` written and never read) and B10 (write-back replaces the member's
   relationship with the catch-all) are the two findings that would survive any amount of additional
   runtime evidence. Both are structural and visible in source at the SHA.
3. §2 is a member-facing representation question, not only an engineering one: a system-authored
   container named *Unresolved Relational Field* currently occupies the position labelled *People in
   your life* for 30 of 31 members. Naming and disposition of that row are above this unit's
   authority and are surfaced, not proposed.
