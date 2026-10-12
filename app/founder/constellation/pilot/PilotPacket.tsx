'use client';
import { useState } from 'react';
import { WRITERS_PILOT_PACKET as packet, pilotPacketReviewText } from '@/lib/constellation/pilotPacket';
import styles from './pilot-packet.module.css';

/** Inspectable, source-controlled draft. No recipients, send action, or approval mutation. */
export default function PilotPacket() {
  const [copyState, setCopyState] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(pilotPacketReviewText());
      setCopyState('Review draft copied, including its not-approved-to-send label. Nothing was sent.');
    } catch {
      setCopyState('Clipboard access was unavailable. The exact draft remains selectable below. Nothing was sent.');
    }
  }
  return <section className={styles.page} aria-label="Writer’s Studio pilot packet">
    <header>
      <p className={styles.eyebrow}>Soullab · Founder working material</p>
      <h1>{packet.title}</h1>
      <p className={styles.lede}>One audience. One useful first experience. Something real for you to review.</p>
      <p className={styles.status}>Founder review draft · not approved to send · {packet.revision}</p>
    </header>
    <nav className={styles.links} aria-label="Pilot workspace">
      <a href="/founder/constellation/work">Growth &amp; AI work</a>
      <a href="/founder/constellation">Doorway learning</a>
    </nav>
    <section className={styles.orientation}>
      <p className={styles.eyebrow}>Start here</p>
      <h2>Read the invitation first.</h2>
      <p>Does it meet the people you want to serve, without promising more than the Studio can presently deliver? The rest of the packet supports that decision.</p>
      <p><strong>For:</strong> {packet.audience}</p>
      <p><strong>Proposed first group:</strong> {packet.proposedGroup}</p>
    </section>
    <section className={styles.section} aria-labelledby="invitation-title">
      <p className={styles.eyebrow}>Outreach draft · not sent</p>
      <h2 id="invitation-title">{packet.invitation.subject}</h2>
      <div className={styles.letter}>{packet.invitation.body.split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      <button type="button" onClick={() => void copy()}>Copy the invitation for review</button>
      <p role="status" className={styles.note}>{copyState || 'This copies a labeled review draft. It does not email anyone or approve a campaign.'}</p>
      <details><summary>Read the exact copyable review draft</summary>
        <textarea readOnly rows={16} aria-label="Exact pilot review draft" value={pilotPacketReviewText()} />
      </details>
    </section>
    <section className={styles.section}>
      <p className={styles.eyebrow}>Landing-page direction · draft copy</p>
      <h2>{packet.landing.headline}</h2>
      <p>{packet.landing.description}</p>
      <p className={styles.note}>Proposed invitation: {packet.landing.invitation} This is copy for review, not a published signup offer.</p>
      <a href="/writers-studio/discover/wisdom-carrier">Inspect the current Writer’s Studio doorway</a>
    </section>
    <section className={styles.section}>
      <p className={styles.eyebrow}>The first session</p>
      <h2>Keep the work small enough to encounter closely.</h2>
      <ol>{packet.firstSession.map(step => <li key={step.title}><strong>{step.title}</strong><p>{step.detail}</p></li>)}</ol>
    </section>
    <section className={styles.hold}>
      <p className={styles.eyebrow}>Demonstration · source example not selected</p>
      <h2>{packet.demonstration.work}</h2>
      <p>{packet.demonstration.detail}</p>
      <details><summary>What the real example needs to show</summary>
        <ol>{packet.demonstration.required.map(item => <li key={item}>{item}</li>)}</ol>
      </details>
    </section>
    <section className={styles.section}>
      <h2>What we confirm before inviting people.</h2>
      <p>These are requirements to verify, not live status readings or tasks marked done by a click.</p>
      <details><summary>Access, cost, and support terms</summary>
        <ul>{packet.termsToConfirm.map(term => <li key={term}>{term}</li>)}</ul>
      </details>
      <details><summary>Inspect the six release checks</summary>
      <dl className={styles.gates}>{packet.gates.map(gate => <div key={gate.id}>
        <dt>{gate.label}</dt><dd>{gate.evidence}</dd>
      </div>)}</dl></details>
    </section>
    <footer>
      <p><strong>Your existing scope approval stands:</strong> one voluntary experience, maximum 30-day retention, author withdrawal, optional invitation attribution, no return tracking or marketing follow-up. This packet does not open collection.</p>
      <p>No private manuscript, member record, or invented outcome was used to populate this page.</p>
      <a href="/founder/constellation/work">Return to the working brief</a>
    </footer>
  </section>;
}
