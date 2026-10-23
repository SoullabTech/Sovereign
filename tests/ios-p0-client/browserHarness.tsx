/**
 * Fictional, client-only P0 browser harness. No API, auth, database, provider,
 * member content, or original app route is available to this harness.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { SessionRitualClosing } from '../../components/session/SessionRitualClosing';
import { SessionRitualOpening } from '../../components/session/SessionRitualOpening';
import { ResumeSessionPrompt } from '../../components/session/ResumeSessionPrompt';
import { SessionTimeAwareness } from '../../components/session/SessionTimeAwareness';
import { SessionTimer } from '../../lib/session/SessionTimer';
import type { ClosureDisplayState } from '../../lib/session/closureReceipt';

const host = document.getElementById('maia-test-host');
if (!host) throw Error('test host unavailable');
const root = createRoot(host);
let closeRequests = 0;
let openings = 0;
let dismissals = 0;
let resumes = 0;
let news = 0;
let clock: SessionTimer | null = null;

const renderClose = (isOpen: boolean, closureState: ClosureDisplayState = 'ready') => {
  const onComplete = () => { closeRequests += 1; };
  root.render(
    <React.StrictMode>
      <SessionRitualClosing
        isOpen={isOpen}
        closureState={closureState}
        onComplete={onComplete}
        onSkip={() => { dismissals += 1; }}
      />
    </React.StrictMode>
  );
};

const renderOpening = (isOpen: boolean) => {
  root.render(
    <React.StrictMode>
      <SessionRitualOpening
        isOpen={isOpen}
        onComplete={() => { openings += 1; }}
      />
    </React.StrictMode>
  );
};

const renderResume = (isOpen: boolean) => {
  root.render(
    <React.StrictMode>
      <ResumeSessionPrompt
        isOpen={isOpen}
        onResume={() => { resumes += 1; }}
        onStartNew={() => { news += 1; }}
        onDismiss={() => { dismissals += 1; }}
      />
    </React.StrictMode>
  );
};

const renderTimer = () => {
  clock = new SessionTimer({ durationMinutes: 50 });
  root.render(<SessionTimeAwareness timer={clock} />);
};
const extendTimer = (minutes: number) => {
  clock?.extend(minutes);
};

(window as unknown as Record<string, unknown>).__maiaIosP0 = {
  renderClose, renderOpening, renderResume, renderTimer, extendTimer,
  counts: () => ({ closeRequests, openings, dismissals, resumes, news }),
};
