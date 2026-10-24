/** LISTEN-03 — user-supplied metadata parser only; no music provider APIs,
 * network fetch, account token processing, media ripping or remote M3U playback. */
export type TrackReference = { title: string; artist: string; album: string; url: string | null; service: string | null };
export type MemberCollection = { id: string; name: string; provider: string | null; link: string | null; tracks: TrackReference[] };
export const MAX_PLAYLIST_BYTES = 1024 * 1024;
export const MAX_TRACKS = 1000;
const DOMAINS: Record<string, string> = {
  'open.spotify.com': 'Spotify',
  'tidal.com': 'TIDAL',
  'listen.tidal.com': 'TIDAL',
  'music.apple.com': 'Apple Music',
  'play.qobuz.com': 'Qobuz',
  'www.qobuz.com': 'Qobuz',
  'soundcloud.com': 'SoundCloud',
};
export function tidyText(value: unknown, max = 180): string {
  return String(value ?? '').replace(/[\x00-\x1f\x7f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
export function recognizedProviderUrl(raw: unknown): { service: string; href: string; path: string } | null {
  if (typeof raw !== 'string' || raw.length > 2048) return null;
  let parsed: URL;
  try { parsed = new URL(raw.trim()); } catch { return null; }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) return null;
  const service = DOMAINS[parsed.hostname.toLowerCase()];
  if (!service || parsed.pathname === '/' || !parsed.pathname || /%2f|%5c|%00|\.\./i.test(parsed.pathname)) return null;
  return { service, href: parsed.origin + parsed.pathname, path: parsed.pathname };
}
export function recognizedPlaylistUrl(raw: unknown): { service: string; href: string } | null {
  const found = recognizedProviderUrl(raw);
  if (!found) return null;
  const sections = found.path.split('/').filter(Boolean);
  let ok = false;
  switch (found.service) {
    case 'Spotify': ok = sections[0] === 'playlist' && sections.length === 2; break;
    case 'TIDAL': ok = sections.includes('playlist') && sections.indexOf('playlist') < sections.length - 1; break;
    case 'Apple Music': ok = sections.includes('playlist') && sections.indexOf('playlist') < sections.length - 1; break;
    case 'Qobuz': ok = sections.includes('playlist') && sections.indexOf('playlist') < sections.length - 1; break;
    case 'SoundCloud': ok = sections.includes('sets') && sections.indexOf('sets') < sections.length - 1; break;
  }
  return ok ? { service: found.service, href: found.href } : null;
}
export function parseCSV(raw: string): TrackReference[] {
  if (new TextEncoder().encode(raw).byteLength > MAX_PLAYLIST_BYTES) throw new Error('Playlist file exceeds 1 MB.');
  const rows: string[][] = []; let row: string[] = [], cell = '', quoted = false;
  const s = raw.replace(/^\uFEFF/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === '') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i+1] === '\n') i++;
      row.push(cell); if (row.some(v => v.trim())) rows.push(row);
      row = []; cell = '';
      if (rows.length > MAX_TRACKS + 1) throw new Error('Playlist exceeds 1,000 tracks.');
    } else cell += c;
  }
  if (quoted) throw new Error('CSV has an unclosed quoted field.');
  row.push(cell); if (row.some(v => v.trim())) rows.push(row);
  if (!rows.length || rows.length > MAX_TRACKS + 1) throw new Error('CSV is empty or too large.');
  const columns = rows.shift()!.map(h => tidyText(h, 80).toLowerCase().replace(/[^a-z0-9]/g,''));
  const find = (...names: string[]) => columns.findIndex(c => names.includes(c));
  const titleAt = find('title','name','song','track','trackname');
  if (titleAt < 0) throw new Error('CSV requires a Title, Song or Track column.');
  const artistAt = find('artist','artists','artistname'), albumAt = find('album','albumname'), urlAt = find('url','link','trackurl');
  return rows.flatMap(r => {
    const title = tidyText(r[titleAt]); if (!title) return [];
    const external = urlAt < 0 ? null : recognizedProviderUrl(r[urlAt]);
    return [{title, artist: artistAt < 0 ? '' : tidyText(r[artistAt]), album: albumAt < 0 ? '' : tidyText(r[albumAt]), url: external?.href || null, service: external?.service || null}];
  });
}
export function parseM3U(raw: string): TrackReference[] {
  if (new TextEncoder().encode(raw).byteLength > MAX_PLAYLIST_BYTES) throw new Error('Playlist file exceeds 1 MB.');
  const tracks: TrackReference[] = []; let label = '';
  for (const row of raw.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = row.trim(); if (!line) continue;
    if (line.startsWith('#EXTINF:')) { label = tidyText(line.slice(line.indexOf(',') + 1)); continue; }
    if (line.startsWith('#')) continue;
    if (tracks.length >= MAX_TRACKS) throw new Error('Playlist exceeds 1,000 tracks.');
    const recognized = recognizedProviderUrl(line);
    const fallback = tidyText(line.split(/[\\/]/).pop()?.replace(/\.[a-z0-9]{1,6}$/i,'') || 'Untitled');
    const display = label || fallback, pivot = display.indexOf(' - ');
    tracks.push({title: tidyText(pivot > 0 ? display.slice(pivot + 3) : display), artist: pivot > 0 ? tidyText(display.slice(0,pivot)) : '', album: '', url: recognized?.href || null, service: recognized?.service || null});
    label = '';
  }
  return tracks;
}
/** Escaping for spreadsheet export: block formula execution when opened in Excel. */
function csvCell(s: unknown): string {
  let value = tidyText(s, 1000);
  if (/^[\s]*[=+@-]/.test(value)) value = "'" + value;
  return '"' + value.replace(/"/g, '""') + '"';
}
export function exportCollectionCSV(tracks: TrackReference[]): string {
  return ['Title,Artist,Album,URL', ...tracks.slice(0,MAX_TRACKS).map(t => [t.title,t.artist,t.album,t.url||''].map(csvCell).join(','))].join('\r\n') + '\r\n';
}


/** Offline restoration of an explicit Soullab-created export. This is NOT
 * provider synchronization or server-side member custody. All imported data is
 * treated as untrusted even when the export declares Soullab as its source. */
export const SOULLAB_EXPORT_FORMAT = 'SOULLAB_LISTEN_03_MEMBER_EXPORT';
export const MAX_RESTORE_BYTES = 5 * 1024 * 1024;
export const MAX_COLLECTIONS = 30;
function plainRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}
export function restoreMemberShelf(raw: string): { collections: MemberCollection[]; journal: string } {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).byteLength > MAX_RESTORE_BYTES)
    throw new Error('Listening export exceeds the 5 MB limit.');
  let data: unknown;
  try { data = JSON.parse(raw); }
  catch { throw new Error('Listening export is not valid JSON.'); }
  if (!plainRecord(data) || data.format !== SOULLAB_EXPORT_FORMAT ||
      !Array.isArray(data.collections) || data.collections.length > MAX_COLLECTIONS ||
      typeof data.journal !== 'string') {
    throw new Error('This is not a supported Soullab Listening Room export.');
  }
  let total = 0;
  const collections = data.collections.map((collection, index): MemberCollection => {
    if (!plainRecord(collection) || typeof collection.name !== 'string' ||
        !Array.isArray(collection.tracks) || collection.tracks.length > MAX_TRACKS) {
      throw new Error('A collection has an invalid structure or too many tracks.');
    }
    total += collection.tracks.length;
    if (total > MAX_COLLECTIONS * MAX_TRACKS) throw new Error('Too many imported tracks.');
    const name = tidyText(collection.name, 100);
    if (!name) throw new Error('A collection is missing its name.');
    const external = collection.link == null ? null : recognizedPlaylistUrl(collection.link);
    if (collection.link != null && !external)
      throw new Error('A collection contains an unrecognized playlist link.');
    const tracks = collection.tracks.map((track): TrackReference => {
      if (!plainRecord(track) || typeof track.title !== 'string' || !tidyText(track.title))
        throw new Error('A collection contains a track without a title.');
      const url = recognizedProviderUrl(track.url);
      return {
        title: tidyText(track.title),
        artist: tidyText(typeof track.artist === 'string' ? track.artist : ''),
        album: tidyText(typeof track.album === 'string' ? track.album : ''),
        url: url?.href || null,
        service: url?.service || null,
      };
    });
    // Never reuse supplied IDs, provider labels or untrusted external URL schemes.
    return { id: 'restored-' + (index + 1), name,
      provider: external?.service || null, link: external?.href || null, tracks };
  });
  return { collections, journal: data.journal.slice(0, 4000) };
}
