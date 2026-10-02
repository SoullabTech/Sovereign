'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FacetCarryNotice, type FacetCarryRef } from '@/components/house/FacetCarryNotice';
import styles from './changes-threshold.module.css';

interface NameYourChangeProps {
  onNext: (title: string, description: string, changeType: string) => void;
  onBack: () => void;
  initialTitle?: string;
  initialDescription?: string;
  initialChangeType?: string;
  carrySourceRef?: FacetCarryRef | null;
  carrySourceReady?: boolean;
  onCarryResolved?: (source: unknown | null) => void;
}

const CHANGE_TYPES = [
  ['dissolution', 'Dissolution', 'Something is ending, loosening, or falling away.'],
  ['emergence', 'Emergence', 'Something new is beginning to take form.'],
  ['threshold', 'Threshold', 'You are at a crossing and the next side is not yet clear.'],
  ['integration', 'Integration', 'Pieces of experience are beginning to come together.'],
  ['upheaval', 'Upheaval', 'The ground itself feels disrupted or reorganized.'],
  ['ripening', 'Ripening', 'Something has been developing and is reaching fullness.'],
] as const;

export default function NameYourChange({
  onNext,
  initialTitle = '',
  initialDescription = '',
  initialChangeType = '',
  carrySourceRef = null,
  carrySourceReady = true,
  onCarryResolved,
}: NameYourChangeProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [changeType, setChangeType] = useState(initialChangeType);
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => titleRef.current?.focus(), 100);
    return () => window.clearTimeout(timer);
  }, []);

  const wordsExist = title.trim().length > 0 && description.trim().length > 0;
  const canContinue = wordsExist && changeType.length > 0 && (!carrySourceRef || carrySourceReady) && !submitting;

  function handleContinue() {
    if (!canContinue) return;
    setSubmitting(true);
    onNext(title.trim(), description.trim(), changeType);
  }

  return (
    <section className={styles.naming} aria-label="Name a Change">
      <div className={styles.namingIntro}>
        <p className={styles.kicker}>BEGIN WITH WHAT YOU KNOW</p>
        <h1>What is changing?</h1>
        <p>
          You do not need the right interpretation. Start with the movement itself — what you can actually feel, see, or name.
        </p>
      </div>

      {carrySourceRef ? (
        <div className={styles.carryWrap}>
          <FacetCarryNotice
            targetFacet="changes"
            sourceRef={carrySourceRef}
            onResolved={onCarryResolved}
          />
        </div>
      ) : null}

      <div className={styles.namingPaper}>
        <label className={styles.fieldLabel} htmlFor="change-title">In a few words</label>
        <input
          ref={titleRef}
          id="change-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Something in my work is changing…"
          maxLength={100}
        />

        <label className={styles.fieldLabel} htmlFor="change-description">What is actually happening?</label>
        <textarea
          id="change-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe what you notice. You can be uncertain, incomplete, contradictory, or still finding the words."
          rows={7}
        />

        <p className={styles.namingHelp}>
          Nothing here needs to be resolved before it belongs.
        </p>
      </div>

      <div className={styles.kindThreshold} data-open={wordsExist ? 'true' : 'false'}>
        {!wordsExist ? (
          <p>Once you have named the movement in your own words, you can choose a loose orientation for it.</p>
        ) : (
          <>
            <div className={styles.kindHead}>
              <div>
                <small>ONLY IF IT HELPS</small>
                <h2>What kind of movement does this feel closest to?</h2>
              </div>
              <p>This is an orientation, not a diagnosis.</p>
            </div>

            <div className={styles.kindGrid}>
              {CHANGE_TYPES.map(([type, label, line]) => (
                <button
                  type="button"
                  key={type}
                  data-active={changeType === type ? 'true' : 'false'}
                  onClick={() => setChangeType(type)}
                >
                  <strong>{label}</strong>
                  <span>{line}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.namingAction}>
        <div>
          <small>{changeType ? 'READY TO KEEP' : 'NOTHING IS KEPT YET'}</small>
          <p>{changeType ? 'This creates a Change you can return to over time.' : 'Your words stay here until you choose an orientation and keep them.'}</p>
        </div>
        <button type="button" disabled={!canContinue} onClick={handleContinue}>
          {submitting ? <Loader2 className={styles.spinner} aria-hidden="true" /> : null}
          Keep this Change
        </button>
      </div>
    </section>
  );
}
