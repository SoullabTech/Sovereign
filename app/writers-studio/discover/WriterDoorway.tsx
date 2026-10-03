import Link from 'next/link';
import { getDoorway, getDoorwayAudience } from '@/lib/constellation/doorways';
import styles from './writers-doorway.module.css';

const doorway = getDoorway('writers-studio');

const cases = [
  {
    title: 'You carry years of lived knowledge.',
    copy: 'You may be a healer, clinician, teacher, elder, researcher, guide, or practitioner. The problem is not that you have nothing to say. The difficulty is giving what you know a form that can travel.',
  },
  {
    title: 'You already have a manuscript.',
    copy: 'The book exists, but you can still feel the distance between what it is and what it could become. The work is refinement rather than replacement.',
  },
  {
    title: 'You speak more naturally than you write.',
    copy: 'Your stories, teaching, and intelligence are alive in conversation. Writer’s Studio helps the page carry more of what is already there.',
  },
];

export function WriterDoorway({ audienceId }: { audienceId?: string }) {
  const audience = getDoorwayAudience('writers-studio', audienceId);
  const audienceQuery = audience ? `&audience=${encodeURIComponent(audience.id)}` : '';
  const signupHref = `/signup?next=%2Fwriters-studio&doorway=writers-studio&campaign=writers-discover${audienceQuery}`;

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Writer’s Studio">
        <Link href="/home" className={styles.brand}>Soullab</Link>
        <Link href="/signin?next=%2Fwriters-studio" className={styles.signin}>Already a member</Link>
      </nav>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>
          Writer’s Studio · a Soullab doorway{audience ? ` · for ${audience.label.toLowerCase()}` : ''}
        </p>
        <h1>Write what only you can write.</h1>
        <p className={styles.lede}>
          {audience?.invitation ?? 'An intelligent writing studio designed to strengthen the work without replacing the person behind it.'}
        </p>
        {audience && <p className={styles.audienceLonging}>“{audience.longing}”</p>}
        <div className={styles.actions}>
          <Link href={signupHref} className={styles.primary}>Enter Writer’s Studio</Link>
          <a href="#how-it-works" className={styles.secondary}>See how it works</a>
        </div>
        <p className={styles.note}>Your voice remains yours. Suggestions remain suggestions.</p>
      </section>

      <section className={styles.statement}>
        <p>
          Some people do not need an AI to write for them. They need an intelligence capable
          of understanding what they are trying to say — and helping the writing carry it
          more faithfully.
        </p>
      </section>

      <section className={styles.grid} aria-label="Who Writer’s Studio is for">
        {cases.map((item) => (
          <article key={item.title} className={styles.card}>
            <h2>{item.title}</h2>
            <p>{item.copy}</p>
          </article>
        ))}
      </section>

      <section id="how-it-works" className={styles.process}>
        <div>
          <p className={styles.eyebrow}>A different editorial relationship</p>
          <h2>Your manuscript stays at the center.</h2>
        </div>
        <ol>
          <li><strong>Bring the real work.</strong><span>Start with a passage, chapter, draft, or complete manuscript.</span></li>
          <li><strong>Let MAIA understand before changing.</strong><span>Read for meaning, voice, structure, lineage, continuity, and reader experience.</span></li>
          <li><strong>Choose the intervention.</strong><span>Review alternatives, reasoning, and context before anything is applied.</span></li>
          <li><strong>Keep authorship sovereign.</strong><span>Accept, reject, undo, revise, or continue the conversation. The writer remains the authority.</span></li>
        </ol>
      </section>

      <section className={styles.caseStudy}>
        <p className={styles.eyebrow}>Founding case study</p>
        <h2><em>Elemental Alchemy</em></h2>
        <p>
          Writer’s Studio is being tested against a demanding real manuscript: an already
          published book carrying decades of clinical work, Jungian study, spiritual inquiry,
          and lived practice. The question is not whether AI can rewrite it. The question is
          whether an intelligent editorial environment can help the book reach its fullest
          expression while preserving the author who made it.
        </p>
      </section>

      <section className={styles.constellation}>
        <div>
          <p className={styles.eyebrow}>One doorway into a larger ecology</p>
          <h2>Come for the writing. Discover only what becomes relevant.</h2>
        </div>
        <p>
          Writer’s Studio stands on its own. It is also part of Soullab: a wider ecology of
          reflection, relationship, astrology, practice, and creative work held together by
          MAIA. Other rooms are offered only when they genuinely belong to what you are
          already exploring.
        </p>
      </section>

      <section className={styles.finalCta}>
        <h2>The work is already in you.</h2>
        <p>Give it a place capable of listening closely enough to help it arrive.</p>
        <Link href={signupHref} className={styles.primary}>Begin in Writer’s Studio</Link>
      </section>

      <footer className={styles.footer}>
        <span>Writer’s Studio</span>
        <span>Soullab</span>
      </footer>
    </main>
  );
}
