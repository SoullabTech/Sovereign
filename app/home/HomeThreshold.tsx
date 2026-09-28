import Link from 'next/link';
import styles from './home-threshold.module.css';

const FACETS = [
  ['Journal', 'Reflect'],
  ['Dream', 'Re-member'],
  ['Writing', 'Create'],
  ['Relationships', 'Relate'],
  ['Astrology', 'Orient'],
  ['Divination', 'Listen'],
  ['Becoming', 'Imagine'],
  ['MAIA', 'Encounter'],
] as const;

export function HomeThreshold() {
  return (
    <main className={styles.threshold}>
      <div className={styles.field} aria-hidden="true">
        <i className={styles.glowA} />
        <i className={styles.glowB} />
        <span className={styles.horizon} />
      </div>

      <header className={styles.nav}>
        <Link href="/" className={styles.brand} aria-label="Soullab public home">
          <img src="/holoflower-studio-transparent.png" alt="" />
          <span>SOULLAB</span>
        </Link>
        <Link href="/signin?next=/home" className={styles.signin}>Sign in</Link>
      </header>

      <section className={styles.arrival}>
        <p className={styles.eyebrow}>WELCOME TO SOULLAB</p>
        <h1>A place to meet your life<br />more fully.</h1>
        <p className={styles.lede}>
          Soullab is a living field for reflection, relationship, creativity, and becoming.
          MAIA is the relational intelligence that can accompany you through it.
        </p>

        <div className={styles.actions}>
          <Link href="/signup?next=/home" className={styles.primary}>Join Soullab</Link>
          <Link href="/signin?next=/home" className={styles.secondary}>I already belong here</Link>
        </div>
      </section>

      <section className={styles.preview} aria-labelledby="field-heading">
        <div className={styles.previewHead}>
          <p>THE FIELD</p>
          <h2 id="field-heading">Different places. One life.</h2>
          <span>These places open when you enter Soullab.</span>
        </div>

        <div className={styles.facets}>
          {FACETS.map(([name, verb]) => (
            <div key={name} className={styles.facet}>
              <strong>{name}</strong>
              <span>{verb}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Private by design · Consent-governed · Your life remains your own</p>
        <Link href="/">About Soullab</Link>
      </footer>
    </main>
  );
}
