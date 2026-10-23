import { readFileSync } from 'fs';
import { join } from 'path';
import { SessionTimer } from '../SessionTimer';

describe('MAIA session timer lifecycle — client-only P0 regressions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-22T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('a 50-minute session extended by 15 expires at 65, not 50 minutes', () => {
    const onComplete = jest.fn();
    const timer = new SessionTimer({ durationMinutes: 50, onComplete });
    timer.start(60_000);
    timer.extend(15);

    expect(timer.getDurationMinutes()).toBe(65);
    expect(timer.getTimeContext().totalMinutes).toBe(65);

    jest.advanceTimersByTime(50 * 60_000);
    expect(timer.getTimeContext().remainingMinutes).toBe(15);
    expect(onComplete).not.toHaveBeenCalled();

    jest.advanceTimersByTime(15 * 60_000);
    expect(timer.getTimeContext().remainingMinutes).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(2 * 60_000);
    expect(onComplete).toHaveBeenCalledTimes(1);
    timer.stop();
  });

  it('start is idempotent and retains one timer interval', () => {
    const timer = new SessionTimer({ durationMinutes: 50 });
    timer.start(60_000);
    timer.start(60_000);
    expect(jest.getTimerCount()).toBe(1);
    timer.stop();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('50+15 legacy save is canonicalized to a stable 65-minute resume', () => {
    const start = new Date('2026-10-22T12:00:00.000Z');
    const firstResume = SessionTimer.fromSavedData(start, 50, 15, {});
    expect(firstResume.getDurationMinutes()).toBe(65);

    // A subsequent autosave must store the effective duration with no
    // second outstanding extension to replay.
    const nextResume = SessionTimer.fromSavedData(
      start, firstResume.getDurationMinutes(), 0, {},
    );
    expect(nextResume.getDurationMinutes()).toBe(65);

    // Contract assertion against the actual client persistence caller.
    const source = readFileSync(
      join(process.cwd(), 'components/OracleConversation.tsx'), 'utf8',
    );
    const resume = source.split('const handleResumeSession = useCallback')[1]
      ?.split('const handleStartNewSession = useCallback')[0];
    expect(resume).toContain('durationMinutes: timer.getDurationMinutes()');
    expect(resume).toContain('totalExtensionMinutes: 0');
  });
});
