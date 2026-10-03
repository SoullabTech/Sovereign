import Link from 'next/link';
import { requireMemberId } from '@/lib/auth/session';
import { readHousePreferences } from '@/lib/house/preferencesStore';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db/postgres';
import { HOUSE_PLACES, type HousePlaceId } from '@/lib/house/catalog';
import { defaultHousePreferences, type HousePreferenceSnapshot } from '@/lib/house/preferences';
import { housePreferenceTag } from '@/lib/house/preferencesStore';
import { cabinStore } from '@/lib/cabin/request';
import styles from './house.module.css';
import { MaiaThresholdLink } from './MaiaThresholdLink';
import { HousePreferencesProvider, HouseMemberControls, HouseCenter, HouseQuickAccess, HouseDirectory, HousePassingThrough } from './HousePreferences';
import { selectPassingQuote } from './passingContext';
import { PASSING_QUOTES } from './passingQuotes';
import { studioArrivalFromHouse } from '@/app/writers-studio/situatedWork';
import { canUseHouseStudioH1 } from '@/lib/access/houseStudioH1Access';
import { houseWritingHref } from '@/app/writers-studio/h1Arrival';
import { houseWriterStudioHref } from '@/lib/house/houseCabinContext';
import { CurrentTransitsField } from '@/components/astrology/CurrentTransitsField';

async function memberForHouse() {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      const member = store.ensureLocalMember();
      return {
        id: member.id,
        name: member.preferredName || member.name || 'there',
      };
    } finally {
      store.close();
    }
  }

  let memberId: string;
  try { memberId = await requireMemberId(); }
  catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') return null;
    throw error;
  }
  const result = await query('SELECT id, name FROM members WHERE id = $1', [memberId]);
  return (result.rows[0] as { id: string; name: string } | undefined) ?? null;
}

async function livingWorksForHouse(memberId: string) {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      return store.listWorks(memberId)
        .slice(0, 2)
        .map((work) => ({ id: work.id, title: work.title }));
    } finally {
      store.close();
    }
  }

  const r = await query(
    `SELECT id, title FROM living_works
     WHERE member_id = $1
     ORDER BY updated_at DESC
     LIMIT 2`,
    [memberId],
  );
  return r.rows as { id: string; title: string | null }[];
}

function cabinHousePreferences(memberId: string): HousePreferenceSnapshot {
  const eligibleIds = HOUSE_PLACES.map((place) => place.id) as HousePlaceId[];
  const store = cabinStore();
  try {
    const saved = store.readHousePreferences(memberId);
    const preferences = saved
      ? {
          version: 1 as const,
          center: saved.center as HousePlaceId[],
          shortcuts: saved.shortcuts as HousePlaceId[],
          passingThrough: saved.passingThrough,
        }
      : defaultHousePreferences(eligibleIds);

    const revision = saved?.revision ?? 0;
    return {
      preferences,
      revision,
      eligibleIds,
      tag: housePreferenceTag(memberId, revision),
    };
  } finally {
    store.close();
  }
}

export const dynamic = 'force-dynamic';

export async function HouseExperience({ current = 'house' }: { current?: 'home' | 'house' } = {}) {
  const member = await memberForHouse();
  if (!member) redirect('/signin');
  const firstName = member.name?.trim().split(/\s+/)[0] || 'there';
  const livingWorks = await livingWorksForHouse(member.id);
  const cabinOffline = process.env.MAIA_CABIN_MODE === 'offline';
  const houseStudioH1Admitted = !cabinOffline && canUseHouseStudioH1(member.id);
  const housePreferences = cabinOffline
    ? cabinHousePreferences(member.id)
    : await readHousePreferences(member.id, query);
  const passingQuote = selectPassingQuote(PASSING_QUOTES, new Date());

  return (
    <HousePreferencesProvider initial={housePreferences} key={housePreferences.tag.split('-')[1]}>
    <main className={styles.house}>
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
          <Link href="/search">Search</Link>
          <Link href="/profile">You</Link>
        </nav>
      </aside>

      <section className={styles.field}>
        <div className={styles.ambient} aria-hidden="true">
          <i /><i /><i />
          <span className={styles.planeA} />
          <span className={styles.planeB} />
          <span className={styles.planeC} />
          <span className={styles.horizon} />
        </div>
        <header className={styles.topline}>
          <span>A SPACE TO REFLECT, CREATE, EXPLORE AND RETURN</span>
          <HouseMemberControls name={firstName} />
        </header>

        <div className={styles.welcome}>
          <p>THE HOUSE</p>
          <h1>Welcome home,<br />{firstName}.</h1>
          <h2>Many paths. A deeper you.</h2>
        </div>

        <CurrentTransitsField variant="house" />

        <aside className={styles.presence} aria-label="House presence">
          <blockquote>Not a place<br />to escape life,<br />but a way to meet it<br />more fully.</blockquote>
          <div className={styles.maiaPresence}>
            <MaiaThresholdLink />
            <p>Always here<br />when you are ready.</p>
            <MaiaThresholdLink variant="invitation" />
          </div>
          <HouseQuickAccess />
          <HousePassingThrough quote={passingQuote} />
          <p className={styles.whole}>Different places.<br />A more whole you.</p>
        </aside>

        <section className={styles.centerIntro} aria-labelledby="home-spaces-title">
          <p>YOUR SPACES</p>
          <h3 id="home-spaces-title">Choose where you want to work.</h3>
          <span>Each space holds a different kind of attention. Open one to enter it.</span>
        </section>

        <HouseCenter />

        <section className={styles.alive} aria-label="What's alive">
          <p>WHAT'S ALIVE</p>
          {livingWorks.length > 0 ? livingWorks.map((work) => (
            <div key={work.id}>
              <span>{work.title || 'An unnamed living work'}</span>
              {/* HOUSE-STUDIO-CIRCULATION-01R1 · H1-B: carries the Work the member
                  points at — a pointer, never meaning. The Studio validates it. */}
              <Link href={cabinOffline ? houseWriterStudioHref(work.id) : houseWritingHref(houseStudioH1Admitted, work.id, studioArrivalFromHouse)}>Writing →</Link>
            </div>
          )) : (
            <div>
              <span>No living Work is asking for space here.</span>
              <Link href={cabinOffline ? '/writers-studio?from=house' : houseWritingHref(houseStudioH1Admitted, null, studioArrivalFromHouse)}>Writing →</Link>
            </div>
          )}
          <div>
            <span>Meet what is here</span>
            <MaiaThresholdLink />
          </div>
          <div>
            <span>See the larger whole</span>
            <Link href="/maia/living-field?from=house">Living Field →</Link>
          </div>
        </section>

        <HouseDirectory />

        <section className={styles.lifeCompass} aria-label="Life compass">
          <p>THE HOUSE IS NOT THE JOURNEY</p>
          <div>
            <span>Meet yourself.</span>
            <span>Meet others.</span>
            <span>Meet the world.</span>
            <strong>Make something of the meeting.</strong>
          </div>
        </section>

        <section className={styles.grounds} aria-label="Grounds">
          <div className={styles.groundsHead}>
            <p>GROUNDS</p>
            <h3>What is asking for your participation?</h3>
            <span>The House returns to life.</span>
          </div>
          <div className={styles.groundsWays}>
            <Link href="/relationships"><strong>People</strong><small>Return to the relationships you are tending</small></Link>
            <Link href="/commons/circles"><strong>Gatherings</strong><small>Meet the communities and circles you belong to</small></Link>
            <Link href="/offerings"><strong>Offerings</strong><small>Bring something of value into the world</small></Link>
          </div>
          <div className={styles.goLive}>
            <span>Nothing here needs to keep you here.</span>
            <Link href="/">Go live →</Link>
          </div>
        </section>
      </section>
    </main>
    </HousePreferencesProvider>
  );
}
export default async function HousePage() {
  return <HouseExperience current="house" />;
}
