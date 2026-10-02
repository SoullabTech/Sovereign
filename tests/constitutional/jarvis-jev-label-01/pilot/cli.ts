/**
 * Usage (run on the Mac Studio, Desktop closed):
 *   snapshot --home <delegation-home> --out <dir outside home>      → manifest.json, local-index.json (never commit)
 *   sheet    --manifest <f> --labeller A|B --out <f>                → blank label sheet
 *   seal     --home <h> --manifest <f> --index <f> --sheet <f> --out <f>
 *   report   --manifest <f> --sealed <f> [--sealed <f>] [--out <f>]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertOutsideHome, blankSheet, PilotRefused, report, seal, snapshot, verifySources, type LocalIndex, type Manifest, type Sealed, type Sheet } from './pilot';

const argv = process.argv.slice(2);
const cmd = argv[0];
const all = (name: string): string[] => argv.flatMap((a, i) => (a === `--${name}` && argv[i + 1] ? [argv[i + 1] as string] : []));
const one = (name: string): string => { const v = all(name)[0]; if (!v) throw new PilotRefused('USAGE', `--${name} required`); return v; };
const json = <T>(f: string): T => JSON.parse(readFileSync(f, 'utf8')) as T;

try {
  if (cmd === 'snapshot') {
    const home = one('home'); const out = one('out');
    assertOutsideHome(home, out);
    const { manifest, index } = snapshot(home);
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    writeFileSync(join(out, 'local-index.json'), JSON.stringify(index, null, 2) + '\n', { mode: 0o600 });
    console.log(`${manifest.banner}\nunits=${manifest.units.length} of ${manifest.primaries_found} manifest_sha256=${manifest.manifest_sha256}`);
  } else if (cmd === 'sheet') {
    const l = one('labeller');
    if (l !== 'A' && l !== 'B') throw new PilotRefused('USAGE', 'labeller must be A or B');
    writeFileSync(one('out'), JSON.stringify(blankSheet(json<Manifest>(one('manifest')), l), null, 2) + '\n');
  } else if (cmd === 'seal') {
    const manifest = json<Manifest>(one('manifest'));
    verifySources(one('home'), manifest, json<LocalIndex>(one('index')));
    writeFileSync(one('out'), JSON.stringify(seal(manifest, json<Sheet>(one('sheet'))), null, 2) + '\n');
  } else if (cmd === 'report') {
    const text = report(json<Manifest>(one('manifest')), all('sealed').map((f) => json<Sealed>(f)));
    const out = all('out')[0];
    if (out) writeFileSync(out, text); else process.stdout.write(text);
  } else throw new PilotRefused('USAGE', 'snapshot | sheet | seal | report');
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}
