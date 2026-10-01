import type { CabinExperienceContext } from '@/lib/cabin/experienceContext';
import { cabinDoorwayPath } from '@/lib/cabin/doorway';
import styles from './cabin.module.css';

type Door = {
  id: 'work' | 'relationship' | 'memory';
  label: string;
  phrase: string;
  href: string;
};

const DOORS: Door[] = [
  {
    id: 'work',
    label: 'Work',
    phrase: 'Make and tend what is becoming.',
    href: cabinDoorwayPath('work'),
  },
  {
    id: 'relationship',
    label: 'Relationships',
    phrase: 'Meet what is between you.',
    href: cabinDoorwayPath('relationship'),
  },
  {
    id: 'memory',
    label: 'Memory',
    phrase: 'Enter what you have chosen to keep.',
    href: cabinDoorwayPath('memory'),
  },
];

const AVAILABILITY_KEYS = {
  work: 'work',
  relationship: 'relationship',
  memory: 'memory',
} as const;

function stateCopy(state: CabinExperienceContext['state']): string {
  if (state === 'mounted') return 'What you carried is here.';
  if (state === 'empty') return 'Begin where you are.';
  return 'The field is quiet.';
}

function PresenceMark({ active }: { active: boolean }) {
  return (
    <span className={styles.presenceMark} data-active={active} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function doorPresence(
  context: CabinExperienceContext,
  door: Door,
): boolean {
  if (context.state !== 'mounted') return false;
  return context.availability[AVAILABILITY_KEYS[door.id]] === 'present';
}

export default function CabinArrival({
  context,
}: {
  context: CabinExperienceContext;
}) {
  return (
    <main className={styles.cabin} data-state={context.state}>
      <header className={styles.identity}>
        <a href="/house" className={styles.brand} aria-label="Return to House">
          <span className={styles.flower} aria-hidden="true" />
          <span>CABIN</span>
        </a>
        <span className={styles.family}>SOULLAB</span>
      </header>

      <section className={styles.arrival} aria-labelledby="cabin-welcome">
        <p className={styles.eyebrow}>SOVEREIGN SPACE</p>
        <h1 id="cabin-welcome">Welcome home.</h1>
        <p className={styles.lead}>{stateCopy(context.state)}</p>
      </section>

      <section className={styles.field} aria-label="Continuity doorways">
        <div className={styles.doors}>
          {DOORS.map((door) => {
            const present = doorPresence(context, door);

            return (
              <a
                key={door.id}
                className={styles.door}
                data-present={present}
                href={door.href}
              >
                <PresenceMark active={present} />
                <span className={styles.doorLabel}>{door.label}</span>
                <span className={styles.doorPhrase}>{door.phrase}</span>
                <span className={styles.enter}>
                  Enter <span aria-hidden="true">→</span>
                </span>
              </a>
            );
          })}
        </div>

        <a className={styles.maia} href={cabinDoorwayPath('maia')}>
          <span className={styles.maiaMark} aria-hidden="true">
            <span />
          </span>
          <span className={styles.maiaCopy}>
            <small>THRESHOLD</small>
            <strong>Meet MAIA</strong>
            <em>Enter when you want company.</em>
          </span>
          <span className={styles.maiaArrow} aria-hidden="true">→</span>
        </a>
      </section>

      <footer className={styles.return}>
        <span>Nothing is asking you to begin.</span>
        <a href="/house">Return to House</a>
      </footer>
    </main>
  );
}
