import Link from 'next/link';
import styles from './house-room-threshold.module.css';

export function HouseRoomThreshold({ room }: { room: string }) {
  return (
    <header className={styles.threshold} aria-label={`${room} House navigation`}>
      <Link href="/house" className={styles.brand} aria-label="Return to the House">
        <img src="/holoflower-studio-transparent.png" alt="" />
        <span>SOULLAB</span>
      </Link>
      <div className={styles.room}>
        <span>THE HOUSE</span>
        <b>{room}</b>
      </div>
      <Link href="/house" className={styles.return}>Return to House →</Link>
    </header>
  );
}
