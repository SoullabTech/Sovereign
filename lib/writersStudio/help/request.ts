import { HELP_RELEASE, HELP_SURFACES, HELP_CONTROLS, type HelpContext } from './catalogue';
export interface HelpQuestion { release: string; question: string; context: HelpContext; sanctuary: boolean; }
export function parseHelpQuestion(raw: unknown): HelpQuestion | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const b = raw as Record<string, unknown>;
  if (Object.keys(b).some(k => !['release','question','context','sanctuary'].includes(k))) return null;
  if (typeof b.release !== 'string' || b.release.length > 80 || typeof b.question !== 'string' || !b.question.trim() || b.question.length > 1000 || typeof b.sanctuary !== 'boolean') return null;
  if (!b.context || typeof b.context !== 'object' || Array.isArray(b.context)) return null;
  const c = b.context as Record<string, unknown>;
  if (Object.keys(c).some(k => !['surface','view','focused','controls'].includes(k)) ||
      !HELP_SURFACES.includes(c.surface as never) || !['markup','preview','unknown'].includes(c.view as string) ||
      typeof c.focused !== 'boolean' || !Array.isArray(c.controls) || c.controls.length > HELP_CONTROLS.length ||
      c.controls.some(v => !HELP_CONTROLS.includes(v as never)) || new Set(c.controls).size !== c.controls.length) return null;
  return { release:b.release, question:b.question.trim(), context:c as unknown as HelpContext, sanctuary:b.sanctuary };
}
export function currentHelpRelease(release: string): boolean { return release === HELP_RELEASE; }

/** Same HTTP-authority rule already used by House preferences. NextURL may
 * normalize loopback hostnames; compare Origin to the request Host instead.
 * The deployment proxy must set forwarded protocol, never a client-selected
 * alternate host. Non-browser requests must carry a verified session token.
 */
export function helpOriginAllowed(headers:Headers,url:string):boolean {
  const origin=headers.get('origin');
  if(!origin)return Boolean(headers.get('x-session-token'));
  try {
    const source=new URL(origin),destination=new URL(url);
    const host=headers.get('host')||destination.host;
    const protocol=headers.get('x-forwarded-proto')?.split(',')[0].trim()||destination.protocol.replace(':','');
    return source.origin===origin && source.host===host
      && ['http:','https:'].includes(source.protocol) && source.protocol===`${protocol}:`;
  }catch{return false;}
}
