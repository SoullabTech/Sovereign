'use client';

/**
 * W2 — THE FORMULATION COMPOSER. ⛔ Wording only.
 *
 * ⭐⭐ WHAT IT IS FOR. Until now the writer could only receive. This is where
 * they answer in kind: *"no — I'd write it this way"* — and their sentence
 * becomes part of the authored lineage rather than temporary textarea state.
 *
 * ── ⛔ WHAT IT IS NOT ──────────────────────────────────────────────────────
 *
 * ⛔ NOT A CHAT BOX. Before W5 a question has no Discourse home and an
 * instruction has no Direction home, so a field inviting either would collect a
 * sovereign act the system cannot receive — and, worse, the sentence would land
 * in `replacementText` and become candidate manuscript text.
 *
 * ⭐ WE CANNOT STOP SOMEBODY TYPING A QUESTION HERE, AND WE DO NOT TRY. There
 * is deliberately NO CLASSIFIER guessing whether a sentence "sounds like" a
 * question — a guess would refuse real prose that happens to end in a question
 * mark, which is a writer's sentence to write. ⭐ The protection is that the
 * surface and the API tell the truth about the act: *what you submit here
 * becomes candidate manuscript wording.*
 *
 * ⛔ AND IT IS NOT PREFILLED FROM MAIA'S VERSION. The contract distinguishes
 * *adopting MAIA's wording* (an authorization binding HER version) from
 * *authoring your own* (a member version). Putting her words in a box labelled
 * "Your version" would manufacture that ambiguity in the one place it must stay
 * legible. The writer may deliberately author identical text — the substrate
 * permits it — but the UI will not do it for them.
 *
 * ⛔ AND IT MOUNTS NOTHING. W3 assembles this with the thread and the
 * manuscript; W1's surface stays read-only rather than becoming the stateful
 * container, so its proved property survives the acts that come after it.
 */

import { useState } from 'react';
import { authorLabel } from '@/lib/writersStudio/editorialThread';

export interface ComposerTarget {
  readonly versionId: string;
  readonly author: 'maia' | 'member';
  readonly ordinal: number;
}

export type ComposerSubmit = (input: {
  supersedes: string;
  replacementText: string;
}) => Promise<{ ok: true } | { ok: false; reason: string }>;

const DIM = 'rgba(255,255,255,0.52)';
const RULE = 'rgba(255,255,255,0.10)';

/** Plain, and never reassuring: the exchange really did move. */
function refusalCopy(reason: string): string {
  switch (reason) {
    case 'not_successor_of_head':
      return 'A newer version was added while you were writing, so this no longer '
        + 'follows the version you answered. Your words are kept below.';
    case 'simultaneous_append':
      return 'Another version landed at the same moment. Your words are kept below.';
    case 'version_exists':
      return 'That version already exists. Your words are kept below.';
    default:
      return 'This version could not be added. Your words are kept below.';
  }
}

export function VersionComposer(
  { target, onSubmit }: { target: ComposerTarget; onSubmit: ComposerSubmit },
) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    setBusy(true); setRefusal(null);
    /* ⛔ `supersedes` is the version the writer ACTED AGAINST, carried exactly.
       ⛔ No head lookup, no substitution, and — on refusal — NO RETRY. Machine
       timing must never author the relationship. */
    const r = await onSubmit({ supersedes: target.versionId, replacementText: text });
    /* ⭐ The draft survives a refusal. Discarding words nobody has seen because
       the exchange moved would punish the writer for our timing. */
    if (!r.ok) setRefusal(r.reason);
    setBusy(false);
  };

  return (
    <section style={{ borderTop: `1px solid ${RULE}`, paddingTop: 20 }}>
      <h3 style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.10em', textTransform: 'uppercase' }}>
        Your version
      </h3>
      {/* ⭐ The label says what the act IS. This is the whole protection. */}
      <p style={{ margin: '0 0 12px', fontSize: 14, color: DIM, lineHeight: 1.6 }}>
        Write the wording you would put in the manuscript.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        spellCheck
        style={{
          width: '100%', padding: 12, fontSize: 16, lineHeight: 1.65,
          color: 'inherit', background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${RULE}`, borderRadius: 4, resize: 'vertical',
        }}
      />

      {/* ⭐ The relationship is stated before submission, not discovered after. */}
      <p style={{ margin: '12px 0 0', fontSize: 13, color: DIM }}>
        {'Your version follows: '}
        <span style={{ color: 'inherit' }}>
          {`${authorLabel(target.author)} · Version ${target.ordinal}`}
        </span>
      </p>

      {refusal !== null && (
        <p role="status" style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.6 }}>
          {refusalCopy(refusal)}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        style={{
          marginTop: 16, padding: '10px 18px', fontSize: 12, fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'inherit', background: 'transparent',
          border: `1px solid ${RULE}`, borderRadius: 3, cursor: 'pointer',
        }}
      >
        Add my version
      </button>
    </section>
  );
}
