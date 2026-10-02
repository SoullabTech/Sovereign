import Link from 'next/link';
import { HouseRoomThreshold } from '@/components/house/HouseRoomThreshold';
import styles from './practices-room.module.css';

const practices = [
  {
    name: 'Anchor',
    line: 'A quiet daily place to return, notice, and hold what matters.',
    href: '/maia/anchor?from=house',
    mark: '●',
  },
  {
    name: 'Meditation',
    line: 'Enter a guided meditation and consciousness practice.',
    href: '/consciousness/meditation',
    mark: '◌',
  },
] as const;

export default function PracticesPage() {
  return (
    <main className={styles.room}>
      <HouseRoomThreshold room="PRACTICES" />
      <section className={styles.inner}>
        <p className={styles.eyebrow}>PRACTICES</p>
        <h1>Return to what helps you become present.</h1>
        <p className={styles.lede}>
          Practices are places you can enter, not performances to maintain.
        </p>
        <div className={styles.grid}>
          {practices.map((practice) => (
            <Link href={practice.href} className={styles.card} key={practice.name}>
              <span className={styles.mark} aria-hidden="true">{practice.mark}</span>
              <span>
                <strong>{practice.name}</strong>
                <small>{practice.line}</small>
              </span>
              <i aria-hidden="true">→</i>
            </Link>
          ))}
        </div>

        <footer className={styles.footer}>
          <span>What is ready for members lives here.</span>
          <Link href="/house">Return to House →</Link>
        </footer>
      </section>
    </main>
  );
}
