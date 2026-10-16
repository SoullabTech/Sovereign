(()=>{'use strict';
// R40 browser-only, fictitious author manuscript. No API, keys, or actual MAIA.
const $=id=>document.getElementById(id);
const root=document.documentElement;
const PREFIX='🍂 A ';
const ORIGINAL='lantern glows';
const SUFFIX=' beside the river. The light moves through an ordinary afternoon.';
const OTHER='The second section keeps its own story. Nothing in this paragraph should change when the first passage is refined.';
const SECTION_ONE='55555555-5555-4555-8555-555555555551';
const SECTION_TWO='55555555-5555-4555-8555-555555555552';
const OPTIONS=[
  {title:'Light touch',wording:'lantern shimmers',origin:'maia',
    reason:'One small verb change keeps the rhythm intact.'},
  {title:'Gentle warmth',wording:'lantern shines',origin:'member',
    reason:'A clearer image without changing the surrounding prose.'},
  {title:'A different cadence',wording:'small lantern flickers',origin:'maia',
    reason:'A more noticeable recast that remains your choice.'},
];
const SESSION='soullab-r40-fictional-two-section-draft.v1';
const PREFS='soullab-r40-fictional-writer-column-widths.v1';
const safeRead=(place,key)=>{try{return JSON.parse(place.getItem(key)||'null');}catch{return null;}};
const fresh=()=>({version:1,focus:ORIGINAL,history:[],applied:null,sectionOne:SECTION_ONE,sectionTwo:SECTION_TWO});
function validDraft(v){
 return !!v&&Number.isSafeInteger(v.version)&&v.version>0&&v.version<100&&
  typeof v.focus==='string'&&v.focus.length>0&&v.focus.length<200&&
  Array.isArray(v.history)&&v.history.length<100&&
  v.sectionOne===SECTION_ONE&&v.sectionTwo===SECTION_TWO&&
  (v.applied===null || (v.applied&&typeof v.applied.before==='string'&&
    typeof v.applied.after==='string'&&v.applied.version===v.version));
}
let draft=fresh();
const prior=safeRead(sessionStorage,SESSION);
if(validDraft(prior))draft=prior;
let choice=-1,context=false,selected=draft.focus;
const escapeHTML=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
 .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
/** R36-style deterministic word/whitespace LCS, not whole-paragraph redlines. */
function changedWords(original,replacement){
 const tokens=s=>s.match(/\s+|[^\s]+/gu)||[];
 const left=tokens(original),right=tokens(replacement);
 if(left.length>128||right.length>128)
  return '<del>'+escapeHTML(original)+'</del><ins>'+escapeHTML(replacement)+'</ins>';
 const m=left.length,n=right.length;
 const table=Array.from({length:m+1},()=>Array(n+1).fill(0));
 for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)
  table[i][j]=left[i]===right[j]?table[i+1][j+1]+1:
   Math.max(table[i+1][j],table[i][j+1]);
 const pieces=[];
 function push(kind,value){
  if(!value)return;
  const previous=pieces[pieces.length-1];
  if(previous?.kind===kind)previous.text+=value;
  else pieces.push({kind,text:value});
 }
 let i=0,j=0;
 while(i<m||j<n){
  if(i<m&&j<n&&left[i]===right[j]){
   push('unchanged',left[i]);i++;j++;
  }else if(i<m&&(j===n||table[i+1][j]>=table[i][j+1])){
   push('removed',left[i++]);
  }else push('added',right[j++]);
 }
 return pieces.map(x=>x.kind==='unchanged'?
   '<span class="unchanged">'+escapeHTML(x.text)+'</span>':
   (x.kind==='removed'?'<del>':'<ins>')+escapeHTML(x.text)+
   (x.kind==='removed'?'</del>':'</ins>')).join('');
}
const inform=message=>{$('editor-status').textContent=message;};
function persist(){
 try{sessionStorage.setItem(SESSION,JSON.stringify(draft));}
 catch{inform('Browser session storage is unavailable. This fictional draft is not saved.');}
}
function switchPane(pane){
 document.querySelectorAll('[data-panel]').forEach(x=>x.dataset.active=String(x.dataset.panel===pane));
 document.querySelectorAll('[data-pane]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.pane===pane)));
}
function render(){
 $('target').textContent=draft.focus;
 $('section-two').textContent=OTHER;
 $('revision').textContent='Version '+draft.version;
 $('selection').textContent=selected;
 $('zoom-description').textContent=context?
   'Context view: your selected passage in relation to the unchanged second section.':
   'Passage view: exact words, cadence and rhythm.';
 $('zoom').textContent='Semantic zoom: '+(context?'Context':'Passage');
 $('zoom').setAttribute('aria-pressed',String(context));
 $('undo').disabled=!draft.applied;
 $('options').replaceChildren();
 OPTIONS.forEach((option,index)=>{
   const button=document.createElement('button');
   button.type='button';button.className='option';button.dataset.option=String(index);
   button.disabled=!!draft.applied;
   button.setAttribute('aria-pressed',String(choice===index));
   button.innerHTML='<strong>'+escapeHTML(option.title)+'</strong>'+
     '<span>'+escapeHTML(option.wording)+'</span>'+
     '<span>'+escapeHTML(option.origin==='member'?'Writer example':'MAIA example')+
     ' · '+escapeHTML(option.reason)+'</span>';
   button.addEventListener('click',()=>{
     if(draft.applied)return;
     choice=index;render();
     $('maia-status').textContent='Preview only. Review changed words before Apply.';
   });
   $('options').append(button);
 });
 $('apply').disabled=choice<0||!!draft.applied;
 $('diff').innerHTML=choice<0?
   (draft.applied?'Author-approved change applied. Undo is available.':
    'Choose an alternative to inspect changed words.'):
    changedWords(draft.focus,OPTIONS[choice].wording);
}
$('apply').addEventListener('click',()=>{
 if(choice<0||draft.applied)return;
 if(draft.focus!==ORIGINAL||selected!==draft.focus){
   inform('Selected words have changed. Reopen the original passage before applying.');return;
 }
 const option=OPTIONS[choice];
 if(option.wording===draft.focus)return;
 const before=draft.focus;
 const unaffected=$('section-two').textContent;
 draft.history.push({generation:draft.version,focus:before,action:'before-apply'});
 draft.version+=1;draft.focus=option.wording;
 draft.applied={before,after:option.wording,version:draft.version,origin:option.origin};
 if(OTHER!==unaffected){
   draft.focus=before;draft.version-=1;draft.applied=null;draft.history.pop();
   inform('Untouched manuscript section did not match. Apply refused.');return;
 }
 selected=draft.focus;choice=-1;persist();render();
 inform('Author-approved passage Apply saved as version '+draft.version+
   '. The second section is unchanged.');
 $('maia-status').textContent='Applied only to your selected passage; Undo remains yours.';
});
$('undo').addEventListener('click',()=>{
 const prior=draft.applied;
 if(!prior||draft.version!==prior.version||draft.focus!==prior.after)return;
 const otherBefore=$('section-two').textContent;
 if(otherBefore!==OTHER){inform('Section ownership changed. Undo refused.');return;}
 draft.history.push({generation:draft.version,focus:draft.focus,action:'applied'});
 draft.version+=1;draft.focus=prior.before;draft.applied=null;
 selected=draft.focus;choice=-1;persist();render();
 inform('Undo saved as version '+draft.version+'. Original author wording restored.');
 $('maia-status').textContent='The original passage has returned; section two was untouched.';
});
$('ignore').addEventListener('click',()=>{
 choice=-1;render();
 $('maia-status').textContent='Ignored. Neither manuscript section has changed.';
});
$('save').addEventListener('click',()=>{
 persist();
 inform('Fictional draft saved in browser session only. No server manuscript was written.');
});
$('reopen').addEventListener('click',()=>{
 const copy=safeRead(sessionStorage,SESSION);
 if(!validDraft(copy)){inform('No valid fictional draft saved in this browser session.');return;}
 draft=copy;choice=-1;selected=draft.focus;render();
 inform('Reopened fictional version '+draft.version+'. Both section identities preserved.');
});
$('work-selection').addEventListener('click',()=>{
 const selection=window.getSelection()?.toString().trim()||'';
 if(selection&&selection!==draft.focus){
   inform('Select only the highlighted passage: this rehearsal does not infer other text.');return;
 }
 selected=draft.focus;choice=-1;render();switchPane('maia');
 inform('Exact section-owned words focused. Review an option before applying.');
});
$('zoom').addEventListener('click',()=>{context=!context;render();});
const limits={outline:[160,360],maia:[250,500]};
const property=name=>name==='outline'?'--outline':'--maia';
const width=name=>{
 const n=parseInt(root.style.getPropertyValue(property(name)),10);
 return Number.isFinite(n)?n:(name==='outline'?235:355);
};
function setWidth(name,value){
 const [lo,hi]=limits[name];const n=Math.min(hi,Math.max(lo,Math.round(value)));
 root.style.setProperty(property(name),n+'px');
 $(name==='outline'?'left-divider':'right-divider').setAttribute('aria-valuenow',String(n));
 try{
  const current=safeRead(localStorage,PREFS)||{};
  current[name]=n;localStorage.setItem(PREFS,JSON.stringify(current));
 }catch{}
}
[['left-divider','outline'],['right-divider','maia']].forEach(([id,name])=>{
 const divider=$(id);
 divider.addEventListener('keydown',event=>{
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
     event.preventDefault();
     setWidth(name,width(name)+(event.key==='ArrowRight'?16:-16));
   }else if(event.key==='Home'){event.preventDefault();setWidth(name,limits[name][0]);}
   else if(event.key==='End'){event.preventDefault();setWidth(name,limits[name][1]);}
 });
 let at=0,x=0;
 divider.addEventListener('pointerdown',event=>{
   x=event.clientX;at=width(name);divider.setPointerCapture(event.pointerId);
 });
 divider.addEventListener('pointermove',event=>{
   if(divider.hasPointerCapture(event.pointerId))
     setWidth(name,at+(name==='outline'?event.clientX-x:x-event.clientX));
 });
});
$('reset').addEventListener('click',()=>{
 setWidth('outline',235);setWidth('maia',355);
 inform('Manuscript-first three-column layout restored.');
});
document.querySelectorAll('[data-pane]').forEach(button=>
 button.addEventListener('click',()=>switchPane(button.dataset.pane)));
const prefs=safeRead(localStorage,PREFS)||{};
if(Number.isFinite(prefs.outline))setWidth('outline',prefs.outline);
if(Number.isFinite(prefs.maia))setWidth('maia',prefs.maia);
switchPane('writing');render();
// No fetch, XHR, model inference, cookies or server writing occurs in R40.
})();