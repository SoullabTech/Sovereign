#!/usr/bin/env python3
"""Bounded R1 reference-generator feasibility. Never trains or scores a learner.

The diagnostic control sample is NOT the preregistered C/N populations. Full
root selection and ordinary quotas are checked separately and explicitly.
Operational caps below frozen caps yield INCOMPLETE, never design failure.
"""
from __future__ import annotations
import argparse
from collections import Counter
from dataclasses import replace
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import platform
import subprocess
import time
from reference import *

ROOT_COUNTS={'TRAIN':1000,'VALIDATION':250,'TEST':500,'REPLICATION':500}

class OperationalCap(Exception): pass


def event(kind, **kw):
    print(json.dumps({'event':kind,**kw},ensure_ascii=False),flush=True)


def check_binding(root: Path):
    sp=root/'docs/programme/RGR-05B_SYNTHETIC_FLOW_REPRESENTATION_BENCHMARK_2026-10-07.md'
    wp=root/'docs/programme/RGR-05B_WORK_UNIT_2026-10-07.json'
    spec=sp.read_bytes();work=json.loads(wp.read_text())
    c=work['repair_r1']['contract']
    if sha256(spec).hexdigest()!=SPEC_SHA256: raise ValueError('accepted specification drift')
    cj=json.dumps(c,indent=2,ensure_ascii=False).encode()
    if sha256(cj).hexdigest()!=CONTRACT_SHA256: raise ValueError('accepted machine contract drift')
    act=work['founder_design_adjudication']
    if act['accepted_design_commit']!=DESIGN_COMMIT or act['design_disposition']!='ACCEPTED':
        raise ValueError('exact Founder acceptance absent')
    if c['roots']!=ROOT_COUNTS:raise ValueError('root quotas mismatch')
    return c


def select_roots(task, graph_budget, output):
    counts=Counter();seen=set();selected=[];valid=0
    # One GRAPH stream draws the two task-B layers sequentially. No split/root
    # exists yet: both fields are the empty string. This serialization binding
    # is recorded before execution; the frozen RNG formula and seed are intact.
    rng=Stream(5107001,task,'GRAPH')
    raw=0
    while raw<min(graph_budget,20_000_000):
        out=draw_graph(rng);raw+=1
        ret=()
        if task=='B':
            if raw>=graph_budget:break
            ret=draw_graph(rng,returning=True);raw+=1
        if not graph_qualifies(8,out,0,7) or (task=='B' and not graph_qualifies(8,ret,7,0)):continue
        valid+=1;world=World(out,ret,task=task);key=root_key(world)
        if key in seen:continue
        seen.add(key);split=split_of(key)
        if counts[split]>=ROOT_COUNTS[split]:continue
        counts[split]+=1
        selected.append({'root':key,'split':split,'world':raw_world(world),'encounter':len(selected),'raw_graph_draw':raw})
        if all(counts[k]==v for k,v in ROOT_COUNTS.items()):break
    complete=all(counts[k]==v for k,v in ROOT_COUNTS.items())
    status='ROOT_QUOTAS_MET' if complete else ('DESIGN_INFEASIBLE_UNDER_FROZEN_BUDGET' if raw>=20_000_000 else 'INCOMPLETE_OPERATIONAL_GRAPH_CAP')
    path=output/f'roots-{task}.json'
    path.write_text(json.dumps(selected,sort_keys=True,separators=(',',':'))+'\n')
    summary={'status':status,'raw_graph_draws':raw,'valid_candidates':valid,'unique_roots_seen':len(seen),'selected_counts':dict(counts),'required_counts':ROOT_COUNTS,'rng_counter':rng.counter,'root_file_sha256':sha256(path.read_bytes()).hexdigest()}
    event('root_selection',task=task,**summary)
    return selected,summary


def test_controls(task, roots, draws, output):
    """A fixed diagnostic draw budget; not C/N quota fulfillment or training data."""
    if not roots:return {'status':'NOT_RUN_NO_ROOTS'}
    rng=Stream(5107002,task,'ATTRIBUTES','DIAGNOSTIC','bounded-controls')
    perm=Stream(5107004,task,'PAIR','DIAGNOSTIC','bounded-controls')
    stats={f:Counter() for f in ('CF-1','CF-2','CF-3')+ (('CF-6',) if task=='B' else ())}
    inv=Counter();witnesses={};cross_checks=0;conservation_ticks=0
    for i in range(draws):
        rec=roots[i%len(roots)];base=load_world(rec['world'])
        w=replace(base,outbound=assign_attributes(base.outbound,rng),returning=assign_attributes(base.returning,rng),carrier=rng.below(2),pulse=4)
        a=exact_amount(w);y=int(a>=w.threshold)
        # Both rhythm orientations remain counted; no adaptive draws until a win.
        other=replace(w,pulse=5);b=exact_amount(other);z=int(b>=other.threshold)
        code=f'{y}{z}';stats['CF-2'][code]+=1
        if code not in witnesses:witnesses[code]={'root':rec['root'],'world':raw_world(w),'P4_amount':str(a),'P5_amount':str(b),'labels':code}
        if i<96:
            ref=simulate(w);ind=independent_amount(w)
            if ref.amount!=a or a!=ind:raise AssertionError('three solvers disagree')
            cross_checks+=1;conservation_ticks+=len(ref.trace)
            # This does not tune draw counts or change the target law.
            sw=coherent_carrier_swap(w);nr=node_relabel(w,perm.shuffle(range(8)));cv=coefficient_variant(w)
            for f,v in (('CF-4',sw),('CF-5',nr),('CF-7',cv)):
                if v is None:inv[f+'_ineligible']+=1;continue
                if exact_amount(v)!=a:raise AssertionError(f+' target changed')
                inv[f+'_pass']+=1
            for f in stats:
                if f=='CF-2':continue
                origin=replace(w,carrier=0) if f=='CF-1' else w
                v=counterfactual(origin,f,perm)
                if v is None:stats[f]['no_op_rejected']+=1;continue
                x0=exact_amount(origin);x1=exact_amount(v)
                stats[f][f'{int(x0>=origin.threshold)}{int(x1>=v.threshold)}']+=1
                if f in ('CF-3','CF-6'):
                    before=origin.outbound if f=='CF-3' else origin.returning
                    after=v.outbound if f=='CF-3' else v.returning
                    if sorted(e.attributes() for e in before)!=sorted(e.attributes() for e in after):raise AssertionError('tuple multiset changed')
    artifact={'task':task,'kind':'DIAGNOSTIC_NOT_PREREGISTERED_CHALLENGE_POPULATION','draws':draws,'outcome_counts':{f:dict(v) for f,v in stats.items()},'invariance_checks':dict(inv),'three_way_exact_agreements':cross_checks,'conservation_ticks_checked':conservation_ticks,'rhythm_witnesses':witnesses,'full_C_N_quotas_checked':False,'no_model_trained':True}
    (output/f'control-probe-{task}.json').write_text(json.dumps(artifact,indent=2)+'\n')
    event('control_probe',task=task,draws=draws,rhythm_counts=dict(stats['CF-2']),invariances=dict(inv))
    return artifact


def ordinary_prefix(task, roots, seconds, max_total_draws, output):
    """Build the ordinary population in fixed root encounter order.

    Stop on any frozen per-root rejection-cap failure. Never replace that root.
    An additional operational wall/draw stop is distinguished from infeasibility.
    """
    start=time.monotonic();total=0;accepted_total=0;complete=0;seen=set();counts=Counter();root_results=[]
    status='ORDINARY_QUOTAS_MET';stop=None
    with (output/f'ordinary-prefix-{task}.jsonl').open('x') as handle:
        for rec in roots:
            key=rec['root'];split=rec['split'];base=load_world(rec['world'])
            attr=Stream(5107002,task,'ATTRIBUTES',split,key)
            car=Stream(5107002,task,'CARRIER',split,key)
            pul=Stream(5107002,task,'PULSE',split,key)
            kept=Counter();raw_labels=Counter();duplicates=0;local=0
            while local<100_000 and (kept[0]<10 or kept[1]<10):
                if total>=max_total_draws or time.monotonic()-start>=seconds:
                    status='INCOMPLETE_OPERATIONAL_CAP';break
                w=replace(base,outbound=assign_attributes(base.outbound,attr),returning=assign_attributes(base.returning,attr),carrier=car.below(2),pulse=pul.below(6))
                local+=1;total+=1;amount=exact_amount(w);y=int(amount>=w.threshold);raw_labels[y]+=1
                if kept[y]>=10:continue
                sig=sha256(full_key(w).encode()).hexdigest()
                if sig in seen:duplicates+=1;continue
                seen.add(sig);kept[y]+=1;accepted_total+=1;counts[split]+=1
                handle.write(json.dumps({'root':key,'split':split,'signature':sig,'world':raw_world(w),'amount':str(amount),'label':y},separators=(',',':'))+'\n')
            row={'root':key,'split':split,'raw_draws':local,'raw_labels':dict(raw_labels),'kept':dict(kept),'duplicate_rejections':duplicates,'attributes_counter':attr.counter,'carrier_counter':car.counter,'pulse_counter':pul.counter}
            root_results.append(row)
            if kept[0]<10 or kept[1]<10:
                if local==100_000:status='DESIGN_INFEASIBLE_UNDER_FROZEN_BUDGET'
                stop=row;break
            complete+=1
            if complete%100==0:event('ordinary_progress',task=task,roots_complete=complete,raw_draws=total)
    artifact={'task':task,'status':status,'complete_roots':complete,'required_roots':2250,'raw_attribute_draws':total,'accepted_instances':accepted_total,'accepted_by_split':dict(counts),'elapsed_seconds':round(time.monotonic()-start,3),'operational_seconds_cap':seconds,'operational_total_draw_cap':max_total_draws,'frozen_per_root_draw_cap':100000,'stopping_root':stop,'root_results':root_results,'retained_prefix_not_training_authority':True}
    (output/f'ordinary-feasibility-{task}.json').write_text(json.dumps(artifact,indent=2)+'\n')
    event('ordinary_done',task=task,status=status,complete_roots=complete,draws=total,accepted=accepted_total)
    return artifact


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo',type=Path,required=True);parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--graph-budget',type=int,default=200000)
    parser.add_argument('--control-draws',type=int,default=12000)
    parser.add_argument('--ordinary-seconds',type=int,default=120)
    parser.add_argument('--ordinary-draws',type=int,default=400000)
    args=parser.parse_args()
    if not 1<=args.graph_budget<=20_000_000 or not 1<=args.control_draws<=20000 or not 1<=args.ordinary_seconds<=600 or not 1<=args.ordinary_draws<=1000000:
        raise SystemExit('outside bounded first feasibility invocation')
    c=check_binding(args.repo)
    args.output.mkdir(parents=True,exist_ok=False)
    source_dir=Path(__file__).parent
    manifest={'kind':'BOUNDED_REFERENCE_GENERATOR_FEASIBILITY','started_at':datetime.now(timezone.utc).isoformat(),'design_commit':DESIGN_COMMIT,'specification_sha256':SPEC_SHA256,'contract_sha256':CONTRACT_SHA256,'implementation_commit':subprocess.check_output(['git','-C',str(args.repo),'rev-parse','HEAD'],text=True).strip(),'source_hashes':{p.name:sha256(p.read_bytes()).hexdigest() for p in source_dir.glob('*.py')},'python':platform.python_version(),'platform':platform.platform(),'limits':{'graph_budget':args.graph_budget,'control_draws_per_task':args.control_draws,'ordinary_seconds_per_task':args.ordinary_seconds,'ordinary_draws_per_task':args.ordinary_draws},'rng_binding':'exact R1 SHA key; root prefix is literal task character followed by 64/128 adjacency bits; empty split/root before root selection; a single GRAPH stream draws B layers sequentially; CARRIER and PULSE use attribute seed with separate stream names','scope':'root selection, exact transport, invariant/control diagnostics, ordinary prefix only; full C/N quotas and evaluator calibration not executed','neural_training':False,'member_data':False,'MAIA_integration':False,'merge':False,'deploy':False}
    (args.output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    result={'manifest':manifest,'roots':{},'controls':{},'ordinary':{},'full_benchmark_feasible':False}
    try:
        selected={}
        for task in ('A','B'):
            selected[task],result['roots'][task]=select_roots(task,args.graph_budget,args.output)
            if result['roots'][task]['status']!='ROOT_QUOTAS_MET':
                result['status']=result['roots'][task]['status'];return
        for task in ('A','B'):
            result['controls'][task]=test_controls(task,selected[task],args.control_draws,args.output)
        for task in ('A','B'):
            result['ordinary'][task]=ordinary_prefix(task,selected[task],args.ordinary_seconds,args.ordinary_draws,args.output)
            if result['ordinary'][task]['status']=='DESIGN_INFEASIBLE_UNDER_FROZEN_BUDGET':
                result['status']='DESIGN_INFEASIBLE_UNDER_FROZEN_BUDGET';break
        else:result['status']='BOUNDED_CHECKS_COMPLETE_FULL_FEASIBILITY_NOT_ESTABLISHED'
    except Exception as error:
        result['status']='IMPLEMENTATION_ERROR';result['error']=repr(error);raise
    finally:
        result['ended_at']=datetime.now(timezone.utc).isoformat()
        (args.output/'feasibility.json').write_text(json.dumps(result,indent=2)+'\n')
        event('final',status=result.get('status'),evidence=str(args.output),full_benchmark_feasible=False)

if __name__=='__main__':main()
