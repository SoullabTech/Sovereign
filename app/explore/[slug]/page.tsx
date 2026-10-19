import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PUBLIC_DOORWAYS, publicDoorwayForSlug } from '@/lib/launch/publicDoorwaysP0';
import styles from '../explore.module.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return PUBLIC_DOORWAYS.map((door) => ({ slug: door.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const door = publicDoorwayForSlug(slug);
  return {
    title: door ? door.name + ' — Discover Soullab' : 'Explore Soullab',
    description: door?.introduction ?? 'Find a Soullab doorway.',
    robots: { index: false, follow: false },
  };
}

export default async function PublicDoorwayPage({ params }: Props) {
  const { slug } = await params;
  const door = publicDoorwayForSlug(slug);
  if (!door) notFound();

  return <main className={styles.field}>
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/home">Soullab</Link>
        <nav className={styles.nav} aria-label="Doorway navigation">
          <Link href="/explore">All doorways</Link>
          <Link href="/signin?next=/home">Sign in</Link>
        </nav>
      </header>
      <section className={styles.hero + ' ' + styles.heroDetail}>
        <Link className={styles.back} href="/explore">← Discover all the doors</Link>
        <p className={styles.eyebrow}>{door.name} · {door.status}</p>
        <h1>{door.headline}</h1>
        <p className={styles.lead}>{door.introduction}</p>
      </section>
      <section className={styles.infoGrid} aria-label={door.name + ' introduction'}>
        <div>
          <p className={styles.eyebrow}>{door.audience}</p>
          <h2>What this doorway is being built to offer</h2>
          <ul>{door.invitations.map((item) => <li key={item}>{item}</li>)}</ul>
          <h2 style={{ marginTop: 34 }}>Its place in Soullab</h2>
          <p>{door.relationship}</p>
        </div>
        <aside className={styles.aside} aria-label="Availability and privacy">
          <span className={styles.status}>{door.status}</span>
          <h3>Availability</h3>
          <p>{door.statusDetail}</p>
          <h3>Privacy and release boundary</h3>
          <p>{door.limitation}</p>
          <Link className={styles.cta} href="/home">Explore Soullab Home →</Link>
          <Link className={styles.secondary} href="/explore">Compare the doorways</Link>
        </aside>
      </section>
      <footer className={styles.footer}>
        <span>No private content is requested on this public introduction page.</span>
        <Link href="/home">Soullab Home</Link>
      </footer>
    </div>
  </main>;
}
