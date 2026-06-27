# Personal Wisdom Library — Architecture

**Status:** Design. Knowledge engine **[LIVE]**; ownership/scope layer **[DESIGNED]**.
**Date:** 2026-06-27
**Authorship:** Emerged from a Kelly ⇄ Claude design conversation (2026-06-27). Constitutional statement (§10) is Kelly's wording.
**Altitude:** This document answers *"what system are we building?"* — it is substrate-independent and should remain true even if the datastore changes. All schema, columns, file paths, and migration mechanics live in the implementation spec: `docs/specs/PERSONAL_WISDOM_LIBRARY_IMPL_2026-06-27.md`.

> **Claim-discipline markers** (per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`):
> **[LIVE]** = wired + carrying production traffic · **[DESIGNED]** = specified, not built · **[VISION]** = directional.
> This document does **not** authorize claiming any **[DESIGNED]** element as delivered.

---

## 0. The simplifying insight

> **There is one knowledge engine. There are multiple ownership scopes.**

The diagnosis that produced this document:

> **The engine is live; the scope layer is missing.**

A single knowledge pipeline — *ingest → chunk → embed → retrieve → distill* — already exists in production, with hybrid retrieval, distillation, consent, and review. What it lacks is any notion of *whose* knowledge it holds. Everything goes into one global pool, and retrieval reads the whole pool regardless of who is asking.

So the Personal Wisdom Library is **not a new subsystem**, and it is **not a capability that already exists**. It is the **missing routing-and-governance layer over a working engine.** Member libraries, practitioner libraries, the platform canon, promotion, and governance all emerge from one idea — *one engine, many scopes* — rather than each requiring a separate stack. That is the architectural win worth protecting: it **removes** conceptual duplication instead of adding a layer.

---

## 1. The problem

The product promises a "Personal Library — your curated knowledge collection." In reality there is **no per-member write path**: members can browse the shared canon, save and label items in it, and submit suggestions to a review queue — but they cannot author or upload a private corpus of their own. "Wisdom" is also overloaded across several disconnected collections that share the word but not a backend.

The member need that forces the architecture (Kelly, 2026-06-27): **an upload path for transcripts, manuals, and other materials into a member-owned field** — private by default, usable by MAIA in conversation, and never silently promoted into shared knowledge.

---

## 2. One engine, orthogonal to the experience layers

The knowledge pipeline is **infrastructure**, shared by every ownership scope. The three "layers" are a **user-experience** distinction — *not* three pipelines. Keeping these orthogonal is what prevents "Personal Library" from quietly meaning "a second retrieval engine."

```
                     Knowledge Pipeline   (one engine)
            ingest → chunk → embed → retrieve → distill
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   Platform scope      Practitioner scope      Member scope
   (Soullab canon)     (coach / org corpus)    (private corpus)
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                 MAIA retrieval / orchestration
```

| Experience layer | What it is | Today |
|---|---|---|
| **L1 — Relationship** | preferences, follows, saves, labels ("I prefer Clean Language; don't interrupt my metaphors") | substrate exists |
| **L2 — Personal corpus** | member-owned knowledge objects (uploaded transcripts/manuals, curated teachers, personal insights) | **the gap this document fills** |
| **L3 — Active practice** | which corpus pieces are live this turn; conversational "moves"; prompt assembly | substrate exists |

L1 and L3 already have homes. **L2 is the hole.** The engine beneath all three is live.

---

## 3. Ownership scopes

| Scope | Owner | Default visibility | Example |
|---|---|---|---|
| **Platform** | Soullab | Everyone | the existing canon, traditions, master fields |
| **Practitioner** | Practitioner / organization | Their clients | a coach's own manuals, frameworks, curricula |
| **Member** | Individual | **Private** | Jondi's uploaded transcripts; her Clean Language materials |

All three run through the **same** engine, parameterized by owner and scope. **All three scopes are reserved in the model from day one**; *practitioner behavior* (sharing/grants) is deferred — schema and model first, behavior later.

**Identity and stewardship are orthogonal.** One identity can simultaneously hold a private member corpus, a practitioner corpus, and stewarded platform knowledge — each governed independently. These are not duplicates; they are three distinct ownership/stewardship relationships around knowledge associated with the same person: her private reflections stay member-scope and invisible, her methods are practitioner-scope for her clients, and only a reviewed subset ever becomes platform-scope canon. This is the same orthogonality move as scope vs visibility (§4): the architecture binds scopes to a **stable identity**, but governs each scope separately. Identity is the connective tissue; scope is the governance.

---

## 4. Five governance axes

Ownership is not one dimension. Several axes that look alike are different things — most importantly **scope ≠ visibility** and **usage authority ≠ maturity**.

| Axis | Values | Question |
|---|---|---|
| **Scope** | Platform / Practitioner / Member | whose domain does it belong to? |
| **Owner** | identity | who authored / uploaded it? |
| **Steward** | identity or organization | who cares for it? |
| **Visibility** | Private / Shared / Published | who may see it? |
| **Usage authority** | Store-only / Only-when-I-ask / Reflect / Use-in-guidance | how may MAIA use it *right now*? |

(Separately, **Status** is the §6 lifecycle — an object's *maturity*. Maturity is **not** authority: a member may fully trust a piece yet forbid MAIA to use it.)

Two orthogonalities make the governance expressive:
- **Scope ≠ visibility** — a Member object can become *temporarily* visible to a reviewer without becoming Platform scope; a Practitioner object can reach *one* client without becoming canon.
- **Usage authority** is the dial the **member holds directly** — the catalyst rule made tangible: the member sets MAIA's authority over each item. It is a **monotonic ladder of MAIA's initiative** — *Store-only* (never used, a private vault) → *Only-when-I-ask* (reactive, explicit invocation) → *Reflect* (proactive mirror, non-directive) → *Use-in-guidance* (proactive, directive-eligible) — and it **defaults to the low end**, enforcing the core invariant: **no kept item becomes guidance-authoritative by default.** Save is easy; authority is deliberate.

Visibility and usage authority change reversibly and locally; scope changes only through promotion (§8).

---

## 5. Upload — the Layer-2 write path

The concrete first capability: **members upload transcripts, manuals, and other materials** into their personal corpus.

- **It reuses the one engine** — the same ingest → chunk → embed → retrieve path, now parameterized by owner and scope. Upload does not introduce a second knowledge stack.
- **Private by default**, member-owned, with **mandatory provenance**: every object records who uploaded it, what kind of source it is, and whether it originated with the member or was imported.

---

## 6. Save ≠ Adopt — object lifecycle

Saving material is not the same as MAIA adopting its voice. Saving a paper on Lacan does **not** make MAIA speak Lacan. Objects carry a state:

```
Kept → Curated → Trusted → Active → Retired
```

Only **Active** (and member-invited) objects inform the current conversation. State is member-controlled and revisable.

**Lifecycle is independent of intent and authority.** Status (maturity) answers one question — *"how mature is this within my practice?"* — and nothing more. It does **not** encode what the member wants done with an item (**intent** → §6A), how MAIA may use it (**usage authority** → §4), how the act is acknowledged (**presentation** → §6B), or who may see it (**visibility** → §4). An earlier draft mapped *intent → a lifecycle state* (e.g. "Practice → Active"); that conflated two different models and is **removed**. Each concern now lives in exactly one place:

| Concern | Owned by |
|---|---|
| Lifecycle / maturity (the states above) | **§6** (here) |
| Member intent — *meaning lives in the relationship* | **§6A** |
| Usage authority — *what MAIA may do* | **§4** |
| Acknowledgment depth / presentation | **§6B** |

---

## 6A. [CANDIDATE] Meaning lives in the relationship, not the artifact

**The durable primitive is not a word — it is an observation:** *the same artifact can carry different meaning because the member has a different relationship to it.* Two members keep the identical PDF — member A: *"this changed my life,"* member B: *"I'm no longer sure this is true."* The artifact is identical; the meaning for MAIA is not. Therefore **the relationship cannot be inferred from the artifact — it must be authored by the member.** This is the core of member-intent-first (§6), and it stands on its own, independent of any stewardship hypothesis.

**Distinguish the member's act from MAIA's posture — do not conflate them.** Conflating them quietly transfers authorship from the person to the system, which the sovereignty commitment forbids (§10).

| | What it is | Stays as |
|---|---|---|
| **Member's act** | the member's declaration of a relationship — *authored, never inferred* | the surface verb (today: **Keep this** — *"I don't want to lose this"*) **+** the usage authority they grant |
| **MAIA's posture** | MAIA's responsibility toward what is entrusted — *internal* | *hold · reflect · carry · steward* — **never member button labels** |

**Do not prematurely invent Soullab vocabulary.** *Receive, Carry, Hold, Tend, Anchor, Living Field, Garden* and the like remain **candidate language only** — none is elevated into the architecture. Invariant:

> **Member language is evidence. Platform language is hypothesis.**

Let members' own language reveal whether richer concepts are actually needed.

**Member experience stays minimal (v1).** The member acts — **Keep this** — and is then asked one question, **"How should MAIA use this?"** → *Store only · Only when I ask · Reflect with me · Use in guidance* — a monotonic ladder, low → high (**default: Only when I ask**; *Store only* is a deliberate vault state, **not** the default). That selector is the member **granting usage authority** (§4), and it is the soul of the feature: **keeping is not authorizing.**

**Governance invariant (restates §4):** *easy to preserve, slow to become authoritative.* **No kept item becomes guidance-authoritative by default** — authority defaults to the low end and is granted deliberately. "Save" must never silently mean "MAIA may use this in guidance."

**V1 boundary.** **Member scope only · Private visibility only** (§3 / §5); **Offer / share / promotion deferred** (§8 reserved, not built); **provenance captured at add-time** (origin + source type — member-authored vs imported, §5 / §9); **Sanctuary sessions must not silently write to the library** (§9 — preservation is an explicit member act, never a side effect).

**Evidence standard.** Do not promote richer vocabulary until *independent member observation* supports it. The experiment: *when members keep something important, do they naturally express a relationship to it?* If yes — **record their language**. If no — retain the minimal interaction. The architecture should **emerge from member language, not platform metaphor.**

**Status: [DESIGNED · candidate].** Design refinement recorded for evaluation; **no UI rename and no code** until explicitly instructed.

---

## 6B. [CANDIDATE] Experience layer — presentation preferences

**Acknowledgment depth is a *presentation* preference, not a state axis** — a category distinction worth holding precisely:
- **State axes** (lifecycle §6 · usage authority §4 · visibility · ownership · scope) change *what the system is allowed to do.*
- **Presentation** changes *how the same event is rendered back to the member* — the underlying state is identical.

Same act, same stored state, different encounter. A member chooses **Keep this → Reflect with me**:
- *Nathan* (acknowledgment depth = "tell me what you understood") sees: **"Kept for reflection. I understood this as a book about Jung's Shadow."**
- *Kelly* (acknowledgment depth = "just keep it") sees: **"✓ Kept."**

Identical lifecycle, identical usage authority — only the **presentation** differs. A very Soullab move: *don't fork the architecture because two people think differently; keep the meaning and state stable, and adapt only the encounter.*

**Acknowledgment depth — candidate profile preference, "After I keep something…"** (a standing default, not a per-keep question — keeping stays low-friction). It is **not** a verbosity setting; it is how much processing the member wants *in the moment of entrusting*:

| Setting | MAIA's response | Example |
|---|---|---|
| **Just keep it** | minimal confirmation only | "✓ Kept." |
| **Briefly acknowledge it** | one short confirmation, including the usage-authority state | "Kept for reflection." |
| **Tell me what you understood** | a short synopsis of what MAIA *recognized* — receipt + understanding — without expanding into a conversation | *(1–2 lines)* |

**Guardrails:**
- **Synopsis is never the global default** — opt-in per member.
- **Keeping never becomes a conversational loop** unless the member asks for more.
- **Acknowledgment ≠ authority.** A synopsis acknowledges *receipt and understanding* — not interpretation, not guidance — and does **not** make MAIA authoritative over the content (§9.4 holds).
- **Presentation never changes state.** Acknowledgment depth tunes only what is *shown*; it cannot alter lifecycle (§6), usage authority (§4), or any other state axis. "Keep this" remains the member-facing act (§6A).
- **Wording is provisional** — per §6A's invariant (*member language is evidence; platform language is hypothesis*).

**This layer will grow.** Acknowledgment depth is the first member-facing presentation preference; the Experience layer is the natural home for others as they appear — confirmation style, narration density, perhaps timing — each changing the encounter while leaving the core architecture (intent §6A, state §4/§6, governance §8/§9) untouched.

**Open flow question (for the implementation spec, not decided here):** how acknowledgment depth composes with §6A's single usage-authority question at keep-time — e.g. whether *"Just keep it"* also streamlines that prompt. That is flow, not principle.

**Status: [DESIGNED · candidate].** Candidate design language for evaluation; **no UI and no code** until explicitly instructed.

---

## 7. Confidence, not truth

Objects store a **role/confidence**, not a truth value, so contradictory material can coexist: *confirmed practice · working hypothesis · question · inspiration · quotation · experiment · principle I live by*. The field holds a landscape of meaning, not a set of verified facts.

---

## 8. Principle: Promotion is governance, not migration

> **Object identity invariant — a knowledge object has one identity throughout its lifetime. Scope, stewardship, and visibility may change through governance; object identity does not.**
>
> Corollary: promotion between scopes changes an object's stewardship and visibility, never its identity.

This is stated implementation-independently on purpose: whether the datastore is PostgreSQL, object storage, or something else, the commitment holds. The object is never copied "into the platform library." It remains the same object; what changes is who stewards it and who may see it — and only after explicit, opt-in review. Nothing leaks upward automatically. This is the **memory-vs-constitution** boundary: a Personal Wisdom Library is **memory**, not the member's constitution.

```
Member → Shared-with-team → Reviewed → Platform lineage
```

Each arrow is a governance act, not a data copy.

---

## 9. Governance & harm boundaries

1. **Ownership** — the wisdom belongs to the member; existence in the system never promotes it to platform knowledge.
2. **Provenance** — every object retains origin (member-authored vs imported) and source type.
3. **Explicit scope** — every object knows its scope; scope never auto-expands.
4. **Non-authoritative by default** — MAIA never says *"your Wisdom Field says this is true."* It says *"earlier you've worked from the principle that…"* / *"would you like to approach this using David Grove's Clean Language?"* The field **informs** the conversation; it does not **decide** it.
5. **Revisability** — nothing is permanent because it was saved; editable / archivable / superseded / retired. A mature field shows development over time.
6. **Consent / Sanctuary** — uploads are memory and respect Sanctuary: a Sanctuary session must **not** write to the library.
7. **Copyright & sensitivity** — uploaded **manuals/books are third-party copyrighted**; uploaded **transcripts are sensitive personal data.** Personal-scope private use is fine; the **promotion path upward** is where copyright and sensitivity risk concentrate, and is exactly what §8's review gates guard.
8. **Harm boundary** — if a member saves something like *"when I hear voices I should stop my medication"* or *"the only trustworthy person is MAIA,"* the system neither deletes it (it is their history) nor reinforces it. MAIA recognizes a stored belief without treating it as guidance or amplifying harm.

---

## 10. Constitutional statement (proposed)

> **A Personal Wisdom Field is a living record of a member's evolving understanding. MAIA may draw from it to deepen continuity, but it must never treat its contents as unquestionable truth, permanent identity, or universal doctrine. Every entry retains its provenance, scope, and revisability, and authority always remains with the living person rather than the stored memory.**

Consistent with the existing sovereignty architecture (authority over meaning stays with the human): the person remains primary, memory supports the relationship, and governance prevents either the platform or the person's past from becoming an unquestioned authority.

---

## 11. What gets unified

Several existing collections share the word "wisdom" but not a backend. Under *one engine, many scopes*, they stop being separate systems and become **scoped collections** or **experience layers**:

| Existing collection | Becomes |
|---|---|
| "Library Files" (the 246-file archive) | a **Platform-scope** collection |
| "Choose Your Guide" (the traditions list) | a **Platform-scope** reference collection — one stewarded collection among many |
| "Sacred Texts" (the sources reference) | a **Platform-scope** reference collection |
| Master fields (Jung / McGilchrist / Hillman) | **Platform-scope** "master lineage" collections |
| Wisdom "moves" | **L3 — Active practice** (wisdom-as-conversational-move), drawing on the corpus |
| "Contribute" queue | the **promotion/review** path of §8 |
| Saves & labels | **L1 — Relationship** signal |

**Architectural decision:** two retrieval engines exist today; the system **converges on the single richest one**. The second is **declared legacy** and retired incrementally as callers migrate — not deleted abruptly. (Which engine, and the migration, are in the implementation spec.)

---

## 12. First vertical slice — Clean Language

The right first slice is **Clean Language support for one member (Jondi)** — not because Clean Language is special, but because the slice exercises **every part** of the architecture: upload, ingestion, retrieval, privacy, stewardship, promotion, and active practice. If it works well, the same architecture supports transcripts, manuals, books, journals, and personal notes **without new concepts.**

The Clean Language behavior itself (preserve the member's exact words; ask clean, non-leading questions; never diagnose; offer elemental/interpretive framing only when invited) is the *content* of the first member-scope corpus object plus a member preference. Its detailed build is in the implementation spec.

---

## 13. Decisions

**Resolved (this conversation, 2026-06-27):**
- **One engine.** Converge on the single richest knowledge engine; declare the other legacy; migrate callers incrementally.
- **Reserve all three scopes now** (Platform / Practitioner / Member) in the model; defer practitioner *behavior*.
- **Scope ≠ Visibility** — four governance axes (§4).
- **Promotion is governance, not migration** (§8) — adopted as an architectural principle.
- **Clean Language for Jondi** is the first vertical slice — **build sequence ratified (Kelly, 2026-06-27):** (1) the `Keep this` primitive (member-scope write path + usage authority + governed retrieval, §5 / impl §5); (2) prove it with Jondi / Clean Language — smallest blast radius (one member, one bounded corpus, one usage relationship, one retrieval path, one authority setting, easy to verify when MAIA should and should *not* draw on it); (3) **only then** Obsidian vault import as the **second** connector (impl §7.7), same engine + same gates, default `only_when_i_ask`, folder/tag-level authority overrides deferred. Guardrail: **Obsidian must not become the architecture** — it is the connector that proves the architecture *generalizes*, not a fork.
- **Member-facing action = "Keep this"** (an intent declaration — *"I don't want to lose this"* — not "store"); the container's member-facing **name is deliberately left open** (members' own language should name it; "Living Field" already names the beta program).

**Candidate (recorded, under evaluation — NOT adopted):**
- **Member-authored intent as the first classification step** (§6) — *Keep / Practice / Question / Share / Let go* precede object-type. Independently testable; does not depend on the container metaphor or on whether stewardship is a constitutional apex.
- **Meaning lives in the relationship, not the artifact** (§6A) — the durable primitive is *the relationship is authored by the member, not inferred from the artifact* (refines §6). Sharp distinction held: the **member's act** (surface verb — today *Keep this* — **+** the usage authority they grant) vs **MAIA's posture** (*hold / reflect / carry / steward* — **never** member labels). Platform vocabulary (*Receive / Carry / Tend / Garden / …*) stays **hypothesis, not architecture**: *member language is evidence, platform language is hypothesis* — promote only on independent member observation. Invariant carried: *easy to preserve, slow to become authoritative.*

**Deferred to the implementation spec** (correctly *not* architecture): embedding specifics, lifecycle-state granularity for v1, accepted file types/limits, the practitioner grant model, and the Jondi member-row dedupe.
