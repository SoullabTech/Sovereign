'use client';

import { useMemo, useState } from 'react';
import styles from './atmosphere-lab.module.css';

type Atmosphere = 'day' | 'blue-evening' | 'night';
type Movement = 'still' | 'responsive';
type Materiality = 'clean' | 'tactile';

const ATMOSPHERES: Atmosphere[] = ['day', 'blue-evening', 'night'];
const MOVEMENTS: Movement[] = ['still', 'responsive'];
const MATERIALITY: Materiality[] = ['clean', 'tactile'];

function label(value: string) {
  return value.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

export function AtmosphereLab() {
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('blue-evening');
  const [movement, setMovement] = useState<Movement>('responsive');
  const [materiality, setMateriality] = useState<Materiality>('tactile');
  const [inspect, setInspect] = useState(false);
  const [focus, setFocus] = useState<'writing' | 'relationship' | 'field'>('writing');

  const context = useMemo(() => ({
    atmosphere,
    movement,
    materiality,
    focus,
  }), [atmosphere, movement, materiality, focus]);

  return (
    <main
      className={styles.lab}
      data-atmosphere={atmosphere}
      data-movement={movement}
      data-materiality={materiality}
    >
      <div className={styles.fieldGlow} aria-hidden="true" />
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Living Field Architecture · Felt Experience Lab</p>
          <h1>Same place. Different conditions.</h1>
          <p className={styles.lede}>
            Tune light, movement and materiality while the meaning, structure and interaction grammar remain unchanged.
          </p>
        </div>
        <button className={styles.inspectButton} type="button" onClick={() => setInspect((v) => !v)} aria-expanded={inspect}>
          How this place is meeting you
        </button>
      </header>

      <section className={styles.controls} aria-label="Experience controls">
        <Control<Atmosphere> label="Light" values={ATMOSPHERES} value={atmosphere} onChange={setAtmosphere} />
        <Control<Movement> label="Movement" values={MOVEMENTS} value={movement} onChange={setMovement} />
        <Control<Materiality> label="Texture" values={MATERIALITY} value={materiality} onChange={setMateriality} />
      </section>

      {inspect ? (
        <aside className={styles.receipt} aria-label="Current tailoring state">
          <div><span>Atmosphere</span><strong>{label(atmosphere)} — chosen by you</strong></div>
          <div><span>Movement</span><strong>{label(movement)} — chosen by you</strong></div>
          <div><span>Texture</span><strong>{label(materiality)} — chosen by you</strong></div>
          <div><span>Meaning impact</span><strong>None</strong></div>
          <button type="button" onClick={() => {
            setAtmosphere('blue-evening');
            setMovement('responsive');
            setMateriality('tactile');
          }}>Reset prototype</button>
        </aside>
      ) : null}

      <section className={styles.organism} aria-label="Soullab prototype surface">
        <nav className={styles.rail} aria-label="Prototype places">
          <div className={styles.mark} aria-hidden="true">✦</div>
          <p>SOULLAB</p>
          <button className={focus === 'writing' ? styles.active : ''} onClick={() => setFocus('writing')}>Writing</button>
          <button className={focus === 'relationship' ? styles.active : ''} onClick={() => setFocus('relationship')}>Relationships</button>
          <button className={focus === 'field' ? styles.active : ''} onClick={() => setFocus('field')}>Living Field</button>
        </nav>

        <div className={styles.room}>
          <div className={styles.orientation}>
            <p>HERE · NOW</p>
            <span>{focus === 'writing' ? 'A work asking for form' : focus === 'relationship' ? 'A relationship asking for attention' : 'The wider whole'}</span>
          </div>

          <article className={styles.primary}>
            <p className={styles.eyebrow}>{label(focus)}</p>
            <h2>{focus === 'writing' ? 'Elemental Alchemy' : focus === 'relationship' ? 'A relationship in view' : 'Your Living Field'}</h2>
            <p className={styles.body}>
              {focus === 'writing'
                ? 'The work remains the same work while the room around it changes. Atmosphere supports attention without becoming meaning.'
                : focus === 'relationship'
                  ? 'Bring one presence closer without deciding what it means. The field can hold relation without forcing resolution.'
                  : 'Move between scales while the same identities remain recognizable. The whole stays recoverable.'}
            </p>
            <div className={styles.actions}>
              <button type="button">Enter</button>
              <button type="button" className={styles.quiet}>Ask MAIA</button>
            </div>
          </article>

          <section className={styles.context} aria-label="Context">
            <div className={styles.contextLine} />
            <div>
              <p className={styles.eyebrow}>Still present</p>
              <p>The wider field recedes without disappearing.</p>
            </div>
            <div>
              <p className={styles.eyebrow}>Return</p>
              <p>Identity and orientation remain stable across conditions.</p>
            </div>
          </section>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>Prototype state</span>
        <code>{JSON.stringify(context)}</code>
      </footer>
    </main>
  );
}

function Control<T extends string>({
  label: controlLabel,
  values,
  value,
  onChange,
}: {
  label: string;
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className={styles.control}>
      <legend>{controlLabel}</legend>
      <div>
        {values.map((item) => (
          <button key={item} type="button" className={value === item ? styles.selected : ''} onClick={() => onChange(item)}>
            {label(item)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
