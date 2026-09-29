#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));

if (pkg.engines?.node !== '>=22.0.0') throw new Error('root Node engine must be >=22.0.0');
if (read('.nvmrc').trim() !== '22') throw new Error('.nvmrc must select Node 22');
if (lock.packages?.['']?.engines?.node !== '>=22.0.0') throw new Error('lock root Node engine must be >=22.0.0');

const dockerFiles = [
  'Dockerfile',
  'Dockerfile.fast',
  'Dockerfile.arm64-alpine.prisma',
  'Dockerfile.production',
  'Dockerfile.beads-sync',
  'apps/api/Dockerfile',
  'services/oldhead/Dockerfile',
];
for (const rel of dockerFiles) {
  const s = read(rel);
  if (/FROM node:(18|20)(?:-|\b)/.test(s)) throw new Error(rel + ' still uses Node 18/20');
  if (!/FROM node:22(?:-|\b)/.test(s)) throw new Error(rel + ' lacks Node 22 base');
}

const workflows = [
  '.github/workflows/deploy.yml',
  '.github/workflows/mobile-deploy.yml',
  '.github/workflows/check-diagrams.yml',
];
for (const rel of workflows) {
  if (!fs.existsSync(path.join(root, rel))) continue;
  const s = read(rel);
  if (/node-version:\s*['"]?(18|20)\b/.test(s)) throw new Error(rel + ' still configures Node 18/20');
}
if (!read('.github/workflows/deploy.yml').includes('node-version: [22]'))
  throw new Error('deploy CI matrix must be Node 22 only');
if (!read('.github/workflows/mobile-deploy.yml').includes("NODE_VERSION: '22'"))
  throw new Error('mobile deploy Node contract must be 22');

if (!read('scripts/ios/doctor.sh').includes('need >= 22'))
  throw new Error('iOS doctor must require Node 22');
if (!read('scripts/deploy-soul-consciousness-interface.sh').includes('NODE_VERSION="22"'))
  throw new Error('consciousness deploy script must require Node 22');
if (/FROM node:(18|20)(?:-|\b)/.test(read('scripts/setup-m4-docker-server.sh')))
  throw new Error('M4 setup script still emits Node 18/20 image');

const productionCompose = read('docker-compose.production.yml');
if (/mythic-atlas:\n\s+image: node:(18|20)-alpine/.test(productionCompose))
  throw new Error('production mythic-atlas still runs Node 18/20');
if (productionCompose.includes('mythic-atlas:') &&
    !productionCompose.includes('mythic-atlas:\n    image: node:22-alpine'))
  throw new Error('existing production mythic-atlas must run on Node 22');

const governedMajors: Record<string,string> = {
  next: '16.3.6',
  '@langchain/core': '1.2.13',
  '@langchain/openai': '1.6.0',
  uuid: '14.0.2',
  'capacitor-voice-recorder': '^7.0.6',
};
for (const [name, expected] of Object.entries(governedMajors)) {
  if (pkg.dependencies?.[name] !== expected)
    throw new Error(`governed package drift for ${name}: ${pkg.dependencies?.[name]} != ${expected}`);
}
if (pkg.dependencies?.langchain !== undefined)
  throw new Error('unused direct langchain package must remain absent');
if (pkg.dependencies?.['@langchain/community'] !== undefined)
  throw new Error('unused direct @langchain/community package must remain absent');

console.log('NODE-TOOLCHAIN-22 CONFORMANCE: PASS');
console.log('  root/local/Docker/CI/mobile Node contract = 22');
console.log('  no Node 18/20 production/CI base remains in governed set');
console.log('  package-major boundaries unchanged');
