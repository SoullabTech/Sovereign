import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireMemberId } from '@/lib/auth/session';
import {
  MEMBER_FOUNDRY_ENTRIES,
  MEMBER_FOUNDRY_FOCUS,
  MEMBER_FOUNDRY_ORIGIN,
} from '@/lib/foundry/memberResearch';
import { FoundryMemberExplorer } from './FoundryMemberExplorer';
import styles from './member-foundry.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Foundry | Soullab',
  description: 'An inside look at the research and ideas Soullab is exploring.',
  robots: { index: false, follow: false },
};

/**
 * The member reading room is downstream of the authenticated /home House.
 *
 * It consumes only a committed, public-source snapshot: no member records,
 * manuscript data, JARVIS control plane, model calls or external requests.
 * The existing signer/session gate is required on every request.
 */
export default async function MemberFoundryPage() {
  try {
    await requireMemberId();
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      redirect('/signin?next=%2Fhome%2Ffoundry');
    }
    throw error;
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.topline}>
          <Link href="/home" className={styles.back}>
            <span aria-hidden="true">←</span> Back to Home
          </Link>
          <span className={styles.brand}>SOULLAB <span aria-hidden="true">·</span> THE FOUNDRY</span>
        </header>

        <section className={styles.hero} aria-labelledby="foundry-title">
          <p className={styles.eyebrow}>AN OPEN LOOK AT OUR RESEARCH</p>
          <h1 id="foundry-title">The Foundry</h1>
          <p className={styles.heroLead}>
            Where we explore the ideas, methods and open research that could shape
            Soullab&apos;s future.
          </p>
          <p className={styles.heroSub}>
            You&apos;re invited to see what we&apos;re studying, why it interests us,
            and where the limits are. Nothing here is a new product or an
            automatically activated AI capability.
          </p>
          <div className={styles.truthLine}>
            <span>Research library</span>
            <span>{MEMBER_FOUNDRY_ORIGIN.sourceCount} public research leads</span>
            <span>No new capabilities enabled</span>
          </div>
        </section>

        <section aria-labelledby="why-foundry" className={styles.orientation}>
          <div className={styles.orientationIntro}>
            <p className={styles.eyebrow}>WHY THIS EXISTS</p>
            <h2 id="why-foundry">Capability with care.</h2>
            <p>
              We want Soullab to grow through carefully studied ideas—not a
              collection of disconnected tools or an endless list of promises.
              Our members deserve to understand what is being considered,
              and how we evaluate it.
            </p>
          </div>
          <div className={styles.principles}>
            <article>
              <strong>Study before adopting</strong>
              <p>We look at sources, evidence and alternatives before deciding what belongs.</p>
            </article>
            <article>
              <strong>Keep you in charge</strong>
              <p>Research cannot quietly become access to your writing, data or decisions.</p>
            </article>
            <article>
              <strong>Separate meaning from measurement</strong>
              <p>Scientific models can inform questions without defining anyone&apos;s lived experience.</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="could-grow" className={styles.possibilities}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>POSSIBLE DIRECTIONS</p>
            <h2 id="could-grow">What might this research help us build?</h2>
            <p>These are areas of exploration, not announcements of new features.</p>
          </div>
          <div className={styles.focusGrid}>
            {MEMBER_FOUNDRY_FOCUS.map((focus) => (
              <article key={focus.title} className={styles.focusCard}>
                <h3>{focus.title}</h3>
                <p>{focus.description}</p>
                <span>{focus.keyword}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="sources" aria-labelledby="source-library-title" className={styles.library}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>THE RESEARCH LIBRARY</p>
            <h2 id="source-library-title">Explore the sources</h2>
            <p>
              Browse our public leads. Every source is research-only, not an installed
              feature. Exact software licenses, safety and real-world usefulness are not assumed.
            </p>
          </div>
          <FoundryMemberExplorer entries={[...MEMBER_FOUNDRY_ENTRIES]} />
        </section>

        <aside className={styles.boundary} aria-label="Research boundary">
          <strong>What this page does—and does not—mean</strong>
          <p>
            These are public research sources under consideration, not Soullab
            endorsements, licensed integrations or installed tools. No member information
            is included in the research catalogue. This page makes no model requests
            and cannot read your journal, manuscripts, clinical information or MAIA conversations. Following a public
            source link is your choice and opens that external website.
          </p>
          <Link href="/home">Return to your Home <span aria-hidden="true">→</span></Link>
        </aside>
      </div>
    </main>
  );
}
