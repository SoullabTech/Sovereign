// LISTEN-NATIVE-AUDIO-01 · thin Capacitor bridge to the native SoundFieldAudio plugin.
// On the web and in tests every function is a no-op: the browser path uses Media Session.
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import type { InterruptionEvent, NativeMixStopReason, NowPlayingInfo, RemoteCommand, RouteChangeEvent } from './platformAudioPolicy';

export type SoundFieldAudioPlugin = {
  /** Member-initiated: configures a playback session. Never touches the microphone. */
  activate(options: { mixWithOthers: boolean }): Promise<{ category: string; mixWithOthers: boolean }>;
  deactivate(): Promise<void>;
  setNowPlaying(info: NowPlayingInfo): Promise<void>;
  clearNowPlaying(): Promise<void>;
  /** Native mix (recorded sounds only, bundled under public/media). Member-started; never auto-resumed. */
  mixStart(options: { path: string; level: number; loop?: boolean }): Promise<{ durationSeconds: number; gainDb: number }>;
  mixStop(): Promise<void>;
  mixSetLevel(options: { level: number }): Promise<{ gainDb: number }>;
  mixStatus(): Promise<{ active: boolean; positionSeconds: number; durationSeconds: number; level: number; gainDb: number }>;
  addListener(event: 'mixStopped', handler: (event: { reason: NativeMixStopReason }) => void): Promise<PluginListenerHandle>;
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
