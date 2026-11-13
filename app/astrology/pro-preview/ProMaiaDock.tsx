'use client';

/**
 * The cockpit's conversation with MAIA (founder direction 2026-11-09: "part of
 * an interactive conversation rather than pushed into a side bar").
 *
 * After the pattern of Writer's Studio's conversation stage: when the
 * astrologer talks with MAIA, the conversation takes the working area beside
 * the wheel — what it is about pinned at the top with the way back to the
 * tools, the thread beneath it, the ways in and the box to ask at the foot.
 * Unlike the Studio, MAIA does not speak first here: nothing of a chart goes
 * to MAIA until the astrologer asks.
 *
 * It follows the astrologer: by default it is on the open chart and knows the
 * view and point in hand; an instrument's "Talk with MAIA about…" button
 * brings its own subject. Ask reads the chart with the astrologer; Mentor
 * teaches the technique and uses the chart only as an example.
 *
 * "How do I…?" (ASTRO-PRO-MAIA-GUIDE-R2, founder ruling D-03 A) reads no chart:
 * it is the stage's content before a chart is open, and the third mode beside
 * Ask and Mentor when one is. It sends only the question (ProMaiaHelp.tsx).
 */
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { ProAskMode, ProAskSection } from '@/lib/astrology/proAskMaiaSections';
import { usePanelState } from './panelMemory';
import { useMaiaDock, type MaiaSubject } from './maiaDock';
import { ProAskMaiaConversation } from './ProAskMaiaPanel';
import { ProHelpConversation, type HelpExchange } from './ProMaiaHelp';
import styles from './pro-cockpit.module.css';

/** The subject the conversation is on: the one pointed at, else the open view's, else the chart. */
export function maiaSubjectInHand(
  subjects: ReadonlyMap<string, MaiaSubject>, focusKey: string | null, preferSections: readonly ProAskSection[],
): MaiaSubject | undefined {
  const all = [...subjects.values()];
  return (focusKey ? subjects.get(focusKey) : undefined)
    ?? all.find((s) => preferSections.includes(s.request.section))
    ?? all.find((s) => s.request.section === 'natal')
    ?? all[0];
}

export default function ProMaiaStage({ chartOpen, whereLabel, preferSections }: {
  /** False until a chart is open and verified: MAIA has nothing to read. */
  chartOpen: boolean;
  /** The view the astrologer has open, in their words: "Chart · Aspects". */
  whereLabel: string | null;
  /** Sections the open view would rather MAIA were on, when an instrument offers one. */
  preferSections: readonly ProAskSection[];
}) {
  const dock = useMaiaDock();
  const [mode, setMode] = usePanelState<ProAskMode | 'help'>('dock.mode', 'ask');
  const [helpQuestion, setHelpQuestion] = useState('');
  const [helpExchanges, setHelpExchanges] = useState<HelpExchange[]>([]);
  if (!dock || !dock.open) return null;

  const all = [...dock.subjects.values()];
  const subject = maiaSubjectInHand(dock.subjects, dock.focusKey, preferSections);
  const onNatal = subject?.request.section === 'natal';

  return (
    <section className={styles.maia} aria-label="Conversation with MAIA">
      <header className={styles.maiaHead}>
        <button type="button" className={styles.back} onClick={() => dock.setOpen(false)} title="Back to the tools (M)">
          <ArrowLeft size={16} aria-hidden="true" /> Back to the tools
        </button>
        <span className={styles.maiaTitle}><Sparkles size={18} aria-hidden="true" /> MAIA</span>
        {chartOpen && subject && <div className={styles.segment} role="group" aria-label="How MAIA answers">
          <button type="button" aria-pressed={mode === 'ask'} onClick={() => setMode('ask')}
            title="Ask reads the chart with you">Ask</button>
          <button type="button" aria-pressed={mode === 'mentor'} onClick={() => setMode('mentor')}
            title="Mentor teaches the technique and uses this chart only as an example">Mentor</button>
          <button type="button" aria-pressed={mode === 'help'} onClick={() => setMode('help')}
            title="How do I…? answers questions about the workstation and reads no chart">How do I…?</button>
        </div>}
      </header>

      {!chartOpen || !subject ? (
        <div className={styles.maiaColumn}>
          <p className={styles.maiaEmpty}>
            Open a chart and MAIA can read it with you. Until then there is nothing for MAIA to see.
            Use “Open my chart” beside the wheel, or Saved charts on the rail.
          </p>
          <div className={styles.maiaBody}>
            <ProHelpConversation question={helpQuestion} setQuestion={setHelpQuestion} exchanges={helpExchanges} setExchanges={setHelpExchanges} />
          </div>
        </div>
      ) : mode === 'help' ? (
        <div className={styles.maiaColumn}>
          <p className={styles.maiaMode}>
            How do I…? answers questions about the workstation. MAIA is not reading {subject.subjectLabel} or any chart in this mode.
          </p>
          <div className={styles.maiaBody}>
            <ProHelpConversation question={helpQuestion} setQuestion={setHelpQuestion} exchanges={helpExchanges} setExchanges={setHelpExchanges} />
          </div>
        </div>
      ) : (
        <div className={styles.maiaColumn}>
          <div className={styles.maiaAbout}>
            <span>We are talking about</span>
            {all.length > 1 ? (
              <select aria-label="What MAIA is reading" value={subject.key}
                onChange={(event) => dock.focus(event.target.value)}>
                {all.map((s) => <option key={s.key} value={s.key}>{s.subjectLabel}</option>)}
              </select>
            ) : <strong>{subject.subjectLabel}</strong>}
            {onNatal && (whereLabel || subject.request.point) && (
              <span className={styles.maiaWhere}>
                · you have {whereLabel ?? 'the chart'} open{subject.request.point ? `, ${subject.request.point} selected` : ''}, so you can say “this”
              </span>
            )}
          </div>
          <p className={styles.maiaMode}>
            {mode === 'mentor'
              ? 'Mentor teaches the technique and uses this chart only as an example.'
              : 'Ask reads the chart with you. Follow-ups build on what has been said.'}
          </p>
          <div className={styles.maiaBody}>
            <ProAskMaiaConversation key={subject.key} request={subject.request} readsWhose={subject.readsWhose} mode={mode} stage />
          </div>
        </div>
      )}
    </section>
  );
}
