import * as React from 'react';
import type { ReadingSummary } from '@/lib/manuscript/developmentalReading/store';
import type { LiveDevelopReading, LiveReadingLens } from '@/lib/writersStudio/develop/liveLens';

export type DevelopLensLiveState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'choices'; readonly readings: readonly ReadingSummary[] }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'ready'; readonly reading: LiveDevelopReading };

export interface DevelopLensReadingActions {
  readonly busy?: boolean;
  readonly error?: string | null;
  readonly onChoose?: (readingId: string) => void;
  readonly onChooseAnother?: () => void;
  readonly onCommission?: () => void;
}

export interface DevelopLensReadingNavigation {
  hrefFor(sectionId: string): string | null;
  onGo?(sectionId: string, href: string): void;
}

const when = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};
function ReadingChoices({ readings, term, actions }: {
  readings: readonly ReadingSummary[];
  term: string;
  actions?: DevelopLensReadingActions;
}) {
  return (
    <>
      <section className="fs-card">
        <h3>{readings.length === 0 ? 'No saved reading yet' : 'Choose a saved reading'}</h3>
        <p className="fs-obsnote">
          {readings.length === 0
            ? `MAIA has not made a saved ${term} reading of this Work yet.`
            : 'Nothing is chosen for you. Open the reading you want to revisit.'}
        </p>
        {readings.length > 0 ? (
          <div className="fs-readingchoices">
            {readings.map((reading) => (
              <button type="button" className="fs-readingchoice" key={reading.id}
                onClick={() => actions?.onChoose?.(reading.id)}>
                <span>{when(reading.frozenAt)}</span>
                <small>{reading.outcome === 'none'
                  ? 'Nothing noticed'
                  : `${reading.observationCount} ${reading.observationCount === 1 ? 'observation' : 'observations'}`}</small>
              </button>
            ))}
          </div>
        ) : null}
      </section>
      {actions?.onCommission ? (
        <section className="fs-card">
          <h3>Ask MAIA to read</h3>
          <p className="fs-obsnote">This is a deliberate new reading of the current Work. Opening this lens alone never starts one.</p>
          <button type="button" className="fs-btn fs-btn--key" disabled={actions.busy}
            onClick={actions.onCommission}>
            {actions.busy ? 'Reading…' : `Read for ${term.toLowerCase()}`}
          </button>
          {actions.error ? <p className="fs-themeerror" role="status">{actions.error}</p> : null}
        </section>
      ) : null}
    </>
  );
}

function ObservationCard({ observation, navigation }: {
  observation: LiveDevelopReading['observations'][number];
  navigation?: DevelopLensReadingNavigation;
}) {
  const href = observation.returnTo ? navigation?.hrefFor(observation.returnTo.sectionId) ?? null : null;
  return (
    <section className="fs-card fs-readingobs" data-observation={observation.id}
      data-reading-state={observation.state}>
      <div className="fs-themehead">
        <div>
          <h3 className="fs-themetitle">{observation.label}</h3>
          <p className="fs-themeprov">MAIA noticed this · {observation.state}</p>
        </div>
      </div>
      <p className="fs-obsb">{observation.text}</p>
      <div className="fs-ev">
        {observation.evidence.map((evidence) => <span className="fs-chip" key={evidence}>{evidence}</span>)}
        {href && observation.returnTo ? (
          <a className="fs-goto" data-return-to={observation.returnTo.sectionId} href={href}
            onClick={navigation?.onGo ? (event) => {
              event.preventDefault();
              navigation.onGo?.(observation.returnTo!.sectionId, href);
            } : undefined}>
            Go to passage →
          </a>
        ) : null}
      </div>
      {observation.state !== 'current' ? (
        <p className="fs-obsnote">{observation.stateSentence}</p>
      ) : null}
      {observation.moved.map((line) => <p className="fs-obsnote" key={line}>{line}</p>)}
      {observation.limits.length > 0 ? (
        <div className="fs-readinglimits">
          {observation.limits.map((limit) => <p className="fs-limit" key={limit}>{limit}</p>)}
        </div>
      ) : null}
    </section>
  );
}
export function DevelopLensReadingPanel({ kind, lens, plain, term, state, actions, navigation }: {
  kind: string;
  lens: LiveReadingLens;
  plain: string;
  term: string;
  state: DevelopLensLiveState;
  actions?: DevelopLensReadingActions;
  navigation?: DevelopLensReadingNavigation;
}) {
  return (
    <div className="fs-pane" data-stage="develop" data-develop-view={lens}>
      <div className="fs-readingpage">
        <div className="fs-phead">
          <div><h2>{plain}</h2><p>{term} · a saved reading of your {kind}</p></div>
        </div>
        {state.kind === 'idle' || state.kind === 'loading' ? (
          <section className="fs-card"><p className="fs-obsnote">Opening saved readings…</p></section>
        ) : state.kind === 'unavailable' ? (
          <section className="fs-card"><p className="fs-obsnote">This reading isn’t available to show here. Nothing about your Work has changed.</p></section>
        ) : state.kind === 'choices' ? (
          <ReadingChoices readings={state.readings} term={term} actions={actions} />
        ) : (
          <>
            <section className="fs-card fs-readingmeta" data-source-reading={state.reading.id}
              data-reading-state={state.reading.state}>
              <div className="fs-themehead">
                <div>
                  <h3>MAIA’s saved reading</h3>
                  <p className="fs-themeprov">{when(state.reading.frozenAt)} · {state.reading.coverage.sentence}</p>
                </div>
                <span className="fs-chip">{state.reading.state}</span>
              </div>
              {state.reading.state !== 'current' ? <p className="fs-obsnote">{state.reading.stateSentence}</p> : null}
              {state.reading.moved.map((line) => <p className="fs-obsnote" key={line}>{line}</p>)}
              <div className="fs-themeacts">
                {actions?.onChooseAnother ? <button type="button" className="fs-btn" onClick={actions.onChooseAnother}>Choose another reading</button> : null}
                {actions?.onCommission ? <button type="button" className="fs-btn" disabled={actions.busy}
                  onClick={actions.onCommission}>{actions.busy ? 'Reading…' : 'Read again'}</button> : null}
              </div>
              {actions?.error ? <p className="fs-themeerror" role="status">{actions.error}</p> : null}
            </section>
            {state.reading.outcome === 'none' ? (
              <section className="fs-card">
                <h3>Nothing noticed</h3>
                <p className="fs-obsnote">MAIA completed this reading and found nothing to bring you for this lens.</p>
              </section>
            ) : (
              <section className="fs-themesection" aria-label={`${term} observations`}>
                <div className="fs-themegrouphead">
                  <h3>What MAIA noticed</h3><span>{state.reading.observations.length}</span>
                </div>
                <div className="fs-themelist">
                  {state.reading.observations.map((observation) => (
                    <ObservationCard key={observation.id} observation={observation} navigation={navigation} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
