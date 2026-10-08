import Link from 'next/link';
import { getDoorwayAudience } from '@/lib/constellation/doorways';
import styles from './astrology-doorway.module.css';

const lenses = [
  ['Calculated facts', 'Begin with the actual chart: planets, signs, houses, aspects, and timing rather than a personality template.'],
  ['Symbolic tradition', 'Keep interpretation visibly rooted in astrological traditions rather than presenting symbols as objective facts about a person.'],
  ['Whole-chart synthesis', 'Let placements modify and speak to one another instead of reducing the chart to a list of independent traits.'],
  ['Human expression', 'Explore ways a pattern could be lived without declaring how it must be lived.'],
  ['Present activation', 'Bring current transits into conversation as symbolic timing, not prediction or fate.'],
  ['Your own meaning', 'Your experience remains the final authority. A chart can illuminate; it does not get to overrule your life.'],
];

export function AstrologyDoorway({ audienceId }: { audienceId?: string }) {
  const audience = getDoorwayAudience('astrology', audienceId);
  const attribution = `doorway=astrology&campaign=astrology-discover${audience ? `&audience=${encodeURIComponent(audience.id)}` : ''}`;
  const next = '/astrology';
  const signupHref = `/signup?next=${encodeURIComponent(next)}&${attribution}`;
  const signinHref = `/signin?next=${encodeURIComponent(next)}&${attribution}`;

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Astrology">
        <Link href="/home" className={styles.brand}>Soullab</Link>
        <Link href={signinHref} className={styles.member}>Already a member</Link>
      </nav>

      <section className={styles.hero}>
        <div className={styles.orbit} aria-hidden="true">
          <span className={styles.sun}>☉</span>
          <span className={styles.moon}>☾</span>
          <span className={styles.star}>✦</span>
        </div>
        <p className={styles.eyebrow}>
          Astrology · a Soullab doorway{audience ? ` · for ${audience.label.toLowerCase()}` : ''}
        </p>
        <h1>Your chart is not a verdict.</h1>
        <p className={styles.lede}>
          {audience?.invitation ?? 'Meet your birth chart as a living symbolic whole — calculated carefully, interpreted humbly, and explored in conversation with MAIA.'}
        </p>
        {audience && <p className={styles.longing}>“{audience.longing}”</p>}
        <div className={styles.actions}>
          <Link href={signupHref} className={styles.primary}>Enter Astrology</Link>
          <a href="#approach" className={styles.secondary}>See the approach</a>
        </div>
      </section>

      <section className={styles.thesis}>
        <p>
          A chart can become a language for seeing pattern, tension, possibility, and timing.
          It becomes less useful when interpretation hardens into identity or prediction.
        </p>
      </section>

      <section id="approach" className={styles.approach}>
        <div className={styles.approachIntro}>
          <p className={styles.eyebrow}>A whole-chart conversation</p>
          <h2>Calculation, tradition, synthesis, and lived experience stay distinct.</h2>
        </div>
        <div className={styles.lenses}>
          {lenses.map(([title, copy], index) => (
            <article className={styles.lens} key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.maia}>
        <div>
          <p className={styles.eyebrow}>MAIA enters through the chart</p>
          <h2>Not “this is who you are.” More: “what does this symbol open for you?”</h2>
        </div>
        <p>
          MAIA can hold the calculated chart, the symbolic tradition, the wider pattern, and
          the present moment in one conversation. But interpretation remains an offering.
          Your own meaning, contradiction, and lived experience can revise the conversation
          at any time.
        </p>
      </section>

      <section className={styles.notThis}>
        <p className={styles.eyebrow}>What this is not</p>
        <div>
          <p>Not a daily horoscope dressed up as intimacy.</p>
          <p>Not a personality score.</p>
          <p>Not fate language.</p>
          <p>Not a machine claiming privileged access to your inner life.</p>
        </div>
      </section>

      <section className={styles.constellation}>
        <p className={styles.eyebrow}>One doorway into Soullab</p>
        <h2>Come because the chart matters. Discover the rest only if your life opens there.</h2>
        <p>
          Astrology stands on its own. If your exploration naturally touches relationship,
          writing, practice, or another part of your life, MAIA can acknowledge that connection
          without turning the conversation into a product funnel.
        </p>
        <Link href={signupHref} className={styles.primary}>Begin with your chart</Link>
      </section>

      <footer className={styles.footer}>
        <span>Astrology</span>
        <span>Soullab</span>
      </footer>
    </main>
  );
}
