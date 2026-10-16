/**
 * R41 · Real Writer Studio selection → exact codepoint locus.
 *
 * This code is used by the canonical PC3 Write UI, not a separate demo route.
 * It neither calls R39, makes a key grant, saves prose, nor infers a section.
 *
 * UTF-16 offsets originate in the actual browser selection/textarea.
 * The returned codepoint positions must match the current A1 authored body
 * byte-for-byte (no whitespace normalization or relocate-on-failure).
 */
export const R41_REAL_PROTECTED_APPLY_ENABLED = false as const;

export type ExactPassageR41 = Readonly<{
  start: number; end: number; text: string;
}>;

const points = (text:string) => Array.from(text);
const LIMIT = 16_384; // A selection, not a whole manuscript.
function verify(body:string,start:number,end:number,selected:string):ExactPassageR41|null {
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<=start||
      typeof selected!=='string'||selected.trim().length===0||
      selected.length>LIMIT)return null;
  const codepoints=points(body);
  if(end>codepoints.length||codepoints.slice(start,end).join('')!==selected)
    return null;
  return {start,end,text:selected};
}
/**
 * Text controls expose exact UTF-16 selectionStart and selectionEnd, even for
 * repeated phrases. Only admit if the textarea is synchronized with the
 * current writer-controlled A1 body; an unsaved version must not be relocated.
 */
export function exactTextareaPassageR41(
  liveBody:string,textareaValue:string,startUTF16:number,endUTF16:number,
):ExactPassageR41|null {
  if(typeof liveBody!=='string'||textareaValue!==liveBody||
     !Number.isSafeInteger(startUTF16)||!Number.isSafeInteger(endUTF16)||
     startUTF16<0||endUTF16>textareaValue.length||startUTF16>=endUTF16)
    return null;
  const start=points(textareaValue.slice(0,startUTF16)).length;
  const end=points(textareaValue.slice(0,endUTF16)).length;
  const selected=textareaValue.slice(startUTF16,endUTF16);
  return verify(liveBody,start,end,selected);
}
/**
 * Contenteditable: only derive an exact locus when the *entire visible
 * editor* serializes identically to the A1 body. Rich multiple-paragraph DOM
 * often inserts synthetic boundaries; the caller may retain its existing
 * UNIQUE-text conservative fallback, but must never guess a repeated locus.
 */
export function exactDomPassageR41(
  liveBody:string,editor:HTMLElement,range:Range,
):ExactPassageR41|null {
  if(typeof liveBody!=='string'||!editor||!range||range.collapsed||
    !editor.contains(range.startContainer)||!editor.contains(range.endContainer))
    return null;
  try {
    const doc=editor.ownerDocument;
    const whole=doc.createRange();
    whole.selectNodeContents(editor);
    if(whole.toString()!==liveBody)return null;
    const before=doc.createRange();
    before.selectNodeContents(editor);
    before.setEnd(range.startContainer,range.startOffset);
    const start=points(before.toString()).length;
    const selected=range.toString();
    const end=start+points(selected).length;
    return verify(liveBody,start,end,selected);
  }catch{return null;}
}
