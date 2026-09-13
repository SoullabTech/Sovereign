# UARE-01 — Uare.ai / Individual AI — First-Pass Study

**Date:** 2026-09-13
**Lane:** `UARE-01` (`docs/programme/UARE-01_LANE_CHARTER_2026-09-13.md`)
**Author of the first pass:** founder (Kelly)
**Status:** U0 INTAKE. Evidence of record for the lane. ⛔ **No [O] evidence exists yet.**
**Revised:** 2026-09-13, founder ruling — evidence taxonomy corrected (see §0). No finding withdrawn; three re-tagged, one re-worded (§6), two converted from requirement to question (§7, §8).

---

## 0 · Evidence class — read before citing anything below

Per charter §5. Every claim carries a tag.

| Class | Meaning | Use |
| --- | --- | --- |
| **[D] Documented** | Uare's own legal / pricing / support / product / **release-note** material. | May ground a finding. |
| **[E] External report** | Independent press, App Store user reviews, third-party accounts. | May ground a finding *about what is reported*. |
| **[O] Observed** | **Soullab witnessed it in the running product**, recorded method, dated build. Nothing else. | May ground a finding. |
| **[M] Marketing** | Vendor assertion, not independently established. | Records their *claim*, never a fact about their architecture. |
| **[I] Interpretation** | Soullab's reading. | Ours. Never later cited as [D], [E] or [O]. |

⚠️ **Correction of record, founder ruling 2026-09-13.** The first draft of this table admitted the App
Store release record as **[O] Observed** while simultaneously stating no [O] existed. Both could not
be true. A vendor writing *"fixed X"* in its own release notes is **[D]** — documentation of a claim
they authored — not our observation of a behaviour. User reviews are **[E]**. The three affected rows
are re-tagged below; no finding is withdrawn, and the §6 inference survives in a weaker, exact form.

**Known limitations of this pass, recorded so they cannot be forgotten:**

1. **No one at Soullab has used the product.** Everything below is desk research. ⛔ **There is no
   [O], anywhere in this document.** That is not a caveat — it is the reason U2 exists.
2. **Instagram was throttled**, so no post-by-post grid audit was possible; social positioning is
   therefore under-sampled relative to legal and product material.
3. **Vendor material dominates.** Most of what is knowable about their architecture is knowable only
   because they chose to describe it. Architecture descriptions from a company's own engineering blog
   are [M] with respect to what is actually running, even when written in good faith.
4. **Versioned surfaces move.** Pricing, terms, release notes and app behaviour are all dated
   observations. Re-read before citing after 2026-12.

**What would upgrade this document:** a clean-room walkthrough under the charter §8 constraints
(step U2) — the only act that can produce [O], converting [M] and [D] rows into observed or refuted.

---

## 1 · What Uare is

An **"Individual AI"** [M]: a person supplies voice, documents, photographs, memories, social
accounts and conversations; the system organizes them into a proprietary **Human Life Model™** with
seven dimensions — *Identity · World · Story · Mindset · Drive · Pattern · Growth* — and learns
continuously from interaction rather than behaving as a static uploaded persona [D, support material].

The product surface spans **capture → talk → publish → act → share → monetize** [D, pricing page].

**Origin:** began as **Eternos**, focused on preserving a dying person's identity so family could
interact with a representation after death; first widely covered case was a terminally ill user.
Pivoted from digital immortality to living Individual AI [D, press]. Founder: Rob LoCascio, previously
LivePerson. **$10.3M seed, Mayfield + Boldstart, November 2025** [D, company announcement].

**[I]** This is not a thin wrapper and not a short-lived experiment. Capital, an experienced operator,
and a deliberate category-creation strategy. Treat as a standing subject, not a news item.

## 2 · Architecture as described

Their Head of AI Engineering describes a **Human Life Model + coordinated multi-agent system +
graph-based retrieval**, with distinct internal agents for meaning extraction, memory
organization/prioritization, reasoning over retrieved material, detail verification, and reflection
before response; voice is described as expressively planned — pacing, emphasis, softness, energy —
rather than plain TTS [M, engineering blog].

```text
PERSON
  └─ voice · memories · documents · conversations · media · socials
       └─ Human Life Model
            └─ structured / graph memory
                 └─ multi-agent processing
                      ├─ meaning extraction
                      ├─ memory organization
                      ├─ retrieval
                      ├─ reasoning
                      ├─ verification
                      └─ reflection
                           └─ Individual AI ─► chat · voice · creation · actions · other people
```

**[I]** Structurally serious — this is not RAG-over-an-LLM. It is adjacent enough to be worth
standing attention. **[I]** But note what the diagram does *not* show: any authority boundary. Every
agent feeds one output and nothing in the public description says which of them is permitted to be
the author. That absence is the interesting part (§7).

## 3 · Where it intersects MAIA

| Uare | MAIA / Soullab | Read |
| --- | --- | --- |
| Human Life Model (7 dims) | Spiralogic / elemental architecture | **[I]** Strong structural parallel — and the reason not to import their taxonomy (charter §0) |
| Story | episodic / developmental memory | **[I]** Direct overlap |
| Pattern · Growth | developmental arc | **[I]** Very strong parallel |
| Long-term memory | Anamnesis / developmental memory | **[I]** Direct overlap |
| Knowledge graph | semantic / relational graph work | **[I]** Technical overlap |
| Multi-agent system | canonical turn + Jarvis orchestration | **[I]** Architectural overlap — diverges on authority (§7) |
| Voice as identity | embodied MAIA voice | **[I]** Overlap; their failure log is the useful part (§6) |
| Practitioner AI + subscriber access | Practitioner Studio | **[I]** Commercial overlap, different relational premise (§8) |
| MCP / actions | Jarvis action layer | **[I]** Overlap |
| Content generation | Writer's Studio | **[I]** Overlap, opposite goal (§9) |
| "Own your data" rhetoric | sovereignty | **[I]** Same market demand; materially different implementation (§10) |

**The finding that matters is not any single row.** It is that an independently funded team, from a
completely different origin (posthumous memory preservation), converged on the need for **a
structured model of a human being that persists beneath conversation**. That is external
confirmation that the substrate question is real. It confirms the *question*, not our answer to it.

## 4 · The philosophical fork

Their language is consistent and load-bearing: **"always you" · "talk to yourself" · "works as you" ·
"thinks like you" · "you, on your best day"** [M].

**[I]** A person does not encounter themselves by being represented more accurately. They encounter
themselves in relation — through attention, context, reciprocity, and the resistance of an other.
Higher-fidelity self-representation is not a route to that; it is a route around it.

**[I]** And the self one can describe is not the psyche. A system trained to reproduce a member's
stated beliefs, narratives and habitual interpretations is structurally excellent at reinforcing the
ego's existing map, and has no native mechanism for the thing that was not already known.

**[I]** MAIA's harder and more interesting position: *remember me deeply while remaining not-me.*
This is the lane's primary discriminator (charter §3) and every subsequent observation is filtered
through it.

**[I]** There is also a market signal here, not only a philosophical one. An App Store reviewer called
the premise *"Very Black Mirror"* while still rating the vision positively [E, App Store user review]. The
resistance is to **"we copied you."** There appears to be materially less resistance to **"something
has come to know you."** Substitution anxiety and encounter are different psychological offers.

## 5 · Product mechanics worth studying (mechanism, not doctrine)

### 5.1 Visible model formation
Their Human Life Model screen shows the model being constructed, including a **fidelity level per
dimension** [D, support material].

**[I]** The *principle* is excellent: the member can perceive that the system is learning something
about them, instead of memory being invisible magic. **The metric is not.** "We understand your psyche
74%" is an epistemic claim about a person that no one can support. ⛔ **Charter §10 prohibits UARE-01
from proposing, importing or recommending such a metric.** Whether Soullab bans it *everywhere,
permanently* is a doctrinal question this lane may pose and may not answer.

**[I]** The MAIA-shaped version — Cat 1, held — is a living map of what MAIA currently has *evidence*
for, in qualitative bands (rich / emerging / provisional / sparse / unexplored), where every item
opens to **source → interpretation → confidence → correction**. That is more sovereign *and* more
honest than a percentage, and it is already the direction the provenance work points
(`lib/manuscript/development/` — `EvidenceRef`, `readState`, `bind`, `resolve`).

### 5.2 Elicitation as encounter
Onboarding is conversational: **voice → avatar → quick interview → socials → knowledge → ongoing
conversation**, with **"Story Quests"** — guided questions designed to surface beliefs and values
rather than asking a member to fill in a profile [D, pricing/platform page].

**[I]** Directly relevant. *"Complete your profile"* produces a form. *"Tell me about a place that
formed you"* / *"What changed the direction of your life?"* / *"Who taught you something you still
carry?"* / *"What do you know now that your younger self couldn't know?"* produce an encounter whose
structured residue can feed memory. Cat 1, held. Note the constitutional constraint: such a question
is Encounter-layer; the system may hold what the member authored, never derive Recognition on their
behalf.

### 5.3 Source chips
August release added **tappable source chips beneath answers when the AI answers from the member's
documents** [D, Uare release notes].

**[I]** Right instinct, directly aligned with work already underway. Not *"MAIA remembers this"* but
*"MAIA remembers this **because…**"* — provenance reachable on demand, without polluting the
conversational surface. Cat 1, held; the substrate for it partly exists.

## 6 · The mobile voice failure surface — the most immediately useful finding

Their App Store version history documents successive fixes across July–September for a specific,
recognizable class of defect [D, Uare release notes].

| Uare repair | Class | MAIA relevance |
| --- | --- | --- |
| AI hearing its own voice / echo | transport | direct |
| replies stopping after first turn | **turn record** | direct |
| text ↔ voice switching | **turn record** | direct |
| interruption while AI speaks | transport | direct |
| end of user speech cut off | capture | direct |
| recovery after network drop | session | direct |
| background app continuation | session | direct |
| cloned voice robotic after resume | synthesis | analogous |
| audio routed to phone not car | routing | future |
| headphone disconnect | routing | future |
| incoming call interruption / resume | routing | future |
| stale / disconnected UI state | session | direct |
| conversation splitting on reconnect | **turn record** | direct |
| text/voice message duplication | **turn record** | direct |
| visible source chips | provenance | see §5.3 |

**⭐ The load-bearing observation.** Four of those rows are not transport bugs. *Replies stopping after
first turn · text↔voice switching · conversation splitting on reconnect · message duplication* are all
failures of **the record of the turn**, not of audio.

⚠️ **Stated to the exact strength of the evidence** (founder ruling 2026-09-13; the earlier wording,
*"two independent production teams hit the same class of defect"*, over-claimed by treating vendor
release notes as observation):

> **MAIA directly exhibited this defect family** — 2026-09-07, the transcript append living inside the
> TTS success branch, a stalled `maiaSpeak` erasing MAIA's words entirely. **Uare's published release
> history [D] independently documents fixes belonging to the same family.** We have not observed those
> failures or their repairs.

**[I]** From that asymmetric pair — one witnessed defect, one documented set of vendor repairs — the
inference is: *coupling the turn to the audio path is a recurring structural attractor in
conversational voice systems, not a local mistake.* That is external support for the non-degradation
gate's discipline (`docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`) and for the single
commit seam the repair introduced. It is strong enough as stated and does not need inflating.

**[I]** The remaining rows — echo, barge-in, routing, backgrounding, reconnect — are **sensory
infrastructure**, explicitly free to change under the gate. They are therefore the cleanest possible
candidates for a shared acceptance surface, because adopting them carries no doctrinal risk at all.
Drafted as a candidate instrument:
`docs/programme/UARE-01_VOICE_ACCEPTANCE_MATRIX_CANDIDATE_2026-09-13.md`.

## 7 · AI-to-AI and the authority question

Two levels of orchestration: cooperating internal agents (§2), and externally, the mobile app allows a
member to **bring another person's Individual AI into a conversation**; the platform connects to
**1,000+ tools via MCP-style integrations** [M/D].

**[I]** Adjacent to the Jarvis problem — and this is where our architecture has something they do not
appear to have described publicly. Their design makes the person's AI the agentic centre. Ours does
not:

```text
                MAIA
                  │
          canonical cognition          ← the only author
                  │
      ┌───────────┼───────────┐
      │           │           │
   memory     specialist    tools /
    field       minds       actions
      │           │
      └──── evidence ───────┘          ← specialists supply evidence, never authorship
```

**[I]** Specialist intelligences do not become alternate authors of MAIA. That convergence-and-authority
constraint is exactly what `CMT-01` (canonical MAIA turn: closed producer registry, participation
adjudication, one renderer) was built to hold.

⭐ **ASYMMETRIC FINDING — the exact claim, founder ruling 2026-09-13:**

> `CMT-01` provides named evidence that Soullab treats multi-producer authority and convergence as an
> explicit architectural problem. **No equivalent mechanism was found in the Uare public corpus
> examined.** This establishes a difference in *publicly evidenced architecture* — **not** a
> difference in actual capability.

⛔ **Not defensible and not to be written:** *"Uare doesn't solve agent authority"* · *"MAIA solves it
and Uare doesn't"* · *"this is a Soullab competitive advantage."* The inspection asymmetry is total —
we can read our own repository, tests, registry, adjudication and standing; we can read only what they
chose to publish. **Absence from their marketing is not absence from their system.**

⛔ **And CMT-01 M3 is NOT opened by this finding.** Advancing internal architecture in order to earn a
competitive comparison would be §0's failure in its most subtle form: *competitor observation →
desire for a differentiator → internal work accelerated.* CMT-01 advances when MAIA's own programme
evidence and a founder act require it. If M3 later reaches its standing, this comparison may be
revisited then — never the other way round.

## 8 · The practitioner economy — and one substantive privacy divergence

Professional plan **$199.99/month**; professionals may charge subscribers **$5–$100/month** for access
to their Individual AI; **Uare retains 30% of gross subscription revenue**, with payment processing
coming out of the professional's remainder [D, subscription terms].

**[I]** Effectively Patreon + Substack + personal AI + voice clone + knowledge graph + agentic
workspace. Commercially strong, and it validates the economic premise behind Practitioner Studio: *a
practitioner's accumulated intelligence has value between human sessions.*

**⭐ The divergence that matters.** Their subscription terms state that when someone interacts with a
Professional's Individual AI, **the Professional can view those conversations and the information
shared in them** [D].

**[I]** For coaching, reflection or depth work this changes the relational field completely. A member
may believe they are *privately exploring something with an intelligence*, when structurally they are
*talking to their coach's AI, which their coach can later read.*

⚠️ **Converted from requirement to question, founder ruling 2026-09-13.** The earlier wording here
("our position **must** be structural, not policy-level") authored a specification. Under charter §4
this lane has no such standing — it raises questions; the owning lane adjudicates them. The handoff is:

> **Question for Practitioner Studio.** Is member-private material structurally distinct from
> explicitly practitioner-shared material, such that no policy or configuration mistake can collapse
> the two? Practitioner Studio determines whether that property already exists in canon and schema,
> needs adjudication, or is the wrong frame entirely.

**[I]** And under the reciprocity test (charter §9) it is not a contrast we may assert publicly until
our own boundary is evidenced.

## 9 · Writer's Studio

They explicitly target writers: the system learns writing voice and accumulated judgment, generates
articles and media with persistent context, and exposes material to subscribers [M/D].

**[I]** The goals are opposite, and the opposition is the product thesis:

- **Uare:** make the AI increasingly capable of writing **as** me. → a *synthetic author*.
- **Writer's Studio:** make the intelligence increasingly capable of understanding my work while
  preserving my authorship. → an *intelligent studio*.

**[I]** That reframes the provenance architecture (`EvidenceRef`, frozen `readState`, digest-verified
recovery, `locateCurrent` never fuzzy) from technically-correct to **strategically load-bearing**.
Authorship you can prove is the whole difference between the two products.

## 10 · The ownership claim — read carefully

Their privacy material is genuinely stronger than most SaaS: per-user models and embeddings, no use of
private user material to train shared or foundation models, deletion controls, export claims [D].

But their terms reserve the underlying software, architecture and technology as Uare's property, and
the export clause describes exporting **memories, context, transcripts and other AI-related data** [D].
No contractual promise of portable model weights or independently runnable infrastructure was found.

**[I]** So *"you own your Individual AI"* [M] is best read as **strong control and ownership rights over
your data and generated identity asset inside their infrastructure** — not demonstrated possession of
an independently runnable model.

**[I]** Similarly, *"trained only on you"* versus *"an average of everyone"* [M] is effective
positioning that their own technical and legal material complicates: service providers, embeddings,
retrieval and underlying platform models all appear. An Individual AI does not derive language and
reasoning from one life.

**⛔ Reciprocity test applies to both (charter §9).** The defensible Soullab formulation is
architectural rather than comparative: **a general model may be used without the general model
becoming the authority on the person.** Self-hosting is a real difference; *demonstrated member
portability* is a claim we have not yet earned either, and it stays out of any outward sentence until
evidenced under `CLAIM_STATE_AUTHORITY`.

## 11 · Conclusion of the first pass

**[I]** Uare belongs on the short list of companies watched continuously. It is close enough to
confirm that the substrate question — a structured, persistent model of a person beneath conversation
— is a real emerging category, and different enough to sharpen what MAIA is by contrast.

**The recommendation is not to pivot toward Uare in any respect.** The transferable material is:
visible model formation (without the metric) · elicitation as encounter · provenance chips · the
mobile voice acceptance surface · and an economic validation of the practitioner premise.

The preserved differences are: relational rather than replicative intelligence · sovereignty beyond
SaaS control · member-private memory · provenance · non-impersonation · developmental rather than
descriptive understanding · psyche / soma / relationship / meaning rather than identity-as-profile.

> **[I]** *Their strongest claim is that it is always you. Ours is that it is never you — and that
> this is the point.*

---

## Appendix A — public sources consulted (2026-09-13)

⚠️ Re-tagged per §0: Uare-authored release notes are **[D]**; App Store user reviews and press are
**[E]**; nothing here is **[O]**.

Vendor material [D]: uare.ai platform & pricing · blog (*The Creation of U*, *AI Clone vs Chatbot*, *Best
AI Tool for Writers*, seed announcement) · privacy policy · terms of service · subscription, credits &
creator monetization terms · featurebase support articles (*The Human Life Model*) · **App Store
release notes and version history** (Uare-authored). Third-party [E]: App Store user reviews ·
TechCrunch coverage of the Eternos → Uare pivot and $10.3M raise.

**Not consulted / not obtainable in this pass:** the running product · Instagram grid (throttled) ·
any non-public technical material.
