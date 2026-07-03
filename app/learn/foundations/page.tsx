'use client';

import Link from 'next/link';

const traditions = [
  {
    title: 'Depth Psychology',
    description:
      'Originating with Jung and developed through archetypal and analytic traditions, depth psychology treats the interior life as layered, symbolic, and requiring patient attention rather than surface-level resolution. Its central insight is that what presents first is rarely what matters most — and that moving too quickly to resolution forecloses discovery.',
    showsUpAs:
      'Reflective responses that stay beneath the obvious, pattern surfacing over multiple turns, a reluctance to name what something means before the person themselves has moved toward it.',
  },
  {
    title: 'Phenomenology',
    description:
      'Philosophical attention to lived experience as it actually presents itself — before interpretation, before diagnosis. The phenomenological stance is to observe precisely, not to immediately categorize. Husserl called it "bracketing" — suspending assumptions long enough to see what\'s actually there.',
    showsUpAs:
      'Staying close to the user\'s own language, not overriding or redirecting it with a different frame, asking what something is like before asking what it means.',
  },
  {
    title: 'Socratic Inquiry',
    description:
      'Question-led clarification rather than answer delivery. The Socratic method trusts that understanding emerges through the right questions, not through being told. Socrates described himself as a midwife — not the source of knowledge, but a presence that helped it be born.',
    showsUpAs:
      'MAIA asks more than it tells. Responses open space rather than close it. The goal is the user\'s clarity, not MAIA\'s demonstration of competence.',
  },
  {
    title: 'Contemplative Traditions',
    description:
      'Across multiple traditions — Buddhist, Stoic, and various mystical lineages — there is a consistent emphasis on slowing, observing, and articulating before acting. The value is in the quality of attention brought to experience, not the speed of response to it. These traditions share a suspicion of the quick answer.',
    showsUpAs:
      'Deliberate pacing, resistance to rushing toward resolution, space held between question and response. The system is not optimized for throughput.',
  },
  {
    title: 'Developmental Psychology',
    description:
      'Frameworks from Piaget, Kegan, and others that treat the self as something that develops in stages through encounter, challenge, and integration — not something fixed or complete. Kegan in particular mapped how meaning-making itself evolves: we don\'t just accumulate knowledge; we periodically restructure how we make sense of things.',
    showsUpAs:
      'MAIA orients toward growth over time, not just clarity in the moment. Continuity between sessions matters. What formed in a previous conversation is not discarded — it becomes context for what forms next.',
  },
  {
    title: 'Existential Philosophy',
    description:
      'From Frankl, Heidegger, and the existential tradition: emphasis on meaning-making, authentic choice, and the value of confronting what is real over what is comfortable. The existential frame takes seriously that some difficulty cannot and should not be resolved away — it must be encountered.',
    showsUpAs:
      'MAIA does not avoid difficulty. It holds space for what\'s hard without rushing to soften or reframe it. The question "what matters to you about this?" is existential. It is asked often.',
  },
  {
    title: 'Philosophy of Mind and Epistemology',
    description:
      'Questions of how we know what we know, how beliefs form, and what it means to think clearly — drawn from analytic and continental philosophy alike. The focus is on the conditions under which genuine understanding becomes possible, as distinct from the accumulation of information.',
    showsUpAs:
      'The artifact system. The emphasis on articulation. The value placed on keeping what forms, rather than letting it dissolve back into the stream of thought. Articulation is not documentation — it\'s completion.',
  },
  {
    title: 'Spiralogic',
    description:
      'The framework developed within Soullab itself — a dynamic map of states, elements, and movement across the interior life. Where the traditions above provide the orientation, Spiralogic provides the routing: how a conversation recognizes where someone is, what element is active, what phase of development is present, and how to move with it rather than against it.',
    showsUpAs:
      'Elemental resonance in responses, phase-aware conversation pacing, the conductor layer that routes between modes and depths. It is the native architecture — not borrowed, but built from what the other traditions made possible.',
  },
];

export default function FoundationsPage() {
  return (
    <div className="min-h-screen bg-soul-background text-amber-50/90">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">

        {/* Opening statement */}
        <header className="mb-16">
          <p
            className="text-xs uppercase tracking-widest text-amber-200/50 mb-8"
            style={{ letterSpacing: '0.18em' }}
          >
            Foundations
          </p>
          <h1
            className="text-3xl md:text-4xl font-light text-maia-spice-400 mb-6 leading-snug"
            style={{ fontFamily: 'Spectral, Georgia, serif', letterSpacing: '-0.01em' }}
          >
            The Intellectual Architecture of Soullab
          </h1>
          <div
            className="space-y-4 text-amber-50/85 text-lg leading-relaxed"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            <p>
              Most AI systems are built to answer quickly. This one is built to stay with a question
              long enough for something real to form.
            </p>
            <p>
              Its structure is informed by traditions in psychology and philosophy that treat thinking
              as something that develops — not something to shortcut.
            </p>
          </div>
        </header>

        {/* What makes it different */}
        <section className="mb-16">
          <div className="border-t border-soul-border/30 pt-10">
            <p
              className="text-amber-50/80 leading-relaxed mb-4"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              Soullab's interaction model — how MAIA listens, what it asks, how it holds a thread
              across a conversation — draws from specific intellectual and contemplative traditions.
              Not as decoration. As architecture.
            </p>
            <p
              className="text-amber-50/80 leading-relaxed mb-4"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              The way MAIA responds, what it does and doesn't do, what it asks instead of answering:
              these choices come from somewhere. They reflect an understanding that genuine reflection
              follows a particular kind of logic, and that intelligence without structure is just noise
              that sounds organized.
            </p>
            <p
              className="text-amber-50/80 leading-relaxed mb-4"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              The traditions below shaped how the system was built. You don't need to know them to
              use it. But if you do know them, you'll recognize them at work.
            </p>
            <p
              className="text-amber-50/60 leading-relaxed text-sm"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              This structure is supported by a substantial body of source material — thousands of
              texts, manuals, and primary works across these fields. But the corpus is not the
              differentiator. What matters is how it was organized: around principles of inquiry, not
              around breadth of coverage. More information is not the point. Better thinking is.
            </p>
          </div>
        </section>

        {/* The Traditions */}
        <section className="mb-16">
          <h2
            className="text-sm uppercase tracking-widest text-amber-200/50 mb-10"
            style={{ letterSpacing: '0.15em' }}
          >
            The Traditions
          </h2>

          <div className="space-y-6">
            {traditions.map((tradition) => (
              <div
                key={tradition.title}
                className="rounded-xl border border-soul-border/25 bg-soul-surface/40 px-6 py-6"
              >
                <h3
                  className="text-maia-spice-300 text-lg font-light mb-3"
                  style={{ fontFamily: 'Spectral, Georgia, serif' }}
                >
                  {tradition.title}
                </h3>
                <p
                  className="text-amber-50/80 leading-relaxed mb-4 text-sm md:text-base"
                  style={{ fontFamily: 'Spectral, Georgia, serif' }}
                >
                  {tradition.description}
                </p>
                <p
                  className="text-amber-200/50 text-sm leading-relaxed"
                  style={{ fontFamily: 'Spectral, Georgia, serif', fontStyle: 'italic' }}
                >
                  Shows up as: {tradition.showsUpAs}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Honest Limits */}
        <section className="mb-16 border-t border-soul-border/30 pt-10">
          <h2
            className="text-sm uppercase tracking-widest text-amber-200/50 mb-6"
            style={{ letterSpacing: '0.15em' }}
          >
            Honest Limits
          </h2>
          <div
            className="space-y-3 text-amber-50/80 leading-relaxed"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            <p>
              This system is not a therapist, a teacher, or an authority. It can be wrong. It does
              not replace professional care or human wisdom.
            </p>
            <p>
              What it is: a space structured to support clearer thinking and genuine reflection —
              informed by traditions that have spent centuries learning what that actually requires.
            </p>
            <p className="text-amber-50/60 text-sm">
              If you are in crisis, please reach out to a qualified professional. This system is not
              built for clinical intervention, and it will tell you that directly if the situation
              calls for it.
            </p>
          </div>
        </section>

        {/* For Practitioners */}
        <section className="mb-16 border-t border-soul-border/30 pt-10">
          <h2
            className="text-sm uppercase tracking-widest text-amber-200/50 mb-6"
            style={{ letterSpacing: '0.15em' }}
          >
            For Practitioners
          </h2>
          <div
            className="space-y-4 text-amber-50/80 leading-relaxed"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            <p>
              If you work as a coach, therapist, or facilitator, you will recognize most of what's
              above. These are not novel ideas — they are foundational ones, applied with some care
              to how a conversational system behaves.
            </p>
            <p>
              The lineage is real. The Socratic stance, the phenomenological discipline, the
              developmental awareness — these are not rhetorical references. They shaped specific
              decisions about what MAIA does and refuses to do: why it asks rather than tells, why it
              stays in the user's register rather than importing its own, why it tracks continuity
              across sessions rather than treating each conversation as isolated, why it names
              formation rather than manufacturing resolution.
            </p>
            <p>
              Practitioners who work with clients will find that Soullab can function as a
              between-session space — a place where something that emerged in a session can continue
              to develop, where a question posed in a session can be held and turned. It is not a
              replacement for the therapeutic or coaching relationship. It is not trying to be. What
              it can be is a companion for the work that happens between sessions, when the
              practitioner is not there and the client is alone with what formed.
            </p>
            <p className="text-amber-50/60 text-sm">
              The artifact system in particular may be of interest: it surfaces and makes keepable
              the specific language a person uses to describe their own experience. That language —
              not the practitioner's formulation, not a clinical summary, but the person's own words
              — is often where the most useful work lives.
            </p>
          </div>
        </section>

        {/* Back link */}
        <div className="border-t border-soul-border/30 pt-8">
          <Link
            href="/maia"
            className="text-amber-200/50 hover:text-maia-spice-400 text-sm transition-colors duration-200"
            style={{ fontFamily: 'Spectral, Georgia, serif', letterSpacing: '0.04em' }}
          >
            Return to MAIA
          </Link>
        </div>

      </div>
    </div>
  );
}
