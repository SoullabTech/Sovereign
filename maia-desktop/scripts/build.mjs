import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const builder = path.join(root, 'node_modules', '.bin', 'electron-builder');
const sha = execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
  cwd: root,
  encoding: 'utf8',
}).trim();
const directoryOnly = process.argv.includes('--dir');
const targets = directoryOnly ? ['dir'] : ['dmg', 'zip'];
const outputDir = process.env.MAIA_DESKTOP_OUTPUT_DIR || path.join(root, 'dist');
const stageParent = process.env.MAIA_DESKTOP_STAGING_DIR ||
  fs.mkdtempSync(path.join(os.tmpdir(), 'maia-desktop-build-'));
const stage = path.join(stageParent, 'project');

fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
for (const entry of ['package.json', 'src', 'build']) {
  fs.cpSync(path.join(root, entry), path.join(stage, entry), { recursive: true });
}
const args = [
  '--projectDir', stage,
  '--mac',
  ...targets,
  '--arm64',
  `--config.extraMetadata.maiaBuildSha=${sha}`,
  `--config.directories.output=${outputDir}`,
];

console.log(`[MAIA Desktop] build=${sha} target=${targets.join(',')} arch=arm64`);
console.log(`[MAIA Desktop] stage=${stage}`);
console.log(`[MAIA Desktop] output=${outputDir}`);
try {
  execFileSync(builder, args, {
    cwd: root,
    env: { ...process.env, MAIA_DESKTOP_BUILD_SHA: sha },
    stdio: 'inherit',
  });
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
