/**
 * RF01 R1-B — exact-turn deletion, transactional provenance and quarantine.
 *
 * INTERNAL FICTIONAL ACCEPTANCE ONLY. No production member deletion endpoint
 * or runtime activation. A caller saying "forget" inside a conversation never
 * authorizes durable erasure; this service requires a separately verified
 * actor, exact UUID row list, and explicit member action.
 *
 * Outcome:
 *  - Records manifest and per-object S5 tombstones before any DELETE;
 *  - Holds the actor's MAIA-derived influence until R1-C source lineage proof;
 *  - Deletes ONLY requested member-owned NORMAL turns in one transaction;
 *  - Rejects partial matches, duplicates, foreign/session/unknown posture;
 *  - Does not touch other sessions or erase unrelated memory objects.
 *
 * The transaction commits together or not at all. After a database outage,
 * a caller must inspect custody; automatic delete retries are disallowed.
 */
import { randomUUID } from 'node:crypto';
import { transaction } from '@/lib/db/postgres';

export const R1B_ERASURE_CONTRACT = 'rf01-exact-member-turns-v1' as const;
export const R1B_MAX_TURNS = 20;

type CandidateTurn = {
  id: string;
  user_id: string;
  session_id: string | null;
  posture_at_creation: string | null;
};

export type ExactErasureOutcome =
  | { ok:true; manifestId:string; deletedCount:number; influenceHeld:true }
  | { ok:false; code: string };

export class ErasureCustodyRefusal extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.code=code;
    this.name='ErasureCustodyRefusal';
  }
}

const validUUID=(s:unknown):s is string =>
  typeof s==='string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

function normalizedExactIDs(turnIds:unknown):string[] | null {
  if (!Array.isArray(turnIds) || !turnIds.length ||
      turnIds.length>R1B_MAX_TURNS) return null;
  if (!turnIds.every(validUUID)) return null;
  const ids=turnIds.map(v=>v.toLowerCase());
  if (new Set(ids).size!==ids.length) return null;
  return ids;
}

export async function eraseExactFictionalMemberTurns(input:{
  verifiedMemberId:unknown;
  sessionId:unknown;
  turnIds:unknown;
  explicitMemberConfirmation:boolean;
}):Promise<ExactErasureOutcome> {
  if(process.env.NODE_ENV!=='test' ||
     process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED!=='1') {
    return {ok:false,code:'R1B_ERASURE_RELEASE_HELD'};
  }
  if(typeof input.verifiedMemberId!=='string' ||
     !validUUID(input.verifiedMemberId) ||
     typeof input.sessionId!=='string' ||
     !input.sessionId.trim() || input.sessionId.length>200 ||
     input.explicitMemberConfirmation!==true) {
    return {ok:false,code:'R1B_AUTHORIZATION_NOT_ESTABLISHED'};
  }
  const ids=normalizedExactIDs(input.turnIds);
  if(!ids) return {ok:false,code:'R1B_EXACT_TURN_IDS_REQUIRED'};

  // No free-text notes, IPs, content fingerprints or member quotations.
  const newManifestId=randomUUID();
  try {
    return await transaction<ExactErasureOutcome>(async tx=>{
      // The DB content writers use the exact same advisory transaction lock.
      // Wait for any preceding write to COMMIT before creating the erasure
      // hold. Writers which start later wait and then see the hold.
      await tx.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1::text,81017))',
        [input.verifiedMemberId],
      );
      const owner=await tx.query<{member_id:string}>(
        'SELECT member_id FROM maia_sessions WHERE id=$1 FOR UPDATE',
        [input.sessionId],
      );
      if(owner.rows[0]?.member_id!==input.verifiedMemberId) {
        throw new ErasureCustodyRefusal('R1B_SESSION_NOT_OWNED');
      }
      // Lock all requested turns. An unknown, foreign, protected, legacy or
      // already-deleted turn poisons the entire batch; no partial deletion.
      const actual=await tx.query<CandidateTurn>(
        'SELECT id::text,user_id,session_id,posture_at_creation '+
        'FROM conversation_turns WHERE id=ANY($1::uuid[]) FOR UPDATE',
        [ids],
      );
      if(actual.rows.length!==ids.length ||
         actual.rows.some(t=>
           t.user_id!==input.verifiedMemberId ||
           t.session_id!==input.sessionId ||
           t.posture_at_creation!=='normal' ||
           !ids.includes(t.id.toLowerCase()))) {
        throw new ErasureCustodyRefusal('R1B_EXACT_TURN_CUSTODY_MISMATCH');
      }

      await tx.query(
        'INSERT INTO deletion_manifests '+
        '(id,reason_class,authorized_by,note,executed_at) '+
        'VALUES ($1,$2,$3,$4,NOW())',
        [newManifestId,'member_deletion',R1B_ERASURE_CONTRACT,
          'Exact member-confirmed turn deletion; derived influence quarantined'],
      );

      // Object-level tombstones, NEVER a session-wide deletion scope.
      // Scoped predicates could accidentally suppress unrelated ordinary turns.
      const tombstones=await tx.query<{object_id:string}>(
        "INSERT INTO provenance_tombstones "+
        "(manifest_id,object_kind,object_id) "+
        "SELECT $1::uuid,'conversation_turns',unnest($2::text[]) "+
        "RETURNING object_id",
        [newManifestId,ids],
      );
      if(tombstones.rows.length!==ids.length) {
        throw new ErasureCustodyRefusal('R1B_TOMBSTONE_CUSTODY_FAILED');
      }

      // A member-wide read hold is deliberate and temporary, not a blanket
      // content deletion. Keep the first manifest as the root quarantine.
      const held=await tx.query<{member_id:string}>(
        'INSERT INTO rf01_member_erasure_holds '+
        '(member_id,manifest_id,hold_reason) '+
        'VALUES ($1,$2,$3) '+
        'ON CONFLICT (member_id) DO UPDATE '+
        'SET established_at=rf01_member_erasure_holds.established_at '+
        'RETURNING member_id',
        [input.verifiedMemberId,newManifestId,
          'exact_turn_erasure_derived_influence_unverified'],
      );
      if(held.rows[0]?.member_id!==input.verifiedMemberId) {
        throw new ErasureCustodyRefusal('R1B_INFLUENCE_HOLD_NOT_ESTABLISHED');
      }

      const deleted=await tx.query<{id:string}>(
        'DELETE FROM conversation_turns '+
        'WHERE id=ANY($1::uuid[]) AND user_id=$2 AND session_id=$3 '+
        "AND posture_at_creation='normal' RETURNING id::text",
        [ids,input.verifiedMemberId,input.sessionId],
      );
      if(deleted.rows.length!==ids.length) {
        throw new ErasureCustodyRefusal('R1B_DELETE_COUNT_MISMATCH');
      }
      return {ok:true,manifestId:newManifestId,
        deletedCount:deleted.rows.length,influenceHeld:true};
    });
  } catch(err) {
    return {
      ok:false,
      code:err instanceof ErasureCustodyRefusal
        ? err.code:'R1B_ERASURE_OR_DATABASE_UNAVAILABLE',
    };
  }
}
