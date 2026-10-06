'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DEFAULT_WORKING_STYLE,
  ENGAGEMENT_COPY,
  ENGAGEMENT_VALUES,
  EXPLANATION_COPY,
  EXPLANATION_VALUES,
  PACE_COPY,
  PACE_VALUES,
  readWorkingStyle,
  writeWorkingStyle,
  type WriterWorkingStyle,
} from '@/lib/writersStudio/workingStyle';
import { useStudioTopbarAccessoriesHost } from './useStudioTopbarAccessoriesHost';

export default function P4R1MaiaSettings() {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<WriterWorkingStyle>(DEFAULT_WORKING_STYLE);
  const topbarHost = useStudioTopbarAccessoriesHost();

  useEffect(() => {
    const sync = () => setStyle(readWorkingStyle());
    sync();
    window.addEventListener('writers-studio-working-style-changed', sync as EventListener);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('writers-studio-working-style-changed', sync as EventListener);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const update = (patch: Partial<WriterWorkingStyle>) => {
    writeWorkingStyle(patch);
    setStyle(readWorkingStyle());
  };

  if (!topbarHost) return null;

  return createPortal(
    <div className="p4r1-maia-settings" data-p4r1-maia-settings>
      <button
        type="button"
        className="p4r1-maia-settings-trigger"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="p4r1-maia-settings-orb" aria-hidden="true" />
        <span>Working with MAIA</span>
        <b>{ENGAGEMENT_COPY[style.engagement].label}</b>
      </button>

      {open ? (
        <section className="p4r1-maia-settings-popover" role="dialog" aria-label="Working with MAIA">
          <header>
            <div>
              <span className="p4r1-maia-settings-kicker">Relationship first</span>
              <h2>Working with MAIA</h2>
              <p>
                Choose how MAIA joins you, how much she brings forward at once,
                and the language she uses. These settings never give her more
                authority over your Work.
              </p>
            </div>
            <button type="button" aria-label="Close Working with MAIA" onClick={() => setOpen(false)}>×</button>
          </header>

          <div className="p4r1-maia-settings-axis">
            <div className="p4r1-maia-settings-label">
              <span>How actively MAIA joins you</span>
              <b>{ENGAGEMENT_COPY[style.engagement].label}</b>
            </div>
            <div className="p4r1-maia-engagement-options" role="radiogroup" aria-label="MAIA engagement">
              {ENGAGEMENT_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={style.engagement === value}
                  onClick={() => update({ engagement: value })}
                >
                  <b>{ENGAGEMENT_COPY[value].label}</b>
                  <span>{ENGAGEMENT_COPY[value].description}</span>
                </button>
              ))}
            </div>
            <div className="p4r1-maia-settings-preview">
              <span>MAIA would begin</span>
              <p>{ENGAGEMENT_COPY[style.engagement].preview}</p>
            </div>
          </div>

          <div className="p4r1-maia-settings-axis">
            <div className="p4r1-maia-settings-label">
              <span>How much MAIA shows at once</span>
              <b>{PACE_COPY[style.pace].label}</b>
            </div>
            <input
              type="range"
              min={0}
              max={PACE_VALUES.length - 1}
              step={1}
              value={PACE_VALUES.indexOf(style.pace)}
              aria-valuetext={PACE_COPY[style.pace].label}
              onChange={(event) => update({
                pace: PACE_VALUES[Number(event.target.value)] ?? DEFAULT_WORKING_STYLE.pace,
              })}
            />
            <div className="p4r1-maia-settings-scale p4r1-maia-settings-scale-three" aria-hidden="true">
              {PACE_VALUES.map((value) => <span key={value}>{PACE_COPY[value].label}</span>)}
            </div>
            <p>{PACE_COPY[style.pace].description}</p>
          </div>

          <div className="p4r1-maia-settings-axis">
            <div className="p4r1-maia-settings-label">
              <span>How MAIA explains what she sees</span>
              <b>{EXPLANATION_COPY[style.explanation].label}</b>
            </div>
            <input
              type="range"
              min={0}
              max={EXPLANATION_VALUES.length - 1}
              step={1}
              value={EXPLANATION_VALUES.indexOf(style.explanation)}
              aria-valuetext={EXPLANATION_COPY[style.explanation].label}
              onChange={(event) => update({
                explanation: EXPLANATION_VALUES[Number(event.target.value)] ?? DEFAULT_WORKING_STYLE.explanation,
              })}
            />
            <div className="p4r1-maia-settings-scale" aria-hidden="true">
              {EXPLANATION_VALUES.map((value) => <span key={value}>{EXPLANATION_COPY[value].label}</span>)}
            </div>
            <p>{EXPLANATION_COPY[style.explanation].description}</p>
          </div>

          <footer>
            MAIA reflects what is alive and worth protecting before she names friction.
            Praise stays specific and earned; problems never get to be the first relationship.
          </footer>
        </section>
      ) : null}
    </div>,
    topbarHost,
  );
}
