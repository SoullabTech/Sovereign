import type { Metadata } from 'next';
import Link from 'next/link';
import { ELEMENTAL_ALCHEMY_CASE_STUDY as study } from '@/lib/constellation/caseStudies';
import styles from './case-study.module.css';

export const metadata: Metadata = {
  title: 'Elemental Alchemy · Writer’s Studio Case Study 001',
  description:
    'A live case study in refining an already-published manuscript while preserving authorship, voice, worldview, and lineage.',
};

export default function ElementalAlchemyCaseStudyPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/writers-studio/discover" className={styles.back}>
          ← Writer’s Studio
        </Link>
        <span className={styles.status}>Active case study</span>
      </nav>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>{study.title}</p>
        <h1><em>{study.work}</em></h1>
        <p className={styles.author}>Kelly Nezat · Writer’s Studio</p>
        <p className={styles.aim}>{study.aim}</p>
      </header>

      <section className={styles.question}>
        <p className={styles.eyebrow}>The governing question</p>
        <h2>{study.governingQuestion}</h2>
      </section>

      <section className={styles.method}>
        <div className={styles.methodIntro}>
          <p className={styles.eyebrow}>The editorial method</p>
          <h2>Improvement has to remain accountable to the work.</h2>
          <p>
            Writer’s Studio does not count novelty as improvement. Each intervention is
            examined against what the manuscript is already carrying, what the author
            actually intends, and what the whole book requires.
          </p>
        </div>

        <div className={styles.steps}>
          {study.steps.map((step, index) => (
            <article key={step.stage} className={styles.step}>
              <div className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</div>
              <div>
                <h3>{step.label}</h3>
                <p className={styles.stepQuestion}>{step.question}</p>
                <p>{step.evidence}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.principles}>
        <p className={styles.eyebrow}>Case-study laws</p>
        <div className={styles.principleGrid}>
          {study.principles.map((principle) => (
            <p key={principle}>{principle}</p>
          ))}
        </div>
      </section>

      <section className={styles.liveStatus}>
        <div>
          <p className={styles.eyebrow}>Where the study stands now</p>
          <h2>The manuscript is still being worked.</h2>
        </div>
        <div className={styles.liveText}>
          <p>
            The chapter-by-chapter refinement is active. That means this page does not
            publish a final score, a finished before-and-after verdict, or a claim that
            Writer’s Studio has already achieved the intended result.
          </p>
          <p>
            As witnessed chapter work is completed, this case study can add inspectable
            examples: original passage, Studio reading, proposed intervention, author
            decision, and the accepted result in whole-book context.
          </p>
        </div>
      </section>

      <section className={styles.final}>
        <p className={styles.eyebrow}>The larger experiment</p>
        <h2>Can editorial intelligence help more wisdom survive the journey into language?</h2>
        <p>
          This case study is one beginning. Writer’s Studio is being built for people
          carrying meaningful work who want help bringing it into form without handing
          authorship away.
        </p>
        <Link
          href="/writers-studio/discover/wisdom-carrier"
          className={styles.cta}
        >
          Explore Writer’s Studio
        </Link>
      </section>
    </main>
  );
}
