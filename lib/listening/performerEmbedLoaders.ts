/** LISTEN-01 · browser-only loaders for the two platform players the Listening Room may show.
 *
 * Both are the platforms' own official players, loaded only after a member presses "Play here":
 * nothing is requested from YouTube or Spotify on page load. Soullab never calls a play method on
 * either (see performerPlaybackPolicy.ts) and keeps no listening data. The adapters expose pause()
 * and destroy() only. Not exercised by any test against the real platforms yet — see the slice
 * record for what is witnessed and what is owed.
 */
import type { PerformerPlayerAdapter, PerformerPlayerState } from './performerPlaybackPolicy';
import type { PerformerEmbed } from './performerCatalog';

export interface PlayerHandle { adapter: PerformerPlayerAdapter }
export interface PlayerCallbacks {
  onState: (state: PerformerPlayerState) => void;
  onFailure: (reason: string) => void;
}

interface YTPlayer { pauseVideo: () => void; destroy: () => void }
interface YTNamespace {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
}
interface SpotifyController {
  pause: () => void; destroy: () => void;
  addListener: (name: string, cb: (e: { data?: Record<string, unknown> }) => void) => void;
}
interface SpotifyIFrameApi {
  createController: (el: HTMLElement, opts: Record<string, unknown>, cb: (c: SpotifyController) => void) => void;
}

/** Inside the native iOS/Android shell the YouTube player is not offered (error 153: the shell's
 * origin cannot identify itself to YouTube). Members get the link instead. */
export function isNativeApp(): boolean {
  const cap = (typeof window !== 'undefined' ? (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor : undefined);
  try { return !!cap?.isNativePlatform?.(); } catch { return false; }
}

const TIMEOUT_MS = 12_000;

function loadScript(src: string, ready: () => boolean, hook?: (done: () => void) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ready()) { resolve(); return; }
    const timer = setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS);
    const done = () => { clearTimeout(timer); resolve(); };
    hook?.(done);
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onerror = () => { clearTimeout(timer); reject(new Error('script-failed')); };
    if (!hook) s.onload = () => (ready() ? done() : undefined);
    document.head.appendChild(s);
  });
}

type WithYT = { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void; onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void };
const w = (): WithYT => window as unknown as WithYT;
let spotifyApi: SpotifyIFrameApi | null = null;

const YT_ERRORS = new Set([2, 5, 100, 101, 150, 153]);
const YT_STATES: Record<number, PerformerPlayerState> = { [-1]: 'unstarted', 0: 'ended', 1: 'playing', 2: 'paused', 3: 'buffering', 5: 'unstarted' };

export async function mountYouTube(el: HTMLElement, embed: PerformerEmbed, cb: PlayerCallbacks): Promise<PlayerHandle> {
  await loadScript('https://www.youtube.com/iframe_api', () => !!w().YT?.Player, done => {
    const prior = w().onYouTubeIframeAPIReady;
    w().onYouTubeIframeAPIReady = () => { prior?.(); done(); };
  });
  const YT = w().YT;
  if (!YT) throw new Error('youtube-unavailable');
  const target = document.createElement('div');
  el.appendChild(target);
  const player = new YT.Player(target, {
    videoId: embed.ref, width: '100%', height: 220,
    host: 'https://www.youtube-nocookie.com',
    // autoplay stays 0 and nothing ever calls a play method: the member presses the player's own button.
    playerVars: { playsinline: 1, rel: 0, autoplay: 0, origin: window.location.origin },
    events: {
      onStateChange: (e: { data: number }) => { const s = YT_STATES[e.data]; if (s) cb.onState(s); },
      onError: (e: { data: number }) => { cb.onState('error'); cb.onFailure(YT_ERRORS.has(e.data) ? `youtube-${e.data}` : 'youtube-error'); },
    },
  });
  return { adapter: { pause: () => { try { player.pauseVideo(); } catch { /* player gone */ } }, destroy: () => { try { player.destroy(); } catch { /* already gone */ } } } };
}

export async function mountSpotify(el: HTMLElement, embed: PerformerEmbed, cb: PlayerCallbacks): Promise<PlayerHandle> {
  if (!spotifyApi) {
    await loadScript('https://open.spotify.com/embed/iframe-api/v1', () => !!spotifyApi, done => {
      w().onSpotifyIframeApiReady = api => { spotifyApi = api; done(); };
    });
  }
  const api = spotifyApi;
  if (!api) throw new Error('spotify-unavailable');
  const target = document.createElement('div');
  el.appendChild(target);
  return new Promise<PlayerHandle>(resolve => {
    api.createController(target, { uri: embed.ref, width: '100%', height: 152 }, controller => {
      controller.addListener('playback_update', e => {
        const d = e.data ?? {};
        cb.onState(d.isBuffering ? 'buffering' : d.isPaused ? 'paused' : 'playing');
      });
      resolve({ adapter: { pause: () => { try { controller.pause(); } catch { /* controller gone */ } }, destroy: () => { try { controller.destroy(); } catch { /* already gone */ } } } });
    });
  });
}

export function mountEmbed(el: HTMLElement, embed: PerformerEmbed, cb: PlayerCallbacks): Promise<PlayerHandle> {
  return embed.provider === 'youtube' ? mountYouTube(el, embed, cb) : mountSpotify(el, embed, cb);
}
