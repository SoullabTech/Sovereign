'use client';
import { useState } from 'react';
import { GROWTH_DEFAULT_OUTCOME, GROWTH_WORK_TASKS, makeGrowthWorkingBrief, type GrowthWorkTask } from '@/lib/constellation/growthWork';
import styles from './growth-work.module.css';

export default function GrowthWork() {
  const [outcome, setOutcome] = useState(GROWTH_DEFAULT_OUTCOME);
  const [task, setTask] = useState<GrowthWorkTask>('prepare-pilot');
  const [message, setMessage] = useState('');
  const valid = outcome.trim().length > 0 && outcome.length <= 1200;
  const brief = valid ? makeGrowthWorkingBrief(outcome, task) : '';
  async function copyBrief() {
    if (!valid) return;
    try {
      await navigator.clipboard.writeText(brief);
      setMessage('Copied. Paste this into JARVIS Work or the conversation with your AI partner. Nothing has been delegated or executed.');
    } catch {
      setMessage('Clipboard access was unavailable. Open the working brief below and copy its text. Nothing was sent.');
    }
  }
  return <section className={styles.page} aria-label="Growth and AI work">
    <header>
      <p className={styles.eyebrow}>Soullab · Founder workspace</p>
      <h1>Growth &amp; AI work</h1>
      <p className={styles.lede}>One outcome. One working brief. Your team carries the preparation; you keep the decisions.</p>
    </header>
    <nav className={styles.links} aria-label="Growth workspace">
      <a href="/founder/constellation">Doorway learning</a>
      <a href="/founder/constellation/participation">Participation preview</a>
      <a href="/founder/constellation/pilot">Writer’s Studio pilot packet</a>
    </nav>
    <section className={styles.approval}>
      <p className={styles.eyebrow}>Decision recorded · 3 October 2026</p>
      <h2>The first pilot’s scope is approved.</h2>
      <p>One experience. A maximum of 30 days. Author-controlled withdrawal. Optional invitation attribution. No return tracking or marketing follow-up.</p>
      <p className={styles.note}>This records build authority, not a live launch. Collection, scheduled cleanup, backup handling, and the final member flow still require their runtime evidence and rollout decision.</p>
    </section>
    <section className={styles.form}>
      <h2>What are we moving forward?</h2>
      <label htmlFor="growth-outcome">The outcome</label>
      <textarea id="growth-outcome" rows={4} maxLength={1200} value={outcome}
        onChange={event => {setOutcome(event.target.value);setMessage('');}} />
      <label htmlFor="growth-task">The next piece of work</label>
      <select id="growth-task" value={task} onChange={event => {setTask(event.target.value as GrowthWorkTask);setMessage('');}}>
        {GROWTH_WORK_TASKS.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <button type="button" disabled={!valid} onClick={() => void copyBrief()}>Copy working brief for the AI team</button>
      <p role="status" className={styles.note}>{message || 'The brief stays on this page until you choose to copy it. No AI worker is started here.'}</p>
      <details className={styles.details}>
        <summary>Read the exact working brief</summary>
        <textarea readOnly aria-label="Exact working brief" rows={18} value={brief} />
      </details>
    </section>
    <section className={styles.rhythm}>
      <h2>A working rhythm—not another dashboard to manage.</h2>
      <ol>
        <li><strong>Choose the outcome.</strong><span>Bring the intention, audience, and what matters to protect.</span></li>
        <li><strong>Let the team prepare.</strong><span>Research, draft, build, and test within the agreed scope. Keep the evidence attached.</span></li>
        <li><strong>Review what needs you.</strong><span>Look at the actual page, message, or result—not just a completion label. Keep publishing, spending, and launch decisions explicit.</span></li>
        <li><strong>Learn from what happened.</strong><span>Return to the admitted evidence. Choose the next small improvement without inventing a success story.</span></li>
      </ol>
    </section>
    <footer className={styles.footer}>
      <h2>One team, clear responsibilities.</h2>
      <p><strong>Kelly’s World / JARVIS</strong> is the governed local working and execution surface. <strong>This founder workspace</strong> is the browser place for briefs, review, and learning. <strong>MAIA</strong> remains the member-facing guide.</p>
      <p>This first connection is an explicit copied brief. It is not an automatic handoff, shared agent chat, or live worker-status display. Those capabilities are not claimed here.</p>
      <a href="/admin">Back to Admin</a>
    </footer>
  </section>;
}
