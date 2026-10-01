'use client';

export type CabinArrivalFixtureState = 'unavailable' | 'empty' | 'mounted';

type Doorway = {
  id: 'work' | 'relationships' | 'memory';
  label: string;
  phrase: string;
};

const DOORWAYS: Doorway[] = [
  {
    id: 'work',
    label: 'Work',
    phrase: 'Make and tend what is becoming.',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    phrase: 'Meet what is between you.',
  },
  {
    id: 'memory',
    label: 'Memory',
    phrase: 'Enter what you have chosen to keep.',
  },
];

export function CabinArrivalVisualFixture({
  state,
}: {
  state: CabinArrivalFixtureState;
}) {
  const stateCopy =
    state === 'mounted'
      ? 'What you carried is here.'
      : state === 'empty'
        ? 'Begin where you are.'
        : 'The field is quiet.';

  return (
    <main className="cabinArrival" data-state={state}>
      <header className="cabinIdentity">
        <a
          href="/dev/cabin-arrival-visual-review?state=mounted"
          className="mark"
          aria-label="Cabin visual review"
        >
          <span className="markFlower" aria-hidden="true" />
          <span className="markWord">CABIN</span>
        </a>
        <a href="/house" className="return">House</a>
      </header>

      <section className="arrivalField" aria-labelledby="cabin-welcome">
        <div className="arrivalCopy">
          <p className="eyebrow">SOULLAB · SOVEREIGN SPACE</p>
          <h1 id="cabin-welcome"><span>Welcome</span> <span>home.</span></h1>
          <p className="stateCopy">{stateCopy}</p>
        </div>
        <div className="continuityField" aria-label="Continuity doorways">
          {DOORWAYS.map((doorway) => (
            <a
              className="doorway"
              data-present={state === 'mounted' ? 'true' : 'false'}
              href={`/dev/cabin-arrival-visual-review?state=${state}&door=${doorway.id}`}
              key={doorway.id}
            >
              <span className="doorGlow" aria-hidden="true" />
              <span className="doorLabel">{doorway.label}</span>
              <span className="doorPhrase">{doorway.phrase}</span>
              <span className="enter">Enter →</span>
            </a>
          ))}
        </div>

        <a
          className="maiaThreshold"
          href={`/dev/cabin-arrival-visual-review?state=${state}&door=maia`}
          aria-label="Meet MAIA"
        >
          <span className="maiaHalo" aria-hidden="true"><span /></span>
          <span>
            <small>THRESHOLD</small>
            <strong>Meet MAIA</strong>
          </span>
        </a>
      </section>

      <footer className="fixtureNote">
        <span>H4.1 visual fixture</span>
        <span>state: {state}</span>
      </footer>
    </main>
  );
}
