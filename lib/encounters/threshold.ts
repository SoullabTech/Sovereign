/**
 * Encounter Threshold — participant-scoped, version/generation-bound consent capability.
 * The capability identifies who may author a decision; it is never itself consent.
 */
import { createHmac, timingSafeEqual } from 'crypto';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;
export const JOIN_CONSENT_TEXT =
  'I choose to enter this live session room. Entering does not grant recording, captions, transcript retention, MAIA attendance, memory, or later sharing.';
export const RECORD_CONSENT_TEXT =
  'I separately agree that my voice may be recorded for this encounter. This permission is distinct from entering the room and may be refused or revoked.';
function secret(): string {
  const value=process.env.JWT_SECRET;
  if(!value)throw new Error('[threshold] JWT_SECRET is not set — consent tokens cannot be issued or verified');
  return value;
}
export interface ThresholdClaims {
  encounterId: string;
  participantId: string;
  agreementVersion: string;
  generation: number;
  exp: number;
}
function b64url(buf: Buffer): string { return buf.toString('base64url'); }
function sign(payload: string): string { return b64url(createHmac('sha256',secret()).update(payload).digest()); }
function validText(value: unknown): value is string { return typeof value==='string'&&value.trim().length>0&&value.length<=200; }
function validGeneration(value: unknown): value is number { return Number.isSafeInteger(value)&&Number(value)>0; }
export function mintThresholdToken(
  encounterId: string,
  participantId: string,
  agreementVersion: string,
  generation: number,
  now=Date.now(),
): string {
  if(!validText(encounterId)||!validText(participantId)||!validText(agreementVersion)||!validGeneration(generation))
    throw new Error('[threshold] invalid versioned threshold scope');
  const claims:ThresholdClaims={encounterId,participantId,agreementVersion,generation,exp:now+TOKEN_TTL_MS};
  const payload=b64url(Buffer.from(JSON.stringify(claims)));
  return `${payload}.${sign(payload)}`;
}
export function verifyThresholdToken(token: string, now=Date.now()): ThresholdClaims|null {
  if(typeof token!=='string'||token.length>4096)return null;
  const dot=token.lastIndexOf('.');if(dot<=0)return null;
  const payload=token.slice(0,dot),sig=token.slice(dot+1),expected=sign(payload);
  const a=Buffer.from(sig),b=Buffer.from(expected);
  if(a.length!==b.length||!timingSafeEqual(a,b))return null;
  try{
    const claims=JSON.parse(Buffer.from(payload,'base64url').toString()) as Record<string,unknown>;
    if(Object.keys(claims).sort().join(',')!=='agreementVersion,encounterId,exp,generation,participantId')return null;
    if(!validText(claims.encounterId)||!validText(claims.participantId)||!validText(claims.agreementVersion)
       ||!validGeneration(claims.generation)||typeof claims.exp!=='number'||claims.exp<now)return null;
    return claims as unknown as ThresholdClaims;
  }catch{return null;}
}
