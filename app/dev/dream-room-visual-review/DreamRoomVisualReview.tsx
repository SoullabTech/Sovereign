'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './dream-room-review.module.css';

type DreamState =
  | 'arrival'
  | 'remember'
  | 'dream'
  | 'encounter'
  | 'amplify'
  | 'series'
  | 'integrate';

const STATES: { id: DreamState; label: string }[] = [
  { id: 'arrival', label: 'Arrival' },
  { id: 'remember', label: 'Re-member' },
  { id: 'dream', label: 'Dream Page' },
  { id: 'encounter', label: 'Encounter' },
  { id: 'amplify', label: 'Amplify' },
  { id: 'series', label: 'Dream Series' },
  { id: 'integrate', label: 'Integrate' },
];

const DREAM_TEXT = [
  'I was moving through a place I knew and did not know at the same time.',
  'The atmosphere was quiet, almost suspended. Something was near, but not yet clear.',
  'I remember a feeling of recognition before I remember any image.',
  'Then the scene changed and I woke with the sense that something had followed me back.',
];
const AMPLIFICATIONS = [
  ['Personal', 'Your own association', 'What does this quality remind you of in your own life?'],
  ['Jungian', 'A psyche in dialogue', 'What polarity, compensation, or threshold might be worth wondering about?'],
  ['Alchemical', 'Transformation language', 'What seems to be dissolving, joining, darkening, clarifying, or taking form?'],
  ['Elemental', 'Mode of participation', 'What changes if you sense this through Fire, Water, Earth, Air, or the Fifth?'],
  ['Across dreams', 'A returning thread', 'Does this quality echo anything you have met before?'],
];

const SERIES = [
  ['Nov 14', 'A place not yet entered', 'distance'],
  ['Jan 03', 'A threshold held in view', 'watching'],
  ['Mar 28', 'A shift in orientation', 'approach'],
  ['Jun 12', 'A different relationship to the same field', 'contact'],
];

function StateNav({ active }: { active: DreamState }) {
  return (
    <div className={styles.stateNav} aria-label="Visual review states">
      {STATES.map((state) => (
        <a
          key={state.id}
          href={'?state=' + state.id}
          data-active={state.id === active ? 'true' : 'false'}
        >
          {state.label}
        </a>
      ))}
    </div>
  );
}

function MaiaPresence({ children }: { children: React.ReactNode }) {
  return (
    <aside className={styles.maia}>
      <div className={styles.maiaHead}>
        <span className={styles.orb} aria-hidden="true" />
        <strong>MAIA</strong>
      </div>
      <div className={styles.maiaBody}>{children}</div>
    </aside>
  );
}
function DreamPaper({ compact = false }: { compact?: boolean }) {
  return (
    <article className={compact ? styles.paperCompact : styles.paper}>
      <div className={styles.paperMeta}>
        <span>SEPT 27 · 6:12 AM</span>
        <span>PRIVATE · DREAM</span>
      </div>
      <h2>A dream I am still carrying</h2>
      {DREAM_TEXT.map((line) => <p key={line}>{line}</p>)}
      <div className={styles.paperRule} />
      <p className={styles.paperWhisper}>Some meanings arrive slowly.</p>
    </article>
  );
}

function Arrival() {
  return (
    <div className={styles.arrival}>
      <p className={styles.kicker}>THE DREAM ROOM</p>
      <h1>A place for what visits you</h1>
      <p className={styles.lead}>What is still with you?</p>
      <p className={styles.sublead}>Bring the dream as you remember it. Nothing here has to resolve before it belongs.</p>
      <div className={styles.primaryCards}>
        <div><span className={styles.abstractMark}>◌</span><h3>Record a dream</h3><p>Speak or type it as you remember it.</p></div>
        <div><span className={styles.abstractMark}>□</span><h3>Return to a dream</h3><p>Re-enter a past dream without starting over.</p></div>
        <div><span className={styles.abstractMark}>∿</span><h3>Dreams still with you</h3><p>Unfinished threads, lingering images, open questions.</p></div>
      </div>
      <section className={styles.recent}>
        <span>RECENT DREAMS</span>
        <div className={styles.recentGrid}>
          {['A dream near water','Something at the threshold','The room that changed'].map((x,i)=>(
            <div key={x}><small>RECENT {i+1}</small><h4>{x}</h4><p>A few remembered lines remain here.</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}
function Remember() {
  return (
    <div className={styles.captureWrap}>
      <section className={styles.capturePaper}>
        <div className={styles.captureTop}><span>RE-MEMBER</span><em>Catch it before it fades.</em></div>
        <h1>Tell me your dream.</h1>
        <p>Just as you remember it. Fragments, images, feelings—even if it is unclear.</p>
        <div className={styles.writing}>
          <p>I remember being somewhere familiar but altered.</p>
          <p>There was a feeling before there was an image.</p>
          <p>I think someone was nearby, but I cannot place who.</p>
          <p>Then everything became very still…</p>
          <span className={styles.cursor} />
        </div>
        <div className={styles.promptGhosts}>
          <span>What happened first?</span><span>What remains?</span><span>Who was there?</span><span>How did it feel?</span>
        </div>
        <footer><span>Tap to record</span><button>Keep this dream</button></footer>
      </section>
      <MaiaPresence><p>Here with you. No need to make sense of it yet.</p></MaiaPresence>
    </div>
  );
}
function DreamPage() {
  return (
    <div className={styles.twoField}>
      <DreamPaper />
      <aside className={styles.actionRail}>
        <p className={styles.kicker}>DREAM</p>
        {['Explore with MAIA','Add what I remember','Write from this dream','Keep something from this','Dream series'].map((x)=>(
          <button key={x}>{x}<span>→</span></button>
        ))}
        <blockquote>Let the dream remain larger than the explanation.</blockquote>
      </aside>
    </div>
  );
}

function Encounter() {
  return (
    <div className={styles.encounter}>
      <DreamPaper compact />
      <MaiaPresence>
        <div className={styles.turn}><small>MAIA · 6:14 AM</small><p>You describe the atmosphere as “suspended.” I want to stay with that exact word. What was suspended—time, movement, expectation, something else?</p></div>
        <div className={styles.turnMember}><small>YOU · 6:16 AM</small><p>Almost like everything was waiting for me to notice something.</p></div>
        <div className={styles.turn}><small>MAIA · 6:18 AM</small><p>Waiting feels different from threatening. When you say that, what changes in your body as you remember the dream?</p></div>
        <div className={styles.inputGhost}>Share what is coming up…</div>
      </MaiaPresence>
      <div className={styles.encounterActions}>
        {['Stay with this','Look at another image','Bring in Jung','Look at waking life'].map(x=><button key={x}>{x}</button>)}
      </div>
    </div>
  );
}
function Amplify() {
  return (
    <div className={styles.amplify}>
      <div className={styles.amplifyTop}>
        <DreamPaper compact />
        <MaiaPresence>
          <p>There are several ways we could widen this without deciding what it means.</p>
          <p>We can hold them beside one another and notice what becomes more alive.</p>
        </MaiaPresence>
      </div>
      <section className={styles.constellation}>
        <div className={styles.constellationHead}><span>AMPLIFY</span><em>A constellation of possibilities</em></div>
        <div className={styles.lensGrid}>
          {AMPLIFICATIONS.map(([label,title,body])=>(
            <div key={label}><small>{label}</small><h3>{title}</h3><p>{body}</p><span>→</span></div>
          ))}
        </div>
      </section>
    </div>
  );
}
function Series() {
  return (
    <div className={styles.series}>
      <div className={styles.seriesHeader}>
        <p className={styles.kicker}>THE DREAM SERIES</p>
        <h1>A thread that returns</h1>
        <p>Some qualities visit more than once. They move with you, changing their relationship over time.</p>
      </div>
      <div className={styles.seriesLine}>
        {SERIES.map(([date,title,state],i)=>(
          <div key={date} className={styles.seriesNode}>
            <span className={styles.seriesPulse} data-i={i} />
            <small>{date}</small><h3>{title}</h3><em>{state}</em>
          </div>
        ))}
      </div>
      <MaiaPresence><p>I notice the relation to this field has changed over time. Want to look at what has moved?</p><small>Patterns are invitations, not conclusions.</small></MaiaPresence>
    </div>
  );
}

function Integrate() {
  const cards=['Carry this image today','Write from this','Keep this recognition','Stay with this question','Continue through active imagination','Do nothing yet'];
  return (
    <div className={styles.integrate}>
      <p className={styles.kicker}>INTEGRATE</p>
      <h1>Let the dream stay with you</h1>
      <p className={styles.lead}>There is no right way to hold a dream. Integration is continuation, not a task list.</p>
      <div className={styles.integrationField}>
        <div className={styles.abstractVessel}><span /><span /><span /></div>
        <div><small>ONE THREAD</small><h2>What remains alive</h2><p>Something in this dream is still moving. It does not have to be named yet.</p></div>
      </div>
      <div className={styles.integrationCards}>{cards.map(x=><button key={x}>{x}<span>→</span></button>)}</div>
      <MaiaPresence><p>What, if anything, do you want to carry from this dream?</p></MaiaPresence>
    </div>
  );
}
export default function DreamRoomVisualReview() {
  const searchParams = useSearchParams();
  const requested = searchParams?.get('state') as DreamState | null;
  const state = useMemo(
    () => STATES.some((s) => s.id === requested) ? requested! : 'arrival',
    [requested],
  );

  return (
    <main className={styles.shell} data-state={state}>
      <div className={styles.fieldAsset} aria-hidden="true" />
      <aside className={styles.leftMembrane}>
        <a className={styles.brand} href="/house">Soullab</a>
        <small>THE INNER LIFE<br/>LIVES HERE</small>
        <nav>
          <a href="/house">Home</a>
          <span>Dream room</span>
          <a href="/journal">Journal</a>
          <a href="/reflections">Reflections</a>
          <a href="/library">Library</a>
          <a href="/maia">MAIA</a>
        </nav>
        <blockquote>A calmer,<br/>truer you<br/>is a kinder world.</blockquote>
      </aside>

      <section className={styles.room}>
        <header className={styles.topline}>
          <span>SOULLAB HOUSE&nbsp;&nbsp;/&nbsp;&nbsp;DREAM ROOM</span>
          <em>Same sky. Deeper you.</em>
        </header>
        <div className={styles.stage}>
          {state === 'arrival' && <Arrival />}
          {state === 'remember' && <Remember />}
          {state === 'dream' && <DreamPage />}
          {state === 'encounter' && <Encounter />}
          {state === 'amplify' && <Amplify />}
          {state === 'series' && <Series />}
          {state === 'integrate' && <Integrate />}
        </div>
        <StateNav active={state} />
      </section>
      <div className={styles.rightMembrane} aria-hidden="true">
        <span className={styles.orb} />
        <strong>MAIA</strong>
        <p>Present when invited.</p>
      </div>
      <footer className={styles.footer}>DREAMS REMIND US THAT A RICHER LIFE LIVES WITHIN.</footer>
    </main>
  );
}

