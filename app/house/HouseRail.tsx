import Link from 'next/link';
import styles from './house.module.css';
import { MaiaThresholdLink } from './MaiaThresholdLink';
import { AccountMenu } from './AccountMenu';

/** The House's left membrane (a top bar on phones). Shared by the House home and All places. */
export function HouseRail({ current }: { current: 'home' | 'house' | 'places' }) {
  return (
  <aside className={styles.rail}>
    <Link href="/" className={styles.brand} aria-label="Soul Lab public home">
      <img className={styles.brandFlower} src="/holoflower-studio-transparent.png" alt="" />
      <b>SOULLAB</b>
      <small>BEING<br />BECOMING<br />TOGETHER</small>
    </Link>
    <nav aria-label="Soul Lab">
      {current === 'home' ? <span aria-current="page">Home</span> : <Link href="/home">Home</Link>}
      {current === 'house' ? <span aria-current="page">House</span> : <Link href="/house">House</Link>}
      <MaiaThresholdLink />
    </nav>
    <nav className={styles.railFoot} aria-label="Member">
      <AccountMenu />
    </nav>
  </aside>
  );
}
