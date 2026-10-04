'use client';

import { useReducer } from 'react';
import { getDoorwayAudience } from '@/lib/constellation/doorways';
import {
  initialParticipationPreview, transitionParticipationPreview, preparePreviewDraft,
  PREVIEW_ACTIVITIES, PREVIEW_USEFULNESS,
} from '@/lib/constellation/participationPreview';
import styles from './participation.module.css';

/** Review-only component. No submission callback, transport, or storage is accepted. */
export default function ParticipationPreview() {
  const [state, dispatch] = useReducer(transitionParticipationPreview, undefined, initialParticipationPreview);
  // A declared example, NOT an attribution inferred from the current founder or URL.
  const example = getDoorwayAudience('writers-studio', 'wisdom-carrier');
  const draft = preparePreviewDraft(state);
  const clear = () => dispatch({ type: 'clear_preview' });

  return (
    <section className={styles.page} data-participation-preview data-phase={state.phase} aria-label="Participation design preview">
      <aside className={styles.banner}>
        <strong>Founder preview · no real participation</strong>
        <span>These choices stay in this page’s memory. Nothing is sent, saved as feedback, or added to the learning report.</span>
      </aside>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Writer’s Studio · first experience</p>
        <h1>Did this help your work?</h1>
        <p>One optional reflection. Your writing stays yours.</p>
      </header>

      {state.phase === 'invitation' && (
        <div className={styles.panel}>
          <h2>An invitation, not an obligation.</h2>
          <p>After trying the Studio, a writer could choose to tell us what they tried and whether it helped. Accepting an edit is not required; keeping their original wording can be the right outcome.</p>
          <p>This proposed report contains only selected descriptions. It does not include the manuscript, a private conversation, or an assessment of the writer.</p>
          <p className={styles.note}>Participation would not grant permission for marketing contact, testimonials, model training, or a referral. Including the arrival invitation would be a separate choice.</p>
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={() => dispatch({ type: 'begin_preview' })}>Try the participation preview</button>
            <button className={styles.secondary} type="button" onClick={clear}>Skip this preview</button>
          </div>
        </div>
      )}

      {state.phase === 'editing' && (
        <div className={styles.panel}>
          <p className={styles.note}>Use example choices to inspect the experience. This is not a real feedback submission.</p>
          <fieldset className={styles.choices}>
            <legend>What did you try?</legend>
            {PREVIEW_ACTIVITIES.map(choice => (
              <label key={choice.id}>
                <input type="radio" name="preview-activity" checked={state.activity === choice.id}
                  onChange={() => dispatch({ type: 'choose_activity', value: choice.id })} />
                <span>{choice.label}</span>
              </label>
            ))}
          </fieldset>
          <button type="button" className={styles.textButton} onClick={clear}>I have not tried the work yet — end preview</button>

          <fieldset className={styles.choices} disabled={!state.activity}>
            <legend>Did it help you move your work forward?</legend>
            {PREVIEW_USEFULNESS.map(choice => (
              <label key={choice.id}>
                <input type="radio" name="preview-usefulness" checked={state.usefulness === choice.id}
                  onChange={() => dispatch({ type: 'choose_usefulness', value: choice.id })} />
                <span>{choice.label}</span>
              </label>
            ))}
          </fieldset>

          {example && <div className={styles.attribution}>
            <p className={styles.eyebrow}>Separate, optional choice</p>
            <h2>Include the invitation?</h2>
            <p>The example invitation is: <em>{example.invitation}</em></p>
            <label>
              <input type="checkbox" checked={state.invitationId === example.id}
                onChange={event => dispatch({ type: 'choose_attribution', invitationId: event.target.checked ? example.id : null })} />
              <span>Include this example invitation in the preview report.</span>
            </label>
            <p className={styles.note}>Leaving this off keeps the report general. Choosing it does not label the person or authorize other tracking.</p>
          </div>}

          <div className={styles.actions}>
            <button type="button" className={styles.primary} disabled={!draft}
              onClick={() => dispatch({ type: 'review_preview' })}>Review the example report</button>
            <button type="button" className={styles.secondary} onClick={clear}>Clear my preview choices</button>
          </div>
        </div>
      )}

      {(state.phase === 'review' || state.phase === 'complete') && draft && (
        <div className={styles.panel}>
          <p className={styles.eyebrow}>{state.phase === 'review' ? 'Exact preview · not sent' : 'Preview complete · not sent'}</p>
          <h2>{state.phase === 'review' ? 'Only what you chose.' : 'Nothing was sent.'}</h2>
          <dl className={styles.summary}>
            <div><dt>Experience</dt><dd>Writer’s Studio</dd></div>
            <div><dt>What you tried</dt><dd>{PREVIEW_ACTIVITIES.find(choice => choice.id === draft.activity)?.label}</dd></div>
            <div><dt>How it helped</dt><dd>{PREVIEW_USEFULNESS.find(choice => choice.id === draft.usefulness)?.label}</dd></div>
            <div><dt>Invitation</dt><dd>{draft.invitation ? 'Included by a separate choice: ' + example?.label : 'Not included.'}</dd></div>
            <div><dt>Evidence</dt><dd>A person’s selected description—not a measured completion or proof of improvement.</dd></div>
          </dl>
          <details className={styles.details}>
            <summary>Inspect every field in this example</summary>
            <pre data-preview-payload>{JSON.stringify(draft, null, 2)}</pre>
          </details>
          <p className={styles.note}>No private text, personal identifier, contact permission, or public endorsement is part of this example.</p>
          <div className={styles.actions}>
            {state.phase === 'review' && <>
              <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'finish_preview' })}>Finish preview — do not send</button>
              <button type="button" className={styles.secondary} onClick={() => dispatch({ type: 'edit_preview' })}>Change my preview choices</button>
            </>}
            <button type="button" className={styles.secondary} onClick={clear}>Clear my preview choices</button>
          </div>
        </div>
      )}

      {state.phase === 'cleared' && <div className={styles.panel} role="status">
        <h2>Your preview choices are cleared.</h2>
        <p>There is no feedback record or participation agreement to withdraw. Nothing was sent. The Studio is unchanged.</p>
        <button type="button" className={styles.secondary} onClick={() => dispatch({ type: 'restart_preview' })}>Start a fresh preview</button>
      </div>}

      <footer className={styles.footer}>
        <h2>Before a real pilot</h2>
        <p>The one-experience, maximum 30-day scope is approved for building. The real storage, withdrawal, cleanup, and backup promises still need their runtime verification.</p>
        <p>The approved scope includes no return tracking and no marketing contact. This page remains a rehearsal; it does not activate that study.</p>
        <a href="/founder/constellation">Return to Doorway learning</a>
      </footer>
    </section>
  );
}
