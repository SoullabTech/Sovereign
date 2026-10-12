import { prepareDeviceManuscriptCopy, type DeviceCopyInput } from '../deviceManuscriptCopy';

function fixture(): DeviceCopyInput {
  const sections = [
    { draftSectionId:'later', sourceSectionId:'source-2', position:2, heading:'Second',
      headingDepth:1, headingSignal:'markdown', headingPrefix:'Second\n\n',
      body:'Old, saved text.', editable:true },
    { draftSectionId:'first', sourceSectionId:'source-1', position:1, heading:'🜂 Beginning',
      headingDepth:1, headingSignal:'markdown', headingPrefix:'🜂 Beginning\n\n',
      body:'One line.\n\nTwo lines.\n', editable:true },
    { draftSectionId:'unheaded', sourceSectionId:null, position:3, heading:null,
      headingDepth:null, headingSignal:null, headingPrefix:'', body:'Ending', editable:true },
  ];
  return {
    manuscriptId:'private-id', title:'A Writer/Own: Work', workTitle:'Writer',
    version:12, sections,
    latestBody:(id:string) => id === 'later' ? 'New unsaved ✨\nA second line' :
      sections.find(x => x.draftSectionId === id)!.body,
    exportedAt:'2026-10-10T21:00:00.000Z', unsavedInStudio:true,
  };
}

describe('Writer-owned device manuscript copies', () => {
  test('plain text contains every ordered section and the newest unsaved body', () => {
    const x=prepareDeviceManuscriptCopy(fixture(),'txt');
    expect(x.sections).toBe(3);
    expect(x.filename).toBe('A Writer Own Work-writer-copy.txt');
    expect(x.mime).toBe('text/plain;charset=utf-8');
    expect(x.contents).toBe('🜂 Beginning\n\nOne line.\n\nTwo lines.\n\nSecond\n\nNew unsaved ✨\nA second line\n\nEnding');
    expect(x.contents).not.toContain('Old, saved text.');
    expect(x.contents.match(/🜂 Beginning/g)).toHaveLength(1);
  });

  test('Markdown keeps poetry line breaks and derives heading levels without modifying bodies', () => {
    const x=fixture();
    x.sections[0]!.headingDepth=2;
    const output=prepareDeviceManuscriptCopy(x,'md');
    expect(output.filename).toMatch(/\.md$/);
    expect(output.contents).toContain('# 🜂 Beginning\n\nOne line.\n\nTwo lines.\n');
    expect(output.contents).toContain('## Second\n\nNew unsaved ✨\nA second line');
    expect(output.contents.endsWith('Ending')).toBe(true);
  });

  test('JSON archives exact section boundaries and confirms local unsaved state honestly', () => {
    const result=prepareDeviceManuscriptCopy(fixture(),'json');
    const data=JSON.parse(result.contents);
    expect(result.mime).toBe('application/json;charset=utf-8');
    expect(data.kind).toBe('soullab.writer-owned-manuscript-copy');
    expect(data.manuscriptId).toBe('private-id');
    expect(data.containsUnacknowledgedStudioEdits).toBe(true);
    expect(data.observedServerVersion).toBe(12);
    expect(data.sections.map((s:any)=>s.id)).toEqual(['first','later','unheaded']);
    expect(data.sections[0].prefix+data.sections[0].body).toBe('🜂 Beginning\n\nOne line.\n\nTwo lines.\n');
    expect(data.sections[1].body).toBe('New unsaved ✨\nA second line');
  });

  test('exact CRLF, verse spacing, tabs, and repetitions stay verbatim inside a section', () => {
    const f=fixture();
    const verse='Spring\r\n\r\n\tRiver\r\nSpring   ';
    f.sections=[{draftSectionId:'verse',sourceSectionId:null, position:1,
      heading:null, headingDepth:null, headingSignal:null, headingPrefix:'', body:verse,editable:true}];
    f.latestBody=()=>verse;
    expect(prepareDeviceManuscriptCopy(f,'txt').contents).toBe(verse);
    expect(prepareDeviceManuscriptCopy(f,'md').contents).toBe(verse);
    expect(JSON.parse(prepareDeviceManuscriptCopy(f,'json').contents).sections[0].body).toBe(verse);
  });

  test('a heading already in a source body is not added a second time', () => {
    const f=fixture();
    f.sections=[{draftSectionId:'legacy', sourceSectionId:'old',position:1,heading:'Preface',
      headingDepth:1,headingSignal:null,headingPrefix:'',body:'Preface\n\nBody',editable:false}];
    f.latestBody=()=> 'Preface\n\nBody';
    expect(prepareDeviceManuscriptCopy(f,'txt').contents).toBe('Preface\n\nBody');
  });

  test('invalid identities, empty manuscripts, or duplicate sections fail closed', () => {
    const empty=fixture(); empty.sections=[];
    expect(()=>prepareDeviceManuscriptCopy(empty,'txt')).toThrow(/No manuscript sections/);
    const duplicate=fixture();duplicate.sections=[...duplicate.sections,duplicate.sections[0]!];
    expect(()=>prepareDeviceManuscriptCopy(duplicate,'txt')).toThrow(/section identity/);
    const noId=fixture();noId.manuscriptId='';
    expect(()=>prepareDeviceManuscriptCopy(noId,'txt')).toThrow(/manuscript identity/);
  });

  test('a 262-section manuscript includes the first and final movement with no page-limit truncation', () => {
    const f=fixture();
    const sections=Array.from({length:262},(_,index)=>({
      draftSectionId:'section-'+index, sourceSectionId:'original-'+index,
      position:index, heading:'Movement '+index, headingDepth:1,
      headingSignal:'markdown', headingPrefix:'Movement '+index+'\n\n',
      body:'This is exact authored material for movement '+index+'.\n\n',
      editable:true,
    }));
    f.sections=sections;
    f.latestBody=id=>sections.find(s=>s.draftSectionId===id)!.body;
    const copy=prepareDeviceManuscriptCopy(f,'txt');
    expect(copy.sections).toBe(262);
    expect(copy.contents).toContain('Movement 0\n\n');
    expect(copy.contents).toContain('Movement 261\n\nThis is exact authored material for movement 261.');
    expect(copy.contents.match(/This is exact authored material for movement /g)).toHaveLength(262);
  });

  test('formatting never adds private user or provider data, and filename is path-safe', () => {
    const f=fixture();f.title='../Some \\ path|?';
    const r=prepareDeviceManuscriptCopy(f,'txt');
    expect(r.filename.includes('/')).toBe(false);
    expect(r.filename.includes('\\')).toBe(false);
    expect(r.contents).not.toContain('private-id');
    expect(r.contents).not.toContain('2026-10-10');
  });
});
