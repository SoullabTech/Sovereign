'use strict';
let voiceInfo={transcription:false,speech:false},voiceRecorder,voiceStream,voiceTimer,voiceAudio,voiceUrl,voiceTurn,voicePreparation,recordCancelled=false,recordStoppedByMember=false;
function refreshVoiceControls(){el('record').disabled=working||!voiceInfo.transcription;el('listen').disabled=working||!voiceInfo.speech||!state?.turns.some(t=>t.role==='assistant');}
function stopCabinAudio(){voicePreparation?.abort();voicePreparation=null;if(voiceAudio){voiceAudio.pause();voiceAudio.src='';voiceAudio=null;}if(voiceUrl)URL.revokeObjectURL(voiceUrl);voiceUrl=null;voiceTurn=null;el('stop-audio').hidden=true;}
function releaseMicrophone(){clearTimeout(voiceTimer);voiceStream?.getTracks().forEach(track=>track.stop());voiceStream=null;el('stop-record').hidden=true;el('cancel-record').hidden=true;el('message').disabled=false;}
el('record').onclick=async()=>{
 if(working)return;
 if(el('message').value.trim()){el('voice-status').textContent='Send or clear your draft before recording another message.';return;}
 recordCancelled=false;recordStoppedByMember=false;const talkAtStart=el('talk-mode').checked;
 stopCabinAudio();working=true;controls();el('message').disabled=true;
 try{
  voiceStream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
  const type=['audio/webm;codecs=opus','audio/webm','audio/ogg'].find(t=>MediaRecorder.isTypeSupported(t));
  if(!type)throw Error('This window does not support local audio recording.');
  voiceRecorder=new MediaRecorder(voiceStream,{mimeType:type});const chunks=[];const session=state.session;
  voiceRecorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  voiceRecorder.onstop=async()=>{
   const audio=new Blob(chunks,{type});releaseMicrophone();working=false;
   if(recordCancelled){controls();el('voice-status').textContent='Recording cancelled. Nothing was transcribed or sent.';return;}
   await act(async()=>{
    el('voice-status').textContent='Transcribing locally…';
    const r=await fetch('/api/voice/transcribe',{method:'POST',headers:{'Content-Type':type,'X-Cabin-Session':session},body:audio});
    const result=await r.json();if(!r.ok)throw Error(result.error);
    if(state.session!==session)throw Error('Conversation changed. The transcript was not added.');
    el('message').value=result.text;
    if(talkAtStart&&el('talk-mode').checked&&recordStoppedByMember){
     el('voice-status').textContent='Sending your recorded message locally…';
     await sendCurrentMessage();
    }else el('voice-status').textContent='Review your transcript, then choose Send to MAIA. Audio is not saved by Cabin.';
   });
  };
  voiceRecorder.start();el('stop-record').hidden=false;el('cancel-record').hidden=false;el('voice-status').textContent='Recording locally. Choose Stop recording when you finish.';
  voiceTimer=setTimeout(()=>voiceRecorder?.state==='recording'&&voiceRecorder.stop(),120000);
 }catch(e){releaseMicrophone();working=false;controls();el('voice-status').textContent='Microphone could not start. Allow microphone access for Cabin, or type your message.';}
};
el('stop-record').onclick=()=>{if(voiceRecorder?.state==='recording'){recordStoppedByMember=true;voiceRecorder.stop();}};
el('cancel-record').onclick=()=>{recordCancelled=true;if(voiceRecorder?.state==='recording')voiceRecorder.stop();};
el('talk-mode').onchange=()=>{
 el('stop-record').textContent=el('talk-mode').checked?'Stop and send':'Stop recording';
 if(!el('talk-mode').checked)stopCabinAudio();
 el('voice-status').textContent=el('talk-mode').checked?'Talk mode is on. Start a recording, then Stop and send. Replies are read aloud. The microphone will not restart automatically.':'Review mode is on. Record, review your words, then choose Send.';
};
async function speakCurrentReply(){
 const turn=[...state.turns].reverse().find(t=>t.role==='assistant');if(!turn)throw Error('There is no reply to read yet.');
 if(voiceAudio&&voiceTurn===turn.id){await voiceAudio.play();el('stop-audio').hidden=false;return;}
 stopCabinAudio();const session=state.session;el('voice-status').textContent='Preparing MAIA’s voice locally…';
 const preparation=new AbortController();voicePreparation=preparation;el('stop-audio').hidden=false;
 let r,blob;
 try{
  r=await fetch('/api/voice/speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session,turn:turn.id}),signal:preparation.signal});
  if(!r.ok)throw Error((await r.json()).error);
  blob=await r.blob();
 }catch(e){if(preparation.signal.aborted)return;throw e;}
 finally{if(voicePreparation===preparation){voicePreparation=null;el('stop-audio').hidden=true;}}
 if(preparation.signal.aborted)return;
 if(state.session!==session)return;
 voiceUrl=URL.createObjectURL(blob);voiceAudio=new Audio(voiceUrl);voiceTurn=turn.id;
 voiceAudio.onended=()=>{el('stop-audio').hidden=true;el('voice-status').textContent='Local reading finished.';};
 try{await voiceAudio.play();el('stop-audio').hidden=false;el('voice-status').textContent='MAIA’s reply is playing locally.';}
 catch{el('voice-status').textContent='Audio is ready. Choose Listen to MAIA again to play it.';}
}
el('listen').onclick=()=>act(speakCurrentReply);
el('stop-audio').onclick=()=>{stopCabinAudio();el('voice-status').textContent='Listening stopped.';};
window.addEventListener('pagehide',()=>{if(voiceRecorder){voiceRecorder.onstop=null;if(voiceRecorder.state==='recording')voiceRecorder.stop();}releaseMicrophone();stopCabinAudio();});
api('/api/voice/status').then(result=>{voiceInfo=result;refreshVoiceControls();el('voice-status').textContent=result.transcription&&result.speech?'Local recording and speech are available. Nothing is recorded until you choose Record message.':'Local voice is unavailable. Text conversation still works.';}).catch(()=>{el('voice-status').textContent='Local voice could not be checked. Text conversation still works.';});
