'use strict';
const el = id => document.getElementById(id);
let state, current, proposal, versions, working=false;
function status(text){el('status').textContent=text;}
async function api(path,data){
 const r=await fetch(path,data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 const value=await r.json();if(!r.ok) throw Error(value.error || 'Local request failed');return value;
}
function dirty(){return current && el('manuscript').value!==current.body.replace(/\r\n?/g,'\n');}
function editorBody(){const value=el('manuscript').value;if(!dirty())return current.body;return /\r\n/.test(current.body)&&!/(?<!\r)\n/.test(current.body)?value.replace(/\n/g,'\r\n'):value;}
function originalOffset(offset){let raw=0,visible=0;while(visible<offset&&raw<current.body.length){raw+=current.body[raw]==='\r'&&current.body[raw+1]==='\n'?2:1;visible++;}return raw;}
function controls(){
 for(const id of ['save','undo','history','export','suggest']) el(id).disabled=working||!current;
 el('undo').disabled=working||!current||!current.canUndo||dirty();
 el('suggest').disabled=working||!current||!el('manuscript').value.trim()||dirty();
 for(const id of ['send','new-chat','resume-chat','sanctuary','new','import','apply','restore']) el(id).disabled=working;
 el('works').disabled=working;el('manuscript').disabled=working||!current;
 if(state?.sanctuary){
  for(const id of ['save','undo','history','export','suggest','new','import','apply','restore','works','manuscript'])el(id).disabled=true;
 }
 if(typeof refreshVoiceControls==='function')refreshVoiceControls();
 el('saved').textContent=current ? (dirty()?'Unsaved changes':'Saved locally · version '+current.revision) : '';
}
async function act(task){if(working)return;working=true;controls();try{await task();}catch(e){status(e.message);}finally{working=false;controls();}}
function showChapter(c){current=c;el('title').textContent=c.title;el('manuscript').value=c.body;el('works').value=c.id;proposal=null;el('proposal').hidden=true;el('versions').hidden=true;controls();}
function renderTurns(){
 el('sanctuary').textContent=state.sanctuary?'End Sanctuary':'Enter Sanctuary';
 el('privacy-status').textContent=state.sanctuary?'Sanctuary · This conversation stays in temporary memory, outside saved history. End Sanctuary or quit Cabin to clear it. Writing controls are paused.':'Ordinary conversation · Saved on this Mac.';
 if(typeof stopCabinAudio==='function')stopCabinAudio();el('conversations').replaceChildren(new Option('Choose a saved conversation',''));for(const s of state.sessions||[])el('conversations').append(new Option(new Date(s.created).toLocaleString(),s.id));el('conversations').value=state.session;el('turns').replaceChildren();for(const t of state.turns){const div=document.createElement('div');div.className='turn '+t.role;const name=document.createElement('strong');name.textContent=t.role==='user'?'You':'MAIA';div.append(name,document.createTextNode(t.content));el('turns').append(div);}el('turns').scrollTop=el('turns').scrollHeight;}
function updateList(){el('works').replaceChildren(new Option('Choose your writing',''));for(const c of state.manuscripts)el('works').append(new Option(c.title,c.id));if(current)el('works').value=current.id;}
async function refresh(id){state=await api('/api/state');updateList();renderTurns();const c=state.manuscripts.find(c=>c.id===(id||current?.id));if(c)showChapter(await api('/api/chapter?id='+encodeURIComponent(c.id)));}
async function saved(c){await api('/api/select',{id:c.id});state=await api('/api/state');updateList();renderTurns();showChapter(c);status('Saved locally.');}
el('works').onchange=()=>{if(dirty()){el('works').value=current.id;status('Save your changes before switching writing.');return;}const c=state.manuscripts.find(c=>c.id===el('works').value);if(c)act(async()=>{await api('/api/select',{id:c.id});showChapter(await api('/api/chapter?id='+encodeURIComponent(c.id)));});};
el('manuscript').oninput=()=>{proposal=null;el('proposal').hidden=true;controls();};
el('new').onclick=()=>{if(dirty()){status('Save your changes before beginning another piece.');return;}el('new-dialog').showModal();el('new-title').focus();};
el('cancel-new').onclick=()=>el('new-dialog').close();
el('new-form').onsubmit=e=>{e.preventDefault();act(async()=>{const c=await api('/api/new',{title:el('new-title').value,body:''});el('new-dialog').close();el('new-title').value='';await saved(c);});};
el('save').onclick=()=>act(async()=>saved(await api('/api/save',{id:current.id,body:editorBody(),revision:current.revision})));
el('undo').onclick=()=>act(async()=>{await saved(await api('/api/undo',{id:current.id,revision:current.revision}));status('Previous saved text restored. The history is preserved.');});
el('suggest').onclick=()=>act(async()=>{
 const area=el('manuscript');const start=area.selectionStart;const end=area.selectionEnd;
 status('MAIA is considering your selected passage locally…');
 proposal=await api('/api/suggest',{id:current.id,revision:current.revision,start:start===end?0:originalOffset(start),end:start===end?current.body.length:originalOffset(end),instruction:el('intention').value});
 el('original').textContent=proposal.original;el('replacement').textContent=proposal.replacement;el('reason').textContent=proposal.reason;el('proposal').hidden=false;status('A suggestion is ready. Your manuscript has not changed.');
});
el('apply').onclick=()=>act(async()=>{if(!proposal)throw Error('Ask for a current suggestion first');await saved(await api('/api/apply',{proposal:proposal.id}));status('Applied and saved. Undo is available.');});
el('ignore').onclick=()=>{proposal=null;el('proposal').hidden=true;status('Your original passage is protected.');};
el('history').onclick=()=>act(async()=>{versions=await api('/api/versions?id='+encodeURIComponent(current.id));el('version').replaceChildren();for(const v of versions)el('version').append(new Option('Version '+v.revision+' · '+v.action+' · '+new Date(v.created_at).toLocaleString(),v.revision));el('version-body').textContent=(await api('/api/versions?id='+encodeURIComponent(current.id)+'&revision='+versions[0].revision)).body;el('versions').hidden=false;status('Saved versions opened.');});
el('version').onchange=()=>act(async()=>{el('version-body').textContent=(await api('/api/versions?id='+encodeURIComponent(current.id)+'&revision='+el('version').value)).body;});
el('close-history').onclick=()=>el('versions').hidden=true;
el('restore').onclick=()=>act(async()=>{if(dirty())throw Error('Save your changes before restoring a version');await saved(await api('/api/restore',{id:current.id,revision:current.revision,targetRevision:Number(el('version').value)}));status('Selected version restored and saved as a new version.');});
el('export').onclick=()=>act(async()=>{if(dirty())throw Error('Save before making a copy.');const result=await window.cabinWriting.saveCopy(current.id);status(result.saved?'Copy saved.':'Save a copy canceled.');});
el('import').onclick=()=>{if(dirty()){status('Save your changes before importing.');return;}el('file').click();};
el('file').onchange=()=>act(async()=>{
 const file=el('file').files[0];if(!file)return;
 try {
  if(!/\.(txt|md)$/i.test(file.name)||file.size>20*1024*1024)throw Error('Choose a UTF-8 TXT or Markdown file up to 20 MB.');
  status('Importing '+file.name+' locally…');
  const response=await fetch('/api/import?name='+encodeURIComponent(file.name),{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:file});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Local import failed');
  await saved(result);status('Imported and saved locally.');
 } finally {el('file').value='';}
});
let pendingChat;
async function sendCurrentMessage(){
 const message=el('message').value;if(!message.trim())throw Error('Write a message first');
 const request={request:crypto.randomUUID(),session:state.session};pendingChat=request;
 el('stop-response').hidden=false;el('stop-response').disabled=false;
 status('MAIA is responding locally…');
 try{
  state=await api('/api/chat',{message,...request});renderTurns();
  if(el('message').value===message)el('message').value='';
  status(state.sanctuary?'MAIA replied in Sanctuary. This conversation is not saved.':'MAIA replied. This conversation is saved locally.');
 }finally{pendingChat=null;el('stop-response').hidden=true;}
 if(typeof speakCurrentReply==='function'&&el('talk-mode').checked)await speakCurrentReply();
}
el('send').onclick=()=>act(sendCurrentMessage);
el('stop-response').onclick=async()=>{
 if(!pendingChat)return;
 el('stop-response').disabled=true;
 try{await api('/api/cancel',pendingChat);}
 catch(e){status(e.message);if(pendingChat)el('stop-response').disabled=false;}
};
function conversationChange(task){if(el('message').value.trim()){status('Send or clear your draft before changing conversations.');return;}return act(task);}
el('sanctuary').onclick=()=>{
 if(dirty()||el('message').value.trim()){status('Save your writing and send or clear your message before changing privacy mode.');return;}
 act(async()=>{state=await api('/api/sanctuary',{enabled:!state.sanctuary});renderTurns();proposal=null;el('proposal').hidden=true;el('versions').hidden=true;status(state.sanctuary?'Sanctuary is open. This conversation is not saved.':'Sanctuary ended and its temporary conversation was cleared.');});
};
el('new-chat').onclick=()=>conversationChange(async()=>{state=await api('/api/session',{});renderTurns();status('A new conversation is open. Earlier conversations remain saved and are not used here.');});
el('resume-chat').onclick=()=>conversationChange(async()=>{const id=el('conversations').value;if(!id)throw Error('Choose a saved conversation');state=await api('/api/resume-session',{id});renderTurns();status('Saved conversation resumed. MAIA can use this conversation when you continue.');});
el('message').onkeydown=e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();el('send').click();}};
el('return-house').onclick=e=>{if(dirty()||working){e.preventDefault();status(dirty()?'Save your writing before returning to House.':'Wait for the current request before returning to House.');}};
window.addEventListener('beforeunload',e=>{if(dirty()){e.preventDefault();e.returnValue='';}});
act(async()=>{await refresh();const selected=state.manuscripts.find(c=>c.id===state.selected)||state.manuscripts[0];if(selected)showChapter(await api('/api/chapter?id='+encodeURIComponent(selected.id)));status('Your local workspace is ready.');const focus=sessionStorage.getItem('cabin-room-focus');sessionStorage.removeItem('cabin-room-focus');if(focus==='maia')el('message').focus();});
