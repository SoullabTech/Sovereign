// LISTEN-NATIVE-AUDIO-01 · thin Capacitor bridge to the native SoundFieldAudio plugin.
// On the web and in tests every function is a no-op: the browser path uses Media Session.
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import type { InterruptionEvent, NowPlayingInfo, RemoteCommand, RouteChangeEvent } from './platformAudioPolicy';

export type SoundFieldAudioPlugin = {
  /** Member-initiated: configures a playback session. Never touches the microphone. */
  activate(options: { mixWithOthers: boolean }): Promise<{ category: string; mixWithOthers: boolean }>;
  deactivate(): Promise<void>;
  setNowPlaying(info: NowPlayingInfo): Promise<void>;
  clearNowPlaying(): Promise<void>;
  addListener(event: 'interruption', handler: (event: InterruptionEvent) => void): Promise<PluginListenerHandle>;
  addListener(event: 'routeChange', handler: (event: RouteChangeEvent) => void): Promise<PluginListenerHandle>;
  addListener(event: 'remoteCommand', handler: (event: { command: RemoteCommand }) => void): Promise<PluginListenerHandle>;
};

let plugin: SoundFieldAudioPlugin | null = null;
export function nativeSoundAudio(): SoundFieldAudioPlugin | null {
  if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) return null;
  if (!plugin) plugin = registerPlugin<SoundFieldAudioPlugin>('SoundFieldAudio');
  return plugin;
}
