/**
 * Isolated execution of the ACTUAL MAIA /list POST handler through genuine
 * Next.js 15.5.11 NextRequest/NextResponse classes.
 *
 * All imported services are fake, side-effect-free fixtures. In particular:
 * NO database, model provider, member account, disk-backed memory, or
 * outbound request can be reached from imported route dependencies.
 *
 * This is a serving-handler harness, NOT an entire Next app/dev-server test.
 * Next 15 and TypeScript module base paths are provided by fixture-only env.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as Module from 'node:module';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const require = createRequire(import.meta.url);
const nextPkg = process.env.PERRY_FIXTURE_NEXT_15;
const tsPkg = process.env.PERRY_FIXTURE_TYPESCRIPT;
assert.ok(nextPkg && tsPkg, 'Missing isolated Next 15 / TypeScript fixture paths');
const TS = require(tsPkg);
const { NextRequest, NextResponse } = require(path.join(nextPkg, 'server.js'));
assert.equal(require(path.join(nextPkg, 'package.json')).version, '15.5.11');

function transpile(relativePath) {
  const file = path.join(root, relativePath);
  return {
    filename: file + '.cjs',
    text: TS.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { target: TS.ScriptTarget.ES2022,
        module: TS.ModuleKind.CommonJS, esModuleInterop: true,
        isolatedModules: true },
      fileName: file,
    }).outputText,
  };
}

function loadCjs(relativePath, imports) {
  const { text, filename } = transpile(relativePath);
  const instance = new Module.Module(filename);
  instance.filename = filename;
  instance.paths = [];
  instance.require = (id) => {
    if (id === 'next/server') return { NextRequest, NextResponse };
    if (id === 'node:crypto' || id === 'crypto') return require('node:crypto');
    if (imports.has(id)) return imports.get(id);
    if (id.startsWith('@/') || id.startsWith('./') || id.startsWith('../')) {
      return new Proxy(Object.create(null), {
        get(_unused, property) {
          if (property === '__esModule') return true;
          if (property === 'then') return undefined;
          return (...args) => null;
        },
      });
    }
    throw new Error('Unapproved import in isolated fixture: ' + id);
  };
  instance._compile(text, filename);
  return instance.exports;
}

function stubMap(state) {
  const map = new Map();
  const add = (id, mock) => map.set(id, mock);
  const noOp = () => undefined;
  const asyncNoOp = async () => undefined;
  const emptyQuery = async () => ({ rows: [], rowCount: 0 });
  add('@/lib/db/schemaGate', { ensureSchemaReady: asyncNoOp });
  add('./resolveIdentity', { resolveMemberIdentity: async () => state.verifiedId });
  add('@/lib/memory/stores/TurnsStore', {
    TurnsStore: { addExchangeTurn: async () => true, getRecentTurns: async () => [] },
  });
  add('@/lib/sanctuary/turnPosture', {
    TurnPosture: { resolve: ({sanctuary}) => ({ sanctuary }) },
  });
  add('@/lib/safety/crisisAssessment', {
    assessCrisisWithCheckIn: () => ({tier:'none'}),
    classifyCheckInAnswer: () => null,
    crisisLogLine:()=>'', maiaAskedAboutSafety:()=>false,
    CRISIS_REFERRAL:{ message:'fictional fixture only' },
  });
  add('@/lib/safety/crisisCheckIn', {
    takeSafetyCheckIn:()=>null, clearSafetyCheckIn:noOp, markSafetyCheckIn:noOp,
  });
  add('@/lib/sovereign/sessionManager', {
    initializeSessionTable:asyncNoOp,
    ensureSession: async (id) => ({ id:id||'fictional-sess', turn_count:1, turns:[] }),
  });
  add('@/lib/db/postgres', { query:emptyQuery, pool:{query:emptyQuery} });
  add('@/lib/auth/getMemberFromRequest', {getMemberIdFromRequest:async()=>state.verifiedId});
  add('@/lib/sovereign/clientPromptAuthority', {
    withoutClientPromptAuthority: (input) => Object.fromEntries(
      Object.entries(input||{}).filter(([key]) => !/Addendum$/.test(key))
    ),
  });
  add('@/lib/maia/maiaRuntimeContext', {
    buildMaiaRuntimeContext: () => ({}), formatRuntimeContextForResponse:()=>({}),
  });
  add('@/lib/maia/assertProviderAvailable', {
    ProviderUnavailableError: class ProviderUnavailableError extends Error {},
    assertProviderAvailable: async () => {
      state.providerBoundaryReached = true;
      throw new Error('FIXTURE_STOP_BEFORE_PROVIDER');
    },
  });
  add('@/lib/sovereign/maiaService', {
    getMaiaResponse: () => {
      state.dispatchedToModel = true;
      throw new Error('UNAUTHORIZED_MODEL_DISPATCH_IN_FIXTURE');
    },
  });
  add('@/lib/memory/MemoryGate', { resolveMemoryMode: () => 'ephemeral' });
  add('@/lib/memory/MemoryBundle', { MemoryBundleService: class MemoryBundleService {
    static async build() { return null; }
    static async create() { return null; }
  }});
  add('@/lib/field/enforceFieldSafety', {
    enforceFieldSafety: () => ({allowed:true,fieldRouting:null}),
  });
  add('@/lib/consciousness/cognitiveProfileService', { getCognitiveProfile:async()=>null });
  add('@/lib/maia/knowledge/perrySourceLens', {
    buildPerrySourceLensAddendum(turn) {
      state.lensCalls.push(turn);
      // Stage B production approval is NULL. No source, permission or
      // prompt block is supplied by this fixture.
      return null;
    },
  });
  add('@/lib/ain/knowledge/GovernedRetrievalService', {
    retrieveGovernedKnowledge: async()=>[], formatGovernedKnowledgeAddendum:()=>null,
  });
  add('@/lib/services/corpusCallosumService', { logAgentRun:asyncNoOp });
  add('@/lib/sovereign/http/canonHeaders', { makeCanonHeaders:()=>({}) });
  add('@/lib/privacy/memberRef', { memberRef:(x)=>x?'fictional-member':null });
  add('@/lib/maia/teaching/TeachingRuntimeBridge', {
    buildTeachingRuntimeBridge:()=>({ promptAddendum:undefined }),
  });
  add('@/lib/maia/teaching/TeachingRuntimeSurfaceAuthority', {
    requestedTeachingSurface:()=>null,
    resolveTeachingRuntimeSurfaceAuthority:()=>({surface:'general',route:'general'}),
  });
  return map;
}

async function invoke(state, requestBody) {
  state.lensCalls = [];
  state.providerBoundaryReached = false;
  state.dispatchedToModel = false;
  // The route must not use global network primitives. Built-in safety test
  // installs a fetch trap for the entire invocation (then restores it).
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('NETWORK_FORBIDDEN_IN_FIXTURE'); };
  const originalEnv = process.env.MAIA_PERRY_SOURCE_LENS_ENABLED;
  process.env.MAIA_PERRY_SOURCE_LENS_ENABLED = '1';
  try {
    const route = loadCjs('app/api/sovereign/app/maia/list/route.ts', stubMap(state));
    const req = new NextRequest('http://127.0.0.1:49152/api/sovereign/app/maia/list', {
      method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({
        message:'Would a Glenn Perry symbolic lens help?',
        sessionId:'fictional-session',
        ...requestBody,
      }),
    });
    const response = await route.POST(req);
    return { status:response.status, data:await response.json() };
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnv === undefined) delete process.env.MAIA_PERRY_SOURCE_LENS_ENABLED;
    else process.env.MAIA_PERRY_SOURCE_LENS_ENABLED = originalEnv;
  }
}

test('actual MAIA /list serving handler reaches Perry gate without model dispatch', async () => {
  const state = { verifiedId:'fictional-member', lensCalls:[] };
  const result = await invoke(state, { perrySourceLens:'glenn-perry-astropsychology',
    sanctuary:false });
  assert.equal(state.dispatchedToModel, false);
  assert.equal(state.providerBoundaryReached, true,
    'route never reached provider assertion; fixture not sufficient');
  assert.equal(state.lensCalls.length, 1);
  assert.equal(state.lensCalls[0].verifiedMemberId, 'fictional-member');
  assert.equal(state.lensCalls[0].requestedLens, 'glenn-perry-astropsychology');
  assert.equal(state.lensCalls[0].isSanctuary, false);
  assert.ok([500,503].includes(result.status));
});
