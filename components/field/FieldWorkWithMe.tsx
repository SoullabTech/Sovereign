'use client';

import Link from 'next/link';
import { useField } from '@/lib/field/FieldProvider';
import FieldCTA from './FieldCTA';

function formatPrice(cents: number | null): string {
  if (cents === null) return '';
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function FieldWorkWithMe() {
  const field = useField();
  const { services, palette, theme, slug, cta } = field;
  const isSpacious = theme.density === 'spacious';
  const sectionPad = isSpacious ? 'py-20 px-6' : 'py-14 px-6';

  const bookableServices = services.filter(s => s.bookable);
  const featuredFirst = [...services].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <main className="min-h-screen" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <section className={`${sectionPad} border-b`} style={{ borderColor: `${palette.primary}15` }}>
        <div className="max-w-3xl mx-auto">
          <p
            className="mb-4 uppercase tracking-[0.25em]"
            style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.65rem',
              color: `${palette.text}50`,
            }}
          >
            Work With Me
          </p>
          <h1
            style={{
              fontFamily: 'var(--field-font-display)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
              fontWeight: 300,
              lineHeight: 1.25,
              color: palette.text,
              letterSpacing: '-0.01em',
            }}
          >
            Sessions and offerings
          </h1>
        </div>
      </section>

      {/* Services grid */}
      {services.length > 0 ? (
        <section className={`${sectionPad} border-b`} style={{ borderColor: `${palette.primary}15` }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredFirst.map(service => (
                <div
                  key={service.id}
                  className="flex flex-col p-6 rounded-sm transition-all duration-300"
                  style={{
                    border: `1px solid ${service.featured ? palette.primary + '50' : palette.primary + '18'}`,
                    backgroundColor: service.featured ? `${palette.primary}08` : 'transparent',
                  }}
                >
                  {/* Featured badge */}
                  {service.featured && (
                    <span
                      className="self-start mb-3 px-2 py-0.5 text-xs rounded-full"
                      style={{
                        backgroundColor: `${palette.primary}20`,
                        color: palette.primary,
                        fontFamily: 'var(--field-font-body)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Featured
                    </span>
                  )}

                  {/* Name */}
                  <h2
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--field-font-display)',
                      fontSize: '1.1rem',
                      fontWeight: 400,
                      color: palette.text,
                      lineHeight: 1.3,
                    }}
                  >
                    {service.name}
                  </h2>

                  {/* Description */}
                  {service.description && (
                    <p
                      className="flex-1 mb-4"
                      style={{
                        fontFamily: 'var(--field-font-body)',
                        fontSize: '0.85rem',
                        lineHeight: 1.7,
                        color: `${palette.text}65`,
                      }}
                    >
                      {service.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center justify-between mb-4">
                    {service.durationMinutes !== null && (
                      <span
                        style={{
                          fontFamily: 'var(--field-font-body)',
                          fontSize: '0.78rem',
                          color: `${palette.text}50`,
                        }}
                      >
                        {formatDuration(service.durationMinutes)}
                      </span>
                    )}
                    {service.priceCents !== null && (
                      <span
                        style={{
                          fontFamily: 'var(--field-font-display)',
                          fontSize: '1rem',
                          color: palette.text,
                        }}
                      >
                        {formatPrice(service.priceCents)}
                      </span>
                    )}
                  </div>

                  {/* Book button */}
                  {service.bookable && (
                    <Link
                      href={`/field/${slug}/book?service=${service.id}`}
                      className="w-full text-center py-2.5 rounded-sm text-xs tracking-widest uppercase transition-all duration-300"
                      style={{
                        border: `1px solid ${palette.primary}40`,
                        color: palette.primary,
                        fontFamily: 'var(--field-font-body)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${palette.primary}15`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      Book
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className={`${sectionPad} border-b`} style={{ borderColor: `${palette.primary}15` }}>
          <div className="max-w-3xl mx-auto">
            <p
              style={{
                fontFamily: 'var(--field-font-body)',
                fontSize: '0.9rem',
                color: `${palette.text}60`,
              }}
            >
              Sessions are being arranged. Reach out to learn more.
            </p>
          </div>
        </section>
      )}

      {/* CTA footer */}
      <section className={sectionPad}>
        <div className="max-w-3xl mx-auto flex flex-col items-start gap-4">
          {bookableServices.length > 0 && (
            <>
              <p
                style={{
                  fontFamily: 'var(--field-font-display)',
                  fontSize: '1.2rem',
                  fontWeight: 300,
                  color: `${palette.text}80`,
                  letterSpacing: '-0.01em',
                }}
              >
                Not sure where to start?
              </p>
              <FieldCTA label="Book a session" href={`/field/${slug}/book`} style="invitation" />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
