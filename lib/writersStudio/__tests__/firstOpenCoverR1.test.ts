import { firstChapterPastBareCover } from '@/lib/writersStudio/firstOpenCoverR1';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

const a = (draftSectionId:string, heading:string|null, body:string, editable=true):RebuildSection => ({
  draftSectionId,sourceSectionId:null,position:0,heading,headingDepth:null,
  headingSignal:null,headingPrefix:'',body,editable,
});
const chapter=a('chapter','Chapter 1: Return and Recognition',
  'The first substantial paragraph of the chapter belongs to the writer. '.repeat(5));

describe('JONDI-RETURN-01: cover-only imported opening',()=>{
  it('enters substantive Chapter 1 when no writing place was requested',()=>{
    expect(firstChapterPastBareCover([a('cover',null,'The Temporary Book'),chapter],null)).toBe('chapter');
  });
  it('never displaces an explicit section address, including the cover',()=>{
    expect(firstChapterPastBareCover([a('cover',null,'The Temporary Book'),chapter],'cover')).toBeNull();
    expect(firstChapterPastBareCover([a('cover',null,'The Temporary Book'),chapter],'chapter')).toBeNull();
  });
  it('protects an intentional epigraph or preface',()=>{
    expect(firstChapterPastBareCover([a('start',null,'A short poem at the beginning.\nAnother line.'),chapter],null)).toBeNull();
    expect(firstChapterPastBareCover([a('preface','Preface','My voice starts here.'),chapter],null)).toBeNull();
    expect(firstChapterPastBareCover([a('start',null,'A long independent opening. '.repeat(7)),chapter],null)).toBeNull();
  });
  it('requires adjacent actual Chapter 1 and substantive editable text',()=>{
    expect(firstChapterPastBareCover([a('cover',null,'Title'),a('other','Dedication','Words of gratitude.')],null)).toBeNull();
    expect(firstChapterPastBareCover([a('cover',null,'Title'),a('next','Chapter 2','A different part '.repeat(15))],null)).toBeNull();
    expect(firstChapterPastBareCover([a('cover',null,'Title'),a('next','Chapter 1','Short')],null)).toBeNull();
    expect(firstChapterPastBareCover([a('cover',null,'Title'),a('next','Chapter 1','Substantial prose '.repeat(20),false)],null)).toBeNull();
  });
  it('keeps empty/single-section Works unchanged',()=>{
    expect(firstChapterPastBareCover([],null)).toBeNull();
    expect(firstChapterPastBareCover([a('cover',null,'Title')],null)).toBeNull();
  });
});
