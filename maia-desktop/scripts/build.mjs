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

const repoRoot = path.join(root, '..');
const standaloneRoot = path.join(repoRoot, '.next', 'standalone');
const standaloneServer = path.join(standaloneRoot, 'server.js');
const standaloneStatic = path.join(repoRoot, '.next', 'static');
const standalonePublic = path.join(repoRoot, 'public');

if (!fs.existsSync(standaloneServer)) {
  throw new Error(
    'Cabin runtime is not built. Run MAIA_CABIN_MODE=offline next build first so .next/standalone/server.js exists.',
  );
}

const cabinSourceParent = process.env.MAIA_DESKTOP_CABIN_STAGING_PARENT ||
  path.join(os.tmpdir(), 'maia-desktop-cabin-staging');
const cabinSource = path.join(cabinSourceParent, `cabin-runtime-${sha}`);
fs.rmSync(cabinSource, { recursive: true, force: true });
fs.mkdirSync(cabinSourceParent, { recursive: true });
fs.cpSync(standaloneRoot, cabinSource, { recursive: true });
fs.mkdirSync(path.join(cabinSource, '.next'), { recursive: true });
fs.cpSync(standaloneStatic, path.join(cabinSource, '.next', 'static'), { recursive: true });
fs.cpSync(standalonePublic, path.join(cabinSource, 'public'), { recursive: true });

const standaloneNextPackage = path.join(cabinSource, 'node_modules', 'next', 'package.json');
if (!fs.existsSync(standaloneNextPackage)) {
  throw new Error('Cabin runtime staging missing node_modules/next; refusing to package');
}

const stagedPackagePath = path.join(stage, 'package.json');
const stagedPackage = JSON.parse(fs.readFileSync(stagedPackagePath, 'utf8'));
const cabinResource = stagedPackage.build?.extraResources?.find(
  (resource) => resource?.to === 'cabin-runtime',
);
if (!cabinResource) {
  throw new Error('Cabin extraResources entry is missing from staged package');
}
cabinResource.from = cabinSource;
const cabinNodeModulesSource = path.join(cabinSource, 'node_modules');
const cabinNodeModulesDestination = 'cabin-runtime/node_modules';
if (!fs.existsSync(path.join(cabinNodeModulesSource, 'next', 'package.json'))) {
  throw new Error('Cabin node_modules source is incomplete; refusing to package');
}
stagedPackage.build.extraResources.push({
  from: cabinNodeModulesSource,
  to: cabinNodeModulesDestination,
  filter: ['**/*'],
});

const stagedNodeModulesResource = stagedPackage.build.extraResources.find(
  (resource) => resource?.from === cabinNodeModulesSource && resource?.to === cabinNodeModulesDestination,
);
if (!stagedNodeModulesResource) {
  throw new Error('Cabin node_modules extraResources entry was not staged');
}

fs.writeFileSync(stagedPackagePath, `${JSON.stringify(stagedPackage, null, 2)}\n`, 'utf8');

console.log('[MAIA Desktop] cabin runtime staged outside electron-builder project and staging parent');
console.log(`[MAIA Desktop] cabin source=${cabinSource}`);
console.log(`[MAIA Desktop] cabin server=${path.join(cabinSource, 'server.js')}`);
console.log(`[MAIA Desktop] cabin next=${standaloneNextPackage}`);
console.log(`[MAIA Desktop] cabin node_modules source=${cabinNodeModulesSource}`);
console.log(`[MAIA Desktop] cabin node_modules destination=${cabinNodeModulesDestination}`);

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
  fs.rmSync(cabinSource, { recursive: true, force: true });
}
