/**
 * R52 — exact Unicode selection in the *real* PC3 WriteRoom rendered blocks.
 *
 * The canonical editor renders editable paragraphs, omitting literal line
 * separators that belong to the server-delivered A1 body. R41 exactDomPassage
 * is deliberately conservative in that case; it cannot compare the editor's
 * flat DOM Range text to the source that includes paragraph breaks.
 *
 * R52 validates EVERY rendered block in original order against the current
 * writer-controlled source. Only whitespace may separate aligned blocks and
 * remain after the last. It then translates a selection WITHIN exactly one
 * block back into source-codepoint offsets. No phrase search/reanchor,
 * normalization, persistence or author approval is permitted here.
 */
import type {ExactPassageR41} from './exactLiveSelectionR41';

const points=(s:string)=>Array.from(s);
export const R52_REAL_PROTECTED_EDITORIAL_WRITE_ENABLED=false as const;
export function exactRenderedPassageR52(
 liveBody:string,editor:HTMLElement,range:Range,
):ExactPassageR41|null {
 if(typeof liveBody!=='string'||!editor||!range||range.collapsed||
    !editor.contains(range.startContainer)||!editor.contains(range.endContainer))
  return null;
 try{
  const direct=Array.from(editor.children);
  if(direct.length===0||direct.length>500||
     direct.some(el=>!el.matches('[data-write-block]')))
   return null;
  let cursor=0;
  let found:ExactPassageR41|null=null;
  for(const block of direct){
   const content=block.textContent||'';
   // An empty contenteditable paragraph cannot provide an unambiguous
   // source segment; do not guess positions across its empty DOM.
   if(!content)return null;
   const at=liveBody.indexOf(content,cursor);
   if(at<0||!/^\s*$/u.test(liveBody.slice(cursor,at)))return null;
   const isSelected=block.contains(range.startContainer)&&
      block.contains(range.endContainer);
   if(isSelected){
    const before=editor.ownerDocument.createRange();
    before.selectNodeContents(block);
    before.setEnd(range.startContainer,range.startOffset);
    const selected=range.toString();
    const prefix=before.toString();
    const start=points(liveBody.slice(0,at)).length+points(prefix).length;
    const end=start+points(selected).length;
    if(!selected.trim()||selected.length>16384||
       points(liveBody).slice(start,end).join('')!==selected)
      return null;
    found={start,end,text:selected};
   }else if(block.contains(range.startContainer)||
      block.contains(range.endContainer)){
    // Selection crosses paragraphs; require a separately witnessed
    // multi-block range instead of combining unrelated text.
    return null;
   }
   cursor=at+content.length;
  }
  if(!/^\s*$/u.test(liveBody.slice(cursor)))return null;
  return found;
}catch{return null;}
}
