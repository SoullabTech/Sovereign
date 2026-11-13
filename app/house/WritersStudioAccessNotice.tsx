import Link from 'next/link';
import styles from './house-preferences.module.css';

/** Shown on the House after the Studio's admission check refused this member. */
export function WritersStudioAccessNotice({ refused }: { refused: boolean }) {
  if (!refused) return null;
  return (
    <section className={styles.decisionNotice} role="status" data-house-access="writers-studio">
      <span className={styles.accessTitle}>
        <strong>Writer&apos;s Studio isn&apos;t open to you yet</strong>
        <small>Invitation-only during this beta</small>
      </span>
      <p>This signed-in account hasn&apos;t been invited to Writer&apos;s Studio, so Writing
        can&apos;t open here yet.</p>
      <p>Already invited? Check that you are using the account the invitation was sent to.</p>
      <Link href="/explore/writers-studio" className={styles.accessAction}>Read about Writer&apos;s Studio →</Link>
    </section>
  );
}
