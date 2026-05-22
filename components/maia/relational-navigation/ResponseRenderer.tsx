'use client';

/**
 * Renders MAIA's structured response.
 *
 * Invariant: the rendering preserves the four-register distinction
 * (known / felt / inferred / unknown) and ALWAYS shows the closing that
 * returns authority to the member. The "what remains unknown" section is
 * styled with the same weight as the other sections — it is not a footnote.
 */

import { motion } from 'framer-motion';
import type {
  FlowRefusal,
  FlowResponse,
  IntegrateResponse,
  PrepareResponse,
} from '@/lib/maia/relationalNavigation/types';

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

interface ResponseRendererProps {
  response?: FlowResponse;
  refusal?: FlowRefusal;
  degradedText?: string;
}

export function ResponseRenderer({
  response,
  refusal,
  degradedText,
}: ResponseRendererProps) {
  if (refusal) {
    return <RefusalView refusal={refusal} />;
  }
  if (degradedText) {
    return (
      <motion.div {...fadeUp} className="rounded-2xl bg-white/60 border border-stone-200 p-6">
        <p className="text-[15px] leading-relaxed text-stone-700 whitespace-pre-wrap">
          {degradedText}
        </p>
      </motion.div>
    );
  }
  if (!response) return null;
  if (response.mode === 'prepare') {
    return <PrepareView response={response} />;
  }
  return <IntegrateView response={response} />;
}

function Section({
  title,
  children,
  tone = 'default',
}: {
  title: string;
  children: React.ReactNode;
  tone?: 'default' | 'unknown' | 'closing';
}) {
  const palette =
    tone === 'unknown'
      ? 'border-amber-300/40 bg-amber-50/40'
      : tone === 'closing'
        ? 'border-[#5a7a6f]/30 bg-[#5a7a6f]/8'
        : 'border-stone-200 bg-white/60';
  return (
    <motion.section {...fadeUp} className={`rounded-2xl border ${palette} p-6`}>
      <h3 className="text-xs font-medium tracking-[0.12em] text-stone-500 uppercase mb-3">
        {title}
      </h3>
      <div className="text-[15px] leading-relaxed text-stone-700">
        {children}
      </div>
    </motion.section>
  );
}

function PrepareView({ response }: { response: PrepareResponse }) {
  return (
    <div className="space-y-4">
      <Section title="What I heard you naming">
        <p>{response.mirror}</p>
      </Section>

      <Section title="Your intention, as you named it">
        <p>{response.clarifiedIntention}</p>
      </Section>

      <Section title="A few possible approaches">
        <ul className="space-y-3 list-none">
          {response.approaches.map((a, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-stone-400 mt-1">·</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="A possible opening (a draft, not a script)">
        <p className="italic text-stone-700">&ldquo;{response.possibleOpening}&rdquo;</p>
      </Section>

      <Section title="Before you go in">
        <p>{response.nervousSystemCheck}</p>
      </Section>

      <Section title="What you wanted to stay true to">
        <p>{response.boundariesAndSupport}</p>
      </Section>

      <KnowFeltInferredUnknownView kfiu={response.knowFeltInferredUnknown} />

      <Section title="Yours to choose" tone="closing">
        <p>{response.closing}</p>
      </Section>
    </div>
  );
}

function IntegrateView({ response }: { response: IntegrateResponse }) {
  return (
    <div className="space-y-4">
      <Section title="What I heard you naming">
        <p>{response.mirror}</p>
      </Section>

      <Section title="Possible readings — each one provisional">
        <ul className="space-y-3 list-none">
          {response.possibleReadings.map((r, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-stone-400 mt-1">·</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] text-stone-500 italic">
          Each of these is one possibility, not the truth of what happened. You
          may want to check directly with them.
        </p>
      </Section>

      <Section title="What belongs to you">
        <p>{response.whatBelongsToYou}</p>
      </Section>

      <Section title="What remains unknown" tone="unknown">
        <p>{response.whatRemainsUnknown}</p>
      </Section>

      <Section title="Some options, if you want one">
        <ul className="space-y-3 list-none">
          {response.nextStepOptions.map((opt, i) => (
            <li key={i} className="rounded-xl bg-stone-50/60 border border-stone-200/70 p-4">
              <div className="text-[12px] uppercase tracking-wide text-stone-500 mb-1">
                {opt.kind}
              </div>
              <div className="text-[14px] font-medium text-stone-800 mb-1">
                {opt.label}
              </div>
              <div className="text-[14px] text-stone-600 leading-relaxed">
                {opt.description}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <KnowFeltInferredUnknownView kfiu={response.knowFeltInferredUnknown} />

      <Section title="Yours to choose" tone="closing">
        <p>{response.closing}</p>
      </Section>
    </div>
  );
}

function KnowFeltInferredUnknownView({
  kfiu,
}: {
  kfiu: {
    known: string;
    felt: string;
    inferred: string;
    unknown: string;
  };
}) {
  return (
    <motion.section
      {...fadeUp}
      className="rounded-2xl border border-stone-200 bg-stone-50/40 p-6"
    >
      <h3 className="text-xs font-medium tracking-[0.12em] text-stone-500 uppercase mb-4">
        Holding the distinction
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
        <div>
          <dt className="text-[12px] uppercase tracking-wide text-stone-500 mb-1">
            Known
          </dt>
          <dd className="text-stone-700 leading-relaxed">{kfiu.known}</dd>
        </div>
        <div>
          <dt className="text-[12px] uppercase tracking-wide text-stone-500 mb-1">
            Felt
          </dt>
          <dd className="text-stone-700 leading-relaxed">{kfiu.felt}</dd>
        </div>
        <div>
          <dt className="text-[12px] uppercase tracking-wide text-stone-500 mb-1">
            Inferred (provisional)
          </dt>
          <dd className="text-stone-700 leading-relaxed">{kfiu.inferred}</dd>
        </div>
        <div>
          <dt className="text-[12px] uppercase tracking-wide text-stone-500 mb-1">
            Unknown
          </dt>
          <dd className="text-stone-700 leading-relaxed">{kfiu.unknown}</dd>
        </div>
      </dl>
    </motion.section>
  );
}

function RefusalView({ refusal }: { refusal: FlowRefusal }) {
  return (
    <motion.div
      {...fadeUp}
      className="rounded-2xl border border-stone-300 bg-white/70 p-6 space-y-4"
    >
      <h3 className="text-xs font-medium tracking-[0.12em] text-stone-500 uppercase">
        A small reframe
      </h3>
      <p className="text-[15px] leading-relaxed text-stone-700">
        {refusal.reframe}
      </p>
      <p className="text-[15px] leading-relaxed text-stone-600">
        {refusal.invitation}
      </p>
    </motion.div>
  );
}
