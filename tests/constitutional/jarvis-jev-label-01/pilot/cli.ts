/**
 * Usage (run on the Mac Studio, Desktop closed). EVERY command takes --home and refuses an output inside it.
 *   snapshot --home <h> --out <dir>                                  → manifest.json, local-index.json (never commit)
 *   sheet    --home <h> --manifest <f> --labeller A|B --domain P --out <f>
 *   seal     --home <h> --manifest <f> --index <f> --sheet <f> --out <f> --annotations-out <f>   (P)
 *   sheet    --home <h> --manifest <f> --labeller A|B --domain F --sealed-p <f> --out <f>   (only after P is sealed)
 *   seal     --home <h> --manifest <f> --index <f> --sheet <f> --sealed-p <f> --out <f> --annotations-out <f>   (F)
 *   (--annotations-out holds the free-text notes, mode 0600, LOCAL ONLY; the sealed file carries ambiguity COUNTS only)
 *   report   --home <h> --manifest <f> --sealed <f> [--sealed <f> ...] [--out <f>]
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertOutsideHome, blankSheet, extractAnnotations, PilotRefused, report, seal, snapshot, verifySources, writeOutside, type LocalIndex, type Manifest, type Sealed, type Sheet } from './pilot';

const argv = process.argv.slice(2);
const cmd = argv[0];
const all = (name: string): string[] => argv.flatMap((a, i) => (a === `--${name}` && argv[i + 1] ? [argv[i + 1] as string] : []));
const opt = (name: string): string | undefined => all(name)[0];
const one = (name: string): string => { const v = opt(name); if (!v) throw new PilotRefused('USAGE', `--${name} required`); return v; };
const json = <T>(f: string): T => JSON.parse(readFileSync(f, 'utf8')) as T;
const pretty = (v: unknown): string => JSON.stringify(v, null, 2) + '\n';

try {
  const home = one('home');
  if (cmd === 'snapshot') {
    const out = one('out');
    assertOutsideHome(home, out);
    const { manifest, index } = snapshot(home);
    mkdirSync(out, { recursive: true });
    writeOutside(home, join(out, 'manifest.json'), pretty(manifest));
    writeOutside(home, join(out, 'local-index.json'), pretty(index), 0o600);
    console.log(`${manifest.banner}\nunits=${manifest.units.length} of ${manifest.primaries_found} manifest_sha256=${manifest.manifest_sha256}`);
  } else if (cmd === 'sheet') {
    const l = one('labeller'); const d = one('domain');
    if ((l !== 'A' && l !== 'B') || (d !== 'P' && d !== 'F')) throw new PilotRefused('USAGE', 'labeller A|B, domain P|F');
    const p = opt('sealed-p');
    writeOutside(home, one('out'), pretty(blankSheet(json<Manifest>(one('manifest')), l, d, p ? json<Sealed>(p) : undefined)));
  } else if (cmd === 'seal') {
    const manifest = json<Manifest>(one('manifest'));
    verifySources(home, manifest, json<LocalIndex>(one('index')));
    const p = opt('sealed-p');
    const sheet = json<Sheet>(one('sheet'));
    const sealed = seal(manifest, sheet, 1, p ? json<Sealed>(p) : undefined);
    writeOutside(home, one('annotations-out'), pretty(extractAnnotations(sheet)), 0o600);
    writeOutside(home, one('out'), pretty(sealed));
  } else if (cmd === 'report') {
    const text = report(json<Manifest>(one('manifest')), all('sealed').map((f) => json<Sealed>(f)));
    const out = opt('out');
    if (out) writeOutside(home, out, text); else process.stdout.write(text);
  } else throw new PilotRefused('USAGE', 'snapshot | sheet | seal | report');
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}
