import Link from 'next/link';
import styles from './decision-house.module.css';

export default function DecisionsHouseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.room}>
      <header className={styles.threshold} aria-label="Decisions room navigation">
        <Link href="/house" className={styles.brand} aria-label="Return to the House">
          <img src="/holoflower-studio-transparent.png" alt="" />
          <span>SOULLAB</span>
        </Link>
        <div className={styles.roomName}>
          <span>THE HOUSE</span>
          <b>DECISIONS</b>
        </div>
        <Link href="/house" className={styles.return}>Return to House →</Link>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
