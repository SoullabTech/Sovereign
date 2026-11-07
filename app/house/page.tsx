import Link from 'next/link';
import { readHousePreferences } from '@/lib/house/preferencesStore';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db/postgres';
import styles from './house.module.css';
import { memberForHouse, livingWorksForHouse, cabinHousePreferences } from './houseData';
import { MaiaThresholdLink } from './MaiaThresholdLink';
import { HouseRail } from './HouseRail';
import { HousePreferencesProvider, HouseMemberControls, HouseCenter, HouseQuickAccess, HouseDirectory, HousePassingThrough, HouseQuickAccessStacked } from './HousePreferences';
import { selectPassingQuote } from './passingContext';
import { PASSING_QUOTES } from './passingQuotes';
import { studioArrivalFromHouse } from '@/app/writers-studio/situatedWork';
import { canUseHouseStudioH1 } from '@/lib/access/houseStudioH1Access';
import { houseWritingHref } from '@/app/writers-studio/h1Arrival';
import { houseWriterStudioHref } from '@/lib/house/houseCabinContext';
import { CurrentTransitsField } from '@/components/astrology/CurrentTransitsField';
import { isWriterStudioInvitationRefusal } from '@/lib/writersStudio/invitationRefusal';
import { WritersStudioAccessNotice } from './WritersStudioAccessNotice';

const GROUNDS = [
  { href: '/relationships', label: 'People', line: 'Return to the relationships you are tending' },
  { href: '/commons/circles', label: 'Gatherings', line: 'Meet the communities and circles you belong to' },
  { href: '/offerings', label: 'Offerings', line: 'Bring something of value into the world' },
] as const;

export const dynamic = 'force-dynamic';

export async function HouseExperience({ current = 'house', writersStudioRefused = false }: {
  current?: 'home' | 'house';
  writersStudioRefused?: boolean;
} = {}) {
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
      <HouseRail current={current} />

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
          <HouseMemberControls name={firstName} arrange="wide" />
        </header>

        <div className={styles.welcome}>
          <p>THE HOUSE</p>
          <h1>Welcome home,<br />{firstName}.</h1>
          <h2>Many paths. A deeper you.</h2>
        </div>

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

        {/* Founder direction 2026-11-05: MAIA comes before the sky wherever the page stacks
            (phones, tablets, the iPhone app). On wide screens MAIA keeps her own column. */}
        <div className={styles.wideOnly}><CurrentTransitsField variant="house" /></div>

        <section className={styles.centerIntro} aria-labelledby="home-spaces-title">
          <p>YOUR SPACES</p>
          <h3 id="home-spaces-title">Choose where you want to work.</h3>
          <span>Each space holds a different kind of attention. Open one to enter it.</span>
        </section>

        <WritersStudioAccessNotice refused={writersStudioRefused} />
        <HouseCenter />
        <HouseQuickAccessStacked />

        {/* HOUSE-MOBILE-01 (phones and iPads): the sky and what's alive as one line each.
            Wide screens keep the full sky panel and the What's alive row below. */}
        <section className={`${styles.today} ${styles.narrowOnly}`} aria-label="Today">
          <p>TODAY</p>
          <CurrentTransitsField variant="line" />
          <Link className={styles.todayLine} href={cabinOffline
            ? (livingWorks[0] ? houseWriterStudioHref(livingWorks[0].id) : '/writers-studio?from=house')
            : houseWritingHref(houseStudioH1Admitted, livingWorks[0]?.id ?? null, studioArrivalFromHouse)}>
            <span className={styles.todayLabel}>What&rsquo;s alive</span>
            <span className={styles.todaySummary}>{livingWorks[0] ? (livingWorks[0].title || 'An unnamed living work') : 'No living Work yet'}</span>
            <span className={styles.todayChevron} aria-hidden="true">Writing ›</span>
          </Link>
        </section>

        <section className={`${styles.alive} ${styles.wideOnly}`} aria-label="What's alive">
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

        <div className={styles.wideOnly}><HouseDirectory /></div>
        <Link href="/house/places" className={`${styles.placesDoor} ${styles.narrowOnly}`}>
          <span><strong>All places</strong><small>Find any room or tool in the House</small></span>
          <span className={styles.todayChevron} aria-hidden="true">›</span>
        </Link>

        <details className={`${styles.moreHouse} ${styles.narrowOnly}`}>
          <summary>More of the House</summary>
          <p className={styles.moreMarker}>THE HOUSE IS NOT THE JOURNEY</p>
          <p className={styles.moreCompass}>Meet yourself. Meet others. Meet the world. <em>Make something of the meeting.</em></p>
          <p className={styles.moreMarker}>GROUNDS</p>
          <div className={styles.moreGrounds}>
            {GROUNDS.map((way) => <Link key={way.href} href={way.href}><strong>{way.label}</strong><small>{way.line}</small></Link>)}
          </div>
        </details>
        <div className={`${styles.goLive} ${styles.narrowOnly} ${styles.goLiveNarrow}`}>
          <span>Nothing here needs to keep you here.</span>
          <Link href="/">Go live →</Link>
        </div>

        <section className={`${styles.lifeCompass} ${styles.wideOnly}`} aria-label="Life compass">
          <p>THE HOUSE IS NOT THE JOURNEY</p>
          <div>
            <span>Meet yourself.</span>
            <span>Meet others.</span>
            <span>Meet the world.</span>
            <strong>Make something of the meeting.</strong>
          </div>
        </section>

        <section className={`${styles.grounds} ${styles.wideOnly}`} aria-label="Grounds">
          <div className={styles.groundsHead}>
            <p>GROUNDS</p>
            <h3>What is asking for your participation?</h3>
            <span>The House returns to life.</span>
          </div>
          <div className={styles.groundsWays}>
            {GROUNDS.map((way) => <Link key={way.href} href={way.href}><strong>{way.label}</strong><small>{way.line}</small></Link>)}
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
type HousePageProps = { searchParams?: Promise<{ access?: string | string[] }> };
export default async function HousePage({ searchParams }: HousePageProps) {
  const p = (await searchParams) || {};
  return <HouseExperience current="house" writersStudioRefused={isWriterStudioInvitationRefusal(p.access)} />;
}
