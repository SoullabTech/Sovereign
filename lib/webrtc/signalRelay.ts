/** Local transport only; durable authority is checked by each subscriber's owner. */
import type { RoomRuntimeSession } from '../encounters/roomRuntime';
import type { RoomStopScope } from '../encounters/roomStopContract';

export type SignalMessage = {
  type: 'offer'|'answer'|'ice'|'peer-join'|'peer-present'|'peer-leave'|'connected'|'ping'|'terminal';
  from: string; to?: string; payload?: unknown;
};
export type ClientSignal = { type:'offer'|'answer'|'ice'|'peer-leave';to?:string;payload?:unknown };
export interface RelaySubscription { readonly id:number; readonly session:Readonly<RoomRuntimeSession> }
export interface RoomSignalRelay {
  subscribe(session:RoomRuntimeSession,send:(message:SignalMessage)=>void,
    authorize?:()=>Promise<boolean>):RelaySubscription;
  isCurrent(handle:RelaySubscription):boolean;
  unsubscribe(handle:RelaySubscription):void;
  publish(session:RoomRuntimeSession,message:ClientSignal):Promise<number>;
  closeRuntime(session:RoomRuntimeSession):void;
  closeScope(scope:Readonly<RoomStopScope>):void;
  size(encounterId:string):number;
}
type Entry={handle:RelaySubscription;send:(message:SignalMessage)=>void;authorize:()=>Promise<boolean>;queue:Promise<void>;active:boolean};
type Origin={kind:'live';entry:Entry}|{kind:'departed';handle:RelaySubscription};
const sameScope=(a:Readonly<RoomStopScope>,b:Readonly<RoomStopScope>)=>a.encounterId===b.encounterId
  &&a.participantId===b.participantId&&a.agreementVersion===b.agreementVersion&&a.consentGeneration===b.consentGeneration;
const sameRoom=(a:RoomRuntimeSession,b:RoomRuntimeSession)=>a.scope.encounterId===b.scope.encounterId
  &&a.scope.agreementVersion===b.scope.agreementVersion&&a.scope.consentGeneration===b.scope.consentGeneration;
function validSession(s:RoomRuntimeSession):boolean{return !!s&&!!s.scope&&s.runtimeId===s.scope.runtimeId
  &&s.peerId==='p_'+s.runtimeId&&typeof s.runtimeCredential==='string'&&s.runtimeCredential.length>0
  &&typeof s.scope.encounterId==='string'&&typeof s.scope.participantId==='string';}
export function createSignalRelay():RoomSignalRelay{
  let next=0;const rooms=new Map<string,Map<string,Entry>>();
  function entries(room:string){return rooms.get(room);}
  function current(e:Entry){return e.active&&entries(e.handle.session.scope.encounterId)?.get(e.handle.session.peerId)===e;}
  function remove(e:Entry){
    if(!current(e))return;e.active=false;const room=entries(e.handle.session.scope.encounterId)!;
    room.delete(e.handle.session.peerId);if(!room.size)rooms.delete(e.handle.session.scope.encounterId);
  }
  function currentOrigin(origin:Origin):boolean{
    if(origin.kind==='live')return current(origin.entry);
    // A departure queued before a reconnect must not close the replacement peer.
    const {session}=origin.handle;
    return !entries(session.scope.encounterId)?.has(session.peerId);
  }
  async function deliver(e:Entry,message:SignalMessage,origin:Origin):Promise<boolean>{
    let delivered=false;
    const work=e.queue.then(async()=>{
      if(!current(e)||!currentOrigin(origin))return;
      let allowed=false;try{allowed=await e.authorize();}catch{/* authority outage closes */}
      if(!current(e))return;
      if(!allowed){remove(e);return;}
      if(!currentOrigin(origin))return;
      if(origin.kind==='live'){
        // Queue waits may outlive the origin's permission or exact subscription.
        // Recheck at delivery admission; this is not an atomic network/DB fence.
        let originAllowed=false;try{originAllowed=await origin.entry.authorize();}catch{/* refuse stale origin */}
        if(!originAllowed){remove(origin.entry);return;}
      }
      if(!current(e)||!currentOrigin(origin))return;
      try{e.send(message);delivered=true;}catch{remove(e);}
    });
    e.queue=work.catch(()=>{remove(e);});await work;return delivered;
  }
  const api:RoomSignalRelay={
    subscribe(session,send,authorize=async()=>false){
      if(!validSession(session)||typeof send!=='function')throw new Error('INVALID_RELAY_SESSION');
      const frozen=Object.freeze({...session,scope:Object.freeze({...session.scope})});
      let room=entries(session.scope.encounterId);
      if(!room){room=new Map();rooms.set(session.scope.encounterId,room);}
      const existing=room.get(session.peerId);
      if(existing&&(!sameScope(existing.handle.session.scope,session.scope)||existing.handle.session.runtimeId!==session.runtimeId))
        throw new Error('RELAY_IDENTITY_CONFLICT');
      const people=new Set([...room.values()].map(e=>e.handle.session.scope.participantId));people.add(session.scope.participantId);
      if(people.size>2)throw new Error('ROOM_PARTICIPANT_LIMIT');
      if(existing)existing.active=false;
      const handle=Object.freeze({id:++next,session:frozen});
      const entry:Entry={handle,send,authorize,queue:Promise.resolve(),active:true};room.set(session.peerId,entry);
      for(const other of room.values()){
        if(other===entry||!sameRoom(other.handle.session,session)||other.handle.session.scope.participantId===session.scope.participantId)continue;
        void deliver(entry,{type:'peer-present',from:other.handle.session.peerId},{kind:'live',entry:other});
        void deliver(other,{type:'peer-join',from:session.peerId},{kind:'live',entry});
      }
      return handle;
    },
    isCurrent(handle){
      const e=entries(handle.session.scope.encounterId)?.get(handle.session.peerId);
      return !!e&&e.handle===handle&&current(e);
    },
    unsubscribe(handle){
      const e=entries(handle.session.scope.encounterId)?.get(handle.session.peerId);
      if(!e||e.handle!==handle)return;remove(e);
      for(const other of entries(handle.session.scope.encounterId)?.values()??[])
        if(sameRoom(other.handle.session,handle.session)&&other.handle.session.scope.participantId!==handle.session.scope.participantId)
          void deliver(other,{type:'peer-leave',from:handle.session.peerId},{kind:'departed',handle});
    },
    async publish(session,message){
      if(!validSession(session)||!message||!['offer','answer','ice','peer-leave'].includes(message.type)
        ||Object.keys(message).some(k=>!['type','to','payload'].includes(k))
        ||(message.to!==undefined&&(typeof message.to!=='string'||message.to.length>200)))
        throw new Error('INVALID_CLIENT_SIGNAL');
      const room=entries(session.scope.encounterId),sender=room?.get(session.peerId);
      if(!sender||!current(sender)||!sameScope(sender.handle.session.scope,session.scope)
        ||sender.handle.session.runtimeCredential!==session.runtimeCredential)throw new Error('UNBOUND_SIGNAL_SENDER');
      let senderAllowed=false;try{senderAllowed=await sender.authorize();}catch{/* outage refuses and removes */}
      if(!senderAllowed||!current(sender)){remove(sender);throw new Error('SIGNAL_SENDER_REFUSED');}
      const recipients=[...room!.values()].filter(e=>e!==sender&&sameRoom(e.handle.session,session)
        &&e.handle.session.scope.participantId!==session.scope.participantId
        &&(message.to===undefined||e.handle.session.peerId===message.to));
      if(message.to!==undefined&&recipients.length!==1)throw new Error('SIGNAL_RECIPIENT_REFUSED');
      const clean:SignalMessage={type:message.type,from:session.peerId};
      if(message.to!==undefined)clean.to=message.to;if(message.payload!==undefined)clean.payload=message.payload;
      const delivered=await Promise.all(recipients.map(e=>deliver(e,clean,{kind:'live',entry:sender})));
      return delivered.filter(Boolean).length;
    },
    closeRuntime(session){const e=entries(session.scope.encounterId)?.get(session.peerId);if(e&&sameScope(e.handle.session.scope,session.scope))remove(e);},
    closeScope(scope){for(const e of [...(entries(scope.encounterId)?.values()??[])])if(sameScope(e.handle.session.scope,scope))remove(e);},
    size(encounterId){return entries(encounterId)?.size??0;},
  };return Object.freeze(api);
}
