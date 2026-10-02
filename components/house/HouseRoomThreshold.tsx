import Link from 'next/link';
import styles from './house-room-threshold.module.css';

/**
 * The shared threshold between a facet room and Home.
 *
 * Its job is orientation, not branding. Where the destination already visibly
 * carries Soullab identity (its own shell shows the mark), the threshold does
 * not repeat it — two marks read as two competing headers. The destination
 * declares that about itself; the threshold never guesses it. Where the
 * destination carries no mark, the threshold keeps it.
 * (HOUSE-STUDIO-CIRCULATION-01R1 · founder ruling H1-close-1, 2026-09-30)
 *
 * Layered vocabulary (founder ruling H1-close-2, 2026-09-30; the Platform
 * Identity Canon stands unamended): HOME is the member-facing place — the
 * route, the navigation, the return action ("Return Home"). THE HOUSE names the
 * containing whole in threshold/circulation language. A threshold is a
 * boundary of the whole, not a place, so it is labelled THE HOUSE while the
 * member returns Home.
 */
export function HouseRoomThreshold({
  room,
  destinationCarriesMark = false,
}: {
  room: string;
  destinationCarriesMark?: boolean;
}) {
  return (
    <header
      className={styles.threshold}
      aria-label={`${room} Soullab navigation`}
      data-mark={destinationCarriesMark ? 'destination' : 'threshold'}
    >
      {destinationCarriesMark ? (
        <span className={styles.brandSpace} aria-hidden="true" />
      ) : (
        <Link href="/home" className={styles.brand} aria-label="Return to Soullab Home">
          <img src="/holoflower-studio-transparent.png" alt="" />
          <span>SOULLAB</span>
        </Link>
      )}
      <div className={styles.room}>
        <span>THE HOUSE</span>
        <b>{room}</b>
      </div>
      <Link href="/home" className={styles.return}>Return Home →</Link>
    </header>
  );
}
