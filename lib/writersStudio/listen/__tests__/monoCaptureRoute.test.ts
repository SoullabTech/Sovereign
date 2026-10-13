import { describe, expect, it } from 'vitest';
import { createMonoCaptureRoute } from '../monoCaptureRoute';

describe('Listen · mono channel routing safeguards', () => {
  const noAudio: MediaStream = { getAudioTracks: () => [] } as unknown as MediaStream;

  it('rejects invalid physical input channels rather than guessing', async () => {
    await expect(createMonoCaptureRoute(noAudio, 3 as 1))
      .rejects.toThrow('Choose microphone input 1 or 2');
  });

  it('refuses a recording if the browser cannot create a mono route', async () => {
    if (typeof AudioContext !== 'undefined') return;
    await expect(createMonoCaptureRoute(noAudio, 1))
      .rejects.toThrow('does not support mono channel routing');
  });
});
