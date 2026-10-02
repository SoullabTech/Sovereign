'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  WriterUnderstanding,
  WriterUnderstandingDraft,
} from '@/lib/writersStudio/writerUnderstanding';

type ListKey =
  | 'preserve'
  | 'centralIdeas'
  | 'intentionalAmbiguity'
  | 'challengeMeOn'
  | 'nonNegotiables'
  | 'unresolvedIntentions';

const LIST_LABELS: ReadonlyArray<{ key: ListKey; label: string; help: string }> = [
  { key: 'preserve', label: 'What I most want preserved', help: 'Qualities, meanings, rhythms, images, or relationships you do not want editing to flatten.' },
  { key: 'centralIdeas', label: 'Central ideas and distinctions', help: 'Ideas MAIA should keep distinct rather than blending together.' },
  { key: 'intentionalAmbiguity', label: 'Intentional ambiguity', help: 'Places where openness, mystery, tension, or more than one meaning is deliberate.' },
  { key: 'challengeMeOn', label: 'Challenge me on', help: 'Patterns or habits you explicitly want MAIA to question rather than protect.' },
  { key: 'nonNegotiables', label: 'Non-negotiables', help: 'Commitments that should not be treated as ordinary editorial variables.' },
  { key: 'unresolvedIntentions', label: 'Still unresolved', help: 'Questions you are genuinely undecided about. MAIA should hold these open.' },
];

const lines = (value: readonly string[]) => value.join('\n');
const split = (value: string) => value.split('\n').map((x) => x.trim()).filter(Boolean);

function draftOf(value: WriterUnderstanding): WriterUnderstandingDraft {
  return {
    becoming: value.becoming,
    preserve: [...value.preserve],
    readerRelationship: value.readerRelationship,
    centralIdeas: [...value.centralIdeas],
    voiceCadence: value.voiceCadence,
    intentionalAmbiguity: [...value.intentionalAmbiguity],
    challengeMeOn: [...value.challengeMeOn],
    nonNegotiables: [...value.nonNegotiables],
    unresolvedIntentions: [...value.unresolvedIntentions],
  };
}

export default function P4R1WriterUnderstanding({
  value,
  busy,
  error,
  onSave,
}: {
  value: WriterUnderstanding;
  busy: boolean;
  error: string | null;
  onSave: (draft: WriterUnderstandingDraft) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<WriterUnderstandingDraft>(() => draftOf(value));

  useEffect(() => {
    if (!editing) setDraft(draftOf(value));
  }, [value, editing]);

  const populated = useMemo(() => {
    const d = draftOf(value);
    return Boolean(
      d.becoming || d.readerRelationship || d.voiceCadence
      || d.preserve.length || d.centralIdeas.length || d.intentionalAmbiguity.length
      || d.challengeMeOn.length || d.nonNegotiables.length || d.unresolvedIntentions.length
    );
  }, [value]);

  return (
    <section className="fr-card p4r1-writer-understanding" data-writer-understanding>
      <div className="p4r1-wu-head">
        <div>
          <span className="p4r1-eyebrow">Author-declared context</span>
          <h3>MAIA’s understanding of your writing</h3>
          <p>Visible, correctable, and yours. MAIA may use this context when interpreting the Work, but cannot change it for you.</p>
        </div>
        <button type="button" onClick={() => setEditing((x) => !x)}>
          {editing ? 'Close' : populated ? 'Review / edit' : 'Shape this understanding'}
        </button>
      </div>

      {value.workPurpose?.trim() ? (
        <div className="p4r1-wu-purpose">
          <span>From your Work purpose</span>
          <p>{value.workPurpose}</p>
        </div>
      ) : null}

      {!editing ? (
        <div className="p4r1-wu-summary">
          {value.becoming ? <div><b>What this Work is becoming</b><p>{value.becoming}</p></div> : null}
          {value.readerRelationship ? <div><b>Reader relationship</b><p>{value.readerRelationship}</p></div> : null}
          {value.voiceCadence ? <div><b>Voice and cadence</b><p>{value.voiceCadence}</p></div> : null}
          {LIST_LABELS.map(({ key, label }) => value[key].length ? (
            <div key={key}><b>{label}</b><p>{value[key].join(' · ')}</p></div>
          ) : null)}
          {!populated ? <p className="p4r1-wu-empty">Nothing beyond the Work purpose has been declared yet.</p> : null}
        </div>
      ) : (
        <div className="p4r1-wu-editor">
          <label>
            <b>What is this Work trying to become?</b>
            <textarea
              value={draft.becoming ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, becoming: e.target.value || null }))}
            />
          </label>
          <label>
            <b>What relationship do you want with the reader?</b>
            <textarea
              value={draft.readerRelationship ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, readerRelationship: e.target.value || null }))}
            />
          </label>
          <label>
            <b>How would you describe the voice and cadence you want to keep?</b>
            <textarea
              value={draft.voiceCadence ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, voiceCadence: e.target.value || null }))}
            />
          </label>
          {LIST_LABELS.map(({ key, label, help }) => (
            <label key={key}>
              <b>{label}</b>
              <span>{help} One item per line.</span>
              <textarea
                value={lines(draft[key])}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: split(e.target.value) }))}
              />
            </label>
          ))}
          <div className="p4r1-wu-actions">
            <button type="button" disabled={busy} onClick={() => onSave(draft)}>
              {busy ? 'Saving…' : 'Save my understanding'}
            </button>
            <span>Only your explicit Save changes this record.</span>
          </div>
          {error ? <p className="p4r1-error" role="status">{error}</p> : null}
        </div>
      )}
    </section>
  );
}
