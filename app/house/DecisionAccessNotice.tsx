import Link from 'next/link';
import styles from './house-preferences.module.css';

/** Discoverability is not an access grant. Studio still verifies the member. */
export function DecisionAccessNotice({ available }: { available: boolean }) {
  if (available) return null;
  return (
    <details className={styles.decisionNotice} data-house-access="decisions">
      <summary aria-label="Decisions — Studio connection needed">
        <span className={styles.accessMark} aria-hidden="true">⧉</span>
        <span className={styles.accessTitle}>
          <strong>Decisions</strong>
          <small>Studio connection needed</small>
        </span>
      </summary>
      <p>Decision Council is available through Personal or Practice Studio.
        This signed-in account has no active Studio connection.</p>
      <p>Already have a Studio? Check that you are using the account linked to it
        before creating another.</p>
      <Link href="/studio" className={styles.accessAction}>Check Studio access →</Link>
    </details>
  );
}
