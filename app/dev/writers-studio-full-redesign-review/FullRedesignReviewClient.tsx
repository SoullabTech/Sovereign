'use client';

/**
 * PC3-S1 / PC3-S2 / PC3-S3 founder-review client.
 *
 * ⛔ Fixture only. This client makes no network request, reads no member data,
 * writes nothing, and commissions no cognition. Every word MAIA "says" here is
 * transcribed from the founder's design originals. The founder-review strip
 * sits BELOW the captured 100vh product frame and names that plainly.
 */
import { useState } from 'react';
import { Shell, ChevronDown } from '@/app/writers-studio/full-redesign/Shell';
import { HOME_GEOMETRY, STATE_GEOMETRY, WRITE_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import { HomeRoom } from '@/app/writers-studio/full-redesign/HomeRoom';
import { WriteManuscriptRail, WriteRoom } from '@/app/writers-studio/full-redesign/WriteRoom';
import { ReviewRail, ReviewChapter, MaiaReview } from '@/app/writers-studio/full-redesign/ReviewRoom';
import { ManuscriptPassage, DevelopThemes, MaiaPassage, ChapterRail, ManuscriptInContext, MaiaStandsOut } from '@/app/writers-studio/full-redesign/DevelopRoom';
import {
  CHAPTER_6, CHAPTER_LIST, CONTINUITY_ROWS, DEVELOP_TABS, FIXTURE_STATES, IMAGES, MAIA_SUGGESTIONS,
  MANUSCRIPT_MAIA, RAIL_QUOTE, REFERENCES, REVIEW_COVERAGE, REVIEW_CURRENT_CHAPTER, REVIEW_FILTERS,
  REVIEW_FINDINGS, REVIEW_MAIA, REVIEW_PARTS, REVIEW_TABS, REVIEW_TILES, STATE_MODE, STORY_MAP_MOVEMENTS,
  THEMES, WHERE_CHAPTER_LIVES, WORK, type ThemeFixture,
  HISTORY, HOME_COPY, HOME_REFERENCES, HOME_STATES, KEPT_LINE, MANY_WORKS, OTHER_WORKS, REMOVE_OR_DELETE,
  RIVER_WORK, UNCLAIMED_WRITING, WRITING_SPACE, isHomeState,
  WRITE_COPY, WRITE_FIXTURE, WRITE_REFERENCE, WRITE_STATES, isWriteState,
} from '@/app/writers-studio/full-redesign/fixtures';
import { DEFAULT_APPEARANCE, type Appearance, type HomeStateId, type ReviewStateId, type StudioMode } from '@/app/writers-studio/full-redesign/types';

export type FullRedesignReviewClientProps = {
  initialState: ReviewStateId;
  initialAppearance?: Appearance;
};

const MODE_STATE: Record<StudioMode, ReviewStateId> = { home: 'home-return', write: 'write-resting', develop: 'develop-themes', review: 'review-chapter' };

const LARGER = [
  'Across the manuscript, change and transition gathers strength from Chapter 5 onward.',
  'Belonging begins to surface in Chapter 6 and may carry more weight in Part III.',
] as const;

export function FullRedesignReviewClient({ initialState, initialAppearance = DEFAULT_APPEARANCE }: FullRedesignReviewClientProps) {
  const [state, setState] = useState<ReviewStateId>(initialState);
  const [appearance, setAppearance] = useState<Appearance>(initialAppearance);
  const [note, setNote] = useState<string>('');
  const [themeId, setThemeId] = useState<string>(THEMES[0].id);
  const [devTab, setDevTab] = useState<string>('Themes');
  const [maiaTab, setMaiaTab] = useState<'passage' | 'larger'>('passage');
  const [reviewFilter, setReviewFilter] = useState<string>('All');
  const [reviewTab, setReviewTab] = useState<string>('Overview');
  // PC3-S3: Full Canvas is a presentation state of the Write room, held here so
  // the Shell recedes with it. `write-full-canvas` only opens the room in it.
  const [canvas, setCanvas] = useState<boolean>(initialState === 'write-full-canvas');

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const home = isHomeState(state);
  const write = isWriteState(state);
  const mode: StudioMode = isHomeState(state) ? 'home' : isWriteState(state) ? 'write' : STATE_MODE[state];
  const act = (a: string) => setNote(`Fixture — \u201C${a}\u201D would act in the live Studio. Nothing happens here.`);

  function selectMode(next: StudioMode) {
    setState(MODE_STATE[next]);
    setCanvas(false);
    setNote('');
  }

  function selectState(next: ReviewStateId) {
    setState(next);
    setCanvas(next === 'write-full-canvas');
    setNote('');
  }

  const body = isHomeState(state)
    ? { work: <HomeState state={state} onAct={act} /> }
    : isWriteState(state)
      ? {
          manuscript: <WriteManuscriptRail fixture={WRITE_FIXTURE} onAct={act} />,
          work: <WriteRoom fixture={WRITE_FIXTURE} copy={WRITE_COPY} canvas={canvas} onCanvasChange={setCanvas} onAct={act} />,
        }
    : state === 'develop-themes'
      ? {
          manuscript: <ManuscriptPassage />,
          work: <DevelopThemes theme={theme} tab={devTab} onTab={setDevTab} onTheme={setThemeId} />,
          maia: <MaiaPassage tab={maiaTab} onTab={setMaiaTab} lead={maiaTab === 'passage' ? theme.maia : LARGER} />,
        }
      : state === 'develop-manuscript'
        ? { manuscript: <ChapterRail />, work: <ManuscriptInContext />, maia: <MaiaStandsOut tab={maiaTab} onTab={setMaiaTab} /> }
        : {
            manuscript: <ReviewRail />,
            work: <ReviewChapter filter={reviewFilter} onFilter={setReviewFilter} tab={reviewTab} onTab={setReviewTab} />,
            maia: <MaiaReview />,
          };

  return (
    <div className="fr-page" data-fixture-state={state}>
      <div className="fr-capture-frame" data-capture-frame="">
        <Shell
          mode={mode}
          appearance={appearance}
          geometry={isHomeState(state) ? HOME_GEOMETRY : isWriteState(state) ? WRITE_GEOMETRY : STATE_GEOMETRY[state]}
          workTitle={state === 'home-begin' ? undefined : WORK.title}
          memberInitial={WORK.memberInitial}
          onSelectMode={selectMode}
          manuscript={'manuscript' in body ? body.manuscript : undefined}
          work={body.work}
          maia={'maia' in body ? body.maia : undefined}
          maiaAbove={state === 'review-chapter' ? <span className="fr-matters">Your story matters. ✦</span> : undefined}
          footer={state === 'review-chapter' ? <span>A deeper you. A more human world.</span> : undefined}
          canvas={write ? canvas : undefined}
        />
      </div>

      <section className="fr-review-strip" data-founder-review-marker="" aria-label="Founder review controls">
        <strong>Founder review · fixture data</strong>
        <span>
          {write ? 'PC3-S3 Write candidate' : home ? 'PC3-S2 Home candidate' : 'PC3-S1 shell candidate'}. Nothing on this page is live: no member
          data, no reading, no MAIA call, no save. Reference:{' '}
          {isWriteState(state) ? (
            <>
              {WRITE_REFERENCE.label} · <code>{WRITE_REFERENCE.sha256.slice(0, 12)}…</code>
            </>
          ) : isHomeState(state) ? (
            <>
              {HOME_REFERENCES.family.label} · <code>{HOME_REFERENCES.family.sha256.slice(0, 12)}…</code> (supporting:{' '}
              {HOME_REFERENCES.supporting.label})
            </>
          ) : (
            <>
              {REFERENCES[state].label} · <code>{REFERENCES[state].sha256.slice(0, 12)}…</code>
            </>
          )}
        </span>
        <label>
          State{' '}
          <select value={state} onChange={(e) => selectState(e.target.value as ReviewStateId)}>
            {[...FIXTURE_STATES, ...HOME_STATES, ...WRITE_STATES].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Appearance{' '}
          <select value={appearance} onChange={(e) => setAppearance(e.target.value as Appearance)}>
            <option value="light">Light (default)</option>
            <option value="night">Night (proof)</option>
          </select>
        </label>
        {note ? <em role="status">{note}</em> : null}
      </section>
    </div>
  );
}

/** PC3-S2 · the four Home fixture states, composed from fixture data only. */
function HomeState({ state, onAct }: { state: HomeStateId; onAct: (act: string) => void }) {
  const common = {
    images: IMAGES as Record<string, string>,
    copy: HOME_COPY,
    removeOrDelete: REMOVE_OR_DELETE,
    writingSpace: { ...WRITING_SPACE, image: IMAGES.railMist },
    onAct,
  };
  switch (state) {
    case 'home-begin':
      return <HomeRoom state={state} {...common} />;
    case 'home-return':
      return <HomeRoom state={state} {...common} work={RIVER_WORK} otherWorks={OTHER_WORKS} keptLine={KEPT_LINE} history={HISTORY} />;
    case 'home-unclaimed-writing':
      return <HomeRoom state={state} {...common} writings={UNCLAIMED_WRITING} allWorks={[RIVER_WORK, ...OTHER_WORKS]} />;
    case 'home-many-works':
      return <HomeRoom state={state} {...common} work={RIVER_WORK} allWorks={[RIVER_WORK, ...MANY_WORKS]} writings={UNCLAIMED_WRITING} />;
  }
}
