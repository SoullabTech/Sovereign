import type { Metadata } from 'next';
import Link from 'next/link';
import { WRITER_STUDIO_PRICE_PROPOSAL } from '@/lib/writersStudio/planPolicy';
import styles from './plans.module.css';

export const metadata: Metadata = {
  title: 'Writer’s Studio Free + Pro · Soullab',
  description: 'Discover your voice, deepen your craft and remain the author.',
};

const experiences = [
  { name: 'Writing and author-owned drafts', free: 'Included', pro: 'Included' },
  { name: 'Inspiration and intention compass', free: 'Included', pro: 'Included' },
  { name: 'MAIA writing guidance', free: 'Foundational', pro: 'Expanded' },
  { name: 'Develop, Write and Review', free: 'Essential craft', pro: 'Advanced editorial depth' },
  { name: 'Writer’s Academy', free: 'Foundation lessons', pro: 'Advanced learning' },
  { name: 'Projects and continuity', free: 'One active project proposed', pro: 'Multiple projects proposed' },
  { name: 'Essential ownership, export, privacy and deletion', free: 'Included', pro: 'Included' },
] as const;

export default function WriterStudioPlans() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Writer’s Studio">
        <Link href="/explore/writers-studio">← Discover Writer’s Studio</Link>
        <span>Soullab · Writer’s Studio</span>
      </nav>
      <div className={styles.content}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>A place for the writer to emerge</p>
          <h1>Your voice belongs to you.</h1>
          <p>Begin freely. Deepen your craft when you choose. MAIA works alongside you without taking authorship away.</p>
        </header>
        <div className={styles.grid}>
          <section className={styles.plan} aria-labelledby="free-heading">
            <p className={styles.kicker}>Discover your voice</p>
            <h2 id="free-heading">Writer’s Studio Free</h2>
            <p className={styles.price}>$0 <span>ongoing</span></p>
            <p>For first stories, reflective writing, journaling and the beginning of longer work.</p>
            <p className={styles.planDetail}>Inspiration and intentions, a welcoming writing space, foundational MAIA guidance, and the first Academy experiences.</p>
          </section>
          <section className={styles.plan} aria-labelledby="pro-heading">
            <p className={styles.kicker}>Deepen your craft</p>
            <h2 id="pro-heading">Writer’s Studio Pro</h2>
            <p className={styles.price}>${WRITER_STUDIO_PRICE_PROPOSAL.proMonthlyUsd} <span>/ month · proposed</span></p>
            <p>For writers developing larger works and looking for an extended creative and editorial partnership.</p>
            <p className={styles.planDetail}>Advanced Develop and Review, whole-work relationships, expanded MAIA guidance, multiple projects and advanced Academy learning.</p>
          </section>
        </div>
        <section className={styles.compare} aria-labelledby="compare-heading">
          <h2 id="compare-heading">What each experience includes</h2>
          <div className={styles.tableWrap}>
            <table>
              <thead><tr><th scope="col">Experience</th><th scope="col">Free</th><th scope="col">Pro</th></tr></thead>
              <tbody>
                {experiences.map((experience) => (
                  <tr key={experience.name}>
                    <th scope="row">{experience.name}</th>
                    <td>{experience.free}</td>
                    <td>{experience.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className={styles.beta} aria-labelledby="beta-heading">
          <p className={styles.kicker}>Invitation-only testing</p>
          <h2 id="beta-heading">Our approved beta writers receive Pro at no charge.</h2>
          <p>Each individually admitted pilot writer receives the same approved Studio experience without subscription charges. No one is automatically enrolled. Features still undergoing security, custody or recovery acceptance remain held.</p>
        </section>
        <p className={styles.footnote}>
          Public Free enrollment and Pro checkout are not yet open. Project counts and AI usage limits are proposals, not active restrictions. Essential export belongs in both plans, but member PDF/EPUB delivery and original-file import remain subject to separate release approval.
        </p>
        <p className={styles.footer}><Link href="/explore/writers-studio">Learn about Writer’s Studio →</Link></p>
      </div>
    </main>
  );
}
