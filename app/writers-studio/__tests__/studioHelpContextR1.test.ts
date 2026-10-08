/** @jest-environment jsdom */
import {captureHelpContext} from '@/app/writers-studio/help/context';
const rects=HTMLElement.prototype.getClientRects;
beforeEach(()=>{HTMLElement.prototype.getClientRects=function(){return (this.hasAttribute('hidden')?[]:[{width:400,height:400}]) as unknown as DOMRectList;};});
afterEach(()=>{document.body.innerHTML='';HTMLElement.prototype.getClientRects=rects;});
it.each(['home','write','develop','review'])('reads %s from the rendered Studio shell, not a requested URL',mode=>{
  document.body.innerHTML=`<div data-room="writers-studio" data-mode="${mode}"><p>Private book text</p></div>`;
  expect(captureHelpContext().surface).toBe(mode);
});
it('captures only allowlisted labels and booleans, never manuscript prose or IDs',()=>{
  document.body.innerHTML='<div class="fr-shell" data-mode="develop"><section data-craftsmans-table-r1><div aria-label="Craft view"><button aria-pressed="true">Preview</button></div><div data-craft-focus-bracket>Private paragraph with an identifier</div><textarea>Unfinished private writing</textarea><button disabled>Save my version</button></section></div>';
  const c=captureHelpContext();expect(c).toEqual({surface:'craft',view:'preview',focused:true,controls:['preview']});expect(JSON.stringify(c)).not.toContain('Private');
});
it('unavailable rendered context remains unknown',()=>{document.body.innerHTML='<div hidden data-room="writers-studio" data-mode="review"></div>';expect(captureHelpContext().surface).toBe('unknown');});
