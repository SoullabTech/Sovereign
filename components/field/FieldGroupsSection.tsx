'use client';

import { useField } from '@/lib/field/FieldProvider';
import FieldCTA from './FieldCTA';

/**
 * Groups section for a master's field.
 * Shows community offerings: SEE, TapFest, circles, cohorts.
 *
 * For Jondi: Spring Energy Event, TapFest, practitioner circles.
 */
export function FieldGroupsSection() {
  const field = useField();
  const { palette, theme, name } = field;
  const isSpacious = theme.density === 'spacious';
  const sectionPad = isSpacious ? 'py-20 px-6' : 'py-14 px-6';

  // Use the "hold-the-field" portal for group content (if available)
  const groupPortal = field.portals?.find(
    (p: { slug: string }) => p.slug === 'hold-the-field' || p.slug === 'with-others'
  );

  return (
    <main className="min-h-screen" style={{ backgroundColor: palette.background }}>
      {/* Header */}
      <section className={sectionPad}>
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-3xl md:text-4xl font-light mb-6"
            style={{
              fontFamily: 'var(--field-font-display)',
              color: palette.text,
            }}
          >
            Walk With Us
          </h1>

          <p
            className="text-base leading-relaxed mb-8 max-w-xl"
            style={{
              fontFamily: 'var(--field-font-body)',
              color: `${palette.text}90`,
            }}
          >
            {groupPortal?.description ||
              `Community gatherings, practitioner circles, and shared practice spaces within ${name}'s field. Transformation that happens in isolation rarely holds — the field holds what individuals cannot.`}
          </p>
        </div>
      </section>

      {/* Community offerings */}
      <section
        className={`${sectionPad} border-t`}
        style={{ borderColor: `${palette.primary}15` }}
      >
        <div className="max-w-3xl mx-auto">
          <p
            className="mb-6 uppercase tracking-[0.25em]"
            style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.65rem',
              color: `${palette.text}50`,
            }}
          >
            Community & Events
          </p>

          <div className="space-y-6">
            {/* Spring Energy Event */}
            <div
              className="p-6 rounded-sm border"
              style={{
                borderColor: `${palette.primary}20`,
                backgroundColor: `${palette.primary}05`,
              }}
            >
              <h3
                className="text-lg font-medium mb-2"
                style={{
                  fontFamily: 'var(--field-font-display)',
                  color: palette.text,
                }}
              >
                Spring Energy Event
              </h3>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--field-font-body)',
                  color: `${palette.text}80`,
                }}
              >
                An annual gathering for those who believe transformation is a collective act.
                Energy medicine, community, and the field that holds what individuals cannot.
              </p>
              <p
                className="text-xs"
                style={{ color: `${palette.text}50` }}
              >
                Details coming soon
              </p>
            </div>

            {/* TapFest */}
            <div
              className="p-6 rounded-sm border"
              style={{
                borderColor: `${palette.primary}20`,
                backgroundColor: `${palette.primary}05`,
              }}
            >
              <h3
                className="text-lg font-medium mb-2"
                style={{
                  fontFamily: 'var(--field-font-display)',
                  color: palette.text,
                }}
              >
                TapFest
              </h3>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--field-font-body)',
                  color: `${palette.text}80`,
                }}
              >
                A gathering for EFT practitioners and energy medicine professionals.
                Skill-deepening, community, and the ongoing conversation about what this work actually is.
              </p>
              <p
                className="text-xs"
                style={{ color: `${palette.text}50` }}
              >
                Details coming soon
              </p>
            </div>

            {/* Practitioner Circle */}
            <div
              className="p-6 rounded-sm border"
              style={{
                borderColor: `${palette.primary}20`,
                backgroundColor: `${palette.primary}05`,
              }}
            >
              <h3
                className="text-lg font-medium mb-2"
                style={{
                  fontFamily: 'var(--field-font-display)',
                  color: palette.text,
                }}
              >
                Practitioner Mentoring Circle
              </h3>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--field-font-body)',
                  color: `${palette.text}80`,
                }}
              >
                For EFT practitioners deepening their craft. Not technique alone —
                the art of presence, calibration, and knowing when to stay quiet.
              </p>
              <p
                className="text-xs"
                style={{ color: `${palette.text}50` }}
              >
                Details coming soon
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
