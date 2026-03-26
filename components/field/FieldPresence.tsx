'use client';

import { useField } from '@/lib/field/FieldProvider';
import FieldCTA from './FieldCTA';

export default function FieldPresence() {
  const field = useField();
  const { story, palette, theme, photoUrl, name, cta } = field;
  const isSpacious = theme.density === 'spacious';
  const sectionPad = isSpacious ? 'py-20 px-6' : 'py-14 px-6';

  return (
    <main className="min-h-screen" style={{ backgroundColor: palette.background }}>
      {/* Header photo + headline */}
      <section className={`${sectionPad} border-b`} style={{ borderColor: `${palette.primary}15` }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Photo */}
            {photoUrl && (
              <div
                className="flex-shrink-0 w-32 h-32 rounded-sm overflow-hidden"
                style={{ border: `1px solid ${palette.primary}25` }}
              >
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Headline + lead */}
            <div className="flex-1">
              <p
                className="mb-4 uppercase tracking-[0.25em]"
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.65rem',
                  color: `${palette.text}50`,
                }}
              >
                {name}
              </p>

              <h1
                style={{
                  fontFamily: 'var(--field-font-display)',
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
                  fontWeight: 300,
                  lineHeight: 1.25,
                  color: palette.text,
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {story.headline}
              </h1>

              <p
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: `${palette.text}85`,
                  maxWidth: '55ch',
                }}
              >
                {story.lead}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story paragraphs */}
      {story.paragraphs.length > 0 && (
        <section className={`${sectionPad} border-b`} style={{ borderColor: `${palette.primary}15` }}>
          <div className="max-w-2xl mx-auto space-y-6">
            {story.paragraphs.map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.95rem',
                  lineHeight: 1.8,
                  color: `${palette.text}75`,
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Lineage */}
      {story.lineage.length > 0 && (
        <section className={`${sectionPad} border-b`} style={{ borderColor: `${palette.primary}15` }}>
          <div className="max-w-2xl mx-auto">
            <p
              className="mb-6 uppercase tracking-[0.2em]"
              style={{
                fontFamily: 'var(--field-font-body)',
                fontSize: '0.65rem',
                color: `${palette.text}45`,
              }}
            >
              Lineage
            </p>
            <ul className="space-y-3">
              {story.lineage.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3"
                  style={{
                    fontFamily: 'var(--field-font-body)',
                    fontSize: '0.9rem',
                    color: `${palette.text}70`,
                    lineHeight: 1.6,
                  }}
                >
                  <span
                    className="mt-2.5 flex-shrink-0 w-1 h-1 rounded-full"
                    style={{ backgroundColor: palette.primary }}
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA footer */}
      <section className={sectionPad}>
        <div className="max-w-2xl mx-auto flex flex-col items-start gap-4">
          <p
            style={{
              fontFamily: 'var(--field-font-display)',
              fontSize: '1.2rem',
              fontWeight: 300,
              color: `${palette.text}80`,
              letterSpacing: '-0.01em',
            }}
          >
            Ready to begin?
          </p>
          <FieldCTA label={cta.label} href={cta.href} style={cta.style} />
        </div>
      </section>
    </main>
  );
}
