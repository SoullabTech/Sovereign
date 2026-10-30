import * as ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { pc3Paragraphs } from '@/app/writers-studio/full-redesign/liveWriteAdapter';

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

describe('Writer Studio immediate manuscript-selection support', () => {
  const writeView = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const developView = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const developController = read('app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx');
  const writeRoom = read('app/writers-studio/full-redesign/WriteRoom.tsx');
  const css = read('app/dev/writers-studio-full-redesign-review/full-redesign-review.css');

  it('keeps blank lines as paragraph boundaries while reflowing PDF hard wraps inside them', () => {
    expect(pc3Paragraphs('first hard\nwrap\n \nsecond')).toEqual(['first hard\nwrap', 'second']);
  });

  it('typesets prose at a readable measure with visible paragraph rhythm', () => {
    expect(css).toContain('.fr-write-editor {');
    expect(css).toContain('white-space: normal');
    expect(css).toContain('.fr-write-editor p { margin: 0 0 30px;');
    expect(css).toContain("p[data-write-block='epigraph']");
    expect(css).toContain("p[data-write-block='subhead']");
  });

  it('treats a Write rail choice as an attentional act even when it is already open', () => {
    const {file,node}=findNode(writeView,n=>ts.isVariableDeclaration(n)&&n.name.getText()==='go');
    const initializer=(node as ts.VariableDeclaration).initializer as ts.CallExpression;
    const callback=initializer.arguments[0]!.getText(file);
    const setRailSelectionId=jest.fn(),goToSection=jest.fn(),onFocusSection=jest.fn();
    let deferred:(()=>void)|null=null;
    const requestCraftDeparture=jest.fn((_label:string,act:()=>void)=>{deferred=act;});
    const props={writing:{activeId:'current',goToSection},context:{sections:[{draftSectionId:'current'},{draftSectionId:'next'}]},onFocusSection};
    const go=evaluateExpression(callback,{props,setRailSelectionId,requestCraftDeparture});
    go('current');
    expect(setRailSelectionId).toHaveBeenCalledWith('current');expect(requestCraftDeparture).not.toHaveBeenCalled();expect(goToSection).not.toHaveBeenCalled();expect(onFocusSection).not.toHaveBeenCalled();
    go('next');expect(requestCraftDeparture).toHaveBeenCalledTimes(1);expect(goToSection).not.toHaveBeenCalled();
    expect(deferred).not.toBeNull();(deferred as unknown as ()=>void)();
    expect(goToSection).toHaveBeenCalledWith('next');expect(onFocusSection).toHaveBeenCalledWith('next');
    goToSection.mockClear();onFocusSection.mockClear();setRailSelectionId.mockClear();
    go('next');props.context.sections=[{draftSectionId:'current'}];(deferred as unknown as ()=>void)();
    expect(goToSection).not.toHaveBeenCalled();expect(onFocusSection).not.toHaveBeenCalled();expect(setRailSelectionId).not.toHaveBeenCalled();
    requestCraftDeparture.mockClear();go(null);expect(requestCraftDeparture).not.toHaveBeenCalled();
    expect(writeRoom).toContain('if (onOpenChapter) {');
    expect(writeRoom).toContain('onOpenChapter(c.id);');
    expect(writeView).toContain('WRITE_RELATIONAL_GEOMETRY');
    expect(writeView).toContain('data-write-locus-support');
    expect(writeView).toContain('Talk about this');
    expect(writeView).toContain('Develop this place');
  });

  it('turns a Develop rail choice into the actual selected scope', () => {
    expect(developController).toContain("if (chapter?.root.draftSectionId === sectionId && chapter.sections.length)");
    expect(developController).toContain("kind: 'chapter'");
    expect(developController).toContain("kind: 'section'");
  });

  it('replaces the generic overview with immediate selected-place support', () => {
    expect(developView).toContain('setRailSelectionId(sectionId);');
    expect(developView).toContain('data-develop-locus=');
    expect(developView).toContain('Chapter selected');
    expect(developView).toContain('Section selected');
    expect(developView).toContain('data-develop-locus-support=');
    expect(developView).toContain('I’m with you in this');
    expect(developView).toContain('Talk with MAIA');
    expect(developView).toContain('Nothing is read automatically.');
    expect(developView).toContain('onSection={selectManuscriptLocus}');
  });
});
