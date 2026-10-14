/**
 * Fixture-only client for the R20-R4 protected AF_UNIX test signer.
 * A future real signer requires independently reviewed secure transport,
 * pinning, hardware custody and authenticated member/outbox authority.
 */
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
export async function callFixtureSigner({root,request,timeoutMs=3000}) {
  if(typeof root!=='string'||!path.isAbsolute(root)||
     !root.startsWith(path.join(os.tmpdir(),'r20-r3j-fixture-r4-'))||
     !Number.isSafeInteger(timeoutMs)||timeoutMs<100||timeoutMs>10000){
    throw Error('R20-R4 signer client refuses non-fictional destination');
  }
  const socketPath=path.join(root,'signer.sock');
  const stat=await fs.lstat(socketPath);
  if(!stat.isSocket()||stat.isSymbolicLink()||
     (stat.mode&0o077)!==0) {
    throw Error('R20-R4 signer socket identity/permissions invalid');
  }
  const serialized=JSON.stringify(request)+'\n';
  if(Buffer.byteLength(serialized,'utf8')>16384)
    throw Error('R20-R4 signer request too large');
  return new Promise((resolve,reject)=>{
    const socket=net.createConnection({path:socketPath});
    let response='',done=false;
    const finish=(err,result)=>{
      if(done)return;
      done=true;
      socket.destroy();
      if(err)reject(err);
      else resolve(result);
    };
    socket.setTimeout(timeoutMs,()=>finish(
      Error('R20-R4 signer unavailable or stale')));
    socket.on('connect',()=>socket.write(serialized));
    socket.on('data',data=>{
      response+=data.toString('utf8');
      if(Buffer.byteLength(response,'utf8')>512000)
        return finish(Error('R20-R4 oversized signer reply'));
      const at=response.indexOf('\n');
      if(at!==-1){
        try{
          const packet=JSON.parse(response.slice(0,at));
          if(packet.ok===true && packet.result &&
             typeof packet.result==='object')finish(null,packet.result);
          else finish(Error('R20-R4 request refused: '+String(
            packet.refusal||'unspecified').slice(0,180)));
        }catch{finish(Error('R20-R4 malformed signer response'));}
      }
    });
    socket.on('error',e=>finish(Error('R20-R4 signer transport unavailable')));
    socket.on('end',()=>{
      if(!done)finish(Error('R20-R4 signer gave no authenticated receipt'));
    });
  });
}
