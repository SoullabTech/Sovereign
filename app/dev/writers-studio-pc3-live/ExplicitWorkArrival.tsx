import type { CSSProperties } from 'react';
import type { CurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';

export default function ExplicitWorkArrival({
  work,
  manuscripts,
  busy,
  onOpen,
  onBegin,
  onReturn,
}: {
  work: LivingWork;
  manuscripts: CurrentManuscript[];
  busy: boolean;
  onOpen: (manuscriptId: string) => void;
  onBegin: (workId: string) => void;
  onReturn: () => void;
}) {
  return (
    <main
      className="fr-root"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '48px 24px',
      }}
    >
      <section
        aria-labelledby="explicit-work-arrival-title"
        style={{
          width: 'min(680px, 100%)',
          border: '1px solid rgba(110, 91, 70, 0.28)',
          borderRadius: 24,
          padding: '42px 44px',
          background: 'rgba(255, 252, 246, 0.72)',
          boxShadow: '0 24px 80px rgba(58, 43, 29, 0.08)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#8a765e',
          }}
        >
          HOUSE → WRITER’S STUDIO
        </p>
        <h1
          id="explicit-work-arrival-title"
          style={{
            margin: '12px 0 8px',
            fontFamily: 'var(--fr-serif, Georgia, serif)',
            fontSize: 34,
            fontWeight: 500,
            color: '#33291f',
          }}
        >
          {work.title || 'Your Work'}
        </h1>
        {work.purpose && (
          <p style={{ margin: '0 0 28px', color: '#756554', lineHeight: 1.6 }}>
            {work.purpose}
          </p>
        )}

        {manuscripts.length === 0 ? (
          <>
            <p style={{ color: '#54483d', lineHeight: 1.7 }}>
              This Work does not have a declared manuscript yet. The Studio will
              not choose one for you. You can begin a manuscript here, explicitly
              placing it in this Work.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onBegin(work.id)}
                style={primaryButton}
              >
                {busy ? 'Opening…' : 'Begin writing in this Work'}
              </button>
              <button type="button" onClick={onReturn} style={quietButton}>
                Return to Studio
              </button>
            </div>
          </>
        ) : manuscripts.length === 1 ? (
          <>
            <p style={{ color: '#54483d', lineHeight: 1.7 }}>
              One manuscript is declared in this Work, so the Studio can carry
              you directly to it without making a selection.
            </p>
            <div
              style={{
                marginTop: 22,
                padding: '16px 18px',
                border: '1px solid rgba(110, 91, 70, 0.22)',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.55)',
              }}
            >
              <div style={{ color: '#33291f', fontSize: 16 }}>
                {manuscripts[0].title || 'Untitled manuscript'}
              </div>
              <div style={{ marginTop: 5, color: '#8a765e', fontSize: 12 }}>
                The member’s declared manuscript for this Work
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onOpen(manuscripts[0].id)}
                style={primaryButton}
              >
                Open manuscript
              </button>
              <button type="button" onClick={onReturn} style={quietButton}>
                Return to Studio
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: '#54483d', lineHeight: 1.7 }}>
              This Work contains several manuscripts. The Studio will not guess
              which one you mean.
            </p>
            <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
              {manuscripts.map((manuscript) => (
                <button
                  type="button"
                  key={manuscript.id}
                  disabled={busy}
                  onClick={() => onOpen(manuscript.id)}
                  style={manuscriptButton}
                >
                  <span style={{ color: '#33291f', fontSize: 15 }}>
                    {manuscript.title || 'Untitled manuscript'}
                  </span>
                  <span style={{ color: '#8a765e', fontSize: 11 }}>
                    Choose this manuscript →
                  </span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 22 }}>
              <button type="button" onClick={onReturn} style={quietButton}>
                Return to Studio
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

const primaryButton: CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: '11px 18px',
  background: '#3b3026',
  color: '#fffaf2',
  cursor: 'pointer',
  fontSize: 13,
};

const quietButton: CSSProperties = {
  border: '1px solid rgba(110, 91, 70, 0.28)',
  borderRadius: 999,
  padding: '10px 16px',
  background: 'transparent',
  color: '#6f5f4e',
  cursor: 'pointer',
  fontSize: 13,
};

const manuscriptButton: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 20,
  width: '100%',
  textAlign: 'left',
  border: '1px solid rgba(110, 91, 70, 0.22)',
  borderRadius: 16,
  padding: '15px 17px',
  background: 'rgba(255,255,255,0.55)',
  cursor: 'pointer',
};
