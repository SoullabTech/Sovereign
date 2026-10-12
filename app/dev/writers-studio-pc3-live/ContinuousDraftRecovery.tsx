'use client';

/**
 * WS-JONDI-CONTINUOUS-RETURN-01 · A member whose existing draft is not
 * section-addressable must never be stranded on a blank Write surface.
 *
 * This is a navigation-only, member-initiated escape to the governed original
 * Canvas/Worktable. That room loads the actual continuous draft; this one does
 * not read, convert, seed, publish, or transmit manuscript content.
 */
import { canvasForManuscript } from '@/app/writers-studio/canvasIdentity';

export function ContinuousDraftRecovery({
  manuscriptId, onBack,
}: {
  manuscriptId: string;
  onBack: () => void;
}) {
  const href = canvasForManuscript('/writers-studio/canvas', manuscriptId);
  return (
    <main
      className="fs-p4-opening"
      data-continuous-draft-recovery="available"
      style={{
        minHeight: '65vh', background: '#1e1a16', color: '#f1e9dc',
        padding: 'clamp(24px, 5vw, 64px)', boxSizing: 'border-box',
      }}
    >
      <section
        aria-labelledby="legacy-draft-title"
        style={{
          maxWidth: '720px', border: '1px solid #655640',
          background: '#28221c', padding: 'clamp(22px, 4vw, 42px)',
          borderRadius: '16px',
        }}
      >
        <p style={{
          fontFamily: 'system-ui, sans-serif', fontSize: '12px',
          letterSpacing: '0.12em', color: '#d8b55e', margin: '0 0 20px',
        }}>
          YOUR EXISTING WRITING
        </p>
        <h1
          id="legacy-draft-title"
          style={{
            font: 'normal clamp(29px, 4vw, 43px)/1.18 Georgia, serif',
            color: '#f1e9dc', margin: '0 0 20px',
          }}
        >
          Continue from the writing you already saved.
        </h1>
        <p style={{
          maxWidth: '58ch', font: '16px/1.65 system-ui, sans-serif',
          color: '#dbd0c0', margin: '0 0 16px',
        }}>
          This manuscript uses an earlier continuous-draft format.
          The newer writing room cannot safely assign section boundaries to
          the text as it stands. Nothing has been converted or replaced.
        </p>
        <p style={{
          maxWidth: '58ch', font: '16px/1.65 system-ui, sans-serif',
          color: '#dbd0c0', margin: '0 0 28px',
        }}>
          Open the original writing room to see this draft in its existing form.
          For now, verify that your words appear before making new edits.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <a
            href={href}
            data-continuous-recovery-open
            style={{
              display: 'inline-block', borderRadius: '11px',
              padding: '13px 18px', background: '#d8b229',
              color: '#231b10', font: '600 15px system-ui, sans-serif',
              textDecoration: 'none',
            }}
          >
            Open my existing draft
          </a>
          <button
            type="button" onClick={onBack}
            style={{
              borderRadius: '11px', padding: '12px 18px',
              border: '1px solid #73634c', background: 'transparent',
              color: '#f1e9dc', font: '500 15px system-ui, sans-serif',
              cursor: 'pointer',
            }}
          >
            Back to my Works
          </button>
        </div>
        <p style={{
          maxWidth: '58ch', margin: '23px 0 0',
          font: '13px/1.6 system-ui, sans-serif', color: '#b9ad9f',
        }}>
          This choice does not import a new source, copy someone else’s Work,
          or change the existing draft structure.
        </p>
      </section>
    </main>
  );
}
