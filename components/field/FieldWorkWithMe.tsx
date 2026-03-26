'use client';

import Link from 'next/link';
import { useField } from '@/lib/field/FieldProvider';
import FieldCTA from './FieldCTA';

function formatPrice(cents: number | null): string {
  if (!cents) return 'Free';
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hour${h > 1 ? 's' : ''}` : `${h}h ${m}m`;
}

type ServiceLane = { label: string; slugs: string[] };
type WorkIntro = { headline?: string; lead?: string; closingNote?: string };

export default function FieldWorkWithMe() {
  const field = useField();
  const { services, palette, theme, slug } = field;
  const isSpacious = theme.density === 'spacious';
  const sectionPad = isSpacious ? 'py-20 px-6' : 'py-14 px-6';

  // Pull structured config from field_config (passed through PractitionerField)
  const fc = (field as Record<string, unknown>);
  const workIntro = (fc.workIntro as WorkIntro) || {};
  const serviceLanes = (fc.serviceLanes as ServiceLane[]) || [];

  // Build a service lookup by slug
  const serviceBySlug = new Map(services.map(s => {
    // Match by slug field or by name-derived slug
    const sSlug = (s as Record<string, unknown>).slug as string ||
      s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return [sSlug, s];
  }));

  // If no lanes configured, fall back to flat list
  const hasLanes = serviceLanes.length > 0;

  function renderServiceCard(service: typeof services[0], isPrimary: boolean) {
    return (
      <div
        key={service.id}
        className="flex flex-col p-6 rounded-sm transition-all duration-300"
        style={{
          border: `1px solid ${isPrimary ? palette.primary + '40' : palette.primary + '15'}`,
          backgroundColor: isPrimary ? `${palette.primary}06` : 'transparent',
        }}
      >
        {/* Name */}
        <h3
          className="mb-2"
          style={{
            fontFamily: 'var(--field-font-display)',
            fontSize: isPrimary ? '1.15rem' : '1rem',
            fontWeight: 400,
            color: palette.text,
            lineHeight: 1.3,
          }}
        >
          {service.name}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3">
          {service.durationMinutes !== null && service.durationMinutes > 0 && (
            <span style={{ fontFamily: 'var(--field-font-body)', fontSize: '0.78rem', color: `${palette.text}50` }}>
              {formatDuration(service.durationMinutes)}
            </span>
          )}
          {service.priceCents !== null && (
            <span style={{ fontFamily: 'var(--field-font-body)', fontSize: '0.78rem', color: `${palette.text}50` }}>
              {formatPrice(service.priceCents)}
            </span>
          )}
        </div>

        {/* Description */}
        {service.description && (
          <p
            className="flex-1 mb-4"
            style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.85rem',
              lineHeight: 1.7,
              color: `${palette.text}70`,
            }}
          >
            {service.description}
          </p>
        )}

        {/* Book button */}
        {service.bookable && (
          <Link
            href={`/field/${slug}/book?service=${service.id}`}
            className="w-full text-center py-2.5 rounded-sm text-xs tracking-widest uppercase transition-all duration-300 hover:opacity-80"
            style={{
              border: `1px solid ${palette.primary}40`,
              color: palette.primary,
              fontFamily: 'var(--field-font-body)',
            }}
          >
            {service.priceCents ? 'Book' : service.durationMinutes ? 'Schedule' : 'Register Interest'}
          </Link>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: palette.background }}>
      {/* Opening frame */}
      <section className={`${sectionPad} border-b`} style={{ borderColor: `${palette.primary}12` }}>
        <div className="max-w-3xl mx-auto">
          <h1
            style={{
              fontFamily: 'var(--field-font-display)',
              fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)',
              fontWeight: 300,
              lineHeight: 1.3,
              color: palette.text,
              letterSpacing: '-0.01em',
              marginBottom: '1.2rem',
            }}
          >
            {workIntro.headline || `Work With ${field.shortName}`}
          </h1>

          {workIntro.lead && (
            <p
              style={{
                fontFamily: 'var(--field-font-body)',
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: `${palette.text}75`,
                maxWidth: '38rem',
              }}
            >
              {workIntro.lead}
            </p>
          )}

          {/* Dual CTA */}
          <div className="flex flex-wrap gap-3 mt-8">
            <FieldCTA label="Book a Session" href={`/field/${slug}/book`} style="direct" />
            <FieldCTA label="Start with a Discovery Call" href={`/field/${slug}/book?service=discovery`} style="invitation" />
          </div>
        </div>
      </section>

      {/* Service lanes */}
      {hasLanes ? (
        serviceLanes.map((lane, i) => {
          const laneServices = lane.slugs
            .map(s => serviceBySlug.get(s))
            .filter(Boolean) as typeof services;

          if (laneServices.length === 0) return null;
          const isPrimaryLane = i === 0;

          return (
            <section
              key={lane.label}
              className={`${sectionPad} border-b`}
              style={{ borderColor: `${palette.primary}12` }}
            >
              <div className="max-w-4xl mx-auto">
                <p
                  className="mb-6 uppercase tracking-[0.25em]"
                  style={{
                    fontFamily: 'var(--field-font-body)',
                    fontSize: '0.6rem',
                    color: `${palette.text}40`,
                  }}
                >
                  {lane.label}
                </p>
                <div className={`grid gap-5 ${laneServices.length === 1 ? '' : 'sm:grid-cols-2'}`}>
                  {laneServices.map(s => renderServiceCard(s, isPrimaryLane))}
                </div>
              </div>
            </section>
          );
        })
      ) : (
        /* Flat grid fallback when no lanes configured */
        <section className={`${sectionPad} border-b`} style={{ borderColor: `${palette.primary}12` }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map(s => renderServiceCard(s, s.featured))}
            </div>
          </div>
        </section>
      )}

      {/* Closing section */}
      <section className={sectionPad}>
        <div className="max-w-3xl mx-auto">
          {workIntro.closingNote && (
            <p
              className="mb-6"
              style={{
                fontFamily: 'var(--field-font-body)',
                fontSize: '0.9rem',
                lineHeight: 1.8,
                color: `${palette.text}65`,
                fontStyle: 'italic',
              }}
            >
              {workIntro.closingNote}
            </p>
          )}
          <FieldCTA label="Book a Session" href={`/field/${slug}/book`} style="direct" />
        </div>
      </section>
    </main>
  );
}
