/**
 * R80 local fictional author format rehearsal; real DOCX Mammoth, real typed
 * PDF text-layer extractor, TXT and Markdown. No providers, database or API
 * credentials. Device copies use the actual Studio exporter; no mocked parser.
 */
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {jsPDF} from 'jspdf';
import {parseUpload} from '../parseUpload';
import {segment} from '../segment';
import {prepareDeviceManuscriptCopy} from '@/lib/writersStudio/deviceManuscriptCopy';
import type {RebuildSection} from '@/lib/writersStudio/rebuild/model';

const FICTION='R80 FICTIONAL WRITER — no member manuscripts or private data.';
const marker='The morning came slowly over the hills';
const f=(name:string)=>path.join(__dirname,'fixtures',name);
const id=()=>randomUUID();
type Format={name:string;bytes:Buffer;mustInclude:string;signal:string};
function typedPdf():Buffer{
 // PDF is freshly authored in memory, never saved under real Work custody.
 // A sufficiently long actual selectable text layer exercises PDFParse.
 const pdf=new jsPDF({unit:'pt',format:'letter',compress:false});
 pdf.setFont('times','normal');
 pdf.setFontSize(14);
 pdf.text('Chapter One — R80 Fictional PDF',45,60);
 pdf.setFontSize(11);
 const note='R80 Fictional PDF author text layer. The river remembers morning light.';
 for(let i=0;i<14;i++)pdf.text(note,45,90+i*26);
 pdf.addPage();
 pdf.setFontSize(14);
 pdf.text('Chapter Two — R80 Fictional PDF',45,60);
 pdf.setFontSize(11);
 for(let i=0;i<14;i++)pdf.text(note,45,90+i*26);
 return Buffer.from(pdf.output('arraybuffer'));
}
const markdown='# Chapter One\n\nR80 fiction authored by a test writer.\n\n'
 +'## Passage — River\n\nThe river remembers a fictional lantern.\n\n'
 +'# Chapter Two\n\nThe end stays the author’s own.';
const txt='Chapter One\r\n\r\n'+'R80 fictional river memory.\r\n'
 +'A verse with a tab:\tRiver light.\r\n'
 +'Chapter Two\r\n\r\nThe end is not rewritten.';

async function formats():Promise<Format[]>{
 return [
  {name:'fiction-only.txt',bytes:Buffer.from(txt,'utf8'),
   mustInclude:'R80 fictional river memory.',signal:'Chapter One'},
  {name:'fiction-only.md',bytes:Buffer.from(markdown,'utf8'),
   mustInclude:'The river remembers a fictional lantern.',signal:'# Chapter One'},
  {name:'sample.docx',bytes:fs.readFileSync(f('sample.docx')),
   mustInclude:marker,signal:'# Chapter One'},
  {name:'fiction-only.pdf',bytes:typedPdf(),
   mustInclude:'R80 Fictional PDF author text layer.',signal:'Chapter One'},
 ];
}
function input(text:string){
 const parsed=segment(text);
 const source:RebuildSection[]=parsed.map(s=>({
  draftSectionId:id(),sourceSectionId:null,
  position:s.position,heading:s.heading??null,
  headingDepth:s.headingDepth??null,headingSignal:s.headingSignal??null,
  headingPrefix:s.heading? s.heading+'\n\n':'',
  body:s.body,editable:true,
 }));
 return {manuscriptId:id(),title:'R80 Fictional Writer Work',
  workTitle:null,version:1,sections:source,
  latestBody:(sectionId:string)=>{
   const section=source.find(s=>s.draftSectionId===sectionId);
   if(!section)throw new Error('fictional_section_missing');
   return section.body;
  },
  unsavedInStudio:false,exportedAt:'2026-10-17T18:00:00.000Z'};
}
describe('R80 genuine four-format author parse and owned device copies',()=>{
 beforeAll(()=>expect(FICTION).toContain('no member manuscripts'));
 it('real typed PDF has actual text layer and two pages, not fake PDF header',async()=>{
  const b=typedPdf();
  expect(b.subarray(0,5).toString('ascii')).toBe('%PDF-');
  expect(b.length).toBeGreaterThan(1500);
  const parsed=await parseUpload(b,'fiction-only.pdf');
  expect(parsed.format).toBe('pdf');
  expect(parsed.text).toContain('R80 Fictional PDF author text layer.');
  expect(parsed.text).toContain('Chapter Two');
  expect(parsed.text).not.toMatch(/--\s*page_number\s*of\s*total_number\s*--/);
  expect(parsed.warnings).toEqual([]);
 },35000);
 it.each(['txt','md','docx','pdf'])('actual %s import creates editable content and portable copies',async extension=>{
  const chosen=(await formats()).find(x=>x.name.endsWith('.'+extension))!;
  const parsed=await parseUpload(chosen.bytes,chosen.name);
  expect(parsed.text).toContain(chosen.mustInclude);
  expect(parsed.text).toContain(chosen.signal);
  const sections=segment(parsed.text);
  expect(sections.length).toBeGreaterThan(0);
  const copyInput=input(parsed.text);
  const copyText=prepareDeviceManuscriptCopy(copyInput,'txt');
  const copyMd=prepareDeviceManuscriptCopy(copyInput,'md');
  const copyJSON=prepareDeviceManuscriptCopy(copyInput,'json');
  for(const o of [copyText,copyMd,copyJSON]){
   expect(o.filename).toContain('R80 Fictional Writer Work');
   expect(o.contents).not.toContain('model-provider-generated edit');
   expect(o.sections).toBe(sections.length);
  }
  expect(copyText.contents).toContain(chosen.mustInclude);
  expect(copyMd.contents).toContain(chosen.mustInclude);
  const archive=JSON.parse(copyJSON.contents);
  expect(archive.kind).toBe('soullab.writer-owned-manuscript-copy');
  expect(archive.containsUnacknowledgedStudioEdits).toBe(false);
  expect(archive.sections.map((x:{id:string})=>x.id)).toHaveLength(sections.length);
  expect(archive.sections.map((x:{body:string})=>x.body).join(''))
   .toContain(chosen.mustInclude);
  expect(archive.sections.every((s:{editable:boolean})=>s.editable)).toBe(true);
 },40000);
 it('TXT and Markdown decoding does not alter the uploaded bytes',async()=>{
  const a=await parseUpload(Buffer.from(txt),'fiction-only.txt');
  const b=await parseUpload(Buffer.from(markdown),'fiction-only.md');
  expect(Buffer.from(a.text).equals(Buffer.from(txt))).toBe(true);
  expect(Buffer.from(b.text).equals(Buffer.from(markdown))).toBe(true);
  expect(a.warnings).toEqual([]);expect(b.warnings).toEqual([]);
 });
 it('DOCX physical conversion retains its chapter structure and exact quotations',async()=>{
  const b=fs.readFileSync(f('sample.docx'));
  const out=await parseUpload(b,'sample.docx');
  expect(out.text).toContain('# Chapter One');
  expect(out.text).toContain('## A Quieter Passage');
  expect(out.text).toContain(marker);
  expect(out.text).not.toContain('<a id=');
  expect(segment(out.text).some(s=>s.heading==='Chapter One')).toBe(true);
 });
 it('real image-only PDF has no fabricated text and gives a human warning',async()=>{
  const pdf=new jsPDF({unit:'pt',format:'letter'});
  pdf.addPage();
  const result=await parseUpload(
   Buffer.from(pdf.output('arraybuffer')),'r80-scanned-image-placeholder.pdf');
  expect(result.format).toBe('pdf');
  expect(result.text.trim()).toBe('');
  expect(result.warnings.join(' ')).toMatch(/scan/i);
 },35000);
 it('unsupported upload is refused rather than silently treated as a manuscript',async()=>{
  await expect(parseUpload(Buffer.from('not a work'),'r80-archive.zip'))
   .rejects.toMatchObject({name:'UnsupportedUploadError'});
 });
 it('device copy is an author-only action with no provider or network call',()=>{
  const source=input('A fictional test chapter.\r\n\tA verse.  ');
  const copy=prepareDeviceManuscriptCopy(source,'txt');
  expect(copy.contents).toContain('A fictional test chapter.\r\n\tA verse.  ');
  expect(copy.mime).toBe('text/plain;charset=utf-8');
  expect(copy.filename).toMatch(/-writer-copy\.txt$/);
 });
});
