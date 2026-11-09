'use client';

/**
 * The MAIA dock of the Pro cockpit: one place to ask, whatever is open.
 *
 * It follows the astrologer: by default it is on the open chart and knows the
 * view and point in front of them; an instrument's "Ask MAIA about…" button
 * points it at that instrument's subject instead. Ask reads the chart with
 * the astrologer; Mentor teaches the technique and uses the chart only as an
 * example. The rules of Ask MAIA are unchanged: MAIA is told whose charts it
 * will read before anything is sent, gets calculated facts only, and nothing
 * is kept.
 */
import { Sparkles, PanelRightClose } from 'lucide-react';
import type { ProAskMode, ProAskSection } from '@/lib/astrology/proAskMaiaSections';
import { usePanelState } from './panelMemory';
import { useMaiaDock } from './maiaDock';
import { ProAskMaiaConversation } from './ProAskMaiaPanel';
import styles from './pro-cockpit.module.css';

export default function ProMaiaDock({ chartOpen, whereLabel, preferSections }: {
  /** False until a chart is open and verified: MAIA has nothing to read. */
  chartOpen: boolean;
  /** The view the astrologer has open, in their words: "Aspect grid". */
  whereLabel: string | null;
  /** Sections the open view would rather MAIA were on, when an instrument offers one. */
  preferSections: readonly ProAskSection[];
}) {
  const dock = useMaiaDock();
  const [mode, setMode] = usePanelState<ProAskMode>('dock.mode', 'ask');
  if (!dock || !dock.open) return null;

  const all = [...dock.subjects.values()];
  const pointed = dock.focusKey ? dock.subjects.get(dock.focusKey) : undefined;
  const subject = pointed
    ?? all.find((s) => preferSections.includes(s.request.section))
    ?? all.find((s) => s.request.section === 'natal')
    ?? all[0];
  const onNatal = subject?.request.section === 'natal';

  return (
    <aside className={styles.dock} aria-label="MAIA">
      <div className={styles.dockHead}>
        <span className={styles.dockTitle}><Sparkles size={17} aria-hidden="true" /> MAIA</span>
        <div className={styles.segment} role="group" aria-label="How MAIA answers">
          <button type="button" aria-pressed={mode === 'ask'} onClick={() => setMode('ask')}>Ask</button>
          <button type="button" aria-pressed={mode === 'mentor'} onClick={() => setMode('mentor')}>Mentor</button>
        </div>
        <button type="button" className={styles.iconButton} aria-label="Hide MAIA" title="Hide MAIA (M)"
          onClick={() => dock.setOpen(false)}>
          <PanelRightClose size={17} aria-hidden="true" />
        </button>
      </div>

      {!chartOpen || !subject ? (
        <p className={styles.dockEmpty}>
          Open a chart and MAIA can read it with you. Until then there is nothing for MAIA to see.
        </p>
      ) : (
        <>
          <div className={styles.dockAbout}>
            <span>About</span>
            {all.length > 1 ? (
              <select aria-label="What MAIA is reading" value={subject.key}
                onChange={(event) => dock.focus(event.target.value)}>
                {all.map((s) => <option key={s.key} value={s.key}>{s.subjectLabel}</option>)}
              </select>
            ) : <strong>{subject.subjectLabel}</strong>}
            {pointed && !onNatal && (
              <button type="button" onClick={() => dock.focus(null)}>Follow me</button>
            )}
          </div>
          {onNatal && (whereLabel || subject.request.point) && (
            <p className={styles.dockWhere}>
              You have {whereLabel ?? 'the chart'} open{subject.request.point ? `, with ${subject.request.point} selected` : ''}.
              MAIA is told that, so you can say “this”.
            </p>
          )}
          <p className={styles.dockMode}>
            {mode === 'mentor'
              ? 'Mentor teaches the technique and uses this chart only as an example.'
              : 'Ask reads the chart with you.'}
          </p>
          <div className={styles.dockBody}>
            <ProAskMaiaConversation key={subject.key} request={subject.request} readsWhose={subject.readsWhose} mode={mode} />
          </div>
        </>
      )}
    </aside>
  );
}
