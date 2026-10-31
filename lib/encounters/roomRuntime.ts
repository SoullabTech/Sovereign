/**
 * R3B-B source integration. The default is closed. Only trusted test composition
 * can supply the isolated simulated profile; HTTP data cannot enable it.
 * No database, key, transport, recorder or provider is opened on import.
 */
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import type { RoomSignalRelay, RelaySubscription, SignalMessage, ClientSignal } from '@/lib/webrtc/signalRelay';
import { verifyThresholdToken as existingThresholdVerifier, type ThresholdClaims } from './threshold';
import { authorizeParticipantStop, authorizeSubsystemAcknowledgement, type RoomRuntimeBinding,
  type VerifiedParticipantStopAuthority } from './roomStopAuthority';
import { ROOM_STOP_TARGETS, sameRoomStopScope, summarizeRoomStop, validateRoomStopScope,
  type RoomStopContract, type RoomStopScope, type RoomStopSummary, type RoomStopTarget,
  type RoomStopTargetBindings, type RoomStopTargetState } from './roomStopContract';
import { acknowledgeStoredRoomStop, loadRoomRuntimeBinding, readRoomStop, requestRoomStop,
  type RoomStopDatabase, type RoomStopTransactionClient } from './roomStopStore';
import { inspectRoomWorkScope, lockRoomWorkScope, RoomWorkFenceError } from './roomWorkFence';

const RUNTIME_TTL_MS = 5 * 60_000;
const DISABLED_TARGETS = ['recorder', 'captions', 'maia_inference', 'maia_playback'] as const;
const CLIENT_TARGETS = ['local_media', 'remote_media'] as const;
type ClientTarget = typeof CLIENT_TARGETS[number];
type TerminalState = Exclude<RoomStopTargetState, 'pending'>;

export class RoomRuntimeError extends Error {
  constructor(readonly code: string, readonly status = 403) { super(code); this.name = 'RoomRuntimeError'; }
}

export interface RoomRuntimeAccess { encounterId: string; runtimeCredential: string }
export interface RoomRuntimeSession {
  scope: Readonly<RoomStopScope>;
  runtimeId: string;
  peerId: string;
  runtimeCredential: string;
  role: string;
  displayName: string;
  expiresAt: number;
}
export interface RoomStopView {
  scopeStopped: boolean;
  operationId: string | null;
  stopGeneration: number | null;
  operation: Readonly<RoomStopContract> | null;
  summary: RoomStopSummary | null;
  coverage: 'origin_runtime' | 'other_runtime' | 'none';
  physicalMediaVerified: false;
  reportCredentials: Partial<Record<ClientTarget, string>>;
}
export interface RoomRuntimeDependencies {
  database: RoomStopDatabase;
  credentialKey: Uint8Array;
  profile: 'isolated-simulated';
  verifyThresholdToken?: (token: string) => ThresholdClaims | null;
}
export interface RoomRuntimeService {
  admit(input: { encounterId: string; thresholdToken: string }): Promise<RoomRuntimeSession>;
  current(input: RoomRuntimeAccess): Promise<RoomRuntimeSession>;
  participantAuthority(input: RoomRuntimeAccess): Promise<VerifiedParticipantStopAuthority>;
  stop(input: RoomRuntimeAccess & { requestKey: string }): Promise<RoomStopView>;
  status(input: RoomRuntimeAccess): Promise<RoomStopView>;
  report(input: RoomRuntimeAccess & { operationId: string; target: ClientTarget; credential: string; state: TerminalState }): Promise<RoomStopView>;
  /** Trusted server adapter only. Never expose this method as a client action. */
  reportOwned(input: RoomRuntimeAccess & { target: 'signaling' | 'late_work'; state: TerminalState }): Promise<RoomStopView>;
  /** Only the never-activating fixture profile can attest these four targets. */
  reportNeverStarted(input: RoomRuntimeAccess): Promise<RoomStopView>;
}

interface RuntimeClaims {
  audience: 'room-runtime'; scope: RoomStopScope; peerId: string; admissionEventId: string; expiresAt: number;
}
interface ReportClaims {
  audience: 'room-report'; scope: RoomStopScope; operationId: string; stopGeneration: number;
  target: RoomStopTarget; principalId: string; adapterRuntimeId: string; evidenceKind: 'simulated'; expiresAt: number;
}

function plain(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}
function exact(value: unknown, keys: string[]): value is Record<string, unknown> {
  return plain(value) && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}
function text(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 200 && value.trim() === value;
}
function uuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
function validScope(scope: unknown): scope is RoomStopScope {
  return validateRoomStopScope(scope) && uuid(scope.encounterId) && uuid(scope.participantId);
}
function expired(expiresAt: number): void {
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) throw new RoomRuntimeError('EXPIRED_RUNTIME');
}
function validState(value: unknown): value is TerminalState {
  return value === 'stopped' || value === 'failed' || value === 'not_started';
}
function bindings(scope: RoomStopScope): RoomStopTargetBindings {
  return Object.freeze(Object.fromEntries(ROOM_STOP_TARGETS.map(target => [target, Object.freeze({
    principalId: `r3bb-fixture:${scope.runtimeId}:${target}`,
    adapterRuntimeId: `${scope.runtimeId}:${target}`, evidenceKind: 'simulated' as const,
  })]))) as RoomStopTargetBindings;
}
function sameBinding(binding: RoomRuntimeBinding | null, claims: RuntimeClaims): binding is RoomRuntimeBinding {
  const expected = bindings(claims.scope);
  return !!binding && sameRoomStopScope(binding.scope, claims.scope) && binding.admissionEventId === claims.admissionEventId
    && ROOM_STOP_TARGETS.every(target => {
      const actual = binding.targetBindings[target];
      return actual?.principalId === expected[target].principalId && actual.adapterRuntimeId === expected[target].adapterRuntimeId
        && actual.evidenceKind === expected[target].evidenceKind;
    });
}

export function createRoomRuntimeService(dependencies?: RoomRuntimeDependencies): RoomRuntimeService {
  const closed = async (): Promise<never> => { throw new RoomRuntimeError('ROOM_INTEGRATION_HELD', 503); };
  if (!dependencies) return Object.freeze({ admit: closed, current: closed, participantAuthority: closed,
    stop: closed, status: closed, report: closed, reportOwned: closed, reportNeverStarted: closed });
  if (dependencies.profile !== 'isolated-simulated' || !dependencies.database
      || typeof dependencies.database.connect !== 'function' || !(dependencies.credentialKey instanceof Uint8Array)
      || dependencies.credentialKey.byteLength < 32 || dependencies.credentialKey.byteLength > 128
      || (dependencies.verifyThresholdToken !== undefined && typeof dependencies.verifyThresholdToken !== 'function')) {
    throw new RoomRuntimeError('INVALID_RUNTIME_COMPOSITION', 503);
  }
  const database = dependencies.database, key = Buffer.from(dependencies.credentialKey);
  const verifyThreshold = dependencies.verifyThresholdToken ?? existingThresholdVerifier;

  function sign(value: RuntimeClaims | ReportClaims): string {
    const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
    return payload + '.' + createHmac('sha256', key).update(payload).digest('base64url');
  }
  function decode(value: unknown): unknown {
    if (typeof value !== 'string' || value.length > 8192) throw new RoomRuntimeError('INVALID_RUNTIME_CREDENTIAL');
    const parts = value.split('.');
    if (parts.length !== 2 || parts.some(p => !/^[A-Za-z0-9_-]+$/.test(p))) throw new RoomRuntimeError('INVALID_RUNTIME_CREDENTIAL');
    const expected = Buffer.from(createHmac('sha256', key).update(parts[0]).digest('base64url'));
    const actual = Buffer.from(parts[1]);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new RoomRuntimeError('INVALID_RUNTIME_CREDENTIAL');
    try { return JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')); }
    catch { throw new RoomRuntimeError('INVALID_RUNTIME_CREDENTIAL'); }
  }
  function runtimeProof(input: RoomRuntimeAccess): RuntimeClaims {
    if (!exact(input, ['encounterId', 'runtimeCredential']) || !uuid(input.encounterId)) throw new RoomRuntimeError('INVALID_REQUEST', 400);
    const value = decode(input.runtimeCredential);
    if (!exact(value, ['audience', 'scope', 'peerId', 'admissionEventId', 'expiresAt']) || value.audience !== 'room-runtime'
        || !validScope(value.scope) || value.scope.encounterId !== input.encounterId
        || value.peerId !== `p_${value.scope.runtimeId}` || !uuid(value.admissionEventId)
        || typeof value.expiresAt !== 'number') throw new RoomRuntimeError('INVALID_RUNTIME_CREDENTIAL');
    expired(value.expiresAt);
    return value as unknown as RuntimeClaims;
  }
  const access = (input: RoomRuntimeAccess): RoomRuntimeAccess => ({ encounterId: input.encounterId, runtimeCredential: input.runtimeCredential });

  /** Expiry is checked again after awaited DB/lock calls, before mutation COMMIT. */
  function guardedDatabase(expiresAt: number): RoomStopDatabase {
    return { async connect() {
      expired(expiresAt);
      const client = await database.connect();
      try { expired(expiresAt); } catch (error) { client.release(); throw error; }
      return { async query<T extends import('pg').QueryResultRow = any>(sql: string, params?: any[]) {
        if (sql !== 'ROLLBACK') expired(expiresAt);
        const result = await client.query<T>(sql, params);
        if (sql !== 'COMMIT' && sql !== 'ROLLBACK') expired(expiresAt);
        return result;
      }, release() { client.release(); } };
    } };
  }
  async function transaction<T>(work: (client: RoomStopTransactionClient) => Promise<T>, mutation = true,
    beforeCommit?: () => void): Promise<T> {
    let client: RoomStopTransactionClient | undefined, committing = false;
    try {
      client = await database.connect();
      await client.query('BEGIN');
      const result = await work(client);
      beforeCommit?.();
      committing = true;
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try { await client?.query('ROLLBACK'); } catch { /* preserve outcome */ }
      if (committing) throw new RoomRuntimeError(mutation ? 'COMMIT_OUTCOME_UNKNOWN' : 'PERSISTENCE_FAILED', 503);
      if (error instanceof RoomRuntimeError) throw error;
      if (error instanceof RoomWorkFenceError) throw new RoomRuntimeError(error.code,
        ['ROOM_STOPPED', 'ROOM_ENDED'].includes(error.code) ? 409 : 403);
      throw new RoomRuntimeError('PERSISTENCE_FAILED', 503);
    } finally { try { client?.release(); } catch { /* known commit stays known */ } }
  }
  async function participantAuthority(input: RoomRuntimeAccess): Promise<VerifiedParticipantStopAuthority> {
    const claims = runtimeProof(input), frozenInput = access(input);
    const result = await authorizeParticipantStop({ thresholdToken: frozenInput.runtimeCredential,
      encounterId: claims.scope.encounterId, runtimeId: claims.scope.runtimeId }, {
      // A signed runtime capability is narrower than the verified threshold used to admit it.
      // The adapter verifies its own audience/scope/expiry; it never trusts serialized authority.
      verifyThresholdToken: token => {
        const verified = runtimeProof({ encounterId: frozenInput.encounterId, runtimeCredential: token });
        return { encounterId: verified.scope.encounterId, participantId: verified.scope.participantId,
          agreementVersion: verified.scope.agreementVersion, generation: verified.scope.consentGeneration, exp: verified.expiresAt };
      },
      lookupRuntimeBinding: async query => {
        const binding = await loadRoomRuntimeBinding(query, guardedDatabase(claims.expiresAt));
        expired(claims.expiresAt);
        return sameBinding(binding, claims) ? binding : null;
      },
    });
    if (!result.ok) throw new RoomRuntimeError(result.reason === 'authority_unavailable' ? 'PERSISTENCE_FAILED' : 'UNBOUND_RUNTIME',
      result.reason === 'authority_unavailable' ? 503 : 403);
    return result.authority;
  }
  function session(claims: RuntimeClaims, credential: string, context: { role: string; displayName: string }): RoomRuntimeSession {
    return Object.freeze({ scope: Object.freeze({ ...claims.scope }), runtimeId: claims.scope.runtimeId,
      peerId: claims.peerId, runtimeCredential: credential, role: context.role, displayName: context.displayName,
      expiresAt: claims.expiresAt });
  }
  function reportCredential(claims: RuntimeClaims, operation: Readonly<RoomStopContract>, target: RoomStopTarget): string {
    const binding = operation.targetBindings[target];
    return sign({ audience: 'room-report', scope: { ...operation.scope }, operationId: operation.operationId,
      stopGeneration: operation.stopGeneration, target, principalId: binding.principalId,
      adapterRuntimeId: binding.adapterRuntimeId, evidenceKind: 'simulated', expiresAt: claims.expiresAt });
  }
  function view(claims: RuntimeClaims, operation: Readonly<RoomStopContract> | null,
    other?: { id: string; stop_generation: number }): RoomStopView {
    return Object.freeze({ scopeStopped: !!operation || !!other,
      operationId: operation?.operationId ?? other?.id ?? null,
      stopGeneration: operation?.stopGeneration ?? (other ? Number(other.stop_generation) : null),
      operation, summary: operation ? summarizeRoomStop(operation) : null,
      coverage: operation ? 'origin_runtime' : other ? 'other_runtime' : 'none', physicalMediaVerified: false,
      reportCredentials: Object.freeze(operation ? {
        local_media: reportCredential(claims, operation, 'local_media'),
        remote_media: reportCredential(claims, operation, 'remote_media'),
      } : {}),
    });
  }
  async function status(input: RoomRuntimeAccess): Promise<RoomStopView> {
    const claims = runtimeProof(input), authority = await participantAuthority(input);
    const client = await guardedDatabase(claims.expiresAt).connect();
    let row: any;
    try {
      const result = await client.query(`SELECT id, stop_generation, runtime_id FROM encounter_room_stop_operations
          WHERE encounter_id=$1 AND participant_id=$2 AND agreement_version=$3 AND consent_generation=$4`,
        [claims.scope.encounterId, claims.scope.participantId, claims.scope.agreementVersion, claims.scope.consentGeneration]);
      if (result.rows.length > 1) throw new RoomRuntimeError('AMBIGUOUS_STORED_STOP', 503);
      row = result.rows[0];
    } finally { client.release(); }
    if (!row) return view(claims, null);
    if (row.runtime_id !== claims.scope.runtimeId) return view(claims, null, row);
    const operation = await readRoomStop(authority, row.id, guardedDatabase(claims.expiresAt));
    if (!operation) throw new RoomRuntimeError('STOP_READ_UNAVAILABLE', 503);
    return view(claims, operation);
  }
  async function acknowledge(input: RoomRuntimeAccess, operation: Readonly<RoomStopContract>,
    target: RoomStopTarget, state: TerminalState, credential: string): Promise<RoomStopView> {
    const claims = runtimeProof(input);
    const result = await authorizeSubsystemAcknowledgement({ credential, operation, target }, {
      authenticateSubsystem: async candidate => {
        let decoded: unknown;
        try { decoded = decode(candidate); } catch { return null; }
        if (!exact(decoded, ['audience', 'scope', 'operationId', 'stopGeneration', 'target', 'principalId', 'adapterRuntimeId', 'evidenceKind', 'expiresAt'])
            || decoded.audience !== 'room-report' || !validScope(decoded.scope)
            || !sameRoomStopScope(decoded.scope, claims.scope) || typeof decoded.expiresAt !== 'number'
            || decoded.expiresAt > claims.expiresAt || decoded.expiresAt <= Date.now()) return null;
        const proof = decoded as unknown as ReportClaims;
        return { scope: proof.scope, operationId: proof.operationId, stopGeneration: proof.stopGeneration,
          target: proof.target, principalId: proof.principalId, adapterRuntimeId: proof.adapterRuntimeId, evidenceKind: proof.evidenceKind };
      },
    });
    if (!result.ok) throw new RoomRuntimeError('ACKNOWLEDGEMENT_REFUSED');
    const updated = await acknowledgeStoredRoomStop(result.authority, state, guardedDatabase(claims.expiresAt));
    return view(claims, updated);
  }
  async function requireOrigin(input: RoomRuntimeAccess): Promise<Readonly<RoomStopContract>> {
    const current = await status(input);
    if (!current.operation || current.coverage !== 'origin_runtime') throw new RoomRuntimeError('ORIGIN_RUNTIME_REQUIRED', 409);
    return current.operation;
  }

  const service: RoomRuntimeService = {
    async admit(input) {
      if (!exact(input, ['encounterId', 'thresholdToken']) || !uuid(input.encounterId)
          || typeof input.thresholdToken !== 'string' || input.thresholdToken.length > 4096) throw new RoomRuntimeError('INVALID_REQUEST', 400);
      let verified: ThresholdClaims | null;
      try { verified = verifyThreshold(input.thresholdToken); } catch { throw new RoomRuntimeError('INVALID_THRESHOLD'); }
      if (!verified || verified.encounterId !== input.encounterId || !uuid(verified.encounterId) || !uuid(verified.participantId)
          || !text(verified.agreementVersion) || !Number.isSafeInteger(verified.generation) || verified.generation <= 0
          || !Number.isSafeInteger(verified.exp) || verified.exp <= Date.now()) throw new RoomRuntimeError('INVALID_THRESHOLD');
      const source = { ...verified };
      const scope: RoomStopScope = { encounterId: source.encounterId, participantId: source.participantId,
        agreementVersion: source.agreementVersion, consentGeneration: source.generation, runtimeId: randomUUID() };
      const expiresAt = Math.min(source.exp, Date.now() + RUNTIME_TTL_MS);
      return transaction(async client => {
        await lockRoomWorkScope(client, scope, ['join']);
        expired(expiresAt);
        const context = await inspectRoomWorkScope(client, scope, ['join']);
        const claims: RuntimeClaims = { audience: 'room-runtime', scope, peerId: `p_${scope.runtimeId}`,
          admissionEventId: context.admissionEventId, expiresAt };
        const inserted = await client.query(`INSERT INTO encounter_room_stop_bindings
            (encounter_id, participant_id, agreement_version, consent_generation, runtime_id, admission_event_id, target_bindings)
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING runtime_id`,
          [scope.encounterId, scope.participantId, scope.agreementVersion, scope.consentGeneration, scope.runtimeId,
            context.admissionEventId, JSON.stringify(bindings(scope))]);
        if (inserted.rows.length !== 1 || inserted.rows[0].runtime_id !== scope.runtimeId) throw new RoomRuntimeError('BINDING_NOT_CONFIRMED', 503);
        expired(expiresAt);
        return session(claims, sign(claims), context);
      }, true, () => expired(expiresAt));
    },
    async current(input) {
      const claims = runtimeProof(input), frozen = access(input);
      await participantAuthority(frozen);
      return transaction(async client => {
        await lockRoomWorkScope(client, claims.scope, ['join']);
        expired(claims.expiresAt);
        const context = await inspectRoomWorkScope(client, claims.scope, ['join']);
        if (context.admissionEventId !== claims.admissionEventId) throw new RoomRuntimeError('STALE_ADMISSION');
        expired(claims.expiresAt);
        return session(claims, frozen.runtimeCredential, context);
      }, false, () => expired(claims.expiresAt));
    },
    participantAuthority,
    async stop(input) {
      if (!exact(input, ['encounterId', 'runtimeCredential', 'requestKey']) || !text(input.requestKey)) throw new RoomRuntimeError('INVALID_REQUEST', 400);
      const frozen = access(input), claims = runtimeProof(frozen), requestKey = input.requestKey;
      const authority = await participantAuthority(frozen);
      const operation = await requestRoomStop(authority, requestKey, guardedDatabase(claims.expiresAt));
      return view(claims, operation);
    },
    status,
    async report(input) {
      if (!exact(input, ['encounterId', 'runtimeCredential', 'operationId', 'target', 'credential', 'state'])
          || !CLIENT_TARGETS.includes(input.target) || !uuid(input.operationId) || typeof input.credential !== 'string'
          || !validState(input.state)) throw new RoomRuntimeError('INVALID_CLIENT_REPORT', 400);
      const frozen = { ...input }, a = access(frozen), operation = await requireOrigin(a);
      if (operation.operationId !== frozen.operationId) throw new RoomRuntimeError('WRONG_OPERATION');
      return acknowledge(a, operation, frozen.target, frozen.state, frozen.credential);
    },
    async reportOwned(input) {
      if (!exact(input, ['encounterId', 'runtimeCredential', 'target', 'state'])
          || !['signaling', 'late_work'].includes(input.target) || !validState(input.state)) throw new RoomRuntimeError('INVALID_OWNED_REPORT', 400);
      const frozen = { ...input }, a = access(frozen), claims = runtimeProof(a), operation = await requireOrigin(a);
      return acknowledge(a, operation, frozen.target, frozen.state, reportCredential(claims, operation, frozen.target));
    },
    async reportNeverStarted(input) {
      const a = access(input), claims = runtimeProof(input);
      // This composition exposes no start method for these targets. Its durable
      // roster is verified against the never-activating fixture identity above.
      let operation = await requireOrigin(a);
      for (const target of DISABLED_TARGETS) {
        const result = await acknowledge(a, operation, target, 'not_started', reportCredential(claims, operation, target));
        if (!result.operation) throw new RoomRuntimeError('STOP_READ_UNAVAILABLE', 503);
        operation = result.operation;
      }
      return view(claims, operation);
    },
  };
  return Object.freeze(service);
}

/** HTTP composition lives outside route modules so Next route exports stay valid.
 * Factories require trusted service injection; production route exports use the closed service.
 */
type Context = { params: Promise<{ roomId: string }> };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export function createRuntimeHandlers(service:RoomRuntimeService){
  return {async POST(request:Request,{params}:Context){
    try{
      const {roomId}=await params;const raw=await request.text();
      if(raw.length>8192)return json({code:'INVALID_REQUEST'},400);
      let body;try{body=JSON.parse(raw);}catch{return json({code:'INVALID_REQUEST'},400);}
      if(!body||Array.isArray(body)||Object.keys(body).sort().join(',')!=='thresholdToken'
        ||typeof body.thresholdToken!=='string')return json({code:'INVALID_REQUEST'},400);
      return json(await service.admit({encounterId:roomId,thresholdToken:body.thresholdToken}));
    }catch(e){return e instanceof RoomRuntimeError?json({code:e.code},e.status):json({code:'PERSISTENCE_FAILED'},503);}
  }};
}

function stopHttpFailure(e:unknown){const code=e instanceof Error&&'code'in e?String(e.code):'PERSISTENCE_FAILED';
  if(e instanceof RoomRuntimeError)return json({code},e.status);
  const status=/CONFLICT/.test(code)?409:/INVALID/.test(code)?400:/PERSISTENCE|COMMIT|UNAVAILABLE/.test(code)?503:403;
  return json({code},status);
}
async function stopHttpBody(request:Request,keys:string[]){
  const raw=await request.text();if(raw.length>16384)throw new RoomRuntimeError('INVALID_REQUEST',400);
  let b;try{b=JSON.parse(raw);}catch{throw new RoomRuntimeError('INVALID_REQUEST',400);}
  if(!b||Array.isArray(b)||Object.keys(b).sort().join(',')!==keys.sort().join(','))throw new RoomRuntimeError('INVALID_REQUEST',400);
  return b;
}
export function createStopHandlers(service:RoomRuntimeService){
  return {
    async POST(request:Request,{params}:Context){try{
      const {roomId}=await params,b=await stopHttpBody(request,['runtimeCredential','requestKey']);
      return json(await service.stop({encounterId:roomId,runtimeCredential:b.runtimeCredential,requestKey:b.requestKey}));
    }catch(e){return stopHttpFailure(e);}},
    async GET(request:Request,{params}:Context){try{
      const {roomId}=await params,url=new URL(request.url);
      if([...url.searchParams.keys()].some(k=>k!=='runtimeCredential')||url.searchParams.getAll('runtimeCredential').length!==1)
        throw new RoomRuntimeError('INVALID_REQUEST',400);
      return json(await service.status({encounterId:roomId,runtimeCredential:url.searchParams.get('runtimeCredential')!}));
    }catch(e){return stopHttpFailure(e);}},
    async PATCH(request:Request,{params}:Context){try{
      const {roomId}=await params,b=await stopHttpBody(request,['runtimeCredential','operationId','target','credential','state']);
      return json(await service.report({encounterId:roomId,runtimeCredential:b.runtimeCredential,
        operationId:b.operationId,target:b.target,credential:b.credential,state:b.state}));
    }catch(e){return stopHttpFailure(e);}},
  };
}

export interface RoomSignalTimers {setInterval:(callback:()=>void,ms:number)=>unknown;clearInterval:(id:unknown)=>void}
const timers:RoomSignalTimers={setInterval:(cb,ms)=>setInterval(cb,ms),clearInterval:id=>clearInterval(id as ReturnType<typeof setInterval>)};
function signalHttpFailure(e:unknown){return e instanceof RoomRuntimeError?json({code:e.code},e.status)
  :json({code:e instanceof Error&&/^(INVALID|UNBOUND|SIGNAL|ROOM_PARTICIPANT)/.test(e.message)?e.message:'PERSISTENCE_FAILED'},
    e instanceof Error&&/^(INVALID|UNBOUND|SIGNAL|ROOM_PARTICIPANT)/.test(e.message)?403:503);}
export function createSignalHandlers(deps:{service:RoomRuntimeService;relay:RoomSignalRelay;heartbeatMs?:number;timers?:RoomSignalTimers}){
  const ms=deps.heartbeatMs??15000,t=deps.timers??timers;
  if(!Number.isFinite(ms)||ms<1||ms>15000)throw new Error('INVALID_HEARTBEAT');
  return {
    async GET(request:Request,{params}:Context){try{
      const {roomId}=await params,url=new URL(request.url);
      if([...url.searchParams.keys()].some(k=>k!=='runtimeCredential')||url.searchParams.getAll('runtimeCredential').length!==1)
        return json({code:'INVALID_REQUEST'},400);
      const access={encounterId:roomId,runtimeCredential:url.searchParams.get('runtimeCredential')!};
      const session=await deps.service.current(access);
      let finished=false,handle:RelaySubscription|undefined,interval:unknown,controller:ReadableStreamDefaultController<Uint8Array>|undefined;
      const encoder=new TextEncoder();let checks=Promise.resolve();
      const cleanup=()=>{
        if(finished)return;finished=true;
        const ownedInterval=interval,ownedHandle=handle;interval=undefined;handle=undefined;
        // A failing adapter cannot prevent the remaining owned resources from closing.
        try{if(ownedInterval!==undefined)t.clearInterval(ownedInterval);}catch{/* cleanup remains terminal */}
        try{if(ownedHandle)deps.relay.unsubscribe(ownedHandle);}catch{/* continue to listener and stream */}
        try{request.signal.removeEventListener('abort',abort);}catch{/* continue to stream */}
        try{controller?.close();}catch{/* already closed */}
      };
      const abort=()=>cleanup();
      const write=(message:SignalMessage)=>{if(finished)return;
        try{controller!.enqueue(encoder.encode('data: '+JSON.stringify(message)+'\n\n'));}catch{cleanup();}};
      const terminal=(code:string)=>{write({type:'terminal',from:'__server',payload:{code}});cleanup();};
      const ownsSubscription=()=>{
        if(finished)return false;
        if(session.expiresAt<=Date.now()){terminal('EXPIRED_RUNTIME');return false;}
        try{if(handle&&deps.relay.isCurrent(handle))return true;}
        catch{terminal('PERSISTENCE_FAILED');return false;}
        terminal('SIGNAL_SUBSCRIPTION_REPLACED');return false;
      };
      const authorize=():Promise<boolean>=>{
        // Check before queuing as well: a displaced or expired stream must close
        // at its next heartbeat even if an older database check is suspended.
        if(!ownsSubscription())return Promise.resolve(false);
        const checked=checks.then(async()=>{
          if(!ownsSubscription())return false;
          try{await deps.service.current(access);return ownsSubscription();}
          catch(e){terminal(e instanceof RoomRuntimeError?e.code:'PERSISTENCE_FAILED');return false;}
        });
        // Heartbeats and relay delivery share this authorization-only queue.
        // No delivery callback waits from inside the queue on another queued check.
        checks=checked.then(()=>undefined,()=>undefined);
        return checked;
      };
      const checked=(message:SignalMessage)=>{
        void authorize().then(allowed=>{if(allowed&&ownsSubscription())write(message);}).catch(()=>terminal('PERSISTENCE_FAILED'));
      };
      const stream=new ReadableStream<Uint8Array>({
        start(c){controller=c;
          try{
            if(request.signal.aborted){cleanup();return;}
            request.signal.addEventListener('abort',abort,{once:true});
            const subscribed=deps.relay.subscribe(session,write,authorize);
            // An injected adapter may synchronously trigger abort before returning.
            if(finished){try{deps.relay.unsubscribe(subscribed);}catch{/* already terminal */}return;}
            handle=subscribed;
            checked({type:'connected',from:session.peerId});
            const started=t.setInterval(()=>checked({type:'ping',from:'__server'}),ms);
            if(finished){try{t.clearInterval(started);}catch{/* already terminal */}}
            else interval=started;
          }catch(error){cleanup();throw error;}
        },
        cancel(){cleanup();},
      });
      return new Response(stream,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-store, no-transform',
        Connection:'keep-alive','X-Accel-Buffering':'no'}});
    }catch(e){return signalHttpFailure(e);}},
    async POST(request:Request,{params}:Context){try{
      const {roomId}=await params,raw=await request.text();
      if(raw.length>65536)return json({code:'INVALID_CLIENT_SIGNAL'},400);
      let b;try{b=JSON.parse(raw);}catch{return json({code:'INVALID_CLIENT_SIGNAL'},400);}
      if(!b||Array.isArray(b)||Object.keys(b).some(k=>!['runtimeCredential','type','to','payload'].includes(k))
        ||typeof b.runtimeCredential!=='string'||!['offer','answer','ice','peer-leave'].includes(b.type)
        ||(b.to!==undefined&&(typeof b.to!=='string'||b.to.length>200)))
        return json({code:'INVALID_CLIENT_SIGNAL'},400);
      const session=await deps.service.current({encounterId:roomId,runtimeCredential:b.runtimeCredential});
      const msg:ClientSignal={type:b.type};
      if(b.to!==undefined)msg.to=b.to;if(b.payload!==undefined)msg.payload=b.payload;
      const delivered=await deps.relay.publish(session,msg);
      return json({ok:true,delivered});
    }catch(e){return signalHttpFailure(e);}},
  };
}

export interface RoomIceAdmission {iceServers:RTCIceServer[];ttl:number}
export function createTurnHandlers(deps:{service:RoomRuntimeService;mint?:(session:RoomRuntimeSession)=>Promise<RoomIceAdmission>}){
  return {async GET(request:Request,{params}:Context){try{
    const {roomId}=await params,url=new URL(request.url);
    if([...url.searchParams.keys()].some(k=>k!=='runtimeCredential')||url.searchParams.getAll('runtimeCredential').length!==1)
      return json({code:'INVALID_REQUEST'},400);
    const access={encounterId:roomId,runtimeCredential:url.searchParams.get('runtimeCredential')!};
    const session=await deps.service.current(access);
    if(!deps.mint)return json({code:'ROOM_INTEGRATION_HELD'},503);
    const result=await deps.mint(session);
    // A suspended mint cannot turn stale permission into an admitted transport.
    await deps.service.current(access);
    if(!result||!Array.isArray(result.iceServers)||!Number.isSafeInteger(result.ttl)||result.ttl<=0||result.ttl>300)
      return json({code:'INVALID_TRANSPORT_ADMISSION'},503);
    // The admitted fixture may use host candidates only; no live relay credential is accepted here.
    if(result.iceServers.length!==0)return json({code:'LIVE_RELAY_HELD'},503);
    return json(result);
  }catch(e){return e instanceof RoomRuntimeError?json({code:e.code},e.status):json({code:'PERSISTENCE_FAILED'},503);}}};
}
