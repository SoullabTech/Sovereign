# Membrane Map — Personal ⇄ Dyadic ⇄ Circle ⇄ Constellation ⇄ Commons ⇄ Co-Lab

**Status:** proposed. Column "Today" is **OBSERVED**; column "Proposed" is **CANDIDATE / VISION**.

## 1. Candidate governing law (Docket D-01)

> **Connection may increase reach, but may never lower the consent level of what is being
> connected.**

Corollary set, derived from the five fields:

1. **Nothing crosses a membrane without an act by someone with authority over what crosses.**
2. **Authority over a Personal-field item belongs to the member. Always. Including after crossing.**
3. **Authority over what a Circle releases belongs to the Circle** — not to any one member, and
   not to MAIA.
4. **A field may only see what the field below it has explicitly released** — never its interior.
   A Constellation cannot see inside a Circle. A Commons cannot see inside a Constellation.
5. **Revocation propagates downstream, never upstream.** Withdrawing an offer removes it from
   every field it reached. It never touches the source item.
6. **Crossing is always representational.** What crosses is a *representation* a member authored
   for that crossing — never a live pointer into the source.

## 2. The membrane matrix

| From → To | Today (OBSERVED) | Proposed | Authority to cross | Revocable by |
|---|---|---|---|---|
| Personal → Circle | ✅ **LIVE, 4 paths** (Studio Decision / Change / Session Room / feed button) → `POST /api/circles/shared` | keep; add MAIA-exchange offer | the member | the member |
| Personal → Circle *(inferred)* | ⛔ **SEVERED** — `member_theme_signals` suspended 2026-07-17 | **stays severed** | — | — |
| Personal → Circle *(authored in place)* | ✅ inquiry response, `field_synthesis` | add withdraw path (G-08) | the member | ❌ **no path today** |
| Circle → Personal | ⬜ none | member may keep a private note referencing a Circle moment | the member | the member |
| Circle → Circle | ⬜ none | **only via Constellation.** No direct Circle↔Circle channel | the Circle (collective act) | the Circle |
| Circle → Constellation | ⬜ none | **explicit release**, decided by the Circle | the Circle | the Circle |
| Constellation → Circle | ⬜ none | a Constellation may offer an inquiry *in*; a Circle may decline | the receiving Circle accepts | the Circle |
| Circle → Commons | ⬜ none | explicit contribution; passes existing Commons review | the Circle + the original author | either |
| Commons → Circle | ⚠️ `/maia/community/commons` exists, unrelated to Circles | discovery + shared knowledge; **read-only into a Circle** | the member who brings it | the member |
| Circle → Co-Lab | ⬜ none | "six of us want to build this" → create Co-Lab **from** Circle | the founding members | n/a (new object) |
| Co-Lab → Circle | ⬜ none | open a Circle inquiry from a Co-Lab | the Co-Lab members | the Co-Lab |
| **Membership transfer, any crossing** | n/a | ⛔ **never automatic.** Creating a Co-Lab from a Circle transfers **no one** unless each person joins | each person individually | each person |

## 3. The typed crossing object (proposed)

Every crossing, at every membrane, records the same seven facts:

```text
source_field          personal | dyadic | circle | constellation | commons | colab
source_ref            what it came from (never dereferenced by the destination)
destination_field
offered_by            the member who performed the act
authorized_by         the authority that permitted it (member | circle | colab)
representation        what actually crossed — authored for this crossing
consent_state         active | revoked
revocation_authority  who may withdraw it
```

**Invariants:** the origin item is never mutated by a crossing · the destination never holds a
live reference into the source · revocation sets `consent_state` and cascades to every downstream
field · a representation carries its provenance forward at every subsequent membrane.

This generalizes what `shared_artifacts` already does correctly for one membrane
(`artifact_type` · `artifact_ref` · `content_mode` · `revoked_at`, owner-scoped revoke, source
untouched) — **the existing table is the working prototype of the general object.**

## 4. What must never cross — proposed hard list

1. **Private MAIA conversation content** into any shared field, by any path, including summary.
2. **Inferred material** (themes, patterns, coherence signals, elemental state) into any shared
   field without explicit member ratification *and* collective eligibility. *(Already ruled
   2026-07-17. This map extends the ruling to every new membrane rather than re-litigating it.)*
3. **Sanctuary-mode content** anywhere, ever, by any mechanism, including at member request during
   the session. *(Absolute boundary, `CLAUDE.md`.)*
4. **A Circle's interior** into a Constellation or Commons.
5. **Membership itself**, as an implicit consequence of any crossing.
6. **Identity across membranes without the member's act** — a Commons contribution must not
   silently disclose which Circle a person belongs to.

## 5. Where the membrane is thinnest today

| Risk | Evidence |
|---|---|
| **Discovery is the first real membrane risk this programme introduces.** Interest-based discovery must read *declared* interests only — never MAIA conversation, memory atoms, or inferred themes | there is no discovery today (census §4.1), so this is a *design* constraint to fix in advance, not a defect to repair |
| **Constellation is the second.** The moment two Circles can see each other, item 4 above becomes enforceable code rather than doctrine | 0% built |
| **A response cannot be withdrawn** | census §5, path 5 — the only irreversible Personal→Circle crossing that exists today |
| **Removal does not cascade** | census §4.3 — `status='removed'` has no writer, and would not revoke shares if it did |
