import type { LearningReport } from '@/lib/constellation/learningReport';
import { MIN_FEEDBACK_CONTRIBUTORS } from '@/lib/constellation/learningReport';
import styles from './learning-report.module.css';

const dateLabel = (iso: string) => new Intl.DateTimeFormat('en', {
  timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric',
}).format(new Date(iso));

/** Presentation only: receives a minimized report, never private source rows. */
export default function LearningReportView({ report }: { report: LearningReport }) {
  const lastDay = new Date(Date.parse(report.window.endExclusive) - 86400000).toISOString();
  return (
    <section className={styles.report} aria-label="Constellation learning report">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Soullab Constellation · Founder</p>
        <h1>Doorway learning</h1>
        <p className={styles.lede}>What people choose to tell us.</p>
        <p className={styles.period}>
          {dateLabel(report.window.start)} – {dateLabel(lastDay)} · {report.window.days} completed UTC days
        </p>
      </header>

      <section className={styles.summary} aria-label="What the evidence says">
        <p className={styles.eyebrow}>
          {report.source.state === 'observed' ? 'Feedback source read' : 'Feedback source unavailable'}
        </p>
        <p>{report.summary}</p>
        <a href="/founder/constellation" className={styles.refresh}>Read the latest report</a>
      </section>

      <section className={styles.section} aria-labelledby="writers-feedback-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>First doorway · Writer’s Studio</p>
          <h2 id="writers-feedback-title">The writer’s words, not our verdict.</h2>
          <p>These descriptions were selected by writers in the existing Beta note form. A count describes submissions, not people or proven improvement.</p>
        </div>
        <div className={styles.tableFrame}>
          <table>
            <caption>Explicit beta feedback · no private notes or manuscript content</caption>
            <thead><tr><th scope="col">What the writer chose to say</th><th scope="col">Feedback submissions</th></tr></thead>
            <tbody>
              {report.feedback.map(item => (
                <tr key={item.id} data-signal={item.id}>
                  <th scope="row">{item.label}</th>
                  <td data-measure-state={item.state}>
                    {item.state === 'observed'
                      ? <span className={styles.count}>{item.submissions}</span>
                      : <span className={styles.qualifier}>
                          {item.state === 'withheld' ? 'Below display floor' : 'Unavailable'}
                        </span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.footnote}>
          Positive counts require at least {MIN_FEEDBACK_CONTRIBUTORS} distinct contributors to that description.
          Smaller groups are withheld, never replaced with zero. One person may submit more than once.
          This limits disclosure; it does not guarantee anonymity or establish statistical significance.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="unmeasured-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>The larger learning loop</p>
          <h2 id="unmeasured-title">Questions we are not yet measuring.</h2>
          <p>The absence of a measurement is not a failure of the people, the Studio, or the campaign.</p>
        </div>
        <dl className={styles.questions}>
          {report.unmeasured.map(item => (
            <div key={item.id}>
              <dt>{item.label}<span>Not measured</span></dt>
              <dd>{item.reason}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.next} aria-labelledby="next-learning-title">
        <p className={styles.eyebrow}>Next learning question</p>
        <h2 id="next-learning-title">Did the invitation lead to work the person found useful?</h2>
        <p>
          That is the next prospective study—not a conclusion this report can produce.
          Its design needs a clear participation choice, an agreed first act, and a distinction
          between an action completing and the person finding it useful.
        </p>
        <p>No campaign is automatically launched, changed, or selected by this report.</p>
      </section>

      <details className={styles.method}>
        <summary>Source, boundaries, and what this does not establish</summary>
        <p>{report.source.population}</p>
        <p>
          The server reads grouped signals from <code>writer_studio_beta_feedback</code> inside a read-only transaction.
          Member identities remain in the database; only the contributor-count test is used to decide whether a signal count can be displayed.
          Private notes, manuscripts, chart details, and conversations are not read by this report.
        </p>
        <p>
          Campaign attribution was not collected by that source. Astrology does not yet have an admitted feedback source here.
          The report introduces no tracker, cookie, new person-level record, or model call.
          It describes the connected database at read time, not the deployment status of every Constellation feature.
        </p>
        <p>
          The C5 referral prompt is an instruction, not a verified guarantee of model behavior.
          Case Study 001 currently presents its method, not a completed set of outcome examples.
        </p>
        <p>Report generated: <time dateTime={report.generatedAt}>{report.generatedAt}</time></p>
      </details>
    </section>
  );
}
