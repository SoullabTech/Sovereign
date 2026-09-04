'use client';

/**
 * DiscussWithMaia — bring a reflection back into conversation.
 *
 * A reflection is something the member already kept. This section lets them
 * reopen it WITH MAIA rather than only re-read it alone.
 *
 * ── DESIGN CONSTRAINTS (canon, not preference) ─────────────────────────────
 *
 * 1. NO INTERPRETATION IS MANUFACTURED. MAIA is not asked what the reflection
 *    means, and this section renders no reading of it. The member names the
 *    question; the openings below are invitations, never conclusions. Every one
 *    of them is a question the MEMBER puts, not an observation MAIA offers.
 *
 * 2. THE MEMBER SEES EXACTLY WHAT TRAVELS. The full message is rendered in an
 *    editable field before it is sent — title and summary included — and can be
 *    edited or emptied. Nothing about the reflection reaches MAIA that the
 *    member has not read first. The raw source excerpt (the original transcript)
 *    is deliberately NOT carried: the member kept a distillation, and only the
 *    distillation travels unless they type more themselves.
 *
 * 3. NO NEW PERSISTENCE. This writes nothing. It uses the existing one-shot
 *    seed-prompt channel (lib/maia/seedPrompt), the same mechanism the
 *    Relational Field and Guide already use, and hands the member a return path
 *    back to this reflection.
 *
 * Growth-obligation answers (CLAUDE.md): the uncertainty preserved is WHAT THE
 * REFLECTION MEANS — that stays with the member and is never pre-answered here.
 * Provenance is visible (the message names the reflection it came from, and the
 * member reads it before it moves). The responsibility created is transparency
 * of transfer, which is why the preview is editable rather than hidden.
 */

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { seedMaiaPrompt } from '@/lib/maia/seedPrompt';
import type { CapsuleDTO } from '@/lib/capsules/types';

/**
 * Openings the member can take. Each is a QUESTION THE MEMBER ASKS — never a
 * claim about them, their state, or what the reflection reveals.
 */
const OPENINGS: { key: string; label: string; line: string }[] = [
  {
    key: 'still-true',
    label: 'Is this still true?',
    line: "I want to look at whether this still holds for me now.",
  },
  {
    key: 'stuck',
    label: "What I haven't moved on",
    line: "Something here hasn't moved. I'd like to talk about that.",
  },
  {
    key: 'next',
    label: 'Where this goes next',
    line: "I'd like to think about where this goes from here.",
  },
  {
    key: 'unfinished',
    label: "What's unfinished",
    line: "There's something unfinished in this I'd like to sit with.",
  },
];

function reflectionContext(capsule: CapsuleDTO): string {
  const lines = [`A reflection I kept — "${capsule.title}"`];
  if (capsule.summary) lines.push('', capsule.summary);
  return lines.join('\n');
}

export interface DiscussWithMaiaProps {
  capsule: CapsuleDTO;
}

export default function DiscussWithMaia({ capsule }: DiscussWithMaiaProps) {
  const router = useRouter();
  const context = useMemo(() => reflectionContext(capsule), [capsule]);
  const [opening, setOpening] = useState<string | null>(null);
  const [message, setMessage] = useState(context);

  const chooseOpening = (key: string, line: string) => {
    // Selecting an opening replaces the previous one, never stacks them.
    setOpening(key);
    setMessage(`${context}\n\n${line}`);
  };

  const discuss = () => {
    const prompt = message.trim();
    if (!prompt) return;
    // seedMaiaPrompt, not seedFromSource: the registry's generic label and
    // return path would override the ones that matter here — this reflection's
    // own title, and the way back to THIS reflection rather than the feed.
    seedMaiaPrompt({
      prompt,
      source: 'reflections:capsule',
      sourceLabel: capsule.title,
      returnTo: `/reflections/${capsule.id}`,
      contextId: capsule.id,
    });
    router.push('/maia');
    router.refresh();
  };

  return (
    <section className="mt-6 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-4 h-4 text-[#5a7a6f]" />
        <h3 className="text-[13px] font-medium text-stone-700 uppercase tracking-wide">
          Discuss this with MAIA
        </h3>
      </div>
      <p className="text-stone-500 text-[13px] leading-relaxed mb-5">
        Bring this reflection back into conversation. You choose what to ask — MAIA has not
        read anything into it.
      </p>

      {/* Openings — the member's questions, not MAIA's observations */}
      <div className="flex flex-wrap gap-2 mb-4">
        {OPENINGS.map((o) => (
          <button
            key={o.key}
            onClick={() => chooseOpening(o.key, o.line)}
            className={`px-3 py-1.5 rounded-lg text-[12px] tracking-wide transition-all border ${
              opening === o.key
                ? 'bg-[#5a7a6f] text-white border-[#5a7a6f]'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* What travels — visible and editable before it moves */}
      <label className="block text-[11px] uppercase tracking-wide text-stone-400 mb-2">
        What MAIA will receive
      </label>
      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          setOpening(null);
        }}
        rows={6}
        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 text-[14px] leading-relaxed placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a7a6f]/20 focus:border-[#5a7a6f] resize-y"
        placeholder="Write what you want to bring to MAIA…"
      />
      <p className="mt-2 text-[12px] text-stone-400 leading-relaxed">
        Edit or clear this before sending. Only what you see here travels — the original
        conversation excerpt stays here.
      </p>

      <button
        onClick={discuss}
        disabled={!message.trim()}
        className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#5a7a6f] hover:bg-[#4a6a5f] disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl text-[13px] tracking-wide transition-colors"
      >
        Discuss with MAIA
        <ArrowRight className="w-4 h-4" />
      </button>
    </section>
  );
}
