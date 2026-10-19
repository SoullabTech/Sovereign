import Link from 'next/link';
import type { Metadata } from 'next';
import { PUBLIC_DOORWAYS } from '@/lib/launch/publicDoorwaysP0';
import styles from './explore.module.css';

export const metadata: Metadata = {
  title: 'Explore Soullab — One ecosystem, many doors',
  description: 'Discover Writer’s Studio, Pro Studio, Astrology Pro, MAIA, AIN OS and the experiences taking shape across Soullab.',
  robots: { index: false, follow: false }, // public preview only; SEO awaits founder release.
};

export default function ExploreSoullab() {
  return <main className={styles.field}>
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/home">Soullab</Link>
        <nav className={styles.nav} aria-label="Explore navigation">
          <Link href="/home">Home</Link>
          <Link href="/signin?next=/home">Sign in</Link>
        </nav>
      </header>
      <section className={styles.hero} aria-labelledby="explore-heading">
        <p className={styles.eyebrow}>One ecosystem. Many doors.</p>
        <h1 id="explore-heading">Enter through what matters to you.</h1>
        <p className={styles.lead}>
          You may come to write, to serve others, to explore a symbolic map,
          to learn or to meet a different kind of intelligence.
          Each place has its own purpose. Soullab is where they can belong together.
        </p>
        <p className={styles.purpose}>Service first. Not self last.</p>
      </section>
      <section aria-label="Discover a Soullab experience" className={styles.grid}>
        {PUBLIC_DOORWAYS.map((door) => (
          <Link key={door.slug} className={styles.card} href={'/explore/' + door.slug}>
            <span className={styles.status}>{door.status}</span>
            <h2>{door.name}</h2>
            <p className={styles.audience}>{door.audience}</p>
            <p className={styles.desc}>{door.introduction}</p>
            <span className={styles.learn}>Discover this doorway →</span>
          </Link>
        ))}
      </section>
      <footer className={styles.footer}>
        <span>Private workspaces open only when their safeguards are verified.</span>
        <Link href="/home">Return to Soullab Home</Link>
      </footer>
    </div>
  </main>;
}
