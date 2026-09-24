'use client';

import { useState } from 'react';
import s from './flagshipV2.module.css';

type Mode = 'home' | 'write' | 'develop' | 'review';
type DevelopLens = 'overview' | 'themes' | 'voice' | 'continuity' | 'map';

const chapters = [
  ['Chapter 6', 'The Current Changes'],
  ['Chapter 7', 'A Wider View'],
  ['Chapter 8', 'What Remains'],
  ['Part II', 'Crossing'],
  ['Chapter 9', 'The Other Bank'],
  ['Chapter 10', 'Learning to Stay'],
  ['Part III', 'Belonging'],
  ['Chapter 11', 'Roots and Rivals'],
  ['Chapter 12', 'The Shape Ahead'],
] as const;

const themes = [
  ['Change and Transition', 'Movement, uncertainty, and what it means to live in the in-between.'],
  ['Belonging', 'Connection, place, and finding where you fit.'],
  ['Perception and Reality', 'What is seen, what is hidden, and how understanding shifts.'],
  ['Inner Growth', 'Becoming, letting go, and what emerges.'],
] as const;

function BrandMark() {
  return <span className={s.brandMark} aria-hidden="true">✣</span>;
}

function TopBar({ mode, setMode }: { mode: Mode; setMode: (mode: Mode) => void }) {
  return (
    <header className={s.topbar}>
      <button className={s.brand} onClick={() => setMode('home')} aria-label="Soullab Writer's Studio home">
        <BrandMark /><span>Soullab</span>
      </button>
      <nav className={s.primaryNav} aria-label="Writer's Studio">
        {(['home', 'write', 'develop', 'review'] as const).map((item) => (
          <button key={item} onClick={() => setMode(item)} className={mode === item ? s.activeNav : undefined}>
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>
      <div className={s.topActions}>
        <button className={s.workPicker}>▧ <span>The River Between</span>⌄</button>
        <span className={s.avatar}>J</span>
        <button className={s.iconButton} aria-label="More">•••</button>
      </div>
    </header>
  );
}

function ManuscriptRail({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={s.rail}>
      <div className={s.railTitle}>
        <span>Manuscript</span><span className={s.railTools}>⌄　⌕　▣</span>
      </div>
      <div className={s.chapterList}>
        {chapters.map(([title, subtitle], index) => (
          <button key={title + subtitle} className={index === 0 ? s.currentChapter : s.chapterButton}>
            <strong>{title}</strong><span>{subtitle}</span>
          </button>
        ))}
      </div>
      {!compact && (
        <div className={s.railQuote}>
          <div className={s.miniLandscape} />
          <blockquote>“A story doesn’t take you somewhere else. It helps you see more clearly where you are.”</blockquote>
          <p>Soullab<br /><span>Writers have inner lives.</span></p>
        </div>
      )}
    </aside>
  );
}

function MaiaPanel({ scope = 'This Passage', review = false }: { scope?: string; review?: boolean }) {
  return (
    <aside className={s.maia}>
      <div className={s.maiaHeader}>
        <span className={s.maiaOrb} />
        <strong>MAIA</strong>
        <button aria-label="More">•••</button>
      </div>
      <div className={s.maiaTabs}>
        <button className={s.maiaTabActive}>{scope}</button>
        <button>Larger Patterns</button>
      </div>
      <div className={s.maiaBody}>
        <div className={s.maiaReading}>
          <p className={s.maiaLead}>{review ? 'This review gives you a clearer view of where this chapter lives in your larger story.' : 'This passage brings forward your theme of change and transition.'}</p>
          <p>{review ? 'You can ask for a closer look, explore a question, or bring a specific passage into conversation.' : 'Clara’s observations of the river mirror her inner shift — the same place, but not the same.'}</p>
        </div>
        <h3>{review ? 'Try asking:' : 'You might also explore:'}</h3>
        <div className={s.maiaPrompts}>
          {(review
            ? ['What stands out in this chapter?', 'Where might I bring more clarity?', 'How does this flow within the larger arc?', 'Are there recurring themes here?']
            : ['How does this moment relate to earlier chapters?', 'Where else does this theme appear?', 'What might develop from here?']
          ).map((text, i) => <button key={text}><span>{['▤', '⌕', '✦', '◌'][i]}</span>{text}</button>)}
        </div>
      </div>
      <div className={s.maiaComposer}>
        <span>Share your thoughts...</span><button aria-label="Send">↑</button>
      </div>
      <p className={s.maiaFoot}>MAIA reads with you, not ahead of you.</p>
    </aside>
  );
}

function WriteScreen() {
  return (
    <div className={s.threePane}>
      <ManuscriptRail />
      <main className={s.manuscriptPage}>
        <div className={s.manuscriptMeta}><span>Chapter 6</span><span>2,134 words<br />Last saved 2 minutes ago</span></div>
        <h1>The Current Changes</h1>
        <div className={s.manuscriptCopy}>
          <p>The river had always moved, but that morning it seemed to move differently, as if it, too, had been listening. Clara stood on the bank and watched the water fold over itself, carrying leaves, reflections, and something else she couldn’t name.</p>
          <p>She thought about how much had changed in a single year — not just around her, but within her. The same place, and yet not the same. What had felt certain before now felt porous, like the edge of a map in fog.</p>
          <blockquote>“Maybe this is what growing feels like,” she whispered. “Not arriving, but learning to stay with the in-between.”</blockquote>
          <p>A kingfisher flashed blue across the water, and for a moment everything stilled. She took a deeper breath and kept walking.</p>
          <p>The path bent toward the old bridge, half hidden by willows. Clara hesitated, then smiled — not because she knew what came next, but because she no longer needed to. The river would keep moving, and so would she.</p>
        </div>
        <div className={s.manuscriptFooter}><span>Chapter 6</span><span>2,134 words</span></div>
        <div className={s.editorToolbar}><span>Paragraph⌄</span><b>B</b><i>I</i><span>☷</span><span>☰</span><span>↗</span></div>
      </main>
      <MaiaPanel />
    </div>
  );
}

function ScenicHero({ title, body, quote }: { title: string; body: string; quote: string }) {
  return (
    <section className={s.scenicHero}>
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
        <button>Explore this view　→</button>
      </div>
      <blockquote>{quote}<br /><span>— MAIA</span></blockquote>
    </section>
  );
}

function DevelopTabs({ lens, setLens }: { lens: DevelopLens; setLens: (lens: DevelopLens) => void }) {
  const items: [DevelopLens, string][] = [
    ['overview', 'Overview'], ['map', 'Structure'], ['themes', 'Themes'], ['voice', 'Voice'], ['continuity', 'Continuity'],
  ];
  return (
    <nav className={s.lensTabs} aria-label="Develop views">
      {items.map(([id, label]) => <button key={id} className={lens === id ? s.activeLens : undefined} onClick={() => setLens(id)}>{label}</button>)}
      <button>Reader Perspective</button>
    </nav>
  );
}

function TinyArc() {
  return (
    <svg className={s.arcSvg} viewBox="0 0 520 120" role="img" aria-label="Story arc">
      <path d="M15 92 C95 90, 115 55, 180 65 S275 35, 330 57 S430 30, 505 24" fill="none" stroke="#50779b" strokeWidth="2" />
      {[15, 130, 220, 320, 410, 505].map((x, i) => <circle key={x} cx={x} cy={[92,67,61,52,40,24][i]} r="4.5" fill={i === 2 ? '#d38a3b' : '#2b6ca3'} />)}
    </svg>
  );
}

function DevelopOverview() {
  return (
    <>
      <ScenicHero title="A story of change, connection, and what holds us." body="Your narrative moves between a personal journey and a larger world. Follow what repeats, shifts, and gathers meaning." quote="Your story moves with what returns — and what changes." />
      <section className={s.sectionBlock}>
        <div className={s.sectionHeading}><div><h2>Patterns to Explore</h2><p>Select one to follow through the manuscript.</p></div></div>
        <div className={s.fourCards}>
          {themes.map(([name, desc], i) => <article key={name} className={s.topicCard}><span className={s.topicIcon}>{['⌁', '◎', '◒', '≋'][i]}</span><h3>{name}</h3><p>{desc}</p><button>Explore　→</button></article>)}
        </div>
        <div className={s.splitCards}>
          <article className={s.chartCard}><h3>Your Story’s Arc</h3><TinyArc /><div className={s.arcLabels}><span>Beginning</span><span>Development</span><span>Turning Point</span><span>Later Story</span></div></article>
          <article className={s.emergingCard}><h3>Observations</h3><p>◌ The river returns at several transitions.</p><p>⌁ Clara’s relationship with place changes across the Work.</p><p>✦ The phrase “in-between” appears at turning points.</p></article>
        </div>
      </section>
    </>
  );
}

function ThemesView() {
  return (
    <>
      <ScenicHero title="Themes are how your story finds its shape." body="They run through moments, characters, and choices — revealing relationships you can follow." quote="A theme isn’t a message you deliver, but a meaning your story discovers." />
      <section className={s.sectionBlock}>
        <div className={s.sectionHeading}><div><h2>Emerging Themes</h2><p>These themes appear across your manuscript. Select one to explore.</p></div><button className={s.selectButton}>▤ All Chapters⌄</button></div>
        <div className={s.themeRows}>
          {themes.map(([name, desc], i) => <button key={name} className={i === 0 ? s.themeRowActive : s.themeRow}><span className={s.thumb}>{['◒','●','◐','◉'][i]}</span><span><strong>{name}</strong><small>{desc}</small></span><span className={s.presence}>▂▃▅▇　Ch {i === 1 ? '2–7' : '1–8'}　›</span></button>)}
        </div>
        <div className={s.splitCards}>
          <article className={s.chartCard}><h3>Theme Across Your Manuscript</h3><p>See where this theme appears and evolves.</p><TinyArc /></article>
          <article className={s.emergingCard}><h3>Key Moments</h3><p><b>Ch 2</b>　Clara notices the river differently.</p><p><b>Ch 4</b>　A conversation challenges her assumptions.</p><p><b>Ch 6</b>　The in-between becomes a place to stay.</p></article>
        </div>
      </section>
    </>
  );
}

function VoiceView() {
  const cards = [['Tone','The emotional texture that runs through your story.'],['Perspective','The lens through which your story is experienced.'],['Language','Your distinctive word choices, rhythms, and patterns.'],['Character Voice','How each character speaks, thinks, and feels on the page.']];
  return (
    <>
      <ScenicHero title="Your voice, more clearly" body="Look for patterns in rhythm, tone, perspective, and the choices you make on the page." quote="Not a style to replicate, but a voice to deepen." />
      <section className={s.sectionBlock}>
        <div className={s.sectionHeading}><div><h2>Aspects of Your Story’s Voice</h2><p>Notice what is present, what is evolving, and what you might explore further.</p></div></div>
        <div className={s.fourCards}>{cards.map(([name, desc], i) => <article key={name} className={s.topicCard}><span className={s.imageSwatch + ' ' + s['swatch' + i]} /><h3>{name}</h3><p>{desc}</p><button>Explore {name.toLowerCase()}　→</button></article>)}</div>
        <div className={s.splitCards}><article className={s.chartCard}><h3>Voice Across Your Manuscript</h3><TinyArc /></article><article className={s.emergingCard}><h3>Observations</h3><p>◌ Reflective passages become more frequent after Chapter 5.</p><p>◎ Clara’s interior voice becomes more concise.</p><p>✦ Nature imagery carries more of the sensory detail.</p></article></div>
      </section>
    </>
  );
}

function ContinuityGrid() {
  const rows = ['Clara', 'The River', 'Change', 'Belonging', 'Uncertainty'];
  return <div className={s.continuityGrid}>{rows.map((row, r) => <div key={row} className={s.gridRow}><strong>{row}</strong>{Array.from({length:12},(_,c)=><span key={c} style={{opacity: 0.25 + (((r * 5 + c * 3) % 7) / 10)}} />)}</div>)}</div>;
}

function ContinuityView() {
  return (
    <>
      <ScenicHero title="Every part belongs." body="Continuity helps you see how moments, characters, ideas, and emotional threads move through your story." quote="A coherent story feels like a river — different at every turn, still itself." />
      <section className={s.sectionBlock}>
        <div className={s.sectionHeading}><div><h2>Continuity Across Your Manuscript</h2><p>These strands show up across chapters. Select any strand to explore.</p></div></div>
        <div className={s.fourCards}>
          {[['Character Arcs','How your characters evolve and reappear.'],['Key Settings','Places that ground your story.'],['Important Ideas','Themes and questions that carry through.'],['Emotional Flow','The feeling beneath the events.']].map(([name,desc])=><article key={name} className={s.topicCard}><h3>{name}</h3><p>{desc}</p><button>Explore　→</button></article>)}
        </div>
        <div className={s.splitCards}><article className={s.chartCard}><h3>Continuity Map</h3><ContinuityGrid /></article><article className={s.emergingCard}><h3>Observations</h3><p>⌁ The river reappears around moments of transition.</p><p>◎ Clara stays linked to place through repeated sensory details.</p><p>✦ Belonging begins to appear more often after Chapter 6.</p></article></div>
      </section>
    </>
  );
}

function MapView() {
  const nodes = [
    ['I. Home','What is known',50,9],['II. Descent','Stepping into change',82,25],['III. Threshold','The in-between',92,51],['IV. Transformation','What shifts',80,77],['V. Integration','A wider view',50,91],['VI. Belonging','A new relationship',20,77],['VII. Contribution','What you carry forward',8,51],['VIII. Renewal','The next unfolding',20,25],
  ] as const;
  return (
    <section className={s.mapLayout}>
      <article className={s.mapCard}><h2>Your Story at a Glance</h2><p>A member-declared map of your story’s movement. This is your lens — you can rename, reorder, or revise it.</p>
        <div className={s.spiralMap}><div className={s.mapCenter}>The River<br />Between</div>{nodes.map(([name,desc,x,y])=><button key={name} style={{left:x+'%',top:y+'%'}}><b>{name}</b><span>{desc}</span></button>)}</div>
        <div className={s.mapActions}><button>Edit your map</button><button>Learn more about the Spiral Map　→</button></div>
      </article>
      <article className={s.chapterPlace}><h2>Where This Chapter Lives</h2><p>Chapter 6 · The Current Changes</p><div className={s.mapLandscape}/><h3>III. Threshold</h3><p>The in-between</p><p>This chapter sits in the Threshold, where old ways loosen and new patterns begin to emerge.</p><button>Explore this chapter in context　→</button><h3>Nearby Movements</h3><p>II. Descent<br /><b>III. Threshold</b><br />IV. Transformation</p></article>
    </section>
  );
}

function DevelopScreen() {
  const [lens, setLens] = useState<DevelopLens>('overview');
  return (
    <div className={s.threePane}>
      <ManuscriptRail />
      <main className={s.developMain}>
        <header className={s.modeHeader}><div><h1>{lens === 'map' ? 'Story/Spiral Map' : lens === 'overview' ? 'Develop' : lens[0].toUpperCase() + lens.slice(1)}</h1><p>{lens === 'overview' ? 'See the shape of your story. Discover what is present, explore possibilities, and go deeper.' : lens === 'map' ? 'See the shape of your story — and how this chapter moves within it.' : 'Explore this aspect of your Work without losing your place in it.'}</p></div></header>
        <DevelopTabs lens={lens} setLens={setLens} />
        {lens === 'overview' && <DevelopOverview />}
        {lens === 'themes' && <ThemesView />}
        {lens === 'voice' && <VoiceView />}
        {lens === 'continuity' && <ContinuityView />}
        {lens === 'map' && <MapView />}
      </main>
      <MaiaPanel />
    </div>
  );
}

function ReviewScreen() {
  return (
    <div className={s.threePane}>
      <ManuscriptRail compact />
      <main className={s.reviewMain}>
        <header className={s.modeHeader}><div><h1>Review</h1><p>See your manuscript clearly. Explore, refine, and prepare what comes next.</p></div><blockquote>“Clarity is a form of care — for your reader, and for your story.”</blockquote></header>
        <nav className={s.lensTabs}>{['Overview','Structure','Pacing','Characters','Themes','Voice','Reader Experience','Readiness'].map((x,i)=><button key={x} className={i===0?s.activeLens:undefined}>{x}</button>)}</nav>
        <div className={s.reviewStats}>
          {[['12','Chapters'],['68,421','Total Words'],['5','Core Themes'],['5','Main Characters'],['87%','Coverage']].map(([num,label])=><article key={label}><strong>{num}</strong><span>{label}</span></article>)}
        </div>
        <section className={s.reviewGrid}>
          <article className={s.keyPassages}><div className={s.sectionHeading}><div><h2>Key Passages</h2><p>Moments you may want to look at again.</p></div><button className={s.selectButton}>All Chapters⌄</button></div>
            {[
              ['“Maybe this is what growing feels like. Not arriving, but learning to stay with the in-between.”','Theme · Voice'],
              ['The river had always moved, but that morning it seemed to move differently.','Imagery · Character'],
              ['She took a deeper breath and kept walking.','Pacing · Transition'],
            ].map(([text,tags],i)=><button key={text} className={i===0?s.passageActive:s.passage}><span className={s.passageThumb}/><span><b>{text}</b><small>Chapter 6　·　p. {112-i*4}</small></span><em>{tags}</em><span>›</span></button>)}
          </article>
          <article className={s.patternsCard}><h2>Patterns to Explore</h2>{['The river as mirror','Clara’s changing relationship with place','Transitions','Questions of belonging','Moments of stillness'].map(x=><button key={x}>{x}<span>›</span></button>)}</article>
        </section>
        <section className={s.reviewBottom}><article className={s.chartCard}><h2>Manuscript Arc</h2><TinyArc /></article><article className={s.patternsCard}><h2>Reader Perspective</h2>{['Emotional resonance','Clarity','Engagement','Takeaway'].map(x=><button key={x}>{x}<span>›</span></button>)}</article></section>
        <div className={s.storyMatters}>—　Your story matters.　—</div>
      </main>
      <MaiaPanel scope="This Chapter" review />
    </div>
  );
}

function HomeScreen({ setMode }: { setMode: (mode: Mode) => void }) {
  return (
    <main className={s.home}>
      <section className={s.welcome}><div><p>Welcome back.</p><h1>The River Between</h1><span>Novel · 82,400 words</span><button onClick={() => setMode('write')}>Open manuscript</button></div><div className={s.homeLandscape}/></section>
      <section className={s.homePrompt}><h2>Your writing space</h2><p>Same home. New clarity. Deeper work.</p><p className={s.homeQuote}>“A calm, consistent surface for a truer you.”</p></section>
    </main>
  );
}

export default function FlagshipV2Preview() {
  const [mode, setMode] = useState<Mode>('write');
  return (
    <div className={s.app}>
      <TopBar mode={mode} setMode={setMode} />
      {mode === 'home' && <HomeScreen setMode={setMode} />}
      {mode === 'write' && <WriteScreen />}
      {mode === 'develop' && <DevelopScreen />}
      {mode === 'review' && <ReviewScreen />}
    </div>
  );
}
