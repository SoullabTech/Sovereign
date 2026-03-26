import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import FieldVirtualSelfTraining from '@/components/masters/FieldVirtualSelfTraining';

/**
 * /fields/[field]/train
 *
 * The master trains their Virtual Self inside their own field.
 * Practitioner-facing — not linked from the public threshold.
 *
 * Auth: the master accesses this via their own subdomain.
 * practitionerId comes from the master's field config (set when they register).
 */
export default async function TrainPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);

  if (!master) notFound();

  // practitionerId is required to save training to the DB.
  // If not yet set (master hasn't registered), we fall through to a prompt.
  const practitionerId = master.practitionerId;

  if (!practitionerId) {
    return <TrainSetupRequired master={master} />;
  }

  return (
    <FieldVirtualSelfTraining
      master={master}
      practitionerId={practitionerId}
    />
  );
}

// ---------------------------------------------------------------------------
// Shown when the master hasn't yet registered their practitioner account.
// Simple — they contact Soullab and we wire the ID.
// ---------------------------------------------------------------------------
import type { MasterField } from '@/lib/masters/types';
import Link from 'next/link';

function TrainSetupRequired({ master }: { master: MasterField }) {
  const { palette, theme, shortName } = master;
  const isSpacious = theme.density === 'spacious';

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: palette.background }}
    >
      <div
        className="relative z-10 max-w-md text-center"
        style={{ padding: isSpacious ? '4rem 2rem' : '2.5rem 2rem' }}
      >
        <p
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: `${palette.text}35`,
            marginBottom: '2rem',
          }}
        >
          Virtual Self Setup
        </p>
        <h1
          style={{
            fontFamily: 'var(--field-font-display)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 300,
            color: palette.text,
            lineHeight: 1.3,
            marginBottom: '1.5rem',
          }}
        >
          Training awaits, {shortName}.
        </h1>
        <p
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.9rem',
            color: `${palette.text}60`,
            lineHeight: 1.7,
            marginBottom: '3rem',
          }}
        >
          Your Virtual Self is ready to be trained. To get started, we need to
          connect your practitioner account. Reach out and we'll have you set up quickly.
        </p>
        <Link
          href={`/fields/${master.slug}`}
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.72rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: palette.primary,
            textDecoration: 'none',
          }}
        >
          ← Return to Your Field
        </Link>
      </div>
    </main>
  );
}
