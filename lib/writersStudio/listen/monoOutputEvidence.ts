/**
 * Web Audio's MediaStreamAudioDestinationNode fixes the stream channel count to
 * the destination's channelCount. Safari may omit track settings for this
 * generated stream. Absence is not evidence of stereo; a contradictory reported
 * setting is still refused. This proves routing, not an encoded-file/mastering claim.
 * https://www.w3.org/TR/webaudio/#MediaStreamAudioDestinationNode
 */
export type MonoOutputEvidence = 'track-settings' | 'explicit-audio-graph';
export function verifyMonoOutput(args: {
  destinationChannels: number;
  channelCountMode: string;
  audioTrackCount: number;
  trackKind: string | undefined;
  trackReadyState: string | undefined;
  reportedChannels: number | undefined;
}): MonoOutputEvidence {
  if (args.destinationChannels !== 1 || args.channelCountMode !== 'explicit'
    || args.audioTrackCount !== 1 || args.trackKind !== 'audio' || args.trackReadyState !== 'live') {
    throw new Error('The browser did not establish one live mono output; recording was not started.');
  }
  if (args.reportedChannels === 1) return 'track-settings';
  if (args.reportedChannels === undefined) return 'explicit-audio-graph';
  throw new Error('The browser reported a non-mono output; recording was not started.');
}
