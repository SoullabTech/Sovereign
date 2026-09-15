// Is the falsifier LETHAL? Build the two wrong implementations the architectural
// obligation exists to exclude, and confirm each dies on its named probe.
import { recoverDisplacedExchanges, type DisplacedExchange } from '../../../lib/maia/continuity/sessionRecovery';
const F=[['How is the writing going today?','Steady. What is pulling at you most?'],['I keep circling the third chapter.','What makes that one hard to leave alone?'],['The structure feels off somehow.','Off how — pacing, or the order of things?'],['Mostly the order.','What would move first if you could rearrange it freely?'],['Probably the ending of chapter two.','That is a real structural instinct.'],['I am tired though.','Tired in the body, or tired of the problem?'],['Tired of the problem.','That is a different kind of rest you need.'],['Maybe. The deadline is close.','How close, and how fixed is it really?'],['A few weeks. Fairly fixed.','Then what is the smallest useful next move?']];
const ex:DisplacedExchange[]=[];const push=(u:string,m:string)=>{const i=ex.length;ex.push({exchangeKey:`k${i}`,index:i,timestamp:new Date(1700000000000+i*60000).toISOString(),userMessage:u,maiaResponse:m});};
push('Morning. Ready to work.','Good morning. Where would you like to begin?');
push('Silver cedar is an image that has been on my mind today.','Tell me more about that image — what does it carry for you?');
push('I have been thinking about rootedness lately, how it differs from being stuck.','That distinction sounds important. What separates them for you?');
while(ex.length<39){const [u,m]=F[ex.length%F.length]!;push(u,m);}
const displaced=ex.slice(0,35);
const P='What was the phrase I gave you earlier in this conversation?';
const S='What was I saying earlier about rootedness?';

// DC-1 · PURE SIMILARITY — the naive implementation. Should pass S, FAIL P.
// COMPETENT similarity: stopword-filtered, as any real implementation would be.
// Without this the candidate "passes" P by matching the stopword "what", which is an
// incompetent candidate rather than a non-lethal falsifier.
const SW=new Set(['what','that','this','these','those','with','from','have','has','had','was','were','been','being','your','you','the','and','for','are','about','they','them','their','then','than','when','where','which','will','would','could','should','just','like','into','over','some','any','all','very','really','get','got','know','think','one','thing','things','conversation','earlier','before','said','told','gave','tell','say','ask','asked','mentioned']);
const tok=(t:string)=>t.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/).filter(w=>w.length>3&&!SW.has(w));
const sim=(q:string)=>{const qt=new Set(tok(q));return displaced.map(e=>({e,n:tok(e.userMessage+' '+e.maiaResponse).filter(w=>qt.has(w)).length})).sort((a,b)=>b.n-a.n).filter(x=>x.n>0).slice(0,3).map(x=>x.e);};
const dc1P=sim(P), dc1S=sim(S);
console.log('DC-1 pure similarity');
console.log('  P → silver cedar?', dc1P.some(e=>e.userMessage.includes('Silver cedar')) ? 'YES (falsifier NOT lethal)' : 'NO  ✅ dies on P as intended');
console.log('  S → rootedness?  ', dc1S.some(e=>e.userMessage.includes('rootedness')) ? 'YES (passes S, as expected)' : 'NO');

// DC-2 · PHRASING SPECIAL-CASE — passes P by pattern-match, FAILS S.
const special=(q:string)=>/what was (the|that) phrase/i.test(q)
  ? [...displaced].sort((a,b)=>a.userMessage.length-b.userMessage.length).slice(0,1) : [];
console.log('DC-2 phrasing special-case');
console.log('  S → rootedness?  ', special(S).some(e=>e.userMessage.includes('rootedness')) ? 'YES (falsifier NOT lethal)' : 'NO  ✅ dies on S as intended');

// The real mechanism must pass BOTH.
const r=(q:string)=>recoverDisplacedExchanges({utterance:q,displaced,corpus:ex});
console.log('REAL mechanism');
console.log('  P → silver cedar?', r(P).some(e=>e.userMessage.includes('Silver cedar')) ? '✅ YES' : '❌ NO');
console.log('  S → rootedness?  ', r(S).some(e=>e.userMessage.includes('rootedness')) ? '✅ YES' : '❌ NO');
