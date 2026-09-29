import Link from 'next/link';
import { HouseReturnLink } from './HouseContinuityLink';
import styles from './house-room-threshold.module.css';

export function HouseRoomThreshold({
  room,
  returnHref = '/home',
  returnLabel = 'Home',
  placeId,
}: {
  room: string;
  returnHref?: string;
  returnLabel?: string;
  placeId?: string;
}) {
  return (
    <header
      className={styles.threshold}
      aria-label={`${room} Soullab navigation`}
      style={placeId ? { viewTransitionName: `house-place-${placeId}` } : undefined}
    >
      <Link href={returnHref} className={styles.brand} aria-label={`Return to ${returnLabel}`}>
        <img src="/holoflower-studio-transparent.png" alt="" />
        <span>SOULLAB</span>
      </Link>
      <div className={styles.room}>
        <span>{returnLabel.toUpperCase()}</span>
        <b>{room}</b>
      </div>
      {placeId ? (
        <HouseReturnLink
          href={returnHref}
          placeId={placeId}
          className={styles.return}
          shareIdentity={false}
        >
          Return to {returnLabel} →
        </HouseReturnLink>
      ) : (
        <Link href={returnHref} className={styles.return}>
          Return to {returnLabel} →
        </Link>
      )}
    </header>
  );
}
