/**
 * Browser-only mono routing for stereo USB microphone interfaces.
 *
 * Input 1/2 is a physical capture channel. It must never be interpreted as
 * left/right stereo programme audio. We deliberately choose ONE source
 * channel rather than mixing a live microphone with an empty second input.
 *
 * This produces a mono stream for MediaRecorder, which may still use lossy
 * WebM/Opus or M4A. It is NOT native 24-bit PCM WAV capture.
 */
export type InputChannel = 1 | 2;

export type MonoCaptureRoute = {
  stream: MediaStream;
  inputChannel: InputChannel;
  outputChannels: number;
  outputRateHz: number;
  /** Live, unrecorded views of the two physical interface inputs. */
  analysers: Readonly<Record<InputChannel, AnalyserNode>>;
  close: () => Promise<void>;
};

export async function createMonoCaptureRoute(
  sourceStream: MediaStream,
  inputChannel: InputChannel,
): Promise<MonoCaptureRoute> {
  if (inputChannel !== 1 && inputChannel !== 2) {
    throw new Error('Choose microphone input 1 or 2.');
  }
  const NativeAudioContext = typeof AudioContext === 'function'
    ? AudioContext
    : (typeof window !== 'undefined'
      ? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined);

  if (!NativeAudioContext) throw new Error('This browser does not support mono channel routing.');

  const sourceTrack = sourceStream.getAudioTracks()[0];
  if (!sourceTrack) throw new Error('The microphone stream has no audio track.');
  const inputCount = sourceTrack.getSettings().channelCount;
  if (inputChannel === 2 && inputCount === 1) {
    throw new Error('Input 2 cannot be selected for a single-channel microphone.');
  }

  const context = new NativeAudioContext({ sampleRate: 48000 });
  try {
    const input = context.createMediaStreamSource(sourceStream);
    const splitter = context.createChannelSplitter(2);
    const analyser1 = context.createAnalyser();
    const analyser2 = context.createAnalyser();
    const output = context.createMediaStreamDestination();

    // Observe both physical inputs while routing only the chosen one to MediaRecorder.
    // Nothing connects to speakers, so the live voice field cannot create feedback.
    for (const analyser of [analyser1, analyser2]) {
      analyser.channelCountMode = 'explicit';
      analyser.channelCount = 1;
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.25;
    }

    // MediaStreamDestination defaults to 2 channels. Explicit mono matters:
    // otherwise input 1 would remain audible in the left speaker only.
    output.channelCountMode = 'explicit';
    output.channelCount = 1;

    input.connect(splitter);
    splitter.connect(analyser1, 0, 0);
    splitter.connect(analyser2, 1, 0);
    (inputChannel === 1 ? analyser1 : analyser2).connect(output);
    await context.resume();

    const monoTrack = output.stream.getAudioTracks()[0];
    // A WebAudio destination may briefly report the default 2-channel setting
    // even after it has been reconfigured. Wait for the actual track settings
    // to settle before refusing the recording; never silently accept stereo.
    let reportedChannels = monoTrack?.getSettings().channelCount;
    for (let i = 0; i < 14 && reportedChannels !== 1; i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
      reportedChannels = monoTrack?.getSettings().channelCount;
    }
    if (reportedChannels !== 1) {
      throw new Error('The browser did not confirm mono output; recording was not started.');
    }
    return {
      stream: output.stream,
      inputChannel,
      outputChannels: 1,
      outputRateHz: context.sampleRate,
      analysers: { 1: analyser1, 2: analyser2 },
      close: async () => {
        try {
          input.disconnect();
          splitter.disconnect();
          analyser1.disconnect();
          analyser2.disconnect();
        } finally {
          output.stream.getTracks().forEach((track) => track.stop());
          if (context.state !== 'closed') await context.close();
        }
      },
    };
  } catch (error) {
    if (context.state !== 'closed') await context.close();
    throw error;
  }
}
