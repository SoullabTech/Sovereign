import * as ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');


function findNode(source: string, predicate: (node: ts.Node) => boolean): {file: ts.SourceFile; node: ts.Node} {
  const file=ts.createSourceFile('review.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const found:ts.Node[]=[];
  const visit=(node:ts.Node)=>{if(predicate(node))found.push(node);ts.forEachChild(node,visit);};visit(file);
  expect(found).toHaveLength(1);return {file,node:found[0]!};
}
function evaluateExpression(expression: string, bindings: Record<string, unknown>): any {
  const output=ts.transpileModule('const actual = '+expression+';',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const requireOnlyJsx=(name:string)=>{if(name!=='react/jsx-runtime')throw Error('Unexpected review import '+name);return require(name);};
  return Function('require','exports',...Object.keys(bindings),output+';return actual;')(requireOnlyJsx,{},...Object.values(bindings));
}

describe('C3 Develop → Focus continuity', () => {
  const developController = read('app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx');
  const developView = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const writeController = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const writeView = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const dance = read('app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx');

  it('separates orientation targets from exact editorial targets', () => {
    expect(developController).toContain('const observationTargets = useMemo');
    expect(developController).toContain('const observationWorkTargets = useMemo');
    expect(developController).toContain("if (ref.kind !== 'passage') continue;");
    expect(developView).toContain('const sectionId = targets[observation.key];');
    expect(developView).toContain('const workSectionId = workTargets[observation.key];');
  });

  it('offers exact-passage Write and orientation gestures only for their own targets', () => {
    const {file,node}=findNode(developView,n=>ts.isFunctionDeclaration(n)&&n.name?.text==='ReadingField');
    const readingField=evaluateExpression(node.getText(file),{LABEL:{overview:'Overview'},friendlyObservation:()=>({title:'Fictional observation',lead:'Fixture'})});
    const buttons=(value:any):any[]=>Array.isArray(value)?value.flatMap(buttons):value&&typeof value==='object'?[...(value.type==='button'?[value]:[]),...buttons(value.props?.children)]:[];
    const make=(targets:Record<string,string>,workTargets:Record<string,string>)=>{
      const onWorkWithObservation=jest.fn(),onGoToObservation=jest.fn();
      const tree=readingField({reading:{id:'fiction-reading',outcome:'observations',coverage:{sentence:'Fixture'},frozenAt:'2026-10-01',stateLabel:'Saved',observations:[{key:'fiction-observation',observation:'Fixture',phenomenonLabel:'Fixture',evidence:[],limits:[]}]},field:'overview',selectedObservationKey:null,targets,workTargets,onWorkWithObservation,onGoToObservation,onTalkObservation:jest.fn(),onTeachObservation:jest.fn(),onDeepObservation:jest.fn(),onSelectObservation:jest.fn()});
      return {items:buttons(tree),onWorkWithObservation,onGoToObservation};
    };
    const exact=make({'fiction-observation':'orientation-section'},{'fiction-observation':'exact-section'});
    const write=exact.items.find(b=>b.props.children==='Stay with this in Write');
    const locate=exact.items.find(b=>b.props.children==='Show me in the manuscript');
    expect(write).toBeDefined();expect(locate).toBeDefined();
    expect(exact.onWorkWithObservation).not.toHaveBeenCalled();expect(exact.onGoToObservation).not.toHaveBeenCalled();
    write.props.onClick();locate.props.onClick();
    expect(exact.onWorkWithObservation).toHaveBeenCalledWith('fiction-reading','fiction-observation','exact-section');
    expect(exact.onGoToObservation).toHaveBeenCalledWith('fiction-reading','fiction-observation','orientation-section');
    const orientation=make({'fiction-observation':'orientation-section'},{});
    expect(orientation.items.some(b=>b.props.children==='Stay with this in Write')).toBe(false);
    expect(orientation.items.some(b=>b.props.children==='Show me in the manuscript')).toBe(true);
    const absent=make({},{});
    expect(absent.items.some(b=>['Stay with this in Write','Show me in the manuscript'].includes(b.props.children))).toBe(false);
  });

  it('carries the exact Develop observation into Write with an explicit focus action', () => {
    expect(developController).toContain("query.set('insightReading', readingId)");
    expect(developController).toContain("query.set('insightObservation', observationKey)");
    expect(developController).toContain("query.set('insightAction', 'focus')");
    expect(developController).toContain('Keep developField / developIntent / r as the exact return address.');
  });

  it('refuses automatic Focus without an exact passage range', () => {
    expect(writeController).toContain("if (incomingAction === 'focus' && !passage.range) return;");
    expect(writeController).toContain("if (incomingAction !== 'focus' || !arrivalInsight || !selectedPassage || workspaceOpen) return;");
    expect(writeController).toContain('&& candidate.range,');
    expect(writeController).toContain('if (exact !== selectedPassage.text) return;');
  });

  it('opens existing Focus only when no author-opened Craft workspace owns the passage', () => {
    expect(writeController).toContain("openWorkspace({ readingId: arrivalInsight.readingId, key: arrivalInsight.observation.key });");
    const {file,node}=findNode(writeView,n=>ts.isCallExpression(n)&&n.expression.getText()==='useEffect'&&n.arguments[0]?.getText().includes('Ordinary Focus remains the default'));
    const callback=(node as ts.CallExpression).arguments[0]!.getText(file);
    const exercise=(workspaceOpen:boolean,held:any,isolatedEditorial:boolean,craftOpen:boolean)=>{
      const setIsolatedEditorial=jest.fn(),setCraftOpen=jest.fn(),setCraftOwnerScope=jest.fn();
      evaluateExpression(callback,{props:{workspaceOpen,held},isolatedEditorial,craftOpen,craftOwnerScope:'fiction-work',setIsolatedEditorial,setCraftOpen,setCraftOwnerScope})();
      return {setIsolatedEditorial,setCraftOpen,setCraftOwnerScope};
    };
    expect(exercise(true,{},false,false).setIsolatedEditorial).toHaveBeenCalledWith(true);
    expect(exercise(true,{},false,true).setIsolatedEditorial).not.toHaveBeenCalled();
    expect(exercise(true,null,false,false).setIsolatedEditorial).not.toHaveBeenCalled();
    expect(exercise(true,{},true,false).setIsolatedEditorial).not.toHaveBeenCalled();
    const closed=exercise(false,{},true,true);
    expect(closed.setIsolatedEditorial).toHaveBeenCalledWith(false);expect(closed.setCraftOpen).toHaveBeenCalledWith(false);expect(closed.setCraftOwnerScope).toHaveBeenCalledWith(null);
  });

  it('keeps the Develop observation visible inside Focus and offers a real return path', () => {
    expect(writeView).toContain('data-focus-origin');
    expect(writeView).toContain('From MAIA’s reading');
    expect(writeView).toContain('props.carriedInsight.observation.observation');
    expect(writeView).toContain('props.carriedInsightReturnMode');
    expect(writeView).toContain('props.onMode(props.carriedInsightReturnMode!)');
    expect(writeView).toContain("props.carriedInsightReturnMode === 'review' ? 'Review' : 'Develop'");
  });

  it('carries the frozen observation into the first editorial act only as attributed context', () => {
    expect(writeView).toContain('origin={props.carriedInsight && props.carriedInsightReturnMode ? {');
    expect(writeView).toContain('observation: props.carriedInsight.observation.observation');
    expect(dance).toContain('We arrived at this exact passage from a prior frozen');
    expect(dance).toContain('Treat that as attributed historical context, not a verdict and not an edit instruction.');
    expect(dance).toContain('Use the current passage as the authority for any new editorial claim.');
    expect(dance).toContain('Do not silently convert the prior observation into a revision recommendation.');
    expect(dance).toContain('if (!props.origin || props.thread) return prompt;');
  });
});
