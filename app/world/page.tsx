import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireMemberId } from '@/lib/auth/session';
import { query } from '@/lib/db/postgres';
import { cabinStore } from '@/lib/cabin/request';
import { HOUSE_GROUPS, HOUSE_PLACES } from '@/lib/house/catalog';
import styles from './world.module.css';

export const dynamic = 'force-dynamic';

const FRONTIER_WAYS = [
  {
    id: 'imagine',
    label: 'Imagine',
    line: 'What wants to become possible through you?',
    href: '/maia/vision-studio?from=world',
    action: 'Enter Vision Studio →',
  },
  {
    id: 'make',
    label: 'Make',
    line: 'Use AI in service of authorship, craft and something real.',
    href: '/writers-studio?from=world',
    action: 'Enter Writer’s Studio →',
  },
  {
    id: 'understand',
    label: 'Understand',
    line: 'Learn enough about the technology to participate with discernment.',
    href: '/library?from=world',
    action: 'Explore the Library →',
  },
  {
    id: 'whole',
    label: 'See the larger whole',
    line: 'Explore patterns, relationships and the field around what you are making.',
    href: '/maia/living-field?from=world',
    action: 'Enter Living Field →',
  },
  {
    id: 'deepen',
    label: 'Consciousness & AI',
    line: 'Question intelligence, agency, meaning, sovereignty and what remains mysterious.',
    href: '/wisdom-keepers/wisdom?from=world',
    action: 'Go deeper →',
  },
  {
    id: 'kelly',
    label: 'Build with Kelly',
    line: 'If an idea feels larger than what you know how to build yet, bring it.',
    href: '#build-with-kelly',
    action: 'See the invitation ↓',
  },
] as const;

type WorldMember = { id: string; name: string };
type LivingWork = { id: string; title: string | null };

async function worldMember(): Promise<WorldMember | null> {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      const member = store.ensureLocalMember();
      return {
        id: member.id,
        name: member.preferredName || member.name || 'there',
      };
    } finally {
      store.close();
    }
  }
  let memberId: string;
  try {
    memberId = await requireMemberId();
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') return null;
    throw error;
  }

  const result = await query('SELECT id, name FROM members WHERE id = $1', [memberId]);
  const row = result.rows[0] as { id: string; name: string } | undefined;
  return row ? { id: row.id, name: row.name || 'there' } : null;
}

async function livingWorks(memberId: string): Promise<LivingWork[]> {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      return store.listWorks(memberId)
        .slice(0, 6)
        .map(work => ({ id: work.id, title: work.title }));
    } finally {
      store.close();
    }
  }
  const result = await query(
    `SELECT id, title
       FROM living_works
      WHERE member_id = $1
      ORDER BY updated_at DESC
      LIMIT 6`,
    [memberId],
  );
  return result.rows as LivingWork[];
}

export default async function MemberWorldPage() {
  const member = await worldMember();
  if (!member) redirect('/signin');

  const firstName = member.name.trim().split(/\s+/)[0] || '';
  const worldTitle = firstName && firstName.toLowerCase() !== 'there'
    ? `${firstName}’s World`
    : 'Your World';
  const works = await livingWorks(member.id);
  const fields = HOUSE_PLACES.filter(place => place.id !== 'world');

  return (
    <main className={styles.world}>
      <header className={styles.header}>
        <Link href="/house" className={styles.return}>← House</Link>
        <span>ONE FIELD · MANY THREADS</span>
      </header>
      <section className={styles.hero}>
        <p>YOUR WORLD</p>
        <h1>{worldTitle}</h1>
        <h2>What you are tending, creating, remembering and becoming — in one place.</h2>
      </section>

      <section className={styles.orientation} aria-labelledby="holding-title">
        <div>
          <p>ORIENTATION</p>
          <h3 id="holding-title">What am I holding?</h3>
          <span>
            This view gathers what is already yours. It does not create new permission,
            new identity, or hidden memory.
          </span>
        </div>
        <Link href="/house">Arrange my House →</Link>
      </section>

      <section className={styles.alive} aria-labelledby="alive-title">
        <header>
          <p>WHAT’S ALIVE</p>
          <h3 id="alive-title">Living work</h3>
        </header>
        {works.length ? (
          <div className={styles.workGrid}>
            {works.map(work => (
              <article key={work.id} className={styles.workCard}>
                <span>WORK</span>
                <strong>{work.title || 'An unnamed living work'}</strong>
                <Link href="/writers-studio">Open Writer’s Studio →</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>No living work is asking for space right now.</p>
            <Link href="/writers-studio">Enter Writer’s Studio →</Link>
          </div>
        )}
      </section>

      <section className={styles.frontier} aria-labelledby="frontier-title">
        <header className={styles.frontierHead}>
          <div>
            <p>THE FRONTIER</p>
            <h3 id="frontier-title">AI as a medium for imagination, inquiry and creation.</h3>
          </div>
          <span>
            Not a course to complete. A place to wonder, understand, make, question,
            and discover what becomes possible when emerging intelligence meets your own work.
          </span>
        </header>

        <div className={styles.frontierGrid}>
          {FRONTIER_WAYS.map(way => (
            <Link href={way.href} key={way.id} className={styles.frontierCard}>
              <span>{way.label}</span>
              <strong>{way.line}</strong>
              <small>{way.action}</small>
            </Link>
          ))}
        </div>

        <aside className={styles.edges}>
          <div>
            <p>FROM THE EDGES</p>
            <h4>Experiments, questions, failures and discoveries from the frontier.</h4>
          </div>
          <span>
            This can become a living stream of what Kelly and the Soullab community are
            learning as we build with AI — technical, creative, philosophical and strange.
          </span>
        </aside>

        <aside className={styles.buildWithKelly} id="build-with-kelly">
          <p>BUILD WITH KELLY</p>
          <h4>Some ideas want a companion.</h4>
          <span>
            If you are carrying something unusual and want help giving it form, keep it close.
            A direct way to bring it to Kelly is being designed. Nothing here asks you to book
            or buy anything.
          </span>
        </aside>
      </section>

      <section className={styles.fields} aria-labelledby="fields-title">
        <header>
          <p>YOUR FIELDS</p>
          <h3 id="fields-title">Move through your House without losing the whole.</h3>
        </header>
        {HOUSE_GROUPS.map(group => {
          const items = fields.filter(place => place.group === group.id);
          return (
            <div key={group.id} className={styles.fieldGroup}>
              <div className={styles.groupHead}>
                <h4>{group.label}</h4>
                <span>{group.line}</span>
              </div>
              <div className={styles.fieldGrid}>
                {items.map(place => (
                  <Link href={place.href} key={place.id} className={styles.fieldCard}>
                    <span>{place.mark}</span>
                    <strong>{place.label}</strong>
                    <small>{place.purpose}</small>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <footer className={styles.footer}>
        <span>Your World is an orientation surface, not a second owner of your life.</span>
        <Link href="/house">Return to House →</Link>
      </footer>
    </main>
  );
}
