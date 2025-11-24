"use client";
import { useEffect, useState } from "react";

type Appraisal = { optionId:string; valence:number; urgencyBias:number; expectedUtility:number }
type Out = { next:any; appraisals:Appraisal[]; chosen:{ optionId:string }|null };

export default function PsiDebug() {
  const [enabled,setEnabled] = useState<boolean>(false);
  const [status,setStatus] = useState<any>(null);
  const [out,setOut] = useState<Out|null>(null);
  const base = "";

  const loadStatus = async()=> {
    const r = await fetch(`${base}/api/psi/status`, { cache: "no-store" });
    if (r.ok) setStatus(await r.json());
  };

  useEffect(()=>{
    fetch(`${base}/api/psi/enabled`).then(r=>r.json()).then(j=>setEnabled(j.enabled));
    loadStatus();
  },[]);

  const reset = async()=> {
    const r = await fetch(`${base}/api/psi/reset`,{ method:"POST" });
    if(r.ok){ setOut(null); await loadStatus(); }
  };
  const step = async()=> {
    const r = await fetch(`${base}/api/psi/step`,{ method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({}) });
    if(r.ok){ setOut(await r.json()); await loadStatus(); }
  };
  const toggleLearning = async()=> {
    if(!status) return;
    const next = !status.runtime?.learning?.enabled;
    const r = await fetch(`${base}/api/psi/config`,{
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({ learning: { enabled: next } })
    });
    if(r.ok){ await loadStatus(); }
  };

  const learningOn = !!status?.runtime?.learning?.enabled;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">PSI-lite Debug</h2>
      <p className="text-sm text-gray-600">Enabled: <b>{String(enabled)}</b></p>
      {!enabled && <p className="text-amber-600 text-sm">Set <code>PSI_LITE_ENABLED=true</code> and restart.</p>}

      <div className="flex items-center gap-3">
        <button onClick={reset} className="px-3 py-1.5 rounded-xl bg-gray-900 text-white">Reset</button>
        <button onClick={step} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white">Step</button>
        <button onClick={toggleLearning} className="px-3 py-1.5 rounded-xl bg-slate-700 text-white">
          {learningOn ? "Learning: ON (click to turn OFF)" : "Learning: OFF (click to turn ON)"}
        </button>
      </div>

      {status && (
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm text-gray-500">Tick: <b>{status.tick}</b> • Mood: <b>{status.mood.toFixed?.(2) ?? status.mood}</b> • Arousal: <b>{status.arousal.toFixed?.(2) ?? status.arousal}</b></div>
          <div className="text-sm">Learning: <b>{String(status.runtime?.learning?.enabled)}</b> • rate={status.runtime?.learning?.rate}</div>
          <div className="text-sm font-medium">Needs</div>
          <ul className="text-sm space-y-1">
            {status.needs?.map((n:any)=>(
              <li key={n.id} className="flex justify-between">
                <span>{n.label} (lvl {n.level.toFixed?.(2)})</span>
                <span className="tabular-nums">urg {n.urgency.toFixed?.(2)} • wt {n.weight.toFixed?.(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {out && (
        <div className="rounded-2xl border p-4 space-y-2">
          <div className="text-sm text-gray-500">Chosen: <b>{out.chosen?.optionId ?? "none"}</b></div>
          <div className="text-sm">Appraisals:</div>
          <ul className="text-sm space-y-1">
            {out.appraisals.map(a=>(
              <li key={a.optionId} className="flex justify-between">
                <span>{a.optionId}</span>
                <span className="tabular-nums">U={a.expectedUtility.toFixed(3)} • V={a.valence.toFixed(3)} • B={a.urgencyBias.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}