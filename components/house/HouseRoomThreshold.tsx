import Link from 'next/link';
import styles from './house-room-threshold.module.css';

export function HouseRoomThreshold({ room }: { room: string }) {
  return (
    <header className={styles.threshold} aria-label={`${room} Soullab navigation`}>
      <Link href="/home" className={styles.brand} aria-label="Return to Soullab Home">
        <img src="/holoflower-studio-transparent.png" alt="" />
        <span>SOULLAB</span>
      </Link>
      <div className={styles.room}>
        <span>HOME</span>
        <b>{room}</b>
      </div>
      <Link href="/home" className={styles.return}>Return Home →</Link>
    </header>
  );
}
