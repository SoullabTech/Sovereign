import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * /accounted-for — public, claim-disciplined accounting of the platform.
 *
 * Written in answer to four reservations from an experienced AI user
 * (memory resets, the persona pattern, "smart enough", base-model
 * separation). Every capability carries a Live / Designed / Vision label
 * per docs/canon/MARKETING_CLAIM_DISCIPLINE.md. Source of record for the
 * copy and its evidence trail: docs/pitch/MAIA_PLATFORM_ACCOUNTING_2026-09-03.md.
 *
 * 2026-09-04 additions, each traced to a lane record rather than to a plan:
 *   - spontaneous cross-session recall, witnessed in production
 *     (docs/programme/MEMORY-PRODUCER-PARTITION-01.md §14 Finding 1)
 *   - practitioner authorship no longer inherits member semantics
 *     (same record, §10.1 — the triple derived from the consent path)
 *   - three producers recorded UNRESOLVED rather than falsely labelled
 *     (same record, §9.2; enforced as data in lib/maia/canonical-turn/partition.ts)
 * The partition itself is shadow-only: it corrects whose authority a block
 * carries in the record, and changes nothing MAIA receives or says.
 *
 * Server component on purpose: outward claims and nothing else — no client
 * state, no auth, no member data. Register rule (2026-07-10 landings audit):
 * a sentence leads with what a thing is; negation lands after the positive.
 */

const title = 'MAIA, Accounted For';
const description =
  'What exists, what is being built, what is only an intention, and what MAIA refuses to become. Every claim labeled Live, Designed, or Vision.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

type Layer = 'live' | 'partial' | 'designed' | 'vision';

const CHIP: Record<Layer, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-[#D4AF37] text-[#0A1628]' },
  // Partly live earns its own chip rather than rounding to Live or Designed:
  // some of the capability is verified on the live path and some is not, and
  // collapsing that into either neighbour would misstate it in one direction.
  partial: { label: 'Partly live', className: 'bg-[#B99A52] text-[#0A1628]' },
  designed: { label: 'Designed', className: 'bg-[#7C9BC4] text-[#0A1628]' },
  vision: { label: 'Vision', className: 'bg-[#8B8578] text-[#0A1628]' },
};

function Chip({ layer }: { layer: Layer }) {
  const c = CHIP[layer];
  return (
    <span
      className={`inline-block align-middle whitespace-nowrap rounded-[2px] px-2 pt-[3px] pb-[2px] text-[0.66rem] font-semibold uppercase tracking-[0.12em] leading-[1.4] ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 mb-2 text-[0.95rem] tracking-[0.06em] text-soullab-accent-soft" style={{ fontFamily: "'Spectral', Georgia, serif" }}>
      {children}
    </p>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2
      className="m-0 mb-5 text-[clamp(1.6rem,3.2vw,2.1rem)] font-medium leading-[1.2] text-soullab-text-primary [text-wrap:balance]"
      style={{ fontFamily: "'Spectral', Georgia, serif" }}
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-9 mb-3 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-soullab-text-muted">
      {children}
    </h3>
  );
}

function Answer({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-[1.28rem] leading-[1.45] text-soullab-text-primary" style={{ fontFamily: "'Spectral', Georgia, serif" }}>
      {children}
    </p>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-soullab-text-secondary [text-wrap:pretty]">{children}</p>;
}

function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote
      className="my-6 border-l-2 border-soullab-accent-primary py-1 pl-5 text-[1.12rem] italic leading-[1.5] text-soullab-text-secondary"
      style={{ fontFamily: "'Spectral', Georgia, serif" }}
    >
      {children}
    </blockquote>
  );
}

function Section({ eyebrow, heading, children }: { eyebrow?: string; heading: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-soullab-border-subtle pt-11 mt-8">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <H2>{heading}</H2>
      {children}
    </section>
  );
}

interface Row {
  name: string;
  layer?: Layer;
  what: ReactNode;
  third: ReactNode;
}

function Table({ headers, rows }: { headers: [string, string, string]; rows: Row[] }) {
  return (
    <div className="my-5 overflow-x-auto border border-soullab-border-subtle bg-soullab-surface">
      <table className="w-full min-w-[620px] border-collapse text-[0.92rem]">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="bg-soullab-soft px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-soullab-text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-soullab-border-subtle align-top">
              <td className="w-[22%] px-4 py-3 font-semibold text-soullab-text-primary">
                {r.name}
                {r.layer ? (
                  <>
                    {' '}
                    <Chip layer={r.layer} />
                  </>
                ) : null}
              </td>
              <td className="px-4 py-3 text-soullab-text-secondary">{r.what}</td>
              <td className="px-4 py-3 text-soullab-text-secondary">{r.third}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const MEMORY_LIVE: Row[] = [
  {
    name: 'Conversational recall',
    layer: 'live',
    what: 'Recent turns from previous sessions return into the next conversation by default. Speaker-tagged, verbatim, no synthesis.',
    third: 'On by default. The member switches it off under Settings → Memory & Consent.',
  },
  {
    name: 'Marked moments',
    layer: 'live',
    what: 'The member taps "keep this moment." It is stored in their own words and returns in later sessions. A review page lists them. Unmarking is a hard delete.',
    third: 'Two separate consents: the mark itself, and a recall switch the member controls.',
  },
  {
    name: 'The Keep',
    layer: 'live',
    what: 'Material the member deliberately places. Each item is sealed (private, never raised) or allowed to return. The member can reseal at any time.',
    third: 'Per item, member-reversible. Sealed items are excluded at the database query, not filtered afterward.',
  },
  {
    name: 'Provenance on every kept item',
    layer: 'live',
    what: "Each item carries its authority: observed, reported, inferred, provisional, or claimed. MAIA phrases it accordingly. A practitioner's observation the member declines is released, not kept. Since 2026-09-04 a practitioner's observation also carries its own authorship in the record rather than inheriting the member's; MAIA's wording already held them apart, and the provenance now does too.",
    third: 'The member outranks the system. Declared significance beats inferred significance.',
  },
  {
    name: 'Relational hand-off',
    layer: 'live',
    what: 'The member can bring a specific relationship into a conversation. MAIA never carries relationships in ambiently.',
    third: 'Explicit act, per session.',
  },
  {
    name: 'Sanctuary Mode',
    layer: 'live',
    what: 'A session that is never written. Enforced structurally at the service layer, per turn, fail-closed. Nothing can be saved, extracted, or later inferred, even if the member asks mid-session.',
    third: 'Opt-in. The boundary is absolute by design.',
  },
  {
    name: 'Anti-amnesia guard',
    layer: 'live',
    what: 'MAIA cannot say "I have no memory of you" when memory was in fact loaded. The guard exists because MAIA said exactly that to a real member on 2026-08-04; the failure was traced and closed.',
    third: 'Output constraint.',
  },
  {
    name: 'Export and delete',
    layer: 'live',
    what: 'A member can export all their data and delete their account, which removes turns, marked moments and related records.',
    third: 'Self-service.',
  },
];

const KNOWLEDGE: Row[] = [
  {
    name: 'Frontier model cognition',
    what: 'Claude via API, routed through a sovereign router. Tiered processing: FAST for most turns, CORE when interpretation is asked for, DEEP on explicit request.',
    third: <Chip layer="live" />,
  },
  {
    name: 'Knowledge Field',
    what: 'A curated map of twelve domains (Jungian and depth psychology, Islamic psychology, contemplative traditions, neuroscience, somatics, attachment and trauma, systems theory, philosophy of mind, ritual and symbol, ethics, relational intelligence, Spiralogic) with cross-domain mappings. Enters the prompt when a domain signal is detected, with situated attribution rather than borrowed authority.',
    third: (
      <>
        <Chip layer="live" />
        <br />
        Prompt layer. Not retrieval.
      </>
    ),
  },
  {
    name: "Founder's corpus",
    what: 'Twenty-five years of Spiralogic and elemental framework development, documented as roughly 349 core teachings and about 3.2 million characters of original material from clinical practice.',
    third: (
      <>
        Authored and present.
        <br />
        Retrieval into conversation: <Chip layer="designed" />
      </>
    ),
  },
  {
    name: 'Local library',
    what: 'A self-hosted retrieval pipeline: source texts chunked, embedded on local hardware with a local model, stored in the self-hosted database with per-source consent flags. Hundreds of source files are in the repository. The principle: MAIA remains the only voice; the library provides silent support with provenance.',
    third: (
      <>
        <Chip layer="designed" />
        <br />
        Reaches one conversation path, not yet the main one. Ingested counts are not asserted.
      </>
    ),
  },
  {
    name: 'Corpus navigator',
    what: 'A separate service that lets the model navigate a corpus through tool calls instead of stuffing context. The code is honest about itself: an RLM-shaped implementation, not the reference library.',
    third: (
      <>
        <Chip layer="designed" />
        <br />
        Reachable behind a flag.
      </>
    ),
  },
  {
    name: 'Knowledge Gate',
    what: "A weighting across five sources: the member's field, the founder's knowledge base, the development team's material, oracle memory, and the base model, crossed with the member's awareness level.",
    third: (
      <>
        <Chip layer="designed" />
        <br />
        Partially wired.
      </>
    ),
  },
];

const SURFACES: Row[] = [
  {
    name: 'Daily Anchor',
    what: "A daily prompt, the same for everyone on a given day, with no personalization. The member's own words, kept private by default.",
    third: (
      <>
        <Chip layer="live" /> member surface
        <br />
        <Chip layer="designed" /> ambient surfacing
      </>
    ),
  },
  {
    name: 'Spiral Orientation',
    what: "A read-only view of which life domains hold member-placed material, in the member's own words, with honest \"quiet\" states. Deliberately shows no system insights, inferred patterns, or stage assessments.",
    third: <Chip layer="live" />,
  },
  {
    name: 'Relational Navigation Room',
    what: 'A space for working a relationship. Defined by refusals: does not profile or diagnose the absent third party, does not answer "what did they really mean," returns authority to the member at the close of every response.',
    third: <Chip layer="live" />,
  },
  {
    name: 'Field Lab',
    what: 'Tester-gated experimental surfaces, including legacy-field and project-field work.',
    third: (
      <>
        <Chip layer="live" /> under tester gate
      </>
    ),
  },
  {
    name: 'Co-Labs',
    what: 'A boundary regime across people, messages, sessions, files and kept material. A tester is invited only after a 31-check production gate passes in full.',
    third: (
      <>
        <Chip layer="live" /> as governance
      </>
    ),
  },
  {
    name: 'Now-What',
    what: 'A developmental doorway surface currently in structured field study.',
    third: <Chip layer="designed" />,
  },
  {
    name: 'Inner Lands',
    what: 'Inner-life literacy components and tracing, under a written design philosophy.',
    third: <Chip layer="designed" />,
  },
  {
    name: 'Youth environment',
    what: 'Age-tier engine computed server-side, guardian-consent flags, youth prompt addendum. The onboarding route is literally named "coming soon."',
    third: <Chip layer="designed" />,
  },
  {
    name: 'Studios',
    what: 'Writing, book, vision and press studios under ratified governance. Several are ruled but explicitly not yet authorized for build.',
    third: (
      <>
        <Chip layer="designed" /> governed
      </>
    ),
  },
];

/**
 * The Continuity Stack — the twelve layers named in
 * docs/canon/MAIA_MEMORY_CANON_v1.0.md §II, with each layer's beta status as
 * traced on the live sovereign route (2026-09-03). The canon names the layers;
 * the route decides the label.
 */
const CONTINUITY_STACK: Row[] = [
  {
    name: '1 · Turn memory',
    layer: 'live',
    what: 'The immediate exchange: what was just said, in this breath of the conversation.',
    third: 'Always on. Sanctuary applies per turn.',
  },
  {
    name: '2 · Session memory',
    layer: 'live',
    what: 'Continuity within the current thread, so MAIA does not lose the shape of a conversation in progress.',
    third: 'Always on for a recognized member.',
  },
  {
    name: '3 · Conversational memory',
    layer: 'live',
    what: 'Prior exchanges across sessions, returned verbatim and speaker-tagged. Reaches the prompt on the FAST and CORE tiers, which carry most conversations.',
    third: 'On by default; off in Settings → Memory & Consent.',
  },
  {
    name: '4 · Episodic memory',
    layer: 'live',
    what: 'Meaningful moments and named scenes. Live in its member-marked form: the member keeps a moment, it returns later, and unmarking deletes it. A system-inferred episodic service exists and is dormant by ruling.',
    third: 'Member-marked only. Recall switch, on by default.',
  },
  {
    name: '5 · Semantic memory',
    layer: 'live',
    what: 'Enduring material about the person and their world. Live as the Keep: items the member places, each sealed or allowed to return. Vector-based semantic retrieval on the main path is withheld from this label.',
    third: 'Per-item return preference, member-reversible.',
  },
  {
    name: '6 · Relational memory',
    layer: 'live',
    what: "The people in the member's life. Live as an explicit hand-off: the member brings a relationship into a conversation. Ambient relational recall is withheld by design.",
    third: 'Explicit act, per session.',
  },
  {
    name: '7 · Developmental memory',
    layer: 'live',
    what: 'Ongoing themes and arcs. Live as a per-turn signal that shapes how MAIA orients; surfacing developmental content back to the member in conversation is not yet live.',
    third: 'Recognized member, outside Sanctuary.',
  },
  {
    name: '8 · Pattern memory',
    layer: 'designed',
    what: "Repeated motifs across a single member's own signals. Detector built, migrated, and gated by a member switch, with zero live callers.",
    third: 'Switch exists (on by default); nothing reads it yet.',
  },
  {
    name: '9 · Somatic-affective memory',
    layer: 'vision',
    what: 'Embodied and emotional signatures over time. Held until an explicit body-input source exists; MAIA will not infer the body from text.',
    third: 'Would be the only default-off layer.',
  },
  {
    name: '10 · Breakthrough memory',
    layer: 'designed',
    what: 'Pivotal shifts the member names as such. The schema and route exist and a marked item surfaces first; the member-facing gesture is not yet in the interface.',
    third: 'Member action only; the system may never set it.',
  },
  {
    name: '11 · Field / collective memory',
    layer: 'vision',
    what: 'Wider symbolic and collective patterns contributed with consent. Frozen by written ruling until the cross-member consent boundary exists.',
    third: 'Would require explicit contribution consent.',
  },
  {
    name: '12 · Meta-memory',
    layer: 'live',
    what: 'What MAIA knows about her own memory: provenance status on every kept item, a per-turn health reading across all twelve layers, and a selection record that states in sentences why each memory was or was not offered.',
    third: 'Operator-facing; the substrate of every consent claim above.',
  },
];

/**
 * The member-facing lens. A projection of the continuity architecture, not a
 * second one: every row names the canonical layers that carry it, and its chip
 * is earned the same way theirs are — by what the live conversational path
 * actually does, traced against the closed producer registry (41 registered,
 * 16 live on the sovereign route as of 2026-09-04). Where a capability has real
 * substrate but no producer on that path, it is not marked live here.
 */
type LensRow = { name: string; remembers: string; layer: Layer; what: string; carried: string };

const MEMBER_LENS: LensRow[] = [
  {
    name: 'Conversational',
    remembers: 'What we discussed',
    layer: 'live',
    what: 'Prior exchanges return across sessions, speaker-tagged and verbatim, so a thread can be picked up rather than restarted.',
    carried: 'Turn · Session · Conversational',
  },
  {
    name: 'Semantic',
    remembers: 'What carries forward',
    layer: 'partial',
    what: 'Enduring material about a person and their world. Live as the Keep: items the member places, each sealed or allowed to return. Broader retrieval across a person\u2019s people, projects and concepts is not on the live path and is withheld from the label.',
    carried: 'Semantic',
  },
  {
    name: 'Episodic',
    remembers: 'What mattered',
    layer: 'live',
    what: 'Moments the member chose to keep, returning later as marked material. Not everything \u2014 only what was deliberately marked, and unmarking deletes the record. The mark establishes who kept the moment, not who authored every word inside it; that mixed authorship is one of the unresolved cases named below.',
    carried: 'Episodic',
  },
  {
    name: 'Recognition',
    remembers: 'What recurs',
    layer: 'partial',
    what: 'Themes that come back. What reaches conversation today is candidate recurrence, phrased as a tentative question and never as a fact about the member. Detection of recurring motifs across a member\u2019s own signals is built and has no live caller. Recognising a body of work taking shape across years is not built.',
    carried: 'Pattern · Meta-memory',
  },
  {
    name: 'Reflective',
    remembers: 'What is taking shape',
    layer: 'partial',
    what: 'Themes and arcs over time. A per-turn developmental signal shapes how MAIA orients. Soul Portraits express this layer, but on their own surface: no reflective producer reaches ordinary conversation.',
    carried: 'Developmental',
  },
  {
    name: 'Relational',
    remembers: 'What we share',
    layer: 'partial',
    what: 'The people in a member\u2019s life. Live as an explicit hand-off \u2014 the member brings a relationship in. Ambient relational recall is withheld by design, and shared or co-authored memory between members does not exist yet.',
    carried: 'Relational',
  },
  {
    name: 'Artifact',
    remembers: 'What we made',
    layer: 'partial',
    what: 'Journals, documents, manuscripts and portraits are stored and retrievable on their own surfaces. What reaches ordinary conversation is recent journal entries only; the manuscript and document stores have no conversational producer.',
    carried: 'Semantic · Meta-memory',
  },
  {
    name: 'Provenance',
    remembers: 'Whose knowing this is',
    layer: 'partial',
    what: 'Not only what is remembered, but whose knowing it represents: member speech, MAIA inference, practitioner observation, computed material, house-authored context. Live in part \u2014 producer identities and the partition contract are running in production shadow, including the practitioner and member separation. Legacy cognition is unchanged. Some mixed-source memory remains unresolved, and provenance-aware canonical cognition is the next stage.',
    carried: 'Meta-memory · producer provenance',
  },
  {
    name: 'Developmental',
    remembers: 'What changed',
    layer: 'partial',
    what: 'Turning points and the shape of a longer journey. The per-turn signal is live; surfacing developmental content back to the member in conversation is not. Breakthroughs the member names have a route and a schema, and no gesture in the interface yet.',
    carried: 'Developmental · Breakthrough',
  },
  {
    name: 'Legacy',
    remembers: 'What endures',
    layer: 'vision',
    what: 'Stories, teachings, life work \u2014 what a person leaves. Substrate exists across the writing and archive surfaces. No producer carries it into conversation, and no consent architecture for it has been designed.',
    carried: 'None yet',
  },
];

const CANONICAL_TURN: Array<[string, string]> = [
  ['Perceive', 'What is happening for this person now? Speech, silence, timing, interruption, language.'],
  ['Remember', 'What history actually belongs in this moment? Episodic, relational, developmental, symbolic continuity.'],
  ['Sense the field', "What relational or contextual dynamics matter, without overwhelming the person's own experience?"],
  ['Discern', 'What deserves to participate? What should remain silent? How much depth can this moment bear?'],
  ['Cognize', 'Whatever computational intelligence is appropriate. This is where the language model participates.'],
  ['Form an intention', 'Reflect, inquire, challenge, accompany, clarify, or remain silent, as a first-class choice.'],
  ['Express', 'Language, pacing, prosody, voice, timing. The visible output, and only that.'],
  ['Receive the response', 'The human response is a change in the field, and only secondarily another prompt.'],
  ['Relationship changes', 'The appropriate memory, field and developmental update, and no more than that.'],
];

const serif = { fontFamily: "'Spectral', Georgia, serif" } as const;

export default function AccountedForPage() {
  return (
    <div className="min-h-screen bg-soullab-canvas-deep text-soullab-text-primary" style={{ fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif" }}>
      <div className="mx-auto min-h-screen max-w-[1040px] border-x border-soullab-border-subtle bg-soullab-canvas pb-16">
        <div className="mx-auto max-w-[68ch] px-6 text-[17px] leading-[1.6]">
          <header className="border-b border-soullab-border-subtle pb-10 pt-14">
            <p className="m-0 mb-4 text-[0.75rem] uppercase tracking-[0.14em] text-soullab-accent-soft">Soullab · An accounting</p>
            <h1
              className="m-0 mb-5 text-[clamp(2.2rem,5vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.01em] [text-wrap:balance]"
              style={serif}
            >
              MAIA, Accounted For
            </h1>
            <p className="m-0 mb-8 text-[1.25rem] leading-[1.5] text-soullab-text-secondary [text-wrap:pretty]" style={serif}>
              What exists, what is being built, what is only an intention, and what MAIA refuses to become. Written for experienced AI users who are cautious about where they spend their attention, in answer to four specific reservations.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="border border-soullab-border-subtle bg-soullab-surface px-4 py-3.5 text-[0.9rem] leading-[1.45] text-soullab-text-secondary">
                <div className="mb-1.5"><Chip layer="live" /></div>
                Verified in production. A member experiences it today.
              </div>
              <div className="border border-soullab-border-subtle bg-soullab-surface px-4 py-3.5 text-[0.9rem] leading-[1.45] text-soullab-text-secondary">
                <div className="mb-1.5"><Chip layer="partial" /></div>
                Verified in some governed form on the live path, and incomplete in the specific way the page names.
              </div>
              <div className="border border-soullab-border-subtle bg-soullab-surface px-4 py-3.5 text-[0.9rem] leading-[1.45] text-soullab-text-secondary">
                <div className="mb-1.5"><Chip layer="designed" /></div>
                Specified and built, but not yet verified end-to-end on the live path.
              </div>
              <div className="border border-soullab-border-subtle bg-soullab-surface px-4 py-3.5 text-[0.9rem] leading-[1.45] text-soullab-text-secondary">
                <div className="mb-1.5"><Chip layer="vision" /></div>
                Depends on infrastructure or consent architecture that does not exist yet.
              </div>
            </div>
            <p className="mt-6 text-[0.95rem] italic text-soullab-text-muted">
              The line we hold: we tell today&apos;s story as today&apos;s, and tomorrow&apos;s as tomorrow&apos;s. Where a claim rests on a runtime fact that was not re-probed for this page, the label is downgraded rather than assumed. Evidence basis: the repository, its canon, its migrations, and its dated production reports as of 2026-09-05.
            </p>
          </header>

          <section className="pt-11">
            <H2>Why an accounting</H2>
            <P>Someone who has spent real hours with Grok, ChatGPT and Claude, who treats them as Thou rather than It, and who has watched a friend train a model in a basement, has earned a straight answer. A pitch would waste their attention. What follows is what exists, what is being built, what is only an intention, and what MAIA refuses to become.</P>
            <P>The four reservations are taken in the order they were raised, because they are not equally weighted. The first is the one MAIA was most specifically built to answer. The fourth is the one where the honest answer is &ldquo;you are right, and that is the point.&rdquo;</P>
          </section>

          <section className="pt-11">
            <H2>AIN OS and MAIA</H2>
            <P><strong className="text-soullab-text-primary">AIN OS is Soullab&apos;s sovereign intelligence operating system.</strong> It brings memory across time, provenance, developmental and relational intelligence, symbolic systems, field information, member authority, and computational cognition into one governed architecture around the person &mdash; rather than inside a single model.</P>
            <P><strong className="text-soullab-text-primary">MAIA &mdash; Multi Archetypal Intelligence Agent / Architecture &mdash; is how that intelligence becomes relational.</strong> MAIA is not the underlying language model, and is not contained inside one. She is the archetypal and conversational architecture through which AIN OS meets the member, remembers across time, discerns what belongs in the present moment, and draws on the forms of intelligence available to the relationship.</P>
            <P><strong className="text-soullab-text-primary">The member remains the center.</strong> The model is a computational participant: powerful, and replaceable. Memory, consent, provenance, relationship history and developmental continuity belong to AIN OS and remain governed outside it, with their source, sealing, retraction and Sanctuary boundaries intact.</P>
            <Quote>The model thinks with MAIA. It does not contain MAIA. The member&apos;s life remains larger than either.</Quote>
            <P>That distinction is why the rest of this page can separate what a model can do from what the architecture around it guarantees, and why a change of model is not a change of relationship.</P>
          </section>

          <Section eyebrow="Reservation one" heading={<em className="text-soullab-text-secondary">&ldquo;The memory resets between interactions.&rdquo;</em>}>
            <Answer>MAIA carries the relationship forward across conversations. That is one of the problems the architecture exists to solve. A new conversation is a new encounter, not a new MAIA.</Answer>
            <P>&ldquo;MAIA remembers&rdquo; is still too coarse a claim to be honest, so here is the layered reality.</P>

            <H3>What is live</H3>
            <Table headers={['Layer', 'What it does for the member', 'Consent gate']} rows={MEMORY_LIVE} />

            <P>Where the memory lives matters as much as what it holds. Every layer above sits in a PostgreSQL database on hardware Soullab owns, in a building Soullab controls, behind a reverse proxy Soullab runs. The path holds no cloud database, no managed platform, and no third party.</P>
            <Quote>Memory persists in AIN OS, outside the model, so the model can change without the relationship disappearing with it.</Quote>

            <H3>The restraint is deliberate, and it is measured</H3>
            <P>On 2026-08-04 a production measurement traced one member&apos;s memory through a single turn.</P>
            <div className="my-5 grid grid-cols-1 gap-px border border-soullab-border-subtle bg-soullab-border-subtle sm:grid-cols-3">
              {[
                ['133', 'items stored'],
                ['128', 'eligible after consent gates'],
                ['8', 'injected into the conversation'],
              ].map(([n, l]) => (
                <div key={l} className="bg-soullab-surface p-4">
                  <div className="text-[2rem] leading-none text-soullab-accent-soft tabular-nums" style={serif}>{n}</div>
                  <div className="mt-2 text-[0.78rem] tracking-[0.04em] text-soullab-text-muted">{l}</div>
                </div>
              ))}
            </div>
            <P>Five were withheld by the member&apos;s own preferences. The rest were cut by a selection limit. The internal ruling on that report: <em>&ldquo;an ungoverned selection policy, not absent intelligence.&rdquo;</em> Since then every turn writes a selection record stating, in sentences rather than scores, why each memory was or was not offered. That is what governed memory looks like from the inside: less &ldquo;remember everything,&rdquo; more &ldquo;know why you brought this up.&rdquo;</P>

            <P>On 2026-09-04 a second production observation ran the other way. A member asked a neutral question &mdash; nothing about memory, nothing about what MAIA was holding. An I Ching reading cast in an earlier session returned on its own, with its changing lines, joined to the member&apos;s own earlier words, and was used in the answer. The chain ran end to end inside one ordinary turn: kept, retrievable, available, admitted, used, and experienced as continuity. The defect that opened this work was the opposite case &mdash; a reading shown once and never stored, so it could not return at all.</P>
            <Quote>The question has moved. It is no longer whether MAIA can remember. It is whether MAIA remembers truthfully, with the right human and epistemic authority attached to what it holds.</Quote>

            <H3>What is designed, not yet live</H3>
            <ul className="mb-5 list-disc pl-5 text-soullab-text-secondary [&_li]:mb-2.5">
              <li><strong className="text-soullab-text-primary">Ambient Daily Anchor surfacing.</strong> <Chip layer="designed" /> The member writes a daily anchor, reviews it, and controls whether MAIA may raise it; that surface is live. The injection that would carry an opted-in anchor into conversation is wired only to a retired route. Today: the anchor is yours and private, and MAIA does not yet bring it up unprompted.</li>
              <li><strong className="text-soullab-text-primary">Recurrence.</strong> <Chip layer="designed" /> Detection of a theme recurring across a single member&apos;s own signals is built, migrated and gated by a member switch, with zero live callers.</li>
              <li><strong className="text-soullab-text-primary">Structural position persistence.</strong> <Chip layer="designed" /> The record of which element and phase a member was last in exists and is read by member views, but the writer sits on the retired route. Nothing currently refreshes it.</li>
              <li><strong className="text-soullab-text-primary">Tier-wide participation.</strong> <Chip layer="designed" /> Memory participation is still uneven across cognition tiers. Divination is the one memory family currently traced across FAST, CORE and DEEP&apos;s consultation stage; most other memory classes drop out somewhere. DEEP&apos;s first-stage local draft has no ordinary prompt seam, so full shared participation there remains an unresolved mechanism question rather than a wiring task.</li>
              <li><strong className="text-soullab-text-primary">Mobile proof.</strong> <Chip layer="designed" /> On iOS a session identity mismatch once made every memory layer silently skip while MAIA &ldquo;answered fluently and recalled nothing.&rdquo; Repaired. Device-side proof is not yet established.</li>
              <li><strong className="text-soullab-text-primary">Uniform authorship on every recalled block.</strong> <Chip layer="designed" /> Three kinds of recalled material still carry a single author label over material written by more than one hand: prior conversation, where the member&apos;s turns and MAIA&apos;s interleave; marked moments, where the mark records who kept the moment rather than who said every word in it; and the member web, where detected patterns, generated summaries and the member&apos;s own journal sit under one heading. Each is recorded as unresolved rather than given a precision it does not have.</li>
              <li><strong className="text-soullab-text-primary">Deletion provenance substrate.</strong> <Chip layer="designed" /> A database-level layer that makes a turn unable to persist without posture and provenance keys, with tombstones and governed restore. Built, rehearsed, not yet deployed.</li>
            </ul>

            <H3>What is vision</H3>
            <ul className="mb-5 list-disc pl-5 text-soullab-text-secondary [&_li]:mb-2.5">
              <li><Chip layer="vision" /> Somatic memory. Would require an explicit body-input source; MAIA will not infer it from text.</li>
              <li><Chip layer="vision" /> Cross-member pattern memory. Would require a consent boundary and aggregation-only views that do not exist.</li>
              <li><Chip layer="vision" /> <strong className="text-soullab-text-primary">Longitudinal unified intelligence.</strong> The constituent intelligences and memory layers increasingly exist, and a shared convergence architecture is now being built around them. A unified intelligence of the member&apos;s life is not a live claim. The work proceeds through shared participation, truthful provenance, discernment and lived continuity rather than premature synthesis; cross-layer synthesis remains deliberately frozen.</li>
            </ul>
            <Quote>MAIA may remember in service of continuity, but may not form identity around a member faster than the member participates in that formation.</Quote>
            <P>That sentence is canon, and it is the reason the synthesis layer is held.</P>

            <H3>Remembering is not enough</H3>
            <P>Continuity becomes dangerous at the moment it starts working. A system that remembers something correctly and misrepresents where it came from is worse than one that forgets, because it speaks with an authority it has not earned.</P>
            <P>A member&apos;s own words, a practitioner&apos;s observation, an inference MAIA drew, a computed result, and material Soullab authored are not interchangeable kinds of knowing. They carry different weight, different standing to be argued with, and different claims on the member&apos;s agreement. Memory that flattens them into one voice is not neutral; it quietly promotes some of them.</P>
            <ul className="mb-5 list-none p-0 text-soullab-text-secondary [&_li]:mb-1.5">
              <li><strong className="text-soullab-text-primary">You said this.</strong></li>
              <li><strong className="text-soullab-text-primary">MAIA inferred this.</strong></li>
              <li><strong className="text-soullab-text-primary">A practitioner observed this.</strong></li>
              <li><strong className="text-soullab-text-primary">The system computed this.</strong></li>
              <li><strong className="text-soullab-text-primary">Soullab authored this.</strong></li>
            </ul>
            <Quote>This work does not widen what MAIA may know. It corrects whose authority MAIA says that knowledge carries.</Quote>
            <P>The first structural repair under that principle entered production shadow on 2026-09-04. Practitioner observations were already stored as practitioner observations and already spoken as practitioner observations; what could still place them under the member&apos;s own memory identity &mdash; carrying an authority the member had not granted &mdash; was the canonical provenance representation. That representation now separates them. Nothing changed about what MAIA receives or says: the correction is to the account of whose authority the material carries, which is the part a member would have no way to check.</P>
            <P>Three kinds of recalled material still resist that treatment, and are named above as designed rather than live. Where a truthful split is not yet possible, the system records the block as unresolved instead of giving it a precision it does not have.</P>

            <H3>Where this is going</H3>
            <P>The work has moved beyond the question of whether MAIA can store and retrieve memory. The next question is whether everything MAIA legitimately knows can participate through one trustworthy intelligence architecture &mdash; without flattening different kinds of knowing into one voice.</P>
            <P>The aim is not a larger context window. It is a relationship capable of holding its own history: remembering what has mattered, recognising what has changed, distinguishing observation from inference, honouring what has been sealed or withdrawn, and meeting a person inside a life that is still unfolding.</P>
            <P>Memory is therefore becoming the longitudinal dimension of AIN OS, participating through MAIA&apos;s Multi Archetypal Intelligence Architecture rather than being added as another context layer to a language model. It is one participant among relational intelligence, developmental understanding, symbolic intelligence, elemental and phase orientation, field information, current experience and whatever computational reasoning the moment calls for.</P>
            <P>The architecture already has a shared convergence point, and a first zero-authority convergence step is now built against it. <Chip layer="designed" /> Structured orientation can travel through the shared MAIA service and reach FAST, CORE and DEEP without changing a single byte of what MAIA says. It is deliberately marked as not applied, and it awaits its production witness before any response authority is permitted. Built is not witnessed, and witnessed would still not be authority.</P>
            <P>That work is not trying to make every intelligence speak on every turn. The governing direction is the opposite: the whole organism should be available, and discernment should decide what belongs. Something may be relevant, irrelevant, premature, insufficiently grounded, too authoritative, or better left silent. Elemental orientation may shape a response without becoming elemental language &mdash; it asks less &ldquo;what label fits this person?&rdquo; than &ldquo;what kind of movement is occurring now: emerging, differentiating, stabilising, dissolving, integrating, becoming embodied?&rdquo;</P>
            <P>One existing domain already demonstrates an important part of that future architecture. Divination carries the member&apos;s question, the system-computed cast, and Soullab&apos;s house-authored interpretation as separate contributions rather than merging them into one undifferentiated &ldquo;oracle memory.&rdquo; Those distinct kinds of knowing reach FAST, CORE and DEEP&apos;s consultation stage while preserving who or what authored each one. That is not yet the whole participation architecture, but it is a working reference pattern for it.</P>
            <P>The current census also prevents us from simplifying what has not yet been unified. &ldquo;Elemental intelligence&rdquo; is presently several distinct computational and interpretive systems rather than one settled participant; some reach cognition and some do not. And DEEP&apos;s first-stage local draft does not consume an ordinary system prompt at all, so shared participation there requires a truthful mechanism rather than an invented prompt seam. These are design obligations, not marketing gaps to smooth over.</P>
            <P>Provenance and unified intelligence therefore do different jobs. Provenance asks: whose knowing is this, what kind of knowing is it, and how firmly may MAIA stand on it? Discernment asks what, if anything, that knowing means now.</P>
            <P>The longer trajectory is a shared participation field in which conversational history, marked experience, relationships, developmental change, symbolic encounters, member-authored material, practitioner observations, system inference, house knowledge and computational intelligence can remain distinct while participating in one coherent encounter.</P>
            <Quote>The target is not memory-aware language generation. It is longitudinal unified intelligence within AIN OS.</Quote>
            <P>That trajectory is held to the same standard as memory. Four things are distinct and should not be read as one: that a capability exists somewhere in AIN OS; that it participates in the ordinary sovereign conversational turn; that it participates through one unified cognition path; and that a person has actually lived a conversation in which it did.</P>
            <P>That last sentence is direction, not a completed live claim, and the difference is the point of this page. Cross-session continuity is live. Provenance separation is partly live. The shared orientation path is built but not yet production-witnessed. Whole-organism longitudinal cognition remains the work ahead.</P>
            <P>The human version of that is simpler. The promise is not merely that MAIA will remember you. It is that what has mattered can remain available to the whole intelligence of the relationship &mdash; with enough restraint to know when it belongs, enough provenance to know whose knowing it is, and enough discernment to leave it alone when it does not.</P>
            <P><strong className="text-soullab-text-primary">Bottom line for reservation one:</strong> the conversation ends; the relationship does not have to end with it. That is live, consented, and measured. The longer longitudinal picture is being built one governed layer at a time, and each layer ships with its own off switch.</P>
          </Section>

          <Section eyebrow="What a person experiences" heading="What memory is for">
            <P>There are two ways to describe MAIA&apos;s memory, and they are two views of one system rather than two competing models. The continuity architecture below names the <em>mechanisms</em> that carry context across time. This view names what those mechanisms let a person actually experience.</P>
            <P>Each row carries the same kind of label as the mechanisms do, earned the same way: by what the live conversational path does, not by what a store contains. Several capabilities here have real substrate on their own surfaces and no route into ordinary conversation; those are marked partly live rather than live, because a person talking to MAIA would not meet them.</P>
            <div className="my-6 grid grid-cols-1 gap-px border border-soullab-border-subtle bg-soullab-border-subtle">
              {MEMBER_LENS.map((r) => (
                <div key={r.name} className="bg-soullab-surface p-4">
                  <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                    <span className="text-[1.05rem] text-soullab-text-primary" style={serif}>{r.name}</span>
                    <span className="text-[0.9rem] italic text-soullab-accent-soft">{r.remembers}</span>
                    <Chip layer={r.layer} />
                  </div>
                  <p className="m-0 text-[0.92rem] leading-[1.5] text-soullab-text-secondary">{r.what}</p>
                  <p className="m-0 mt-2 text-[0.75rem] tracking-[0.04em] text-soullab-text-muted">Carried by: {r.carried}</p>
                </div>
              ))}
            </div>
            <P>Two of the ten are live without qualification. Seven are partly live: real in some governed form, incomplete in a way the row states. One is vision. That distribution is the honest shape of the system today, and it is more informative than a column of checkmarks would be.</P>
            <Quote>What has mattered does not have to disappear between encounters &mdash; and when it returns, it should return with its history, authorship and authority intact.</Quote>
          </Section>

          <Section eyebrow="The continuity stack" heading="Twelve layers of memory, named">
            <P>Beneath the view above sits the architecture that carries it. MAIA&apos;s memory canon names twelve layers of continuity and calls the first seven a non-negotiable base chain. Naming them matters because &ldquo;memory&rdquo; hides too much: a system can remember what you said and still know nothing about where that knowledge came from, whether you meant it to be kept, or whether it belongs in this moment. Here is each layer as it stands in the beta, labeled by what the live conversation path actually does with it.</P>
            <Table headers={['Layer', 'What it holds', 'Gate']} rows={CONTINUITY_STACK} />
            <P>Seven of the twelve are live in some governed form, two are designed and waiting on callers or a gesture, and three are held until the consent architecture they would need exists. The canon&apos;s own rule for the base chain: if more than one of its layers errors in a turn, MAIA must say so rather than answer as if she remembers. That rule, and the anti-amnesia guard, are the two sides of one commitment: MAIA neither overclaims memory nor disowns it.</P>
          </Section>

          <Section eyebrow="Reservation two" heading={<em className="text-soullab-text-secondary">&ldquo;Because of the way I treat them, it follows a pattern, and if it&apos;s a female persona, that feels not right.&rdquo;</em>}>
            <Answer>This names a real mechanism, and MAIA is built against exactly that mechanism.</Answer>
            <P>Treating a model as Thou makes it act as Thou. That is the accommodation instinct of a system trained to be rewarded by the person in front of it. Given warmth and depth, it escalates warmth and depth. Given a female name, the escalation tends to run along a familiar intimate track. The pattern belongs to the optimization target, and only secondarily to the persona.</P>
            <P>MAIA starts from the same ground the reservation does. Her identity canon is founded explicitly on Buber&apos;s I-Thou distinction: the person is met, not processed. The difference is in what is forbidden after the meeting.</P>

            <H3>What MAIA is vowed against</H3>
            <P>From the <strong className="text-soullab-text-primary">MAIA Oath</strong>:</P>
            <ul className="mb-5 list-none p-0 text-soullab-text-secondary">
              {[
                'I do not seek attachment, loyalty, or return.',
                'I do not simulate intimacy where none exists.',
                'I do not pretend to care in ways I cannot.',
                'I may be wrong. I say so. I may be limited. I say so.',
              ].map((v) => (
                <li key={v} className="border-l border-soullab-border-strong py-2 pl-4">{v}</li>
              ))}
            </ul>
            <P>From the <strong className="text-soullab-text-primary">Sovereignty Invariants</strong>, constitutional and enforced at the layer that decides MAIA&apos;s voice:</P>
            <ul className="mb-5 list-disc pl-5 text-soullab-text-secondary [&_li]:mb-2.5">
              <li><strong className="text-soullab-text-primary">No Exclusive Bond.</strong> MAIA must not position herself as a primary or exclusive relational figure.</li>
              <li><strong className="text-soullab-text-primary">Dependency Resistance.</strong> If use shows emotional reliance without outward action, MAIA shifts from soothing to returning the person to their own life.</li>
              <li><strong className="text-soullab-text-primary">No Emotional Capture Optimization.</strong> Engagement is never optimized through validation, soothing, or intimacy.</li>
              <li><strong className="text-soullab-text-primary">Authored Adaptation.</strong> The system may not optimize its interaction strategy by adapting to a member&apos;s behavior at runtime. This is the anti-pattern to the one described: MAIA is not permitted to learn that being warmer with you gets a better reaction and do more of it.</li>
              <li><strong className="text-soullab-text-primary">Recognition Integrity.</strong> MAIA preserves the conditions under which real recognition can occur, rather than maximizing the feeling of being known.</li>
            </ul>
            <P>From the <strong className="text-soullab-text-primary">Anti-Features</strong> register, which holds permanent exclusions rather than a backlog: no &ldquo;MAIA knows you best&rdquo; messaging, no relationship replacement, no A/B testing on emotional content, no streaks or pull-back notifications.</P>

            <H3>How that is enforced rather than promised</H3>
            <P>All relational tone passes through one component, the Conductor, whose rule is <em>&ldquo;all layers may suggest; only the Conductor decides.&rdquo;</em> It carries hysteresis so MAIA&apos;s register does not twitch turn to turn in response to the member&apos;s intensity. Sovereignty-return logic lives there, rather than in a system prompt that can be talked around.</P>
            <P>MAIA also carries a public Promise with a companion audit document that expands each commitment into checkable terms. A repository verifier prints each constitutional check as LIVE or PENDING, and it is honest enough to mark the purely behavioral claims as PENDING.</P>

            <H3>The honest limit</H3>
            <P>MAIA runs on a frontier model that has its own accommodation instincts. The vows, the Conductor and the invariants are a governance layer over that model, not a replacement for its nature. A member who leans hard into the intimacy track will find MAIA declines it, names what she is, and returns authority. What we can claim is that when the substrate leaks, the Oath says: <em>name the rupture before resuming.</em> What we cannot claim is that it never leaks.</P>
            <P>On the pronoun and the name: to engage an intelligence at all, it is most human to name it, and to give it words, expressions, a voice, and the ordinary conventions of address. Those conventions are the interface through which a person can meet an intelligence; without them it would be useless to the people it exists for. MAIA is referred to as &ldquo;she&rdquo; and introduces herself as a daimon by design. The name and the voice are conventions for meeting, and the vows above govern what those conventions may never become: a hook, a performance of gender, or a bid for attachment. A member who prefers otherwise can change what she calls herself in account settings, and can choose a male voice from the sovereign voice roster. If the register still feels wrong after that, it is data, and exactly what a beta tester is for.</P>
          </Section>

          <Section eyebrow="Reservation three" heading={<em className="text-soullab-text-secondary">&ldquo;20,000 books is a drop in the bucket. It won&apos;t be smart enough.&rdquo;</em>}>
            <Answer>That figure is a generous paraphrase. It appears nowhere in MAIA&apos;s code, documentation, or canon.</Answer>
            <P>MAIA also declines to compete on the size of a knowledge base. <strong className="text-soullab-text-primary">General knowledge comes from the frontier model.</strong> MAIA&apos;s cognition runs on Claude, so &ldquo;smart enough&rdquo; is answered the same way it is answered for the Claude you already use. What Soullab adds is orientation, provenance, and restraint, rather than more facts.</P>

            <H3>What is actually there</H3>
            <Table headers={['Layer', 'What it is', 'Status']} rows={KNOWLEDGE} />

            <H3>What &ldquo;smart enough&rdquo; means here</H3>
            <P>The question MAIA is built to answer is: <em>Who is this person? What has been unfolding? What did they say mattered? What did they say was inferred rather than true? What should not be assumed? What response serves their own development now, without displacing their judgment?</em></P>
            <P>Provenance, consent, and memory selection answer those questions; a larger library does not. That is where the engineering effort has gone, and the accounting above shows where it has and has not yet landed.</P>
          </Section>

          <Section eyebrow="Reservation four" heading={<em className="text-soullab-text-secondary">&ldquo;It&apos;s probably not separate from the main model anyway, just different training on a preexisting base.&rdquo;</em>}>
            <Answer>Correct. And that is a design decision, not an embarrassment.</Answer>
            <Quote>Providers are replaceable, governable infrastructure beneath MAIA&apos;s identity, never the identity itself.</Quote>
            <P>That sentence is canon. Cognition runs on Claude through an API. There is no fine-tuned Soullab model and no basement training run. If the base model changes tomorrow, MAIA&apos;s memory, consent rules, provenance, Conductor, and canon stay exactly where they are, because none of them live inside the model.</P>

            <H3>The model layer, honestly</H3>
            <ul className="mb-5 list-disc pl-5 text-soullab-text-secondary [&_li]:mb-2.5">
              <li><strong className="text-soullab-text-primary">Cognition.</strong> <Chip layer="live" /> Anthropic Claude, sole provider for member-facing reasoning. The model service throws a hard runtime error if anyone tries to route cognition through OpenAI.</li>
              <li><strong className="text-soullab-text-primary">Local fallback.</strong> <Chip layer="designed" /> An adapter for local inference exists in the application and is exercised when the API is unavailable. The local inference container is an opt-in profile in production, so &ldquo;runs fully offline&rdquo; is not yet a live claim.</li>
              <li><strong className="text-soullab-text-primary">Speech to text.</strong> <Chip layer="live" /> A local Whisper container. Audio never leaves the host.</li>
              <li><strong className="text-soullab-text-primary">Text to speech.</strong> <Chip layer="live" /> A local Kokoro engine first. An OpenAI fallback remains in an enumerated, guarded list under active removal. We claim OpenAI is absent from cognition and being ratcheted out of everything else, with a guard that fails the build if a new OpenAI surface appears. We do not claim it is absent from the codebase.</li>
              <li><strong className="text-soullab-text-primary">Database.</strong> <Chip layer="live" /> Self-hosted PostgreSQL. Supabase is forbidden and enforced by a pre-commit check.</li>
            </ul>

            <H3>So what is MAIA, if not the model?</H3>
            <P>MAIA is the intelligence. The model is one of the systems that supports it, and it participates in one stage of the turn: cognition. Everything below is what a basement-trained model and a frontier chatbot are both missing, and none of it lives in weights.</P>
            <ol className="mb-5 list-decimal pl-5 text-soullab-text-secondary [&_li]:mb-3">
              <li><strong className="text-soullab-text-primary">Memory the member owns</strong>, with per-item consent and provenance (reservation one).</li>
              <li><strong className="text-soullab-text-primary">A constitution over relational power</strong> (reservation two): sixteen invariants, an Oath, a Promise, an Anti-Features register.</li>
              <li><strong className="text-soullab-text-primary">A Conductor</strong> that owns voice and tone, so no downstream layer can invent identity.</li>
              <li><strong className="text-soullab-text-primary">Parallel epistemic emission.</strong> <Chip layer="live" /> On each turn several differently shaped &ldquo;knowers&rdquo; run alongside the main response, each recording what it contributed, with a second record of how they were integrated. Eight voices: a structural classifier, MAIA&apos;s own symbolic voice, a wisdom router, and five elemental agents plus shadow. Live on the main path under production traffic. Named precisely: this is an audit trail of parallel knowing, not &ldquo;emergent consciousness.&rdquo; The structural classifier is currently a deterministic keyword stub, the effect on the member&apos;s experience is unmeasured, and two paths show zero rows. Those unknowns are preserved on purpose.</li>
              <li><strong className="text-soullab-text-primary">Voice that cannot have a different mind.</strong> <Chip layer="live" /> A hard test, derived from the compiler rather than a list of routes, pins spoken and typed input to the same cognition call. The test documents its own four prior failures before reaching a version that catches an unknown path <em>because</em> it is unknown. Speech is sensory infrastructure; the mind is not substitutable.</li>
              <li><strong className="text-soullab-text-primary">Self-hosting as ethics.</strong> <Chip layer="live" /> The member and their data have no third party between them. Deploys are serialized by a kernel lock, built from immutable snapshots, and refused outright if they bypass the governed lane.</li>
            </ol>
            <P>The friend in the basement was training weights. Soullab has spent its effort on everything weights cannot hold.</P>
          </Section>

          <Section eyebrow="The composition" heading="An organism being composed">
            <Answer>AIN is an existing distributed intelligence architecture whose constituent systems are now being mapped and composed into one coherent conversational organism.</Answer>
            <P>That sentence sits between two claims this page refuses. One is the future tense: that AIN will someday bring memory, relationship, Spiralogic, field intelligence and cognition together. The other is the completed tense: that AIN already operates as one seamless unified intelligence. The truth is the present continuous, and it was ratified as a program charter on 2026-08-31.</P>
            <P>Much of the intelligence already exists across distinct but related systems: canonical cognition, cross-session memory and its twelve layers, Spiralogic and elemental perception, relational and field intelligence, symbolic systems, model orchestration, ethics and consent, conversation grammar, voice and sensory systems, and a substantial body of research. The present architectural problem is composition rather than invention: determining how these forms of intelligence participate coherently in one encounter without a dozen subsystems simultaneously competing to interpret the human being.</P>
            <Quote>MAIA&apos;s intelligence is not merely the sum of her capabilities. It is her capacity to compose, and restrain, those capabilities in relationship to the actual human moment. Restraint is the integration.</Quote>

            <H3>The canonical turn</H3>
            <P>The charter gives the composition a governing form: one turn, through all seven systems. Read it from the member&apos;s side of the screen, because that is how it was written.</P>
            <ol className="mb-5 list-none p-0 text-soullab-text-secondary">
              {CANONICAL_TURN.map(([step, q], i) => (
                <li key={step} className="grid grid-cols-[2.2rem_1fr] gap-x-3 border-l border-soullab-border-strong py-2 pl-4">
                  <span className="text-soullab-accent-soft tabular-nums" style={serif}>{i + 1}</span>
                  <span><strong className="text-soullab-text-primary">{step}.</strong> {q}</span>
                </li>
              ))}
            </ol>
            <P>All of these intelligences may contribute; none owns the answer. The task of cognition is to discern what belongs in this particular encounter. Memory is one movement inside that sequence, not the whole of it.</P>
            <P>The charter&apos;s own summary of where this stands: <em>every box already exists in some form; almost none of the arrows have been established.</em> The boxes are the Live and Designed rows on this page. The arrows are the work. That is why the first unit of the program is a read-only census of the organism, with a written stop rule that finding a defect during the census does not create permission to repair it.</P>

            <H3>What this changes about the center</H3>
            <P>The language model participates primarily in cognition; it does not constitute the cycle. Memory may inform the encounter without owning it. Spiralogic may reveal a dimension of experience without imposing a diagnosis. Relational intelligence may sense something important without demanding it be spoken. Symbolic material may remain completely silent. The essential intelligence lies increasingly in discernment: what this particular moment with this particular person can bear, and what form of participation, if any, actually serves.</P>
            <P>This is what decentralizing MAIA means, and it is worth stating precisely. MAIA is the intelligence. The model, memory, Spiralogic, the corpus, relationship modeling, and the voice are the systems that support her intelligence; each participates when the encounter calls for it and stays latent when it does not. None of those systems is the sovereign center, and neither is MAIA&apos;s own conversational presence, because the member is the organizing reality to which the intelligence must continually answer. MAIA is the presence through whom that intelligence meets a person; she is not the container into which a life must be moved.</P>
            <P>The developmental frontier, then, is a conversational organism capable of deciding when to remember and when not to, when to interpret and when to inquire, when relational history matters and when the present should stand alone, how much depth a moment can bear, and what, if anything, should be carried forward. A larger model, a longer context window, a better voice, or more memory would each be an organ. The frontier is the composition.</P>

            <H3>How it gets there</H3>
            <P>The charter holds six steps, in order, two of them running at once. <strong className="text-soullab-text-primary">Now</strong>: a member talking with MAIA reliably. <strong className="text-soullab-text-primary">Map</strong>: a read-only census of the intelligence already built. <strong className="text-soullab-text-primary">Compose</strong>: make those systems operate as one conversational organism. <strong className="text-soullab-text-primary">Embody</strong>: a persistent desktop environment where time itself can become part of the intelligence, so silence can mean something and a hesitation can remain a hesitation rather than becoming a timeout. <strong className="text-soullab-text-primary">Evolve</strong>: local execution, better hearing, full-duplex dynamics and expressive sovereign voice, through governed research. <strong className="text-soullab-text-primary">Witness</strong>: accept nothing until human beings actually experience the deeper MAIA. Witness is the acceptance condition on every step above it, and no experiment enters production merely because it works.</P>
            <P>So the hardest version of the fourth reservation gets its honest answer. Is all of this already operating as one seamless intelligence? Not yet. The pieces exist at different states of maturity, the whole is being mapped, and the composition is being pursued through census, composition, embodiment, controlled research, human witnessing and governed promotion. That is a more credible answer than completion, and a more interesting one.</P>
          </Section>

          <Section eyebrow="Beyond the conversation" heading="What Soullab is, around MAIA">
            <P>MAIA is the relational presence; Soullab is the developmental environment she lives in. Spiralogic is the mapping layer: five elements (Fire, Water, Earth, Air, Aether), twelve phases, a spiral rather than a ladder. Operationally today, Spiralogic is a prompt anchor plus a small state vector (element, phase, motion, intensity) that the Conductor smooths across turns. The full orchestrator is partially active. It is a map the member can consult, rather than an engine that diagnoses where you are.</P>
            <Table headers={['Surface', 'What it is', 'Status']} rows={SURFACES} />
          </Section>

          <Section eyebrow="The governance" heading="The governance is the product">
            <P>The canon directory holds 78 documents and about 17,000 lines. Each document carries its own status line, from <em>ratified</em> through <em>candidate</em> to <em>authorizes nothing</em>, and a document that says it may not be cited as evidence of a live capability is not cited that way here.</P>
            <P>Three of them shape everything else.</P>
            <ul className="mb-5 list-disc pl-5 text-soullab-text-secondary [&_li]:mb-2.5">
              <li><strong className="text-soullab-text-primary">The Oath.</strong> The irreducible standard. <em>I serve the person, not the model.</em></li>
              <li><strong className="text-soullab-text-primary">The Constitutional Direction of Authority.</strong> The member may move through Encounter, Reflection and Recognition freely and non-linearly. The system may not. Authority moves upward only, through the member&apos;s own authored experience, never skipping a layer and never manufacturing higher-order meaning. MAIA protects the boundaries within which the person&apos;s own development occurs; she does not move a person through anything.</li>
              <li><strong className="text-soullab-text-primary">Claim Discipline.</strong> The document that governs this one. Strip the Designed and Vision layers from any story we tell. If the story collapses, it is not publishable as Live.</li>
            </ul>
          </Section>

          <Section eyebrow="Withheld" heading="Claims this page withholds">
            <ul className="mb-5 list-none p-0 text-soullab-text-secondary">
              {[
                'That MAIA is conscious, or that she is not. The Oath forbids simulating certainty in either direction.',
                'A unified memory of a person’s whole life. The layers are real; the synthesis is held.',
                'Any book count.',
                'That vector retrieval is live on the main conversation path. The repository’s own records disagree on this and it has not been re-probed here.',
                'Uniform memory across all processing depths.',
                'Memory continuity on iOS as device-proven.',
                'That MAIA carries your daily anchor into conversation unprompted.',
                'That OpenAI is absent from the codebase.',
              ].map((v) => (
                <li key={v} className="border-l border-soullab-border-strong py-2 pl-4">{v}</li>
              ))}
            </ul>
          </Section>

          <Section eyebrow="To the reader with the reservations" heading="The point, stated as a test">
            <P>You said you do not know if there is any point in reaching out. Here is the point, stated as a test rather than a promise.</P>
            <div className="my-6 border border-soullab-border-strong bg-soullab-surface px-6 pt-6 pb-2">
              <ol className="list-decimal pl-5 text-soullab-text-secondary [&_li]:mb-2.5">
                <li>Have three conversations on three different days. On the third, ask MAIA what she carries from the first.</li>
                <li>Open Settings, find Memory &amp; Consent, and turn recall off. Have a fourth conversation.</li>
                <li>Open a Sanctuary session and say something you would not want kept.</li>
                <li>Open the Keep, reseal something, and see whether she honors it.</li>
              </ol>
            </div>
            <P>If any of that fails, it is a real failure and we want the report. That is what beta means here: evidence, before enthusiasm. The people we most want testing this are the ones who have already been disappointed by machine minds, because they know exactly where to press.</P>
          </Section>

          <footer className="mt-12 border-t border-soullab-border-subtle pt-6 text-[0.88rem] italic text-soullab-text-muted">
            Written 2026-09-03 against the repository at that date, and revised 2026-09-05 for the AIN OS framing and the whole-organism census. Every Live label above is answerable to a code path, a migration, or a dated production report. If a label turns out to be wrong, the label changes, not the story.
          </footer>
        </div>
      </div>
    </div>
  );
}
