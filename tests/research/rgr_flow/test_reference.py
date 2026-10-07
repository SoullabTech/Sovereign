"""Finite generator/transport tests, not neural benchmark or empirical validation."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[3]/'scripts/research/rgr_flow'))
import unittest
from fractions import Fraction as F
from dataclasses import replace
from itertools import permutations
from reference import *


def qualifying():
    return tuple(Edge(u,v) for u,v in ((0,1),(1,7),(0,2),(2,7),(0,3),(3,4),(0,5),(5,6),(1,2),(3,6)))


class Transport(unittest.TestCase):
    def compare(self,w):
        a=simulate(w);self.assertEqual(a.amount,independent_amount(w));self.assertEqual(a.amount,exact_amount(w))
        for row in a.trace:
            self.assertEqual(row['injected'],sum(row[k] for k in ('stock','transit','turnaround','loss','absorbed')))
        return a

    def test_absorbing_delivery(self):
        r=self.compare(World((Edge(0,1),),n=2,sink=1));self.assertEqual(r.amount,1)
        self.assertEqual(r.trace[0]['absorbed'],0);self.assertEqual(r.trace[1]['absorbed'],1)

    def test_delay(self):
        r=self.compare(World((Edge(0,1,delay=3),),n=2,sink=1))
        self.assertEqual(r.trace[2]['absorbed'],0);self.assertEqual(r.trace[3]['absorbed'],1)

    def test_dead_route(self):
        r=self.compare(World((Edge(0,1,p0=0),),n=2,sink=1))
        self.assertEqual(r.amount,0);self.assertEqual(r.trace[-1]['stock'],1)

    def test_retained_quantity(self):
        r=self.compare(World((Edge(0,1,c=F(1,2)),),n=2,sink=1))
        self.assertEqual(r.amount,1-F(1,1024))

    def test_simultaneous_dispatch(self):
        w=World((Edge(0,1),Edge(0,2)),n=3,sink=1)
        r=self.compare(w);self.assertEqual(r.amount,F(1,2));self.assertEqual(r.trace[-1]['stock'],F(1,2))

    def test_threshold_equality_A(self):
        w=World((Edge(0,1,c=F(3,4)),Edge(0,2,c=F(1,2))),n=3,sink=1)
        r=self.compare(w);self.assertEqual(r.amount,F(3,5));self.assertEqual(r.label,1)

    def test_threshold_equality_B(self):
        w=World((Edge(0,1,c=F(1,2)),Edge(0,2,c=F(3,4))), (Edge(1,0),),n=3,sink=1,task='B')
        r=self.compare(w);self.assertEqual(r.amount,F(3,10));self.assertEqual(r.label,1)

    def test_return_turnaround_once(self):
        w=World((Edge(0,1,delay=2),),(Edge(1,0,delay=2),),n=2,sink=1,task='B')
        r=self.compare(w);self.assertEqual(r.amount,F(3,4));self.assertEqual(r.trace[-1]['loss'],F(1,4))
        self.assertEqual(r.trace[4]['absorbed'],0);self.assertEqual(r.trace[5]['absorbed'],F(3,4))
        self.assertEqual(r.trace[2]['turnaround'],F(3,4))

    def test_outbound_continues_past_ten(self):
        w=World(tuple(Edge(i,i+1,delay=3) for i in range(4)),(Edge(4,0),),n=5,sink=4,task='B')
        r=self.compare(w);self.assertEqual(r.trace[13]['absorbed'],0);self.assertEqual(r.trace[14]['absorbed'],F(3,4))

    def test_inclusive_horizon(self):
        e=(Edge(0,1,delay=3),Edge(1,2,delay=3),Edge(2,3,delay=3),Edge(3,4))
        r=self.compare(World(e,n=5,sink=4));self.assertEqual(r.amount,1)
        late=self.compare(World(tuple(replace(x,delay=2) if x.u==3 else x for x in e),n=5,sink=4))
        self.assertEqual(late.amount,0);self.assertEqual(late.trace[-1]['transit'],1)

    def test_turnaround_pending_at_horizon(self):
        e=tuple(Edge(i,i+1,delay=3) for i in range(6))
        r=self.compare(World(e,(Edge(6,0),),n=7,sink=6,task='B'))
        self.assertEqual(r.amount,0);self.assertEqual(r.trace[-1]['turnaround'],F(3,4));self.assertEqual(r.trace[-1]['loss'],F(1,4))

    def test_pulses_and_carriers(self):
        for pulse in range(6):
            for carrier in (0,1):
                r=self.compare(World((Edge(0,1,p0=0,p1=1),),n=2,sink=1,pulse=pulse,carrier=carrier))
                self.assertEqual(r.amount,carrier)

    def test_cross_method_generated_fixtures(self):
        # Authored validation stream, explicitly not the frozen data stream.
        rng=Stream(17,'A','VALIDATION_FIXTURE')
        for i in range(24):
            out=assign_attributes(qualifying(),rng)
            ret=tuple(replace(e,u=7-e.u,v=7-e.v) for e in assign_attributes(qualifying(),rng))
            for task in ('A','B'):
                self.compare(World(out,ret if task=='B' else (),i%2,i%6,task=task))

class Contracts(unittest.TestCase):
    def test_reject_bad_attributes(self):
        for kwargs in ({'delay':0},{'delay':1.5},{'c':F(1,3)},{'p0':-1},{'r':2}):
            with self.assertRaises(ValueError): Edge(0,1,**kwargs)

    def test_reject_bad_graph(self):
        for edges in ((Edge(0,1),Edge(1,0)),(Edge(0,1),Edge(0,1))):
            with self.assertRaises(ValueError): World(edges,n=2,sink=1)

    def test_reject_bad_role_and_task(self):
        with self.assertRaises(ValueError): World((Edge(0,1),),n=2,sink=1,task='B')
        with self.assertRaises(ValueError): World((Edge(0,1),),n=2,sink=1,carrier=3)

    def test_qualified_graph(self):
        self.assertTrue(World(qualifying()).qualifies())
        self.assertFalse(World(qualifying()[:-1]).qualifies())
        direct=tuple(Edge(u,v) for u,v in ((0,1),(1,7),(0,2),(2,7),(0,3),(3,7),(0,4),(4,7),(0,5),(5,7)))
        self.assertFalse(World(direct).qualifies())

    def test_rng_reproducibility(self):
        a=Stream(5107001,'A','GRAPH');b=Stream(5107001,'A','GRAPH')
        self.assertEqual([a.below(28) for _ in range(100)],[b.below(28) for _ in range(100)])
        self.assertNotEqual(Stream(1,'A','GRAPH').prefix,Stream(1,'A','ATTRIBUTES').prefix)

    def test_root_invariance(self):
        w=World(qualifying());p=(6,2,3,1,5,7,0,4)
        self.assertEqual(root_key(w),root_key(node_relabel(w,p)))
        self.assertEqual(split_of(root_key(w)),split_of(root_key(node_relabel(w,p))))

    def test_root_pruning_matches_exhaustive(self):
        # Independent unpruned enumeration of all 720 internal-node permutations.
        for edges in (qualifying(),tuple(Edge(7-e.u,7-e.v) for e in qualifying())):
            w=World(edges,source=0 if edges[0].u==0 else 7,sink=7 if edges[0].u==0 else 0)
            scores=[]
            for imgs in permutations(range(1,7)):
                p=[0]*8;p[w.source]=0;p[w.sink]=7
                for old,new in zip([v for v in range(8) if v not in (w.source,w.sink)],imgs):p[old]=new
                bits=['0']*64
                for e in edges:bits[8*p[e.u]+p[e.v]]='1'
                scores.append(''.join(bits))
            self.assertEqual(root_key(w),'A'+min(scores))

    def test_full_equivalence_key(self):
        w=World(assign_attributes(qualifying(),Stream(7,'A','FIXTURE')))
        k=full_key(w)
        self.assertEqual(k,full_key(node_relabel(w,(6,2,3,1,5,7,0,4))))
        self.assertEqual(k,full_key(coherent_carrier_swap(w)))
        cf=coefficient_variant(w)
        if cf: self.assertEqual(k,full_key(cf))

    def test_cf7_non_equal_channels(self):
        w=World((Edge(0,1,p0=F(1,2),p1=1,c=F(1,2)),),n=2,sink=1)
        other=coefficient_variant(w);self.assertIsNotNone(other)
        self.assertNotEqual(w,other);self.assertEqual(w.outbound[0].effective(),other.outbound[0].effective())
        self.assertEqual(simulate(w).amount,simulate(other).amount)

    def test_cf7_all_tuples(self):
        for attrs in ATTRS:
            w=World((Edge(0,1,*attrs),),n=2,sink=1);other=coefficient_variant(w)
            if other:self.assertEqual(w.outbound[0].effective(),other.outbound[0].effective())

    def test_coherent_carrier_amount(self):
        w=World(assign_attributes(qualifying(),Stream(29,'A','FIXTURE')))
        self.assertEqual(simulate(w).amount,simulate(coherent_carrier_swap(w)).amount)

    def test_counterfactual_preserves_marginals(self):
        w=World(assign_attributes(qualifying(),Stream(3,'A','FIXTURE')))
        other=counterfactual(w,'CF-3',Stream(4,'A','FIXTURE'))
        self.assertIsNotNone(other)
        self.assertEqual(sorted(e.attributes() for e in w.outbound),sorted(e.attributes() for e in other.outbound))
        self.assertEqual(root_key(w),root_key(other))

    def test_rhythm_crosses_and_same_mean(self):
        a,b=PULSES[4:6]
        self.assertEqual(sum(a),sum(b));self.assertEqual(sum(i*x for i,x in enumerate(a)),sum(i*x for i,x in enumerate(b)))
        self.assertTrue(any(sum(a[:i])-sum(b[:i])>0 for i in range(1,5)))
        self.assertTrue(any(sum(a[:i])-sum(b[:i])<0 for i in range(1,5)))

    def test_serialization(self):
        w=World(assign_attributes(qualifying(),Stream(7,'A','FIXTURE')))
        self.assertEqual(w,load_world(json.loads(json.dumps(raw_world(w)))))

if __name__=='__main__': unittest.main(verbosity=2)
