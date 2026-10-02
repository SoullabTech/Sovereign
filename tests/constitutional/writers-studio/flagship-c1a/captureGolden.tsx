/** C1A — capture the accepted controlled Write markup. Run ONCE, before the extraction. */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderWriteStates } from './renderStates';
const dir = join(__dirname, 'golden');
const states = renderWriteStates();
for (const [id, html] of Object.entries(states)) writeFileSync(join(dir, `${id}.html`), html);
process.stdout.write(`captured ${Object.keys(states).length} states → ${dir}\n`);
