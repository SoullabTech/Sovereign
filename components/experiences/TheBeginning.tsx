'use client';

import { useEffect, useRef } from 'react';
import styles from './TheBeginning.module.css';

/**
 * The Beginning — a guided orientation experience.
 *
 * Not a landing page: a product encounter. The platform introduces itself the way
 * it hopes to accompany a life. Claim discipline (MARKETING_CLAIM_DISCIPLINE.md) is
 * rendered INTO the ecosystem screen: what is live glows, what is forming outlines,
 * what is envisioned rests on the horizon. MAIA is never staged as speaking live —
 * "What are you becoming?" is presented as a question at the heart of MAIA, not an
 * utterance in the moment.
 */

type NodeState = 'live' | 'designed' | 'vision';

const ECOSYSTEM: { label: string; state: NodeState }[] = [
  { label: 'Personal', state: 'live' },
  { label: 'Relationships', state: 'live' },
  { label: 'Contribution', state: 'designed' },
  { label: 'Practice', state: 'designed' },
  { label: 'Creation', state: 'designed' },
  { label: 'Legacy', state: 'vision' },
  { label: 'Organizations', state: 'vision' },
  { label: 'Education / Communities', state: 'vision' },
];

const LIFE_WORDS = [
  'Relationships', 'Creativity', 'Contribution',
  'Practice', 'Wisdom', 'Family', 'Legacy',
];

export function TheBeginning({
  recipientName,
  replyTo,
}: {
  recipientName: string | null;
  replyTo: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        }
      },
      { root, threshold: 0.22 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const arrivalName = recipientName ?? 'The Beginning';
  const letterGreeting = recipientName ? `${recipientName} —` : 'Hello —';
  const signOff = recipientName ? `\n\n- ${recipientName}` : '';
  const mailtoBody =
    `Kelly,\n\nThe future you described resonates with me. ` +
    `I'd like to talk about how I might help build it.${signOff}`;
  const mailto =
    `mailto:${replyTo}` +
    `?subject=${encodeURIComponent("AIN - Let's Begin")}` +
    `&body=${encodeURIComponent(mailtoBody)}`;

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.field} aria-hidden="true" />
      <div className={styles.stars} aria-hidden="true" />

      <div className={styles.content}>
        {/* Arrival */}
        <section className={`${styles.section} ${styles.visible}`} data-reveal>
          <div className={styles.name}>{arrivalName}</div>
          <div className={styles.subtle}>Kelly asked me to share something with you.</div>
          <div className={styles.scrollcue}>Scroll</div>
        </section>

        {/* 1 */}
        <section className={styles.section} data-reveal>
          <p className={styles.line}>
            Every generation inherits a technology that changes what it means to be human.
          </p>
        </section>

        {/* 2 */}
        <section className={`${styles.section} ${styles.stack}`} data-reveal>
          <p className={styles.line}>Printing changed knowledge.</p>
          <p className={styles.line}>Electricity changed industry.</p>
          <p className={styles.line}>The Internet changed information.</p>
          <p className={`${styles.line} ${styles.gold}`}>
            Artificial intelligence changes intelligence itself.
          </p>
        </section>

        {/* 3 */}
        <section className={`${styles.section} ${styles.stack}`} data-reveal>
          <p className={styles.line}>
            Within the next decade, every person on Earth will live beside intelligence.
          </p>
          <p className={`${styles.line} ${styles.dim}`}>That is no longer the question.</p>
          <p className={`${styles.line} ${styles.spaced}`}>
            The question is what kind of relationship we will have with it.
          </p>
        </section>

        {/* 4 — Kelly's voice */}
        <section className={`${styles.section} ${styles.stack}`} data-reveal>
          <p className={styles.small}>
            For over forty-five years I thought I was studying human development. I wasn&rsquo;t.
            I was preparing for this moment.
          </p>
          <p className={styles.small}>
            Long before AI, I kept asking the same question: why do people slowly lose contact
            with themselves &mdash; their intuition, their bodies, their relationships, their
            purpose, the living world?
          </p>
          <p className={styles.small}>
            When AI arrived, I realized the question hadn&rsquo;t changed. Only the medium had.
          </p>
        </section>

        {/* 5 — emotional center */}
        <section className={`${styles.section} ${styles.stack}`} data-reveal>
          <p className={styles.center}>We aren&rsquo;t building better AI.</p>
          <p className={`${styles.center} ${styles.gold}`}>
            We&rsquo;re building a better relationship between human beings and intelligence.
          </p>
        </section>

        {/* 6 — LIFE (philosophy: all luminous) */}
        <section className={styles.section} data-reveal>
          <div className={styles.lifeWrap}>
            <div className={styles.lifeCenter}>Life</div>
            <div className={styles.lifeWords}>
              {LIFE_WORDS.map((w) => (
                <span key={w} className={styles.lifeWord}>{w}</span>
              ))}
            </div>
            <p className={`${styles.line} ${styles.gold} ${styles.spaced}`}>
              Intelligence belongs here.
            </p>
          </div>
        </section>

        {/* 7 — MAIA (never staged as speaking live) */}
        <section className={`${styles.section} ${styles.stack}`} data-reveal>
          <p className={styles.center}>
            If that future is worth building, something has to exist first.
          </p>
          <p className={`${styles.center} ${styles.gold} ${styles.spaced}`}>That is MAIA.</p>
          <p className={`${styles.small} ${styles.spaced}`}>
            A question at the heart of MAIA:
          </p>
          <p className={`${styles.center} ${styles.gold}`}>What are you becoming?</p>
        </section>

        {/* 8 — the ecosystem, in three states of maturation */}
        <section className={styles.section} data-reveal>
          <div className={styles.eco}>
            <div className={styles.ecoRow}>
              {ECOSYSTEM.filter((n) => n.state === 'live').map((n) => (
                <span key={n.label} className={`${styles.node} ${styles.live}`}>{n.label}</span>
              ))}
              {ECOSYSTEM.filter((n) => n.state === 'designed').map((n) => (
                <span key={n.label} className={`${styles.node} ${styles.designed}`}>{n.label}</span>
              ))}
              {ECOSYSTEM.filter((n) => n.state === 'vision').map((n) => (
                <span key={n.label} className={`${styles.node} ${styles.vision}`}>{n.label}</span>
              ))}
            </div>
            <div className={styles.legend}>
              <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotLive}`} />Live</span>
              <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotDesigned}`} />Forming</span>
              <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotVision}`} />On the horizon</span>
            </div>
            <p className={styles.caption}>
              What is live glows. What is emerging forms. What is envisioned rests on the
              horizon. We don&rsquo;t tell tomorrow&rsquo;s story as if it were today&rsquo;s.
            </p>
          </div>
        </section>

        {/* 9 — the constitution, in one breath */}
        <section className={`${styles.section} ${styles.stack}`} data-reveal>
          <p className={styles.center}>
            A relationship this important cannot depend on good intentions.
          </p>
          <p className={`${styles.center} ${styles.spaced}`}>
            It requires an architecture that keeps the human being at the center &mdash; even as
            intelligence grows more capable.
          </p>
        </section>

        {/* 10 — a short personal message, signed simply, as to a friend (no button here) */}
        <section className={styles.section} data-reveal>
          <div className={styles.letter}>
            <p className={styles.line}>{letterGreeting}</p>
            <p className={styles.line}>
              when we first talked, you saw what this could become before I&rsquo;d even shown you
              much of anything.
            </p>
            <p className={styles.line}>Well &mdash; it&rsquo;s real now. I built it.</p>
            <p className={styles.line}>
              And honestly, the part that excites me most is the chance to play in whole new
              dimensions of human development and collective intelligence &mdash; with someone
              who&rsquo;s spent his life pushing what human minds can do. I don&rsquo;t want to
              imagine where it goes by myself. I&rsquo;d love to dream it up and build it with you.
            </p>
            <p className={`${styles.line} ${styles.gold}`}>If it lands for you, let&rsquo;s talk.</p>
            <p className={styles.sig}>&mdash; Kelly</p>
          </div>
        </section>

        {/* 11 — silence, then a single question, then the invitation, quietly */}
        <section className={`${styles.section} ${styles.silence}`} data-reveal>
          <p className={styles.question}>
            What kind of relationship with intelligence do you want to help create?
          </p>
          <div className={`${styles.cta} ${styles.delayed}`}>
            <a className={styles.button} href={mailto}>Let&rsquo;s Begin</a>
          </div>
        </section>
      </div>
    </div>
  );
}
