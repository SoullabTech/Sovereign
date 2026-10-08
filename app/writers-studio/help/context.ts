import { UNKNOWN_HELP_CONTEXT, type HelpContext, type HelpControl, type HelpSurface } from '@/lib/writersStudio/help/catalogue';
/** Reads UI labels/booleans only. No editor values, manuscript prose, receipts,
 * URL IDs, account details or conversation contents enter the help request.
 */
export function captureHelpContext(doc:Document=document):HelpContext {
  const visible=(selector:string)=>Array.from(doc.querySelectorAll<HTMLElement>(selector)).find(el=>el.getClientRects().length>0 && !el.closest('[hidden]'));
  const craft=visible('[data-craftsmans-table-r1]');
  const passage=visible('[data-isolated-editorial]');
  const shell=visible('.fr-shell, [data-room="writers-studio"]');
  const mode=shell?.getAttribute('data-mode');
  const surface:HelpSurface=craft?'craft':passage?'passage':mode==='home'?'home':mode==='write'?'write':mode==='develop'?'develop':mode==='review'?'review':'unknown';
  const root=craft??passage??shell;
  if(!root)return {...UNKNOWN_HELP_CONTEXT,controls:[]};
  const buttons=Array.from(root.querySelectorAll<HTMLButtonElement>('button'));
  const aliases:Record<HelpControl,readonly string[]>={preview:['Preview'],markup:['Markup'],keep:['Keep mine'],save:['Save my version'],apply:['Apply my version'],undo:['Undo','Undo this change'],next:['Next passage'],choose:['Choose passage']};
  const controls=(Object.keys(aliases) as HelpControl[]).filter(id=>buttons.some(b=>!b.disabled && aliases[id].includes(b.textContent?.trim()??'')));
  const viewGroup=craft?.querySelector('[aria-label="Craft view"]');
  const chosen=viewGroup?.querySelector('[aria-pressed="true"]')?.textContent?.trim();
  return {surface,view:chosen==='Markup'?'markup':chosen==='Preview'?'preview':'unknown',focused:Boolean(craft?.querySelector('[data-craft-focus-bracket]')||passage),controls};
}
