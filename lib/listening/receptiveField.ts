/** LISTEN-23 · Private member-authored Receptive Field recipes (review only).
 * A recipe is inert listening metadata; it NEVER grants music rights, plays
 * audio, diagnoses anyone, or authorizes member/session persistence.
 */
export const RECEPTIVE_SHELF_FORMAT = 'SOULLAB_LISTEN_RECEPTIVE_FIELDS_V1';
export const RECEPTIVE_SHELF_MAX_BYTES = 64 * 1024;
export const RECEPTIVE_SHELF_MAX_FIELDS = 24;
export const RECEPTIVE_SHELF_MAX_INTENTIONS = 4;

export type ReceptiveJourney = 'focus' | 'create' | 'drift' | 'rest';
export type ReceptiveControls = { pulse: number; space: number; density: number };
export type ReceptiveIntention =
  | 'center' | 'balance' | 'inspire' | 'wonder' | 'connect' | 'remember'
  | 'rest' | 'energize' | 'grieve' | 'release' | 'immerse' | 'explore';

export type ReceptiveFieldRecipe = {
  id: string;
  title: string;
  source: 'soullab-original-sketch-v1';
  journey: ReceptiveJourney;
  controls: ReceptiveControls;
  intentions: ReceptiveIntention[];
};

export const ORIGINAL_RECEPTIVE_CONTROLS: Readonly<ReceptiveControls> =
  Object.freeze({ pulse: 50, space: 50, density: 50 });

export const RECEPTIVE_INTENTIONS: ReadonlyArray<{ id: ReceptiveIntention; label: string }> = [
  {id:'center',label:'Centering'}, {id:'balance',label:'Balance'},
  {id:'inspire',label:'Inspiration'}, {id:'wonder',label:'Wonder'},
  {id:'connect',label:'Connection'}, {id:'remember',label:'Remembrance'},
  {id:'rest',label:'Rest'}, {id:'energize',label:'Energy'},
  {id:'grieve',label:'Grief & tenderness'}, {id:'release',label:'Catharsis & release'},
  {id:'immerse',label:'Immersion'}, {id:'explore',label:'Exploration'},
] as const;

export const RECEPTIVE_INVITATIONS: ReadonlyArray<{
  id:string; title:string; explanation:string; journey:ReceptiveJourney;
  controls:ReceptiveControls; intention:ReceptiveIntention;
}> = [
  { id:'settle',title:'A place to center',explanation:'Warm quiet, breathing space and gentle motion.',
    journey:'rest',controls:{pulse:20,space:72,density:25},intention:'center' },
  { id:'warmth',title:'A moving current',explanation:'Human rhythm, gentle momentum and connection.',
    journey:'create',controls:{pulse:77,space:50,density:60},intention:'inspire' },
  { id:'open',title:'A wider horizon',explanation:'Long resonance and spacious, unhurried sound.',
    journey:'drift',controls:{pulse:30,space:88,density:30},intention:'wonder' },
  { id:'release',title:'Room for catharsis',explanation:'A more present, expressive texture—always with space to stop.',
    journey:'create',controls:{pulse:75,space:65,density:80},intention:'release' },
] as const;

const JOURNEYS = new Set<ReceptiveJourney>(['focus','create','drift','rest']);
const INTENTIONS = new Set<ReceptiveIntention>(RECEPTIVE_INTENTIONS.map(v=>v.id));
const safeText = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\x00-\x1F\x7F]/g,' ').replace(/\s+/g,' ').trim().slice(0,max) : '';
const record = (v: unknown): v is Record<string,unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

function controlValue(v: unknown): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 100)
    throw new Error('Sound shaping values must be within 0–100.');
  return Math.round(v / 5) * 5;
}

export function validatedReceptiveControls(v: unknown): ReceptiveControls {
  if (!record(v)) throw new Error('Sound shaping settings are invalid.');
  return {pulse:controlValue(v.pulse),space:controlValue(v.space),density:controlValue(v.density)};
}

export function validatedReceptiveIntentions(v: unknown): ReceptiveIntention[] {
  if (!Array.isArray(v) || v.length > RECEPTIVE_SHELF_MAX_INTENTIONS ||
      v.some(x=>typeof x !== 'string' || !INTENTIONS.has(x as ReceptiveIntention)))
    throw new Error('Listening intention labels are invalid.');
  const distinct=[...new Set(v as ReceptiveIntention[])];
  if (distinct.length!==v.length) throw new Error('Repeated listening intention labels are not permitted.');
  return distinct;
}

export function validateReceptiveRecipe(v: unknown): ReceptiveFieldRecipe {
  if(!record(v) || v.source !== 'soullab-original-sketch-v1' ||
     typeof v.id !== 'string' || !/^field-[a-zA-Z0-9_-]{8,80}$/.test(v.id) ||
     typeof v.journey !== 'string' || !JOURNEYS.has(v.journey as ReceptiveJourney))
    throw new Error('This is not a recognized Soullab receptive field.');
  const title=safeText(v.title,80);
  if(!title || title.length > 80) throw new Error('A receptive field needs a short title.');
  return {
    id:v.id,title,source:'soullab-original-sketch-v1',
    journey:v.journey as ReceptiveJourney,
    controls:validatedReceptiveControls(v.controls),
    intentions:validatedReceptiveIntentions(v.intentions)
  };
}

export function newReceptiveRecipe(
  title:string, journey:ReceptiveJourney, controls:ReceptiveControls,
  intentions:ReceptiveIntention[], id:string
):ReceptiveFieldRecipe {
  return validateReceptiveRecipe({
    id,title,journey,controls,intentions,source:'soullab-original-sketch-v1'
  });
}

/** Never serializes audio, raw journal writing, provider links, member IDs,
 * recordings, emotions inferred by AI or account credentials. */
export function exportReceptiveShelf(entries: readonly ReceptiveFieldRecipe[]): string {
  if(entries.length>RECEPTIVE_SHELF_MAX_FIELDS) throw new Error('Go-to fields are limited to 24.');
  const verified=entries.map(validateReceptiveRecipe);
  const ids=new Set(verified.map(x=>x.id));
  if(ids.size!==verified.length) throw new Error('Duplicate saved fields are not allowed.');
  const text=JSON.stringify({format:RECEPTIVE_SHELF_FORMAT,version:1,fields:verified});
  if(new TextEncoder().encode(text).byteLength>RECEPTIVE_SHELF_MAX_BYTES)
    throw new Error('Go-to field collection is too large.');
  return text;
}

export function importReceptiveShelf(raw: string): ReceptiveFieldRecipe[] {
  if(typeof raw !== 'string' || new TextEncoder().encode(raw).byteLength>RECEPTIVE_SHELF_MAX_BYTES)
    throw new Error('Receptive field export is too large.');
  let parsed:unknown;
  try {parsed=JSON.parse(raw);} catch {throw new Error('Not a recognized Soullab receptive field export.');}
  if(!record(parsed) || parsed.format!==RECEPTIVE_SHELF_FORMAT ||
      parsed.version!==1 || !Array.isArray(parsed.fields) ||
      parsed.fields.length>RECEPTIVE_SHELF_MAX_FIELDS)
    throw new Error('Not a recognized Soullab receptive field export.');
  const fields=parsed.fields.map(validateReceptiveRecipe);
  if(new Set(fields.map(x=>x.id)).size!==fields.length)
    throw new Error('Duplicate receptive fields are not permitted.');
  return fields;
}
