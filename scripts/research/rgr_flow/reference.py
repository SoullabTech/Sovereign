"""Research-only exact reference for accepted RGR-FLOW-SFRB-01-R1.

No models, member data, network, environment credentials or application imports.
The queue simulator and DAG impulse solver use independent update organizations.
"""
from __future__ import annotations

from dataclasses import dataclass, replace
from fractions import Fraction as F
from hashlib import sha256
from itertools import permutations, product
import json
from typing import Iterable

DESIGN_COMMIT = 'f6f9c7cb02bfa47a36cc4b143b66a99f1d441ebf'
SPEC_SHA256 = '16df2b04c769e94adff6147c81177c9698a5d6a1878b29920181aeb36fde1567'
CONTRACT_SHA256 = '1f3d376d5b360817bfd441b160fcfbb894aeb9104ea09619da1540ff72e14d92'
PULSES = (
    (F(1),F(0),F(0),F(0)), (F(1,2),F(1,2),F(0),F(0)),
    (F(1,2),F(0),F(1,2),F(0)), (F(1,4),)*4,
    (F(1,2),F(0),F(0),F(1,2)), (F(0),F(1,2),F(1,2),F(0)),
)
P = (F(0), F(1,2), F(1))
C = (F(1,4),F(1,2),F(3,4),F(1))
R = (F(0),F(1,4),F(1,2))
ATTRS = tuple(product(P,P,C,R,(1,2,3)))
ZERO = F(0)

@dataclass(frozen=True)
class Edge:
    u: int
    v: int
    p0: F = F(1)
    p1: F = F(1)
    c: F = F(1)
    r: F = F(0)
    delay: int = 1

    def __post_init__(self):
        for key in ('p0','p1','c','r'):
            value = F(getattr(self,key))
            object.__setattr__(self,key,value)
        if self.p0 not in P or self.p1 not in P or self.c not in C or self.r not in R:
            raise ValueError('attribute outside frozen R1 vocabulary')
        if type(self.delay) is not int or self.delay not in (1,2,3):
            raise ValueError('delay outside frozen R1 vocabulary')
        if type(self.u) is not int or type(self.v) is not int or self.u == self.v:
            raise ValueError('invalid endpoint')

    def a(self, carrier: int) -> F:
        if carrier not in (0,1): raise ValueError('carrier must be 0 or 1')
        return (self.p0 if carrier == 0 else self.p1) * self.c * (1-self.r)

    def attributes(self) -> tuple:
        return (self.p0,self.p1,self.c,self.r,self.delay)

    def effective(self) -> tuple:
        return self.a(0),self.a(1),self.delay

    def with_attributes(self, attributes: tuple) -> 'Edge':
        return Edge(self.u,self.v,*attributes)


def topological_order(n: int, edges: tuple[Edge,...]) -> tuple[int,...]:
    indegree=[0]*n; outgoing=[[] for _ in range(n)]
    seen=set()
    for e in edges:
        if not 0 <= e.u < n or not 0 <= e.v < n or (e.u,e.v) in seen:
            raise ValueError('invalid graph or duplicate edge')
        seen.add((e.u,e.v)); indegree[e.v]+=1; outgoing[e.u].append(e.v)
    ready=sorted(i for i in range(n) if indegree[i]==0); order=[]
    while ready:
        u=ready.pop(0); order.append(u)
        for v in outgoing[u]:
            indegree[v]-=1
            if indegree[v]==0: ready.append(v); ready.sort()
    if len(order)!=n: raise ValueError('graph is not a DAG')
    return tuple(order)


def graph_qualifies(n: int, edges: tuple[Edge,...], source: int, sink: int) -> bool:
    if n!=8 or len(edges)!=10 or source==sink: return False
    try: order=topological_order(n,edges)
    except ValueError: return False
    if any(e.v==source or e.u==sink for e in edges): return False
    und=[set() for _ in range(n)]; out=[[] for _ in range(n)]
    for e in edges: und[e.u].add(e.v);und[e.v].add(e.u);out[e.u].append(e.v)
    reached={source}; todo=[source]
    while todo:
        for v in und[todo.pop()]:
            if v not in reached: reached.add(v);todo.append(v)
    if len(reached)!=n: return False
    paths=[0]*n;paths[source]=1
    for u in order:
        for v in out[u]: paths[v]+=paths[u]
    if paths[sink]<2: return False
    toward={sink}
    for u in reversed(order):
        if any(v in toward for v in out[u]): toward.add(u)
    distractors=sum(not (paths[e.u]>0 and e.v in toward) for e in edges)
    return distractors>=2

@dataclass(frozen=True)
class World:
    outbound: tuple[Edge,...]
    returning: tuple[Edge,...] = ()
    carrier: int = 0
    pulse: int = 0
    source: int = 0
    sink: int = 7
    n: int = 8
    task: str = 'A'

    def __post_init__(self):
        if self.task not in ('A','B') or self.carrier not in (0,1) or self.pulse not in range(6):
            raise ValueError('invalid task, carrier or pulse')
        if type(self.n) is not int or not 2<=self.n<=8 or not 0<=self.source<self.n or not 0<=self.sink<self.n or self.source==self.sink:
            raise ValueError('invalid node count or roles')
        topological_order(self.n,self.outbound)
        if self.task=='B':
            if not self.returning: raise ValueError('Task B requires a return graph')
            topological_order(self.n,self.returning)
        elif self.returning: raise ValueError('Task A cannot have return edges')
        for edges,s,t in ((self.outbound,self.source,self.sink), (self.returning,self.sink,self.source)):
            if any(e.v==s or e.u==t for e in edges): raise ValueError('terminal/source role violation')

    @property
    def horizon(self) -> int: return 10 if self.task=='A' else 18
    @property
    def threshold(self) -> F: return F(3,5) if self.task=='A' else F(3,10)

    def qualifies(self) -> bool:
        return graph_qualifies(self.n,self.outbound,self.source,self.sink) and (self.task=='A' or graph_qualifies(self.n,self.returning,self.sink,self.source))

@dataclass(frozen=True)
class Result:
    amount: F
    label: int
    trace: tuple[dict,...]


def simulate(world: World) -> Result:
    """Exact synchronous queue simulator; audit conservation at every tick."""
    layers=(world.outbound,) if world.task=='A' else (world.outbound,world.returning)
    terminals=(world.sink,) if world.task=='A' else (world.sink,world.source)
    stocks=[[ZERO]*world.n for _ in layers]
    queues: list[dict[int,list[tuple[int,F]]]]=[{} for _ in layers]
    turn: dict[int,F]={}; absorbed=ZERO;loss=ZERO;injected=ZERO;trace=[]
    weights=[]
    for edges in layers:
        sums=[ZERO]*world.n
        for e in edges: sums[e.u]+=e.a(world.carrier)
        weights.append(tuple(e.a(world.carrier)/max(F(1),sums[e.u]) for e in edges))
    for tick in range(world.horizon+1):
        for layer in range(len(layers)):
            for v,q in queues[layer].pop(tick,[]):
                if v==terminals[layer]:
                    if world.task=='B' and layer==0:
                        loss+=q/4;turn[tick+1]=turn.get(tick+1,ZERO)+3*q/4
                    else: absorbed+=q
                else: stocks[layer][v]+=q
        if world.task=='B': stocks[1][world.sink]+=turn.pop(tick,ZERO)
        pulse=PULSES[world.pulse][tick] if tick<4 else ZERO
        stocks[0][world.source]+=pulse;injected+=pulse
        if tick<world.horizon:
            for layer,edges in enumerate(layers):
                snapshot=stocks[layer].copy()
                for e,w in zip(edges,weights[layer]):
                    q=snapshot[e.u]*w
                    if q:
                        stocks[layer][e.u]-=q
                        queues[layer].setdefault(tick+e.delay,[]).append((e.v,q))
        stock=sum((sum(s,ZERO) for s in stocks),ZERO)
        transit=sum((q for queue in queues for due in queue.values() for _,q in due),ZERO)
        pending=sum(turn.values(),ZERO)
        if min((q for layer in stocks for q in layer),default=ZERO)<0: raise AssertionError('negative stock')
        if injected!=stock+transit+pending+loss+absorbed: raise AssertionError('mass conservation violated')
        trace.append({'tick':tick,'injected':injected,'stock':stock,'transit':transit,'turnaround':pending,'loss':loss,'absorbed':absorbed})
    return Result(absorbed,int(absorbed>=world.threshold),tuple(trace))


def layer_delivery(n: int, edges: tuple[Edge,...], source: int, sink: int,
                   injections: tuple[F,...], carrier: int, horizon: int) -> tuple[F,...]:
    """Independent DAG-first dynamic program, no event queues or mutable node vector.

    For each node, finish its entire time series before any successor's series.
    Self-retention is a geometric holding process; downstream arrivals have delays.
    """
    arrivals=[[ZERO]*(horizon+1) for _ in range(n)]
    arrivals[source][:len(injections)]=injections
    out=[[] for _ in range(n)]
    for e in edges: out[e.u].append(e)
    for u in topological_order(n,edges):
        if u==sink: continue
        total=sum((e.a(carrier) for e in out[u]),ZERO)
        denom=max(F(1),total);hold=1-total/denom;residual=ZERO
        for tick in range(horizon+1):
            available=residual+arrivals[u][tick]
            if tick==horizon: break
            for e in out[u]:
                if tick+e.delay<=horizon:
                    arrivals[e.v][tick+e.delay]+=available*e.a(carrier)/denom
            residual=available*hold
    return tuple(arrivals[sink])


def independent_amount(world: World) -> F:
    h=world.horizon
    arrivals=layer_delivery(world.n,world.outbound,world.source,world.sink,PULSES[world.pulse],world.carrier,h)
    if world.task=='A': return sum(arrivals,ZERO)
    injections=(ZERO,)+tuple(3*x/4 for x in arrivals[:-1])
    return sum(layer_delivery(world.n,world.returning,world.sink,world.source,injections,world.carrier,h),ZERO)


class Stream:
    """Frozen SHA-256/unsigned64/rejection RNG. No Python random dependency."""
    def __init__(self, seed: int, task: str, stream: str, split: str='', root: str=''):
        self.prefix=f'SFRB01R1|{seed}|{task}|{stream}|{split}|{root}|'
        self.counter=0

    def below(self, n: int) -> int:
        if type(n) is not int or not 1<=n<=2**64: raise ValueError('invalid choice bound')
        limit=(2**64//n)*n
        while True:
            x=int.from_bytes(sha256((self.prefix+str(self.counter)).encode()).digest()[:8],'big');self.counter+=1
            if x<limit: return x%n

    def shuffle(self, values: Iterable) -> tuple:
        a=list(values)
        for i in range(len(a)-1,0,-1):
            j=self.below(i+1);a[i],a[j]=a[j],a[i]
        return tuple(a)


def draw_graph(stream: Stream, returning: bool=False) -> tuple[Edge,...]:
    order=tuple(reversed(range(8))) if returning else tuple(range(8))
    pairs=[(order[u],order[v]) for u in range(8) for v in range(u+1,8)]
    return tuple(Edge(u,v) for u,v in sorted(stream.shuffle(pairs)[:10]))


def assign_attributes(edges: tuple[Edge,...], stream: Stream) -> tuple[Edge,...]:
    return tuple(e.with_attributes(ATTRS[stream.below(len(ATTRS))]) for e in edges)


def mappings(world: World):
    # Exact lexicographic pruning: row zero is the source row. Its zero
    # internal destinations must precede its one destinations in a minimum.
    # All permutations within those two groups remain; no isomorphism is lost.
    neighbors={e.v for e in world.outbound if e.u==world.source}
    others=[v for v in range(world.n) if v not in (world.source,world.sink)]
    zero=[v for v in others if v not in neighbors]
    one=[v for v in others if v in neighbors]
    for z in permutations(zero):
        for o in permutations(one):
            p=[0]*world.n;p[world.source]=0;p[world.sink]=world.n-1
            for new,old in enumerate(z+o,1): p[old]=new
            yield tuple(p)


def topology_integer(world: World, p: tuple[int,...]) -> int:
    answer=0
    for layer in ((world.outbound,) if world.task=='A' else (world.outbound,world.returning)):
        bits=0
        for e in layer: bits |= 1 << (world.n*world.n-1-world.n*p[e.u]-p[e.v])
        answer=(answer << (world.n*world.n))|bits
    return answer


def root_key(world: World) -> str:
    size=world.n*world.n*(1 if world.task=='A' else 2)
    return world.task+format(min(topology_integer(world,p) for p in mappings(world)),f'0{size}b')


def split_of(root: str) -> str:
    bucket=int.from_bytes(sha256(('SFRB01R1|split|'+root).encode()).digest(),'big')%100
    return 'TRAIN' if bucket<60 else 'VALIDATION' if bucket<75 else 'TEST' if bucket<90 else 'REPLICATION'


def full_key(world: World) -> str:
    """Canonical equivalence: role-fixed node permutation + coherent carrier swap
    + edgewise effective-coefficient equivalence. Raw c/r names do not affect key.
    """
    perms=list(mappings(world)); scores=[topology_integer(world,p) for p in perms];minimum=min(scores)
    candidates=[]
    for p,score in zip(perms,scores):
        if score!=minimum: continue
        for swap in (False,True):
            layers=[]
            for edges in ((world.outbound,) if world.task=='A' else (world.outbound,world.returning)):
                rows=[]
                for e in edges:
                    a0,a1,d=e.effective()
                    if swap: a0,a1=a1,a0
                    rows.append((p[e.u],p[e.v],str(a0),str(a1),d))
                layers.append(sorted(rows))
            candidates.append(json.dumps([world.task,world.n,world.pulse,world.carrier^swap,layers],separators=(',',':')))
    return min(candidates)


def node_relabel(world: World, mapping: tuple[int,...]) -> World:
    if sorted(mapping)!=list(range(world.n)): raise ValueError('not a permutation')
    def apply(edges): return tuple(replace(e,u=mapping[e.u],v=mapping[e.v]) for e in edges)
    return replace(world,outbound=apply(world.outbound),returning=apply(world.returning),source=mapping[world.source],sink=mapping[world.sink])


def coherent_carrier_swap(world: World) -> World:
    def apply(edges): return tuple(replace(e,p0=e.p1,p1=e.p0) for e in edges)
    return replace(world,carrier=1-world.carrier,outbound=apply(world.outbound),returning=apply(world.returning))


_EQUIV: dict[tuple,tuple] = {}
for _attrs in ATTRS:
    _e=Edge(0,1,*_attrs)
    _EQUIV.setdefault(_e.effective(),[]).append(_attrs)
_EQUIV={key:tuple(sorted(value)) for key,value in _EQUIV.items()}


def coefficient_variant(world: World) -> World | None:
    changed=False
    def apply(edges):
        nonlocal changed
        result=[]
        for e in edges:
            group=_EQUIV[e.effective()]
            new=group[(group.index(e.attributes())+1)%len(group)]
            changed |= new!=e.attributes();result.append(e.with_attributes(new))
        return tuple(result)
    outbound=apply(world.outbound);returning=apply(world.returning)
    return replace(world,outbound=outbound,returning=returning) if changed else None


def counterfactual(world: World, family: str, stream: Stream) -> World | None:
    if family=='CF-1': return replace(world,carrier=1-world.carrier)
    if family=='CF-2':
        if world.pulse not in (4,5): raise ValueError('CF-2 is P4/P5 only')
        return replace(world,pulse=9-world.pulse)
    if family not in ('CF-3','CF-6') or (family=='CF-6' and world.task!='B'): raise ValueError('invalid counterfactual')
    edges=world.outbound if family=='CF-3' else world.returning
    attrs=stream.shuffle(tuple(e.attributes() for e in edges))
    new=tuple(e.with_attributes(a) for e,a in zip(edges,attrs))
    if new==edges: return None
    return replace(world,**{'outbound' if family=='CF-3' else 'returning':new})


def raw_world(world: World) -> dict:
    def rows(edges): return [[e.u,e.v,*[str(x) for x in e.attributes()]] for e in edges]
    return {'task':world.task,'n':world.n,'source':world.source,'sink':world.sink,'carrier':world.carrier,'pulse':world.pulse,'outbound':rows(world.outbound),'returning':rows(world.returning)}


def load_world(obj: dict) -> World:
    def edges(rows): return tuple(Edge(int(row[0]),int(row[1]),*(F(x) for x in row[2:6]),int(row[6])) for row in rows)
    return World(edges(obj['outbound']),edges(obj.get('returning',[])),int(obj['carrier']),int(obj['pulse']),int(obj['source']),int(obj['sink']),int(obj['n']),obj['task'])


def exact_amount(world: World) -> F:
    """Accelerated exact rational solver using an integer common denominator.

    All masses at tick t are integer numerators over 4*L**t. L is a
    multiple of four and every dispatch-weight denominator. This is not
    a floating-point approximation and never uses a threshold tolerance.
    """
    from math import lcm
    layers=(world.outbound,) if world.task=='A' else (world.outbound,world.returning)
    weights=[];L=4
    for edges in layers:
        sums=[ZERO]*world.n
        for e in edges: sums[e.u]+=e.a(world.carrier)
        w=tuple(e.a(world.carrier)/max(F(1),sums[e.u]) for e in edges)
        weights.append(w)
        for x in w:L=lcm(L,x.denominator)
    h=world.horizon;powers=[L**i for i in range(h+1)]
    def solve(edges,w,source,sink,inject):
        arrivals=[[0]*(h+1) for _ in range(world.n)];arrivals[source]=list(inject)
        out=[[] for _ in range(world.n)]
        for e,b in zip(edges,w):out[e.u].append((e.v,e.delay,b.numerator*(L//b.denominator)))
        for u in topological_order(world.n,edges):
            if u==sink:continue
            hold=L-sum(b for _,_,b in out[u]);residual=0
            for t in range(h):
                available=residual+arrivals[u][t]
                if available:
                    for v,d,b in out[u]:
                        if t+d<=h:arrivals[v][t+d]+=available*b*powers[d-1]
                residual=available*hold
        return arrivals[sink]
    injection=[0]*(h+1)
    for t,pulse in enumerate(PULSES[world.pulse]):injection[t]=pulse.numerator*(4*powers[t]//pulse.denominator)
    a=solve(layers[0],weights[0],world.source,world.sink,injection)
    if world.task=='B':
        a=solve(layers[1],weights[1],world.sink,world.source,[0]+[x*(3*L//4) for x in a[:-1]])
    return F(sum(x*powers[h-t] for t,x in enumerate(a)),4*powers[h])
