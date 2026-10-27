import type { Metadata } from 'next';
import Link from 'next/link';
import {
  WRITER_INDEPENDENT_RELEASE_HOLDS,
  WRITER_STUDIO_FEATURE_INCLUSION,
  type WriterStudioFeature,
} from '@/lib/writersStudio/planPolicy';
import styles from './plans.module.css';

export const metadata: Metadata = {
  title: 'Writer’s Studio Free + Pro · Soullab',
  description: 'Begin freely. Deepen your craft when you choose. Your writing remains yours.',
  robots: { index: false, follow: false },
};

const FEATURE_LABELS: Readonly<Record<WriterStudioFeature, string>> = {
  author_owned_writing: 'Author-owned writing and drafts',
  inspiration_compass: 'Inspiration and intention compass',
  basic_develop: 'Foundational Develop',
  basic_review: 'Foundational Review',
  basic_maia: 'Foundational MAIA collaboration',
  author_controlled_edits: 'Author-controlled proposals, Apply and Undo',
  author_owned_text_copy: 'Author-owned copies of your writing',
  privacy_controls: 'Privacy controls and withdrawal rights',
  academy_foundations: 'Writer’s Academy foundations',
  advanced_develop: 'Advanced Develop',
  advanced_review: 'Advanced Review',
  whole_work_continuity: 'Whole-Work continuity',
  multiple_active_works: 'Multiple active Works',
  expanded_maia: 'Expanded MAIA collaboration',
  advanced_academy: 'Advanced Academy learning',
  listen: 'Listen room',
  publish_preparation: 'Publish preparation',
};

const HELD_LABELS: Readonly<Record<(typeof WRITER_INDEPENDENT_RELEASE_HOLDS)[number], string>> = {
  new_original_file_ingest: 'New original-file ingest',
  member_pdf_epub_delivery: 'Member PDF / EPUB delivery',
  live_provider_inference: 'Live provider-backed MAIA inference',
  deletion_safe_recovery: 'Deletion-safe backup and recovery',
  cloud_offline_sync: 'Cloud / offline synchronization',
  automatic_publisher_submission: 'Automatic publisher submission',
};

const features = Object.entries(WRITER_STUDIO_FEATURE_INCLUSION) as Array<[
  WriterStudioFeature,
  { readonly free: boolean; readonly pro: boolean },
]>;

export default function WriterStudioPlansPage() {
  return (
    <main className={styles.page} data-writer-plans>
      <nav className={styles.nav} aria-label="Writer’s Studio plans">
        <Link href="/writers-studio">← Return to your Studio</Link>
        <span>Soullab · Writer’s Studio</span>
      </nav>

      <div className={styles.content}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>For the life you live. For the world we make.</p>
          <h1>Your voice belongs to you.</h1>
          <p>Begin freely. Deepen your craft when you choose. MAIA works alongside you without taking authorship away.</p>
        </header>

        <div className={styles.grid}>
          <section className={styles.plan} aria-labelledby="writer-free-heading">
            <p className={styles.kicker}>Discover your voice</p>
            <h2 id="writer-free-heading">Writer’s Studio Free</h2>
            <p className={styles.price}>$0 <span>ongoing</span></p>
            <p>Real writing, foundational craft and a meaningful relationship with MAIA—not a disposable trial.</p>
            <p className={styles.planDetail}>Public enrollment is not open during the invitation-only beta.</p>
          </section>

          <section className={`${styles.plan} ${styles.pro}`} aria-labelledby="writer-pro-heading">
            <p className={styles.kicker}>Deepen your craft</p>
            <h2 id="writer-pro-heading">Writer’s Studio Pro</h2>
            <p className={styles.price}>
              Complimentary
              <span> for individually approved beta writers</span>
            </p>
            <p>Advanced editorial depth, whole-Work continuity, expanded MAIA, Listen and Publish preparation.</p>
            <p className={styles.planDetail}>Future pricing is not set. No checkout, subscription or public enrollment is active.</p>
          </section>
        </div>

        <section className={styles.compare} aria-labelledby="writer-compare-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>One Studio, two depths</p>
            <h2 id="writer-compare-heading">The complete product definition</h2>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr><th scope="col">Experience</th><th scope="col">Free</th><th scope="col">Pro</th></tr>
              </thead>
              <tbody>
                {features.map(([feature, inclusion]) => (
                  <tr key={feature}>
                    <th scope="row">{FEATURE_LABELS[feature]}</th>
                    <td>{inclusion.free ? 'Included' : '—'}</td>
                    <td>{inclusion.pro ? 'Included' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.beta} aria-labelledby="writer-beta-heading">
          <p className={styles.kicker}>Invitation-only beta</p>
          <h2 id="writer-beta-heading">Each approved writer enters Pro without a subscription.</h2>
          <p>Plan identity comes from the authenticated server-side pilot record. A URL parameter, browser storage, generic Soullab tier or payment claim cannot grant Writer’s Studio access.</p>
          <p>The beta is evidence-gathering, not public enrollment or release certification.</p>
        </section>

        <section className={styles.holds} aria-labelledby="writer-holds-heading">
          <p className={styles.kicker}>Held by separate authority</p>
          <h2 id="writer-holds-heading">A plan never turns a held operation on.</h2>
          <ul>
            {WRITER_INDEPENDENT_RELEASE_HOLDS.map((hold) => <li key={hold}>{HELD_LABELS[hold]}</li>)}
          </ul>
          <p>These remain unavailable until their own source, custody, recovery and release decisions are accepted.</p>
        </section>

        <footer className={styles.footer}>
          <Link href="/writers-studio">Enter the Writer’s Studio →</Link>
          <span>No checkout or public enrollment is active.</span>
        </footer>
      </div>
    </main>
  );
}
