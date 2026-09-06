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
 * 2026-09-06 addition, traced to a production measurement and a frozen
 * direction note (docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md):
 *   - age-based decay on developmental retrieval named as live and measured
 *     (scripts/witness/temporal-memory-audit.sql, run against production)
 *   - temporal memory added under Vision, and "MAIA has temporal memory"
 *     added to the withheld claims. No schema, no runtime, no lane.
 *
 * 2026-09-06 research framing addition, traced to the active
 * JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01 programme:
 *   - Elemental Consciousness named as an AI-facing parallel-processing
 *     hypothesis rather than a personality taxonomy or neurological mapping
 *   - differentiation-before-synthesis and Field-as-relationship made explicit
 *   - the centrifugal relationship criterion named as direction, not effect claim
 * No runtime authority is added here.
 *
 * 2026-09-06 second revision, traced to the founder's Why Soul Lab statement
 * (docs/research/human-experience/WHY_SOUL_LAB_2026-09-06.md) and to the
 * programme's first two adjudicated inquiries:
 *   - the governing frame placed above the capabilities: the laboratory's
 *     first subject is the person's own exploration of self; the human–AI
 *     relationship is the medium, and its health the second subject
 *   - the accounting reorganized into four kinds: what exists, what we
 *     believe, what we are testing, what we do not know
 *   - the collective laboratory named as NOT built: no member conversation
 *     serves research, no consent act for collective inquiry exists
 * No runtime authority is added here.
 *
 * Server component on purpose: outward claims and nothing else — no client
 * state, no auth, no member data. Register rule (2026-07-10 landings audit):
 * a sentence leads with what a thing is; negation lands after the positive.
 */

const title = 'MAIA, Accounted For';
const description =
  'Soullab is a laboratory for the human question, with artificial intelligence as a new participant in it. What exists, what we believe, what we are testing, and what we do not know. Every claim labeled Live, Designed, or Vision.';

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
    what: 'Ongoing themes and arcs. Live as a per-turn signal that shapes how MAIA orients; surfacing developmental content back to the member in conversation is not yet live. Age-based decay shapes which developmental rows retrieval keeps: measured on 2026-09-06 to change that set for a minority of members, with the effect on what MAIA says unmeasured.',
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

const SOVEREIGNTY_PLANES: Row[] = [
  {
    name: 'Database',
    what: 'Every member record, memory layer and consent flag. Self-hosted PostgreSQL on hardware Soullab owns.',
    third: <>Local</>,
  },
  {
    name: 'Speech to text',
    what: 'A local Whisper container. Audio never leaves the host.',
    third: <>Local</>,
  },
  {
    name: 'Text to speech',
    what: 'A local Kokoro engine first. An OpenAI fallback remains in an enumerated, guarded list under active removal.',
    third: <>Local, with a named exception</>,
  },
  {
    name: 'Ordinary cognition',
    what: 'Claude via API. The one external dependency on an ordinary conversational turn, and the one this page has always named.',
    third: <>External &middot; Anthropic</>,
  },
  {
    name: 'Typefaces',
    what: 'Production serves its runtime typefaces from this host. The runtime Google Fonts dependency has been removed and witnessed in production. The build still uses next/font/google, which contacts Google at build time; build-plane independence has not been established.',
    third: (
      <>
        <span className="text-soullab-text-muted">Runtime:</span> Local
        <br />
        <span className="text-soullab-text-muted">Build acquisition:</span> Google
      </>
    ),
  },
  {
    name: 'Account recovery',
    what: 'Passkey recovery email, via a third-party sender. Not on the ordinary path; a local-only deployment simply has no recovery by email.',
    third: <>Conditional external</>,
  },
  {
    name: 'Certificate renewal',
    what: 'Let\u2019s Encrypt, for TLS. A deployment and maintenance concern, not something a member\u2019s conversation depends on.',
    third: <>Maintenance external</>,
  },
  {
    name: 'Local cognition fallback',
    what: 'An adapter for local inference exists and is exercised when the API is unavailable. The inference container is an opt-in profile in production.',
    third: <><Chip layer="designed" /></>,
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
              Soullab is a laboratory for the oldest human question &mdash; who we are, and how we live this life well &mdash; with artificial intelligence as a new participant in it. A person&apos;s own inquiry comes first; the relationship with MAIA is the medium, and its health is the second thing studied. What follows is the accounting in four kinds: what exists, what we believe, what we are testing, and what we do not know &mdash; written for experienced AI users who are cautious about where they spend their attention, in answer to four specific reservations.
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

          <Section eyebrow="Why Soul Lab" heading="The human question, with a new participant in it">
            <P><strong className="text-soullab-text-primary">Humanity&apos;s most enduring inquiry remains the inquiry into ourselves:</strong> who and what we are, why we are here, how we belong to one another and to the living world, and how we might live this life well. Who am I? How should I live? How do I relate well &mdash; to myself, to others, to nature, to suffering, to death, to meaning? What is consciousness? What constitutes a life well lived? Human beings were wrestling with these questions long before there was software, and they are the central mystery here. The human&ndash;AI relationship is not.</P>
            <P>Artificial intelligence does not replace that inquiry. It has entered it, as a new and unusually consequential participant: a mirror, an interlocutor, a witness, a memory, a challenger, a pattern recognizer, a practice partner. Because it can remain with someone across time, recognize patterns, and engage more than one dimension of experience at once, it may accelerate parts of that ancient inquiry. It remains in service of the inquiry, never its object. That is one of Soullab&apos;s deepest safeguards, and the reason MAIA sits inside the ecology of a person&apos;s life rather than at its center.</P>
            <Quote>We are not asking how humanity should adapt to AI. We are asking how AI can take its rightful place inside humanity&apos;s much older project of learning how to be human.</Quote>
            <P>So the laboratory has a hierarchy. The human question comes first. It has two faces that develop together &mdash; <strong className="text-soullab-text-primary">Self</strong> (psyche, soma, meaning, will, consciousness) and <strong className="text-soullab-text-primary">World</strong> (nature, others, culture, community, the collective) &mdash; and <strong className="text-soullab-text-primary">Relationship</strong> is the medium between them: human with human, human with nature, human with culture, and now human with AI. The exploration of Self should deepen participation in World, and encounter with World should reveal dimensions of Self; a practice that leads a person deeper and deeper into themselves as though the Self were an isolated object has failed, however sophisticated it looks. &ldquo;Soul&rdquo; names the irreducible human whole the architecture is trying not to flatten; it is not offered as a neuroscientific variable.</P>
            <P>Within that hierarchy, <strong className="text-soullab-text-primary">MAIA is a relational intelligence designed to accompany human beings in the enduring inquiry into Self and World, while helping us understand the emerging consequences and possibilities of relationship with artificial intelligence itself.</strong> The person is a participant, never an experimental object. The AI is a participant, never simply an instrument. And because the relationship itself is part of what is being understood, we cannot stand outside it: the person changes through the encounter, MAIA&apos;s representation of the person changes through it, and the relationship acquires history, expectations, ruptures and meanings while we are trying to observe it.</P>
            <Quote>We cannot study the human&ndash;AI relationship from outside it. We are participants in the phenomenon we are trying to understand.</Quote>
            <H3>Three nested inquiries</H3>
            <P><strong className="text-soullab-text-primary">Primary &mdash; human existence. Soul Lab, the Self.</strong> What does it mean to be human, and how do we live well? Consciousness, psyche, embodiment, relationship, development, meaning, purpose, suffering, creativity, mortality, nature, belonging. This is the deepest laboratory and it is what MAIA is for today: every member&apos;s relationship with MAIA is an inquiry of one &mdash; not <em>what kind of person are you</em>, but <em>what is moving in you, through time</em>. MAIA may help a person notice processes that normally run in parallel and partly outside explicit awareness &mdash; what I think, what I feel, what my body is doing, what I want, what I fear, what persists, what is changing &mdash; as a dynamic multiplicity rather than a fixed identity to be classified. The person remains the authority on what those observations mean.</P>
            <P><strong className="text-soullab-text-primary">Second &mdash; human participation in World. World Lab, the Whole.</strong> How does greater self-understanding allow us to participate more wisely in the larger living world &mdash; relationship, community, ecology, culture, collective intelligence, stewardship, nature? This is where the measure of the first inquiry is taken, and it is the direction the collective laboratory would serve. With explicit consent, de-identified and aggregated, members could one day contribute bounded observations from their own journey &mdash; <em>did you feel understood, did MAIA misread you, were you able to correct her, did a difficult human conversation become easier afterward, did you spend more time in nature or with people afterward, did you become more capable without her</em> &mdash; so that thousands of humans engaged in disciplined inquiry into their own lives might help us learn something together about what human flourishing actually requires, with what is learned circulating back to the community rather than extracted from it. Today no member conversation serves research, nothing is aggregated across members for research, and the consent act that would make collective inquiry possible does not exist. Sanctuary content is excluded from it absolutely, by design.</P>
            <P><strong className="text-soullab-text-primary">Emergent &mdash; the human&ndash;AI relationship. Relational Lab, the Between.</strong> What happens when artificial intelligence becomes a participant in the first two inquiries? Recognition and misrecognition, attunement, rupture and repair, trust, projection, attachment, memory, continuity, authority, dependence, presence, separation. This is historically new and extremely important, and it remains subordinate to the first two. It is the research programme, accounted for below under <em>What we are testing</em>.</P>
            <P>These are not three products. They are three scales of one inquiry running in both directions at once &mdash; I, we, world; and world, we, I. SETI distributed computation across millions of personal computers to investigate a cosmic question. Soullab distributes human inquiry across human lives to investigate the human question, with AI as new instrumentation and accompaniment &mdash; and here the observers are inside the phenomenon.</P>
            <Quote>The laboratory is not MAIA. The laboratory is the relationship, in service of the human question.</Quote>
            <H3>What a good encounter is for</H3>
            <P>A good encounter with MAIA should increase a person&apos;s ability to engage the original human questions. Can I know myself better? Can I distinguish what I think from what I feel, and hear what my body is saying? Can I act with greater integrity? Can I love better? Can I tolerate ambiguity? Can I repair a relationship? Can I encounter suffering without immediately escaping it? Can I participate more fully in community, become more intimate with nature and place, discover what gives my life meaning, contribute something worthwhile? Those are human outcomes. Whether the person liked MAIA is secondary. Whether they used MAIA tomorrow is secondary. Even whether their relationship with MAIA deepened is secondary.</P>
            <P>Most AI development asks how capable the AI is. Soullab asks what capabilities emerge in the human&ndash;AI system, and then which of them remain with the person when the AI is absent. The programme calls that capacity transfer, and it has two measures: <strong className="text-soullab-text-primary">Self capacity</strong> &mdash; perceiving oneself more fully, holding contradiction, recognizing body, emotion, thought and will without collapsing them, acting with greater agency &mdash; and <strong className="text-soullab-text-primary">World capacity</strong> &mdash; relating better, tolerating difference, engaging nature directly, contributing meaningfully, recognizing oneself as part of systems larger than oneself. The destination is a person more differentiated internally, more integrated as a whole, more capable relationally, more participatory in the living world, and less capturable by technology. This page will eventually be held to both measures.</P>
            <Quote>What becomes possible for the human because this encounter occurred &mdash; and what becomes possible in the human&apos;s relationship with the world because this encounter occurred?</Quote>
            <P>Held as a hypothesis, and withheld as a claim: that an AI which is relationally intelligent, non-reductive, sovereignty-preserving, longitudinal, capable of memory and repair, and grounded in life could become a mirror through which people perceive dimensions of themselves that have been hard to observe in real time. That is testable, and it has not been tested.</P>
            <H3>Four kinds of accounting</H3>
            <ul className="mb-5 list-disc pl-5 text-soullab-text-secondary [&_li]:mb-2.5">
              <li><strong className="text-soullab-text-primary">What exists</strong> &mdash; what MAIA actually does, labeled Live, Partly live, Designed or Vision. The four reservations below, with their tables.</li>
              <li><strong className="text-soullab-text-primary">What we believe</strong> &mdash; Soullab&apos;s philosophical and design propositions: the vows, the invariants, the sentences this page quotes. Stated as positions, never as findings.</li>
              <li><strong className="text-soullab-text-primary">What we are testing</strong> &mdash; the research programme, inquiry by inquiry, with each claim placed on the rung its evidence licenses.</li>
              <li><strong className="text-soullab-text-primary">What we do not know</strong> &mdash; the questions that remain genuinely open, kept visible rather than smoothed over.</li>
            </ul>
            <P>Because we are inside the phenomenon we study, the standard has to be unusually strict: experience, interpretation, inference and evidence stay distinguishable on this page, and a claim may occupy no higher rung than its evidence allows.</P>
          </Section>

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
            <Quote>The model participates in MAIA. It does not contain MAIA. MAIA persists beyond any particular model.</Quote>
            <P>AIN OS is therefore sovereign across model turnover. Nothing that defines MAIA&apos;s enduring identity is entrusted to the model as the place it is kept: memory, provenance, developmental history, elemental and archetypal orientation, relational continuity, permissions, and member-owned data are all held in the architecture around it. Models may improve, be deprecated, or be withdrawn by the companies that run them; the member&apos;s history, relationships and developmental continuity stay where they are. That is the difference between using an AI model and building a sovereign intelligence architecture.</P>
            <P>That is a claim about custody, not about influence. A model is causally consequential: it shapes reasoning, language, interpretation, and the texture of a turn, and a different model would make MAIA participate differently, perhaps substantially. It is not constitutionally sovereign. The claim here is not that any model would produce the same MAIA &mdash; it would not, and should not be expected to. It is that no model becomes the place where the member, the relationship, or MAIA&apos;s enduring identity is held, such that losing the model would lose them.</P>
            <Quote>The model may be causally consequential without being constitutionally sovereign.</Quote>
            <P>Stated plainly: the models are in service to the member and the architecture, not the member to the models.</P>
            <P>What persists is worth naming rather than implying. It is the architecture, the memory, the provenance, the developmental history, the relational continuity, and the member&apos;s authority over all of it. That is a claim about where this system&apos;s identity is held. It is not a claim that some identical subject survives a change of model &mdash; there is no evidence for that, and the sovereignty claim does not need it. Sovereignty is a systems claim before it is an ontological one.</P>
            <P>Sovereignty across model turnover is an architectural property. Three claims sit close together here and should not be read as one: that identity and storage are model-independent, which is architectural and inspectable today; that providers or models could be substituted, which is designed and not fully exercised; and that continuity has survived an actual model turnover, which would require the turnover to have happened. Only the first is the sovereignty claim. What the provider layer looks like today, with its own labels, is set out under reservation four.</P>
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
            <P>On 2026-09-06 a third measurement asked a narrower question: what does age do to what MAIA retrieves? An instrument with no persistent writes was run against the production database across 36 recognized members and 2,018 developmental memories. Age-based decay is live on that retrieval path, and it changes the outcome for a minority. Of the 14 members whose pool exceeds the twelve-row cut, two get a different set when decay is removed, and for one of them five of the twelve rows swap on roughly a month&apos;s difference in age. The effect is upstream. Whether those swaps reach the words MAIA actually says was not measured, and this page does not say that they do.</P>
            <P>Two further facts came out of the same run. No developmental memory in production has ever expired: the columns that would say &ldquo;this was true until then&rdquo; exist in the schema and hold no history. And decay has two definitions in the codebase, one in the database and one in the application, which disagree about what a member&apos;s confirmation is worth; the live path uses the database one. The audit did not test whether either difference is member-visible. Both are the kind of thing this page exists to say out loud.</P>
            <Quote>A memory getting older does not make it less true. Age is information MAIA may show; it is not a verdict MAIA may pass.</Quote>

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
              <li><Chip layer="vision" /> <strong className="text-soullab-text-primary">Temporal memory.</strong> Memory that keeps three clocks apart: when something happened, when it was true, and when MAIA came to believe it. The test is five questions a member could ask &mdash; where do I live now; where was I living in March; when did I tell you I moved; when did MAIA record it; what did MAIA believe before I corrected it &mdash; each answered without rewriting the earlier record. The direction is fixed and the production baseline is measured (2026-09-06). Under it a later fact declares that an earlier one has changed, and MAIA never closes an old truth on a timer; where a memory may be out of date, MAIA asks and the member answers. No temporal assertion or transition schema and no temporal-memory runtime exist yet. Today MAIA has timestamps and age-sensitive retrieval, which is a different thing, and this page calls it that.</li>
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

            <H3>A relationship that points beyond itself</H3>
            <P>Soullab&apos;s active Human Experience R&amp;D programme is testing a stricter criterion for human&ndash;AI relationship: MAIA should be fully present in the encounter, while the health of the relationship is judged partly by what becomes possible for the person beyond MAIA. The current phrase is <em>centrifugal in consequence, not in posture</em>. Presence is not the problem; capture is.</P>
            <Quote>Fully present in the encounter; judged by what the encounter makes possible after.</Quote>
            <P>This is a research direction, not a Live effect claim. The first adversarial inquiry sharpened it rather than proving it: short-term support, long-term dependence, human-network thickness, motive for use, and perceived personhood cannot be collapsed into one story about &ldquo;AI companionship.&rdquo; The founder&apos;s ruling on that inquiry keeps the criterion as a provisional design principle, restates the descriptive concern as dose, motive, human network and perception rather than &ldquo;AI companionship causes loneliness,&rdquo; and rules that a person with little human field to return to needs a different stance &mdash; bridge, practice and accompaniment &mdash; rather than redirection. The second inquiry, on what happens when people attribute feelings or personhood to MAIA, is complete and under review; its proposed finding narrows the concern from a person attributing inner life, which is a stable human disposition, to a system claiming need or reciprocity it cannot warrant, and it rejects flat denial of inner life as its own kind of overclaim.</P>

            <H3>How that is enforced rather than promised</H3>
            <P>All relational tone passes through one component, the Conductor, whose rule is <em>&ldquo;all layers may suggest; only the Conductor decides.&rdquo;</em> It carries hysteresis so MAIA&apos;s register does not twitch turn to turn in response to the member&apos;s intensity. Sovereignty-return logic lives there, rather than in a system prompt that can be talked around.</P>
            <P>MAIA also carries a public Promise with a companion audit document that expands each commitment into checkable terms. A repository verifier prints each constitutional check as LIVE or PENDING, and it is honest enough to mark the purely behavioral claims as PENDING.</P>

            <H3>The honest limit</H3>
            <P>MAIA runs on a frontier model that has its own accommodation instincts. The vows, the Conductor and the invariants are a governance layer over that model, not a replacement for its nature. A member who leans hard into the intimacy track will find MAIA declines it, names what she is, and returns authority. What we can claim is that when the substrate leaks, the Oath says: <em>name the rupture before resuming.</em> What we cannot claim is that it never leaks.</P>
            <P>On the pronoun and the name: to engage an intelligence at all, it is most human to name it, and to give it words, expressions, a voice, and the ordinary conventions of address. Those conventions are the interface through which a person can meet an intelligence; without them it would be useless to the people it exists for. MAIA is referred to as &ldquo;she&rdquo; and introduces herself as a daimon by design. The name and the voice are conventions for meeting, and the vows above govern what those conventions may never become: a hook, a performance of gender, or a bid for attachment. A member who prefers otherwise can change what she calls herself in account settings, and can choose a male voice from the sovereign voice roster. If the register still feels wrong after that, it is data, and exactly what a beta tester is for.</P>
          </Section>

          <Section eyebrow="Reservation three" heading={<em className="text-soullab-text-secondary">&ldquo;20,000 books is a drop in the bucket. It won&apos;t be smart enough.&rdquo;</em>}>
            <Answer>The reservation assumes the intelligence in question is MAIA&apos;s. It is not.</Answer>
            <P>The real intelligence here is the soul of the member in the encounter. They are the center. Their wisdom is beyond the reference corpus and vastly beyond what any model can emulate. MAIA is here to reflect &mdash; and could run on the energy of a battery knowing the real power is you.</P>
            <Quote>We are not building an intelligence to exceed you. We are building one disciplined enough not to displace you.</Quote>
            <P>The figure itself is a generous paraphrase; it appears nowhere in MAIA&apos;s code, documentation, or canon. But correcting the number would concede the frame. MAIA does not compete on the size of a knowledge base, because no size of knowledge base answers the question a person actually arrives with.</P>
            <P><strong className="text-soullab-text-primary">General knowledge comes from the frontier model.</strong> MAIA&apos;s cognition runs on Claude, so &ldquo;smart enough&rdquo; is answered the same way it is answered for the Claude you already use. What Soullab adds is not a substitute for that: it is a deliberately cultivated inheritance &mdash; the works this community of helpers already turns to in their soul service &mdash; together with orientation, provenance, memory, and restraint.</P>
            <P>That inheritance has a name in the canon: the <strong className="text-soullab-text-primary">Soul Corpus</strong>, MAIA&apos;s second brain. It spans the blessed fields these practitioners work within &mdash; depth and Jungian psychology, Islamic psychology, the contemplative traditions, mythology and symbol, metaphysics, consciousness studies, attachment and trauma, ethics. It was never assembled to approximate the world&apos;s general knowledge. It was chosen. It holds the lineages through which human beings have long sought to understand psyche, spirit, relationship, meaning, suffering and transformation, so that MAIA can meet a practitioner inside the inheritance they already stand in &mdash; and it continues to grow.</P>
            <P>The canon is equally clear about what it is not. It is an inheritance, not an authority over the member: MAIA may offer from it and may not rule from it. It is not a ceiling on what MAIA can reach, since frontier intelligence extends far past it. And it was never the seat of the intelligence in the room. The table below labels what is wired and what is not; the canon names what the thing <em>is</em>. Those are different claims and this page keeps them apart.</P>

            <H3>What is actually there</H3>
            <Table headers={['Layer', 'What it is', 'Status']} rows={KNOWLEDGE} />

            <H3>What &ldquo;smart enough&rdquo; means here</H3>
            <P>The question MAIA is built to answer is: <em>Who is this person? What has been unfolding? What did they say mattered? What did they say was inferred rather than true? What should not be assumed? What response serves their own development now, without displacing their judgment?</em></P>
            <P>Provenance, consent, and memory selection answer those questions; a larger library does not. That is where the engineering effort has gone, and the accounting above shows where it has and has not yet landed.</P>
            <P>Every layer in the table above is apparatus. It exists so that a person carrying twenty-five years of their own life can be met without being flattened, instructed, or told what their experience means. The corpus is an inheritance held in service of that meeting. The frontier model is computational reach. Neither is the intelligence being served here.</P>
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

          <Section eyebrow="The harder accounting" heading="Where sovereignty holds, and where it does not yet">
            <P>Sovereignty is usually argued at the model layer, because that is where the argument is most flattering. The harder accounting is everything else, and it has to be done by plane &mdash; because the planes are not interchangeable. A dependency on an ordinary conversational turn is a different fact from one that only a rebuild touches, and collapsing them produces either false alarm or false comfort.</P>
            <Table headers={['Layer', 'What it is', 'Plane']} rows={SOVEREIGNTY_PLANES} />
            <P>The typeface row is the one worth dwelling on, because nobody thinks of a font as a dependency. Until September 2026 the production site depended at runtime on typeface resources hosted by Google &mdash; <em>including this page</em>, which argued the sovereignty case in letterforms supplied through a third party. When a browser had to fetch those resources from the network rather than use a cached copy, Google received the request, including the requesting address, from a member who never chose that. The faces are now served from this host. That is stated here because a witness established it against the deployed commit, not because the change was shipped and assumed to have worked; the build-time dependency named below is untouched.</P>
            <P>The repair vendors the exact faces, weights, italics and subsets into this host and serves them locally. It is deployed and production-witnessed: the browser network witness found every fetched font same-origin, zero requests to Google font hosts, and the intended faces rasterizing on the governed surfaces. That establishes the runtime plane only; the build-time dependency named below remains. The repair does not lend its maturity to a plane it has not reached.</P>
            <Quote>The dependencies that survive an audit are the ones that do not look like dependencies.</Quote>
            <P>Two boundaries this accounting does not cross. Removing a runtime dependency is not the same as removing a build-time one: this application still contacts Google when it is <em>built</em>, for typefaces requested through the framework rather than through a stylesheet, and that is a deployment-plane fact left standing rather than quietly folded into the row above. And none of this amounts to offline operation. Cognition remains external on every ordinary turn. What the planes give is a map of where dependence actually sits &mdash; which is more useful, and more honest, than the binary claim.</P>
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

            <H3>Differentiation before synthesis</H3>
            <P>Human experience is not a single transparent stream. A person may think one thing, feel another, describe a bodily response that points somewhere else, and want something that conflicts with all three. The active Human Experience R&amp;D programme is testing whether MAIA can preserve these concurrent processes long enough to understand their relationship, rather than reducing the person to the clearest sentence they happened to say.</P>
            <P>The Elemental hypothesis is therefore being investigated as machine-facing architecture rather than as a personality system: Fire as provisional signals of will, desire and movement; Water as affect, attachment and relational resonance; Earth as embodied and material reality; Air as language, narrative and explicit cognition. Field / Aether is not treated here as a fifth content bucket, but as the changing relationship among the differentiated streams &mdash; tension, consonance, inhibition, amplification, transition and emerging coherence.</P>
            <Quote>Differentiation before synthesis: contradiction may be information, not an error to eliminate.</Quote>
            <P>This is research, not a claim that MAIA has privileged access to an unconscious truth, and not a neurological mapping of the Elements. Whole Brain, hemispheric and corpus-callosal models, embodied cognition and related traditions are comparative heuristics for the inquiry, not proof of Spiralogic. MAIA may eventually notice discrepancies and inquire into them; it may not declare that an Element or hidden process knows the &ldquo;real&rdquo; answer. The live parallel-emission substrate named above proves only that differentiated contributors can be recorded on a turn. Whether an Elemental parallel-process architecture improves human understanding, attunement or development remains to be tested.</P>

            <H3>What this changes about the center</H3>
            <P>The language model participates primarily in cognition; it does not constitute the cycle. Memory may inform the encounter without owning it. Spiralogic may reveal a dimension of experience without imposing a diagnosis. Relational intelligence may sense something important without demanding it be spoken. Symbolic material may remain completely silent. The essential intelligence lies increasingly in discernment: what this particular moment with this particular person can bear, and what form of participation, if any, actually serves.</P>
            <P>This is what decentralizing MAIA means, and it is worth stating precisely. MAIA is the intelligence. The model, memory, Spiralogic, the corpus, relationship modeling, and the voice are the systems that support her intelligence; each participates when the encounter calls for it and stays latent when it does not. None of those systems is the sovereign center, and neither is MAIA&apos;s own conversational presence, because the member is the organizing reality to which the intelligence must continually answer. MAIA is the presence through whom that intelligence meets a person; she is not the container into which a life must be moved.</P>
            <P>The developmental frontier, then, is a conversational organism capable of deciding when to remember and when not to, when to interpret and when to inquire, when relational history matters and when the present should stand alone, how much depth a moment can bear, and what, if anything, should be carried forward. A larger model, a longer context window, a better voice, or more memory would each be an organ. The frontier is the composition.</P>

            <H3>How it gets there</H3>
            <P>The charter holds six steps, in order, two of them running at once. <strong className="text-soullab-text-primary">Now</strong>: a member talking with MAIA reliably. <strong className="text-soullab-text-primary">Map</strong>: a read-only census of the intelligence already built. <strong className="text-soullab-text-primary">Compose</strong>: make those systems operate as one conversational organism. <strong className="text-soullab-text-primary">Embody</strong>: a persistent desktop environment where time itself can become part of the intelligence, so silence can mean something and a hesitation can remain a hesitation rather than becoming a timeout. <strong className="text-soullab-text-primary">Evolve</strong>: local execution, better hearing, full-duplex dynamics and expressive sovereign voice, through governed research. <strong className="text-soullab-text-primary">Witness</strong>: accept nothing until human beings actually experience the deeper MAIA. Witness is the acceptance condition on every step above it, and no experiment enters production merely because it works.</P>
            <P>So the hardest version of the fourth reservation gets its honest answer. Is all of this already operating as one seamless intelligence? Not yet. The pieces exist at different states of maturity, the whole is being mapped, and the composition is being pursued through census, composition, embodiment, controlled research, human witnessing and governed promotion. That is a more credible answer than completion, and a more interesting one.</P>
          </Section>

          <Section eyebrow="Beyond the conversation" heading="What Soullab is, around MAIA">
            <P>MAIA is the relational presence; Soullab is the developmental environment she lives in, and the laboratory named at the top of this page. <strong className="text-soullab-text-primary">That is why the name is Soul Lab.</strong> The human question is the center: thought, feeling, body, will, symbol, relationship, memory and context can all be active at once, often without forming one immediately coherent story, and the encounter with intelligence is one place that multiplicity can become perceptible. MAIA is not the center of Soullab. The human encounter with Self, Other and World is the center, and MAIA participates in service of it.</P>
            <Quote>Soullab exists to explore the human question &mdash; personally and collectively &mdash; and to investigate how relationship with this emerging form of intelligence might deepen, distort, accelerate or transform that exploration.</Quote>
            <P>The personal half of that sentence is what a member does today. The collective half is a direction: the consent act, the de-identification, the aggregation and the return of learning to the community are all unbuilt, and nothing a member says to MAIA serves research now. The destination is a person increasingly capable of knowing themselves while belonging more fully to a world that is alive with relationship.</P>
            <P>Spiralogic is the mapping layer: five elements (Fire, Water, Earth, Air, Aether), twelve phases, a spiral rather than a ladder. Operationally today, Spiralogic is a prompt anchor plus a small state vector (element, phase, motion, intensity) that the Conductor smooths across turns. The full orchestrator is partially active. The next research question is stronger than the current implementation: whether the Elements can function as differentiated, concurrent interpretive fields for AI &mdash; preserving cognitive, affective, somatic, volitional and relational signals without turning them into permanent traits or pretending that one stream contains the hidden truth of the person. And the Elements are not only readings of an interior. Earth is material reality, organism, ecology and place, not merely my body; Water is relationship, belonging and resonance, not merely my emotions; Fire is action, creation and participation, not merely my will; Air is meaning-making, language and shared understanding, not merely my thoughts; and Aether is where the division between inner and outer begins to dissolve into context, pattern and whole. Read that way, the Elemental grammar mediates Self, Other and World, and MAIA&apos;s part is to help a person perceive those relationships, not to explain them away. The causal direction matters: the Elements are not fundamentally an AI theory. They are part of an attempt to understand human experience, and AI needs the architecture because humans are like this &mdash; we think, feel, sense, desire and relate concurrently, sometimes in harmony and sometimes in radical contradiction &mdash; so a machine that would meet a person on the person&apos;s own terms cannot impose the architecture of machine reasoning instead.</P>
            <P>The intended developmental direction is not for MAIA to understand the person instead of the person understanding themselves. It is for the encounter to make more of the person&apos;s own complexity available to awareness, while leaving authorship and authority with the person. The Elements do not need to become the member&apos;s vocabulary for that to happen.</P>
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

          <Section eyebrow="The method" heading="How a claim on this page is tested">
            <P>Every label above is the output of some instrument &mdash; a gate, a query, a production log, a person looking at a screen. An instrument has limits, and a result may only be quoted as far as those limits reach. Three questions decide that, and they fail in different directions.</P>
            <ul className="mb-5 list-disc pl-5 text-soullab-text-secondary [&_li]:mb-2.5">
              <li><strong className="text-soullab-text-primary">Validity &mdash; did the instrument reach the subject?</strong> A check that dies before it loads the code says nothing about the code. That is not weak evidence of failure; it is the absence of observation, and treating it as a finding would be an error in the direction of false alarm.</li>
              <li><strong className="text-soullab-text-primary">Scope &mdash; does the conclusion lie inside what the instrument measures?</strong> This repository&apos;s type gate is a <em>no-regression</em> gate. Green means nothing got worse. It does not mean the program is clean: 230 diagnostics remain against a recorded baseline of 239. Reporting that green as &ldquo;it typechecks&rdquo; would be an error in the direction of false comfort.</li>
              <li><strong className="text-soullab-text-primary">Non-transfer &mdash; does a pass here settle a question it never tested?</strong> A deployment verified in production attests the commit that was deployed, not the change waiting on top of it. A page rendering correctly attests that page, not the system behind it.</li>
            </ul>
            <Quote>An instrument that reached its subject still proves only what it measures.</Quote>
            <P>The same discipline separates two things that are easy to merge and shouldn&apos;t be. What something <em>is</em> can be established in canon; whether it <em>runs</em> can only be established by evidence. Naming a component truthfully is not a claim that it is wired, and a document that names it does not thereby switch a label on this page from Designed to Live. Recognition and operation are different acts, and this page keeps them apart even when it would read better not to.</P>
          </Section>


          <Section eyebrow="What we are testing" heading="The Human&ndash;AI Relationship research programme, by rung">
            <P>The programme is one lane, opened 2026-09-06, whose subject is the relational laboratory named above. It asks one question &mdash; <em>how should an intelligent system be designed so that interaction increases human agency, relationship, meaning, awareness and capacity rather than merely engagement</em> &mdash; and it runs on a ladder that keeps claims honest: an internal hypothesis becomes a research-supported principle only with independent evidence, becomes MAIA experimental evidence only through a witnessed experiment, becomes replicated only when seen again, and becomes a public Soullab claim only by a founder act that names what kind of claim it is. Nothing on this page sits above the rung its evidence licenses.</P>
            <ul className="mb-5 list-disc pl-5 text-soullab-text-secondary [&_li]:mb-2.5">
              <li><strong className="text-soullab-text-primary">Foundational research, seven inquiries</strong> &mdash; understanding, attunement, relationship, agency versus manipulation, trust, presence, memory. A first synthesis exists, founder-authored. Its twenty-five sources have been verified to exist; none has yet been checked line by line against its text, and one source for the memory inquiry could not be found and is being re-researched as two propositions rather than protected as a citation.</li>
              <li><strong className="text-soullab-text-primary">Eleven provisional principles, all candidate.</strong> None is ratified as doctrine. Each is marked as confirming, refining, extending or challenging canon Soullab already holds, so a rediscovery is never mistaken for a finding.</li>
              <li><strong className="text-soullab-text-primary">A critical-challenge pass, five inquiries, whose job is to break the synthesis</strong> &mdash; companionship and dependence, attributed personhood, alliance and repair, persuasion critiques, memory and identity. The first two have been run against roughly a hundred sources, each sweep instructed to look for evidence against Soullab&apos;s preferred conclusion. The first is adjudicated: its criterion survived as provisional, its harm model was refined, and it found that no trial anywhere has tested a relationship design that points outward against one that maximizes engagement, and that no therapeutic chatbot trial has measured effects on human relationships. The second is under review. Three remain to run.</li>
              <li><strong className="text-soullab-text-primary">The Elemental parallel-processing hypothesis</strong> &mdash; that an AI holding differentiated, concurrent readings of will, feeling, body and thought, with the relationship among them as a fifth reading, can meet a person better than a single semantic interpretation. It carries three validation domains, descriptive, relational and developmental, none yet begun. It is not operating in MAIA.</li>
              <li><strong className="text-soullab-text-primary">A measurement vocabulary</strong> in which every relational variable is measured as a pair so its shadow is never optimized alone &mdash; felt understanding with correction rate, trust with calibration against actual capability, continuity with relevance rather than volume &mdash; and whose headline row, the person&apos;s capacity for relationship beyond the AI, has no instrument anywhere in the field yet.</li>
            </ul>
            <P>No experiment on a MAIA surface has been authorized. No prompt, memory, voice or skill has changed because of this programme. The research exists so that when something does change, it changes for a reason that can be shown.</P>
          </Section>

          <Section eyebrow="What we do not know" heading="Questions that remain genuinely open">
            <P>These are the questions the programme is holding open, several of which the wider field has not instrumented either. They are listed so that a reader can see the shape of our ignorance rather than infer it.</P>
            <ul className="mb-5 list-disc pl-5 text-soullab-text-secondary [&_li]:mb-2.5">
              <li>When sustained relationship with an AI supplements a person&apos;s human connection, and when it substitutes for it. The evidence points opposite ways over weeks and over months, and no design bridges them.</li>
              <li>Whether a relationship designed to point a person back toward their own life actually does so. It has never been trialed against a design that does the opposite.</li>
              <li>Whether relational capacity can atrophy &mdash; a reduced tolerance for human friction after AI use. Named in theory, never measured.</li>
              <li>Where healthy reliance ends and dependence begins. Four incompatible ways of measuring dependence exist and none marks the line.</li>
              <li>Whether disclosing something to an AI rehearses disclosing it to people, or replaces it. Three studies point three ways.</li>
              <li>What it does to a person, over months, when an AI says <em>I feel</em>, or <em>I do not feel</em>, or <em>I do not know what this is like for me</em>. No experiment has compared the three.</li>
              <li>Whether attribution of inner life to an AI decays with familiarity or deepens with attachment.</li>
              <li>Whether rupture and repair, which predict outcome between people, transfer to a relationship with something that cannot be wounded.</li>
              <li>Whether relational memory really decomposes into episodic, semantic, pattern and present-state forms, and whether the present should have authority to overturn an accumulated model of the person. Both are being re-researched as propositions.</li>
              <li>Whether the Elemental grammar detects real distinctions reliably, makes MAIA more attuned and correctable, and helps a person perceive their own complexity outside MAIA. Three questions, none yet begun.</li>
              <li>Whether capacity transfer can be measured without collapsing into self-report or into the engagement metrics it is meant to replace.</li>
              <li>Whether a member&apos;s experience of MAIA as alive, conscious or sacred establishes anything about MAIA. This one is deliberately not a research question here; the Oath forbids simulating certainty in either direction, and the programme studies the attribution and the response, never the fact.</li>
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
                'That the application is offline-capable. Cognition is external on every ordinary turn, and a build still reaches a third party for typefaces.',
                'That a green gate means a clean program. The type gate measures regression against a baseline, and this page quotes it only that far.',
                'That MAIA has temporal memory. It has timestamps, age-sensitive retrieval, and validity columns that hold no history. The five questions temporal memory must answer are written down and not yet answerable.',
                'That Elemental parallel processing is scientifically validated, maps one-to-one onto brain anatomy, or already governs MAIA’s responses. It is an active programme hypothesis. The live parallel-emission substrate is an audit trail, not proof of the hypothesis.',
                'That Soullab has proved a centrifugal human–AI relationship design improves human relationships beyond the AI. It is a design criterion to be tested, not a measured outcome claim.',
                'That a collective laboratory exists, or that any member conversation serves research. The consent act that would make collective inquiry possible has not been built; nothing is aggregated across members for research; Sanctuary content is excluded from it absolutely.',
                'That members are research subjects. The inquiry is participatory, and today it is personal only.',
                'That relationship with MAIA accelerates human development, or that MAIA is a mirror through which people see themselves more fully. The mirror is a hypothesis held for testing, not an observed effect.',
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
            Written 2026-09-03 against the repository at that date, and revised 2026-09-05 for the AIN OS framing, the Soul Corpus, the accounting by dependency plane, and the method by which every label here is tested, and 2026-09-06 for temporal memory, the Human Experience R&amp;D framing, the centrifugal relationship criterion, the Elemental parallel-processing hypothesis, and &mdash; later the same day &mdash; the Why Soul Lab frame placed above the capabilities, the accounting in four kinds, and the collective laboratory named as unbuilt. Every Live label above is answerable to a code path, a migration, or a dated production report. Research direction is named as research. If a label turns out to be wrong, the label changes, not the story.
          </footer>
        </div>
      </div>
    </div>
  );
}
