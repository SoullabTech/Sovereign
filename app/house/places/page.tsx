import Link from 'next/link';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db/postgres';
import { readHousePreferences } from '@/lib/house/preferencesStore';
import styles from '../house.module.css';
import { memberForHouse, cabinHousePreferences } from '../houseData';
import { HouseRail } from '../HouseRail';
import { HousePreferencesProvider, HouseMemberControls, HouseDirectory } from '../HousePreferences';

/** HOUSE-MOBILE-01 D1: All places has its own page, so the House home stays a place of
 *  arrival on phones and iPads rather than a catalogue. */
export const dynamic = 'force-dynamic';

export default async function HousePlacesPage() {
  const member = await memberForHouse();
  if (!member) redirect('/signin');
  const firstName = member.name?.trim().split(/\s+/)[0] || 'there';
  const housePreferences = process.env.MAIA_CABIN_MODE === 'offline'
    ? cabinHousePreferences(member.id)
    : await readHousePreferences(member.id, query);

  return (
    <HousePreferencesProvider initial={housePreferences} key={housePreferences.tag.split('-')[1]}>
    <main className={styles.house}>
      <HouseRail current="places" />
      <section className={styles.field}>
        <header className={styles.topline}>
          <Link href="/house" className={styles.backToHouse}>‹ House</Link>
          <HouseMemberControls name={firstName} />
        </header>
        <div className={styles.placesPage}>
          <HouseDirectory variant="list" />
        </div>
      </section>
    </main>
    </HousePreferencesProvider>
  );
}
