'use client';

import { useMemo, useState } from 'react';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { HOME_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import { HOME_COPY, REMOVE_OR_DELETE } from '@/app/writers-studio/full-redesign/fixtures';
import { useWorkVisual } from '@/app/writers-studio/useWorkVisual';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
import type { CurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import type { Arrival } from '@/app/writers-studio/homeState';
import {
  homeWritingExtent,
  manuscriptIdsOf,
  manuscriptsForWork,
  manuscriptsInOrder,
} from '@/app/writers-studio/homeState';
import type { SectionActivity } from '@/lib/writersStudio/sectionActivity';
import type { MarkedLine } from '@/app/writers-studio/useMarkedLines';
import type { StudioAct } from '@/app/writers-studio/studioHistory';
import { sentenceFor } from '@/app/writers-studio/studioHistory';
import P4R1WorkMaterialsSummary from './P4R1WorkMaterialsSummary';
import P4R1WorkDirectives from './P4R1WorkDirectives';
import P4R1ProducePanel from './P4R1ProducePanel';
import type { Appearance } from '@/app/writers-studio/full-redesign/types';

function fixedDate(iso: string | null | undefined): string {
  if (!iso) return 'date not recorded';
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return 'date not recorded';
  const now = new Date();
  const sameYear = value.getFullYear() === now.getFullYear();
  return value.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

function wordsFromChars(chars: number): number {
  return Math.max(0, Math.round(chars / 6));
}

function workFacts(work: LivingWork, manuscripts: readonly CurrentManuscript[]): { extent: string; written: string } {
  const choices = manuscriptsForWork(work, manuscripts);
  if (choices.length > 1) {
    return {
      extent: `${choices.length} manuscripts`,
      written: 'Choose a manuscript to continue',
    };
  }
  const manuscript = choices[0] ?? null;
  if (!manuscript) return { extent: 'No manuscript yet', written: 'not yet written here' };
  const extent = homeWritingExtent(manuscript);
  const words = wordsFromChars(extent);
  return {
    extent: manuscript.sectionCount > 0
      ? `${manuscript.sectionCount} section${manuscript.sectionCount === 1 ? '' : 's'} · ~${words.toLocaleString()} words`
      : words > 0 ? `~${words.toLocaleString()} words` : 'No writing yet',
    written: manuscript.lastMemberDraftActivityAt
      ? `worked ${fixedDate(manuscript.lastMemberDraftActivityAt)}`
      : 'no authored return date recorded',
  };
}

function LiveWorkVisual({ workId, title }: { workId: string; title: string }) {
  const visual = useWorkVisual(workId);
  if (!visual.src) return null;
  return <img className="p4r1-home-work-image" src={visual.src} alt={`${title} — the image this Work carries`} />;
}

function WorkAnchor({ work, manuscripts, activity, onOpen, onStartWriting, busy }: {
  work: LivingWork;
  manuscripts: readonly CurrentManuscript[];
  activity: SectionActivity | null;
  onOpen: (manuscriptId: string, sectionId?: string) => void;
  onStartWriting: (workId: string) => void;
  busy: boolean;
}) {
  const choices = manuscriptsForWork(work, manuscripts);
  const manuscript = choices.length === 1 ? choices[0] : null;
  const [producing, setProducing] = useState(false);
  const facts = workFacts(work, manuscripts);
  const title = work.title?.trim() || 'Untitled Work';
  const sectionId = activity?.kind === 'distinct' ? activity.sectionId : undefined;
  const hasManuscriptExpression = work.expressions.some((expression) => expression.expressionType === 'manuscript');
  return (
    <section className="fr-home-anchor fr-home-return p4r1-home-anchor" data-field="anchor">
      <header className="fr-home-arrive">
        <p className="fr-home-eyebrow">{HOME_COPY.returnEyebrow}</p>
        <h1 className="fr-home-greeting">{HOME_COPY.returnWelcome(title)}</h1>
        {activity?.kind === 'distinct' ? (
          <p className="fr-home-place">Your last exact writing place is available.</p>
        ) : (
          <p className="fr-home-place">Open this Work without inventing a more precise return place.</p>
        )}
      </header>
      <div className="fr-home-recognize p4r1-home-recognize">
        <LiveWorkVisual workId={work.id} title={title} />
        <div className="p4r1-home-work-copy">
          <span className="fr-home-chip fr-home-chip-work">Work</span>
          <h2>{title}</h2>
          <p className="fr-home-kind">{work.form?.trim() || 'Work'}</p>
          <p className="fr-home-facts">{facts.extent} <span className="fr-home-dot">·</span> {facts.written}</p>
          {work.purpose?.trim() ? <blockquote className="p4r1-home-purpose">“{work.purpose.trim()}”</blockquote> : null}
          {manuscript ? (
            <>
              <div className="fr-home-actions">
                <button type="button" className="fr-home-primary" onClick={() => onOpen(manuscript.id, sectionId)}>
                  {HOME_COPY.returnAction}
                </button>
                <button
                  type="button"
                  className="fr-home-quiet"
                  aria-expanded={producing}
                  onClick={() => setProducing((value) => !value)}
                >
                  Publish
                </button>
              </div>
              {producing ? (
                <P4R1ProducePanel
                  manuscriptId={manuscript.id}
                  onClose={() => setProducing(false)}
                />
              ) : null}
            </>
          ) : choices.length > 1 ? (
            <ManuscriptChooser
              manuscripts={choices}
              heading="Choose a manuscript to continue"
              onChoose={(id) => onOpen(id, sectionId)}
            />
          ) : !hasManuscriptExpression ? (
            <div className="fr-home-actions">
              <button
                type="button"
                className="fr-home-primary"
                disabled={busy}
                onClick={() => onStartWriting(work.id)}
              >
                {busy ? 'Opening writing…' : 'Start writing'}
              </button>
              <span className="p4r1-home-start-note">
                Begins a blank writing place. Materials stay where they are.
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <P4R1WorkDirectives workId={work.id} />
      <P4R1WorkMaterialsSummary work={work} />
    </section>
  );
}

function WorkShelfCard({ work, manuscripts, onOpen, onStartWriting, busy }: {
  work: LivingWork;
  manuscripts: readonly CurrentManuscript[];
  onOpen: (manuscriptId: string) => void;
  onStartWriting: (workId: string) => void;
  busy: boolean;
}) {
  const choices = manuscriptsForWork(work, manuscripts);
  const manuscript = choices.length === 1 ? choices[0] : null;
  const facts = workFacts(work, manuscripts);
  const title = work.title?.trim() || 'Untitled Work';
  const hasManuscriptExpression = work.expressions.some((expression) => expression.expressionType === 'manuscript');
  return (
    <article className="fr-home-workcard p4r1-home-workcard">
      <LiveWorkVisual workId={work.id} title={title} />
      <div>
        <span className="fr-home-chip fr-home-chip-work">Work</span>
        <h3>{title}</h3>
        <p className="fr-home-kind">{work.form?.trim() || 'Work'}</p>
        <p className="fr-home-facts">{facts.extent}<br />{facts.written}</p>
        {manuscript ? (
          <button type="button" className="fr-home-link" onClick={() => onOpen(manuscript.id)}>Open</button>
        ) : choices.length > 1 ? (
          <ManuscriptChooser
            manuscripts={choices}
            heading="Choose a manuscript"
            onChoose={onOpen}
          />
        ) : !hasManuscriptExpression ? (
          <div className="p4r1-home-shelf-start">
            <button
              type="button"
              className="fr-home-link"
              disabled={busy}
              onClick={() => onStartWriting(work.id)}
            >
              {busy ? 'Opening writing…' : 'Start writing'}
            </button>
            <span>Blank page. Materials stay where they are.</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function WritingCard({ manuscript, works, onOpen, onMakeWork, onAddToWork }: {
  manuscript: CurrentManuscript;
  works: readonly LivingWork[];
  onOpen: (id: string) => void;
  onMakeWork: (id: string, title: string | null) => void;
  onAddToWork: (manuscriptId: string, workId: string) => void;
}) {
  const [choosing, setChoosing] = useState(false);
  const extent = homeWritingExtent(manuscript);
  return (
    <article className="fr-home-writing p4r1-home-writing" data-kind="writing">
      <span className="fr-home-page" aria-hidden="true">◇</span>
      <div className="fr-home-writing-body">
        <span className="fr-home-chip">Writing</span>
        <h3>{manuscript.title?.trim() || 'Untitled writing'}</h3>
        <p className="fr-home-facts">
          ~{wordsFromChars(extent).toLocaleString()} words
          {manuscript.lastMemberDraftActivityAt ? <> <span className="fr-home-dot">·</span> {fixedDate(manuscript.lastMemberDraftActivityAt)}</> : null}
        </p>
        <div className="fr-home-actions">
          <button type="button" className="fr-home-primary" onClick={() => onOpen(manuscript.id)}>Open writing</button>
          <button type="button" className="fr-home-quiet" onClick={() => onMakeWork(manuscript.id, manuscript.title)}>Make this a Work</button>
          {works.length > 0 ? (
            <button type="button" className="fr-home-quiet" onClick={() => setChoosing((v) => !v)}>Add to a Work</button>
          ) : null}
        </div>
        {choosing ? (
          <ul className="fr-home-chooser">
            {works.map((work) => (
              <li key={work.id}><button type="button" onClick={() => onAddToWork(manuscript.id, work.id)}>{work.title || 'Untitled Work'}</button></li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export interface P4R1HomeViewProps {
  appearance: Appearance;
  arrival: Arrival;
  works: readonly LivingWork[];
  manuscripts: readonly CurrentManuscript[];
  resumeActivity: SectionActivity | null;
  returnWork: LivingWork | null;
  returnActivity: SectionActivity | null;
  markedLines: readonly MarkedLine[];
  historyActs: readonly StudioAct[];
  busy: boolean;
  error: string | null;
  pendingMode: {
    mode: 'write' | 'develop' | 'review';
    manuscriptIds: readonly string[];
  } | null;
  onMode: (mode: 'home' | 'write' | 'develop' | 'review') => void;
  onChooseManuscript: (mode: 'write' | 'develop' | 'review', manuscriptId: string) => void;
  onBegin: (title: string) => void;
  onOpen: (manuscriptId: string, sectionId?: string) => void;
  onMakeWork: (manuscriptId: string, title: string | null) => void;
  onAddToWork: (manuscriptId: string, workId: string) => void;
  onStartWriting: (workId: string) => void;
  onImport: () => void;
  onSources: () => void;
}

export default function P4R1HomeView(props: P4R1HomeViewProps) {
  const [beginning, setBeginning] = useState(false);
  const [title, setTitle] = useState('');

  const claimed = useMemo(
    () => new Set(props.works.flatMap(manuscriptIdsOf)),
    [props.works],
  );
  const unclaimed = props.manuscripts.filter((m) => !claimed.has(m.id));
  // The mode-bar chooser keeps the order it was given (declaration order), never recency.
  const pendingManuscripts = props.pendingMode
    ? manuscriptsInOrder(props.pendingMode.manuscriptIds, props.manuscripts)
    : [];
  const recentHistory = props.historyActs.slice(0, 4).map(sentenceFor).filter((x): x is string => Boolean(x));

  const creationControls = (
    <section className="p4r1-home-create" aria-label="Start or bring writing">
      <div className="p4r1-home-create-copy">
        <p className="fr-home-eyebrow">Start or bring a Work</p>
        <p>Begin something new, or bring writing you already have into the Studio.</p>
      </div>
      {!beginning ? (
        <div className="fr-home-actions">
          <button type="button" className="fr-home-primary" onClick={() => setBeginning(true)}>New Work</button>
          <button type="button" className="fr-home-quiet" onClick={props.onImport}>Upload / import writing</button>
          <button type="button" className="fr-home-quiet" onClick={props.onSources}>Notes &amp; sources</button>
        </div>
      ) : (
        <div className="p4r1-home-begin-form">
          <label htmlFor="p4r1-work-title">Give the new Work a name, or leave it blank for now.</label>
          <div>
            <input id="p4r1-work-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !props.busy) props.onBegin(title); if (e.key === 'Escape') setBeginning(false); }} />
            <button type="button" className="fr-home-primary" disabled={props.busy} onClick={() => props.onBegin(title)}>
              {props.busy ? 'Beginning…' : 'Begin'}
            </button>
            <button type="button" className="fr-home-quiet" onClick={() => setBeginning(false)}>Cancel</button>
          </div>
        </div>
      )}
      {props.error ? <p className="p4r1-error">{props.error}</p> : null}
      {props.pendingMode ? (
        <ManuscriptChooser
          manuscripts={pendingManuscripts}
          heading={
            props.pendingMode.mode === 'write'
              ? 'Choose a manuscript to write'
              : props.pendingMode.mode === 'develop'
                ? 'Choose a manuscript to develop'
                : 'Choose a manuscript to review'
          }
          onChoose={(id) => props.onChooseManuscript(props.pendingMode!.mode, id)}
        />
      ) : null}
    </section>
  );

  let work: React.ReactNode;
  if (props.returnWork) {
    work = (
      <div className="fr-home fr-home-returning" data-home-return-work={props.returnWork.id}>
        <div className="fr-home-field" data-field="room">
          {creationControls}
          <WorkAnchor
            work={props.returnWork}
            manuscripts={props.manuscripts}
            activity={props.returnActivity}
            onOpen={props.onOpen}
            onStartWriting={props.onStartWriting}
            busy={props.busy}
          />
          {recentHistory.length > 0 ? (
            <section className="fr-home-region p4r1-home-history">
              <p className="fr-home-eyebrow">History</p>
              <ol>{recentHistory.map((line, i) => <li key={i}>{line}</li>)}</ol>
            </section>
          ) : null}
        </div>
      </div>
    );
  } else if (props.arrival.kind === 'begin') {
    work = (
      <div className="fr-home fr-home-begin">
        <div className="fr-home-field" data-field="room">
          <section className="fr-home-anchor fr-home-threshold" data-field="anchor">
            <h1 className="fr-home-welcome">{HOME_COPY.beginWelcome}</h1>
            {!beginning ? (
              <div className="fr-home-actions">
                <button type="button" className="fr-home-primary" onClick={() => setBeginning(true)}>Begin a new Work</button>
                <button type="button" className="fr-home-quiet" onClick={props.onImport}>Upload / import writing</button>
                <button type="button" className="fr-home-quiet" onClick={props.onSources}>Bring notes &amp; sources</button>
              </div>
            ) : (
              <div className="p4r1-home-begin-form">
                <label htmlFor="p4r1-work-title">Give it a name, or leave it blank for now.</label>
                <div>
                  <input id="p4r1-work-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !props.busy) props.onBegin(title); if (e.key === 'Escape') setBeginning(false); }} />
                  <button type="button" className="fr-home-primary" disabled={props.busy} onClick={() => props.onBegin(title)}>
                    {props.busy ? 'Beginning…' : 'Begin'}
                  </button>
                  <button type="button" className="fr-home-quiet" onClick={() => setBeginning(false)}>Cancel</button>
                </div>
              </div>
            )}
            <p className="fr-home-trust">{HOME_COPY.trust}</p>
            {props.error ? <p className="p4r1-error">{props.error}</p> : null}
          </section>
        </div>
      </div>
    );
  } else if (props.arrival.kind === 'continue' && props.arrival.resume) {
    work = (
      <div className="fr-home fr-home-returning">
        <div className="fr-home-field" data-field="room">
          {creationControls}
          <WorkAnchor
            work={props.arrival.resume}
            manuscripts={props.manuscripts}
            activity={props.resumeActivity}
            onOpen={props.onOpen}
            onStartWriting={props.onStartWriting}
            busy={props.busy}
          />
          {props.arrival.alsoWritten.length > 0 ? (
            <section className="fr-home-region">
              <p className="fr-home-eyebrow">Also written</p>
              <div className="fr-home-shelf">
                {props.arrival.alsoWritten.map((item) => (
                  <WorkShelfCard
  key={item.id}
  work={item}
  manuscripts={props.manuscripts}
  onOpen={props.onOpen}
  onStartWriting={props.onStartWriting}
  busy={props.busy}
/>
                ))}
              </div>
            </section>
          ) : null}
          {recentHistory.length > 0 ? (
            <section className="fr-home-region p4r1-home-history">
              <p className="fr-home-eyebrow">History</p>
              <ol>{recentHistory.map((line, i) => <li key={i}>{line}</li>)}</ol>
            </section>
          ) : null}
        </div>
      </div>
    );
  } else if (unclaimed.length > 0) {
    work = (
      <div className="fr-home fr-home-unclaimed">
        <div className="fr-home-field" data-field="room">
          {creationControls}
          <p className="fr-home-here">{HOME_COPY.writingHere}</p>
          <div className="fr-home-writing-list">
            {unclaimed.map((manuscript) => (
              <WritingCard key={manuscript.id} manuscript={manuscript} works={props.works}
                onOpen={(id) => props.onOpen(id)} onMakeWork={props.onMakeWork} onAddToWork={props.onAddToWork} />
            ))}
          </div>
          {props.works.length > 0 ? (
            <section className="fr-home-region">
              <p className="fr-home-eyebrow">Your Works</p>
              <div className="fr-home-shelf">
                {props.works.map((item) => <WorkShelfCard
  key={item.id}
  work={item}
  manuscripts={props.manuscripts}
  onOpen={props.onOpen}
  onStartWriting={props.onStartWriting}
  busy={props.busy}
/>)}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    );
  } else {
    work = (
      <div className="fr-home fr-home-many">
        <div className="fr-home-field" data-field="room">
          {creationControls}
          <section className="fr-home-region">
            <p className="fr-home-eyebrow">Your Works</p>
            <div className="fr-home-shelf fr-home-shelf-4">
              {props.works.map((item) => <WorkShelfCard
  key={item.id}
  work={item}
  manuscripts={props.manuscripts}
  onOpen={props.onOpen}
  onStartWriting={props.onStartWriting}
  busy={props.busy}
/>)}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <Shell
      mode="home"
      appearance={props.appearance}
      geometry={HOME_GEOMETRY}
      memberInitial=""
      onSelectMode={props.onMode}
      work={work}
    />
  );
}

function ManuscriptChooser({
  manuscripts,
  heading = 'Choose a manuscript',
  onChoose,
}: {
  manuscripts: readonly CurrentManuscript[];
  heading?: string;
  onChoose: (manuscriptId: string) => void;
}) {
  if (manuscripts.length < 2) return null;

  return (
    <div className="mt-4" data-manuscript-choice="">
      <p className="text-[13px] opacity-55 mb-2">{heading}</p>
      <ul className="grid gap-2 max-w-xl" aria-label={heading}>
        {manuscripts.map((manuscript) => (
          <li key={manuscript.id}>
            <button
              type="button"
              onClick={() => onChoose(manuscript.id)}
              className="block w-full text-left px-4 py-3 border border-current rounded-[2px] opacity-75 hover:opacity-100 transition-opacity"
            >
              {manuscript.title?.trim() || 'Untitled manuscript'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
