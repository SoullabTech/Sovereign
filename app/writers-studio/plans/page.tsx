import type { Metadata } from 'next';
import Link from 'next/link';
import { proTasteEnabled } from '@/lib/writersStudio/proTaste';
import { PlansMemberStatus } from './PlansMemberStatus';
import styles from './plans.module.css';

/**
 * Writer's Studio — Free and Pro (step C1 of the Free Studio plan).
 *
 * Restores the plans page designed and contracted on 2026-10-22 ("Your voice belongs to you"), brought to the founder
 * rulings of 2026-11-02 and 2026-11-13:
 *   - Free is the whole Studio on one Work; Pro adds more Works and each Pro capability AS IT SHIPS (nothing that does
 *     not exist is listed);
 *   - the plan is "Writer's Studio Pro";
 *   - MAIA is never sold: Pro is capacity and tools, never a better or "expanded" MAIA (Sanctuary economy);
 *   - one complimentary whole-book editorial pass per Free writer (shown only while that is switched on);
 *   - "Ask about Pro", no price, until checkout exists;
 *   - Pro never holds a writer's work hostage: export, privacy and deletion are on every plan.
 * Inside the Writer's Studio corridor, so only admitted members reach it.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Writer’s Studio Free and Pro · Soullab',
  description: 'Your voice belongs to you. Begin freely; deepen your craft when you choose.',
};

export default function WriterStudioPlans() {
  const taste = proTasteEnabled();
  const rows: ReadonlyArray<{ name: string; free: string; pro: string }> = [
    { name: 'Writing, revising and saving your work', free: 'Included', pro: 'Included' },
    { name: 'Inspiration, and MAIA alongside you', free: 'Included', pro: 'Included — the same MAIA' },
    { name: 'Develop and review', free: 'Included', pro: 'Included' },
    { name: 'Export, privacy and deletion', free: 'Always yours', pro: 'Always yours' },
    { name: 'Works at once', free: 'One', pro: 'As many as you need' },
    { name: 'Whole-book editorial pass', free: taste ? 'Your first one is on us' : 'Part of Pro', pro: 'Whenever you need one' },
  ];

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Writer’s Studio">
        <Link href="/writers-studio">← Back to the Studio</Link>
        <span>Soullab · Writer’s Studio</span>
      </nav>
      <div className={styles.content}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>A place for the writer to emerge</p>
          <h1>Your voice belongs to you.</h1>
          <p>Begin freely. Deepen your craft when you choose. MAIA works alongside you without taking authorship away.</p>
        </header>

        <PlansMemberStatus />

        <div className={styles.grid}>
          <section className={styles.plan} aria-labelledby="free-heading">
            <p className={styles.kicker}>Discover your voice</p>
            <h2 id="free-heading">Writer’s Studio Free</h2>
            <p>The whole Studio, on one Work.</p>
            <p className={styles.planDetail}>
              Write, revise and keep your work. Inspiration, MAIA alongside you, develop and review. Export, privacy and
              deletion are yours.{taste ? ' And your first whole-book editorial pass is on us.' : ''}
            </p>
          </section>
          <section className={styles.plan} aria-labelledby="pro-heading">
            <p className={styles.kicker}>Deepen your craft</p>
            <h2 id="pro-heading">Writer’s Studio Pro</h2>
            <p>More Works, and the whole-book editorial pass.</p>
            <p className={styles.planDetail}>
              Keep several Works going at once, and ask MAIA to read a whole manuscript and write you an editorial letter
              whenever you need one.
            </p>
          </section>
        </div>

        <section className={styles.compare} aria-labelledby="compare-heading">
          <h2 id="compare-heading">What each plan includes</h2>
          <div className={styles.tableWrap}>
            <table>
              <thead><tr><th scope="col">In the Studio</th><th scope="col">Free</th><th scope="col">Pro</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name}>
                    <th scope="row">{row.name}</th>
                    <td>{row.free}</td>
                    <td>{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className={styles.promise}>
          Your writing is always yours, on any plan. MAIA is the same MAIA on every plan — Pro adds room and tools, never a
          different companion. If Pro ends, every Work stays yours to open, write and export.
        </p>
      </div>
    </main>
  );
}
