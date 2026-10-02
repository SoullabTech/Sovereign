'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './divination-room.module.css';

type DivinationKey = 'iching' | 'tarot' | 'runes';

const safeGet = (key: string) => {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch {
    // Local counting is non-authoritative; failure must not block entry.
  }
};

export default function OraclePage() {
  const router = useRouter();
  const [readingsThisWeek, setReadingsThisWeek] = useState(0);

  useEffect(() => {
    const storedCount = safeGet('oracle_readings_this_week');
    if (storedCount) setReadingsThisWeek(Number(storedCount) || 0);
  }, []);

  const methods = useMemo(() => [
    {
      key: 'iching' as DivinationKey,
      title: 'I Ching',
      tradition: 'THE BOOK OF CHANGES',
      subtitle: 'Change, timing, and relation',
      description:
        'Meet the configuration of the present moment through hexagram, line, and transformation.',
      sigil: '☰',
      route: '/oracle/iching',
      cue: 'Ask about the situation and your way of meeting it, rather than demanding an outcome.',
    },
    {
      key: 'tarot' as DivinationKey,
      title: 'Tarot',
      tradition: 'IMAGE · ARCHETYPE · SEQUENCE',
      subtitle: 'Psyche, story, and symbolic pattern',
      description:
        'Let image and archetype disclose tensions, possibilities, and the deeper story inside the question.',
      sigil: '✶',
      route: '/oracle/tarot',
      cue: 'Let the image speak before the explanation. Notice what attracts, disturbs, or surprises you.',
    },
    {
      key: 'runes' as DivinationKey,
      title: 'Runes',
      tradition: 'MARK · SOUND · SYMBOL',
      subtitle: 'Compression, edge, and embodied meaning',
      description:
        'Meet the question through a smaller symbolic field whose force often lies in its starkness.',
      sigil: 'ᚠ',
      route: '/oracle/runes',
      cue: 'Stay close to the symbol. Resist making it say more than it says.',
    },
  ], []);

  const handleEnter = (route: string) => {
    const next = readingsThisWeek + 1;
    setReadingsThisWeek(next);
    safeSet('oracle_readings_this_week', String(next));
    router.push(route);
  };

  return (
    <div className={styles.arrival}>
      <section className={styles.opening}>
        <div className={styles.openingCopy}>
          <p className={styles.kicker}>DIVINATION</p>
          <h1>Meet the question through symbol.</h1>
          <p className={styles.lead}>
            Divination begins where certainty ends. A question is placed beside an image,
            a pattern, or a changing figure so that another way of seeing can enter.
          </p>
          <p className={styles.secondary}>
            The symbol does not decide for you. It changes the conditions under which
            you listen.
          </p>
        </div>

        <aside className={styles.questionPractice} aria-label="How to approach a reading">
          <p>BRING ONE LIVING QUESTION</p>
          <ol>
            <li>
              <span>01</span>
              <b>Make it real.</b>
              <small>Bring the question that is actually alive, not the one that sounds impressive.</small>
            </li>
            <li>
              <span>02</span>
              <b>Leave room to be changed.</b>
              <small>A useful reading may complicate the question before it clarifies anything.</small>
            </li>
            <li>
              <span>03</span>
              <b>Keep your authority.</b>
              <small>Receive the symbol as material for discernment, never as command.</small>
            </li>
          </ol>
        </aside>
      </section>

      <section className={styles.languages} aria-labelledby="divination-languages">
        <div className={styles.sectionHead}>
          <p>THREE SYMBOLIC LANGUAGES</p>
          <h2 id="divination-languages">Choose the form that can meet the question.</h2>
        </div>

        <div className={styles.gates}>
          {methods.map((method) => (
            <button
              key={method.key}
              type="button"
              onClick={() => handleEnter(method.route)}
              className={styles.gate}
              aria-label={`Enter ${method.title}`}
            >
              <div className={styles.gateTop}>
                <span className={styles.sigil} aria-hidden="true">{method.sigil}</span>
                <span className={styles.enter}>ENTER →</span>
              </div>
              <p className={styles.tradition}>{method.tradition}</p>
              <h3>{method.title}</h3>
              <p className={styles.subtitle}>{method.subtitle}</p>
              <p className={styles.description}>{method.description}</p>
              <div className={styles.cue}>
                <span>ATTUNEMENT</span>
                <p>{method.cue}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.orientation} aria-label="Questions for divination">
        <div>
          <p>QUESTIONS THAT OPEN</p>
          <blockquote>“What is the nature of this moment?”</blockquote>
          <blockquote>“What am I not yet seeing?”</blockquote>
          <blockquote>“What way of meeting this belongs now?”</blockquote>
        </div>
        <div className={styles.archive}>
          <p>WHAT HAS BEEN KEPT</p>
          <h2>Return to a reading.</h2>
          <p>
            A symbol can change as you change. Saved readings let you encounter an earlier
            question again without pretending the first interpretation was final.
          </p>
          <button type="button" onClick={() => router.push('/oracle/reflections')}>
            Open saved readings →
          </button>
        </div>
      </section>

      <footer className={styles.boundary}>
        <span>✧</span>
        <p>
          A reading is not an authority over the future. It is a structured encounter
          with symbol, pattern, imagination, and the question you bring.
        </p>
      </footer>
    </div>
  );
}
