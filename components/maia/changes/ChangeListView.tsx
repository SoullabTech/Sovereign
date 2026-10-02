'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ChangeRecord } from '@/lib/studio/changes/types';
import styles from './changes-threshold.module.css';

interface ChangeListViewProps {
  memberId: string;
  onSelect: (changeId: string) => void;
  onCreate: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  dissolution: 'Dissolution',
  emergence: 'Emergence',
  threshold: 'Threshold',
  integration: 'Integration',
  upheaval: 'Upheaval',
  ripening: 'Ripening',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ChangeListView({ memberId, onSelect, onCreate }: ChangeListViewProps) {
  const [changes, setChanges] = useState<Array<ChangeRecord & { experienceCount?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    async function fetchChanges() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch('/api/changes');
        if (!response.ok) throw new Error('Failed to load changes');
        const data = await response.json();
        if (live) setChanges(data.changes || []);
      } catch {
        if (live) setError('Changes could not be gathered just now.');
      } finally {
        if (live) setLoading(false);
      }
    }
    void fetchChanges();
    return () => { live = false; };
  }, [memberId]);

  return (
    <div className={styles.threshold}>
      <div className={styles.thresholdTop}>
        <div>
          <p className={styles.kicker}>THE CHANGES ROOM</p>
          <h1>Stay close to what is moving.</h1>
          <p className={styles.lead}>
            Name what is shifting, notice what happens, and return as the movement becomes clearer over time.
          </p>
        </div>

        <aside className={styles.maiaQuiet} aria-label="MAIA presence">
          <div className={styles.maiaQuietHead}>
            <span className={styles.orb} aria-hidden="true" />
            <strong>MAIA</strong>
          </div>
          <p>Available when invited — to help you stay with what is changing.</p>
        </aside>
      </div>

      <div className={styles.begin}>
        <button type="button" className={styles.beginCard} onClick={onCreate}>
          <small>BEGIN</small>
          <h2>Name a new Change</h2>
          <p>
            Give enough form to what is shifting that you can return to it without having to know what it means yet.
          </p>
          <span className={styles.beginAction}><span>What is changing?</span><span>→</span></span>
        </button>

        <section className={styles.orientation}>
          <small>THIS ROOM IS FOR</small>
          <h3>Movement, not management.</h3>
          <p>
            A Change can gather lived moments, symbolic consultation, conversation with MAIA, and meaning over time — without becoming a task to complete.
          </p>
        </section>
      </div>

      <section className={styles.continue} aria-label="Your Changes">
        <div className={styles.continueHead}>
          <div>
            <small>YOUR CHANGES</small>
            <h2>Continue what is already unfolding</h2>
          </div>
          <p>Return without starting over.</p>
        </div>

        {loading ? (
          <div className={styles.loading}><Loader2 className={styles.spinner} aria-hidden="true" /></div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : changes.length === 0 ? (
          <div className={styles.empty}>
            <div>
              <h3>No Changes are being held yet.</h3>
              <p>When something begins to shift, this is a place to stay in relationship with it rather than rush toward an answer.</p>
            </div>
          </div>
        ) : (
          <div className={styles.changeGrid}>
            {changes.map((change) => (
              <button type="button" className={styles.changeCard} key={change.id} onClick={() => onSelect(change.id)}>
                <div className={styles.changeMeta}>
                  <span className={styles.changeType}>{TYPE_LABELS[change.changeType] || change.changeType}</span>
                  <span className={styles.changeDate}>{formatDate(change.updatedAt || change.createdAt)}</span>
                </div>
                <h3>{change.title}</h3>
                <p>{change.description}</p>
                <div className={styles.changeFoot}>
                  <span>{change.experienceCount || 0} kept moment{change.experienceCount === 1 ? '' : 's'}</span>
                  <b>Open this Change →</b>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
