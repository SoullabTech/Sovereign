'use client';

import {useCallback,useEffect,useState} from 'react';
import {apiFetch} from '@/lib/http/apiBase';

type Manuscript={id:string;title:string|null;createdAt:string};
export default function SelfCustodyPage(){
  const [rows,setRows]=useState<Manuscript[]>([]);
  const [waiting,setWaiting]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [busy,setBusy]=useState<string|null>(null);
  const refresh=useCallback(async()=>{
    setError(null);
    try{
      const r=await apiFetch('/api/beta/custody',{cache:'no-store'});
      if(r.status===401){window.location.assign('/signin');return;}
      if(!r.ok)throw Error('Your files are temporarily unavailable.');
      const data=await r.json() as {manuscripts:Manuscript[];hasMore:boolean};
      setRows(data.manuscripts);
      if(data.hasMore)setError('More than 250 manuscripts are present; please contact support for your complete export.');
    }catch{setError('Unable to verify your writing custody. Please try again later.');}
    finally{setWaiting(false);}
  },[]);
  useEffect(()=>{void refresh();},[refresh]);

  async function exportWork(m:Manuscript){
    if(busy)return;
    setBusy(m.id);setError(null);
    try{
      const res=await apiFetch('/api/beta/custody/'+encodeURIComponent(m.id),{cache:'no-store'});
      if(!res.ok)throw Error('Could not export this writing.');
      const content=await res.text();
      const blob=new Blob([content],{type:'application/json;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const anchor=document.createElement('a');
      anchor.href=url;
      anchor.download='writer-owned-'+m.id+'.json';
      document.body.appendChild(anchor);anchor.click();anchor.remove();
      URL.revokeObjectURL(url);
    }catch{setError('The export was not completed. Please try again.');}
    finally{setBusy(null);}
  }

  async function deleteWork(m:Manuscript){
    if(busy)return;
    const confirmation=window.prompt(
      'This deletes your live saved manuscript and original source from Studio. Backup retention is governed separately. Type DELETE MY WRITING to confirm.');
    if(confirmation!=='DELETE MY WRITING')return;
    setBusy(m.id);setError(null);
    try{
      const res=await apiFetch('/api/beta/custody/'+encodeURIComponent(m.id),{
        method:'DELETE',headers:{'content-type':'application/json'},
        body:JSON.stringify({confirmation,manuscriptId:m.id}),
      });
      const result=await res.json() as {removed?:boolean;originalBytesDestroyed?:boolean};
      if(!res.ok||result.removed!==true||result.originalBytesDestroyed!==true){
        throw Error('The complete deletion has not yet been verified.');
      }
      await refresh();
    }catch{
      setError('Complete deletion could not be verified. Please contact support before treating the original as gone.');
    }finally{setBusy(null);}
  }

  return <main className="min-h-screen bg-[#f5f2ea] px-6 py-14 text-[#292c30]">
    <section className="mx-auto max-w-2xl rounded-2xl border border-[#dad6cc] bg-[#fffefb] px-7 py-9">
      <p className="text-xs uppercase tracking-[0.18em] text-[#637078]">Soullab · Writer’s Studio</p>
      <h1 className="mt-4 font-serif text-3xl">Your writing, in your care</h1>
      <p className="mt-5 leading-7">
        Even after you withdraw from the beta, you may download or request deletion
        of your own writing. This room does not reopen MAIA or Studio editing.
      </p>
      <p className="mt-3 text-sm leading-6 text-[#626568]">
        The download is a portable JSON copy of the current saved draft and source text.
        It is not a replacement for the original Word or PDF file.
      </p>
      {waiting&&<p role="status" className="mt-8">Checking your saved writing…</p>}
      {error&&<p role="alert" className="mt-6 text-[#8a3933]">{error}</p>}
      {!waiting&&rows.length===0&&<p className="mt-8">There is no saved writing under this account.</p>}
      <div className="mt-8 space-y-4">
        {rows.map(m=><article key={m.id} className="rounded-xl border border-[#d9d3c8] p-5">
          <h2 className="font-serif text-xl">{m.title||'Untitled manuscript'}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={busy!==null} onClick={()=>void exportWork(m)}
              className="rounded-lg bg-[#263b44] px-4 py-2 text-white disabled:opacity-50">
              Download my writing
            </button>
            <button type="button" disabled={busy!==null} onClick={()=>void deleteWork(m)}
              className="rounded-lg border border-[#b8aaa1] px-4 py-2 disabled:opacity-50">
              Delete this manuscript
            </button>
          </div>
        </article>)}
      </div>
    </section>
  </main>;
}
