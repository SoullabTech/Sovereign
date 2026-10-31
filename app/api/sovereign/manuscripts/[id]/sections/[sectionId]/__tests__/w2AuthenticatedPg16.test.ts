/** @jest-environment node */
/** W2 physical PG16: actual authenticated section PUT, no production data. */
import { NextRequest } from 'next/server';
jest.mock('next/headers', () => ({ cookies: jest.fn(async () => ({ get: () => undefined })) }));
import { closePool, query } from '@/lib/db/postgres';
import { loadEditableSections } from '@/lib/manuscript/sections/saveSection';
import { PUT } from '../route';

const a='11111111-1111-4111-8111-111111111111';
const b='22222222-2222-4222-8222-222222222222';
const manuscript='33333333-3333-4333-8333-333333333333';
const draft='44444444-4444-4444-8444-444444444444';
const section='55555555-5555-4555-8555-555555555555';
const tokenA='fiction-session-A', tokenB='fiction-session-B', revoked='fiction-revoked';
const allowed=process.env.WS_W2_PG16==='fictional-only'
  && (process.env.DATABASE_URL??'').startsWith('postgresql://fict@127.0.0.1:')
  && (process.env.DATABASE_URL??'').endsWith('/ws_w2_fictional');

const put=(token:string, body:string, baseVersion:number, claim?:string)=>PUT(
  new NextRequest(`http://localhost/api/sovereign/manuscripts/${manuscript}/sections/${section}`,{
    method:'PUT',
    headers:{'content-type':'application/json','x-session-token':token,
      ...(claim?{'x-member-id':claim}:{})},
    body:JSON.stringify({body,baseVersion}),
  }),
  {params:Promise.resolve({id:manuscript,sectionId:section})},
);

(allowed?describe:describe.skip)('W2 actual verified session and PG16 section writer',()=>{
  beforeAll(async()=>{
    if(!allowed)throw Error('STOP: This suite only runs on disposable fictional PG16 loopback.');
    await query(`
      CREATE TABLE auth_sessions(session_token TEXT PRIMARY KEY,member_id UUID NOT NULL,
        revoked BOOLEAN DEFAULT FALSE, expires_at TIMESTAMPTZ NOT NULL);
      CREATE TABLE manuscript_working_drafts(id UUID PRIMARY KEY,manuscript_id UUID NOT NULL,
        member_id UUID NOT NULL,version BIGINT NOT NULL,section_addressable_at TIMESTAMPTZ,
        content TEXT NOT NULL,updated_at TIMESTAMPTZ DEFAULT now());
      CREATE TABLE manuscript_sections(id UUID PRIMARY KEY,heading TEXT);
      CREATE TABLE manuscript_draft_sections(id UUID PRIMARY KEY,draft_id UUID NOT NULL,
        source_section_id UUID,position INTEGER NOT NULL,text TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now());
    `);
    await query(`INSERT INTO auth_sessions VALUES
      ($1,$2,FALSE,now()+interval '1 hour'),
      ($3,$4,FALSE,now()+interval '1 hour'),
      ($5,$2,TRUE,now()+interval '1 hour')`,
      [tokenA,a,tokenB,b,revoked]);
    await query(`INSERT INTO manuscript_working_drafts
      (id,manuscript_id,member_id,version,section_addressable_at,content)
      VALUES($1,$2,$3,1,now(),'')`,[draft,manuscript,a]);
    await query(`INSERT INTO manuscript_draft_sections
      (id,draft_id,source_section_id,position,text)
      VALUES($1,$2,NULL,0,'')`,[section,draft]);
  });

  afterAll(async()=>{
    await closePool();
  });

  it('validates a session, durably saves, then reads the EXACT author words twice',async()=>{
    const words='A fictional river curves through the orchard.';
    const res=await put(tokenA,words,1);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      ok:true,sectionId:section,body:words,version:2,acceptedBy:'version',
    });
    const first=await loadEditableSections(manuscript,a);
    const reopened=await loadEditableSections(manuscript,a);
    expect(first?.version).toBe(2);
    expect(first?.sections[0]).toMatchObject({id:section,body:words,editable:true});
    expect(reopened?.sections[0].body).toBe(words);
    const saved=await query('SELECT content,version FROM manuscript_working_drafts WHERE id=$1',[draft]);
    expect(saved.rows[0].content).toBe(words);
    expect(Number(saved.rows[0].version)).toBe(2);
  });

  it('rejects old revision without overwriting what was saved',async()=>{
    const res=await put(tokenA,'obsolete replacement',1);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ok:false,refusal:'stale_base'});
    expect((await loadEditableSections(manuscript,a))?.sections[0].body)
      .toBe('A fictional river curves through the orchard.');
  });

  it('refuses another member, forged identity claim and revoked token',async()=>{
    expect((await put(tokenB,'not mine',2)).status).toBe(404);
    expect((await put(tokenA,'identity mismatch',2,b)).status).toBe(401);
    expect((await put(revoked,'revoked',2)).status).toBe(401);
    expect((await loadEditableSections(manuscript,a))?.sections[0].body)
      .toBe('A fictional river curves through the orchard.');
  });
  it('connects actual Chromium and WebKit Write views to the authenticated section route and durable PG16', async()=>{
    const witness = require(process.cwd()+'/scripts/witness/ws-jarvis-w2-blank-autosave-browser-20261021.cjs');
    const js = await witness.bundle({sectionId:section,manuscriptId:manuscript});
    for (const [name,engine] of [['Chromium',witness.chromium],['WebKit',witness.webkit]] as const) {
      // Reset ONLY synthetic data in the disposable DB: each physical browser
      // witnesses its own blank arrival and first authoritative Save.
      await query('UPDATE manuscript_draft_sections SET text=$2 WHERE id=$1',[section,'']);
      await query('UPDATE manuscript_working_drafts SET content=$2,version=1 WHERE id=$1',[draft,'']);
      const driver = {
        snapshot: async()=>{
          const current=await loadEditableSections(manuscript,a);
          if(!current) throw Error('Disposable member Work unavailable.');
          return {body:current.sections[0].body,version:current.version};
        },
        save: async(args:{sectionId:string,body:string,baseVersion:number})=>{
          if(args.sectionId!==section)throw Error('Wrong source section');
          const res=await put(tokenA,args.body,args.baseVersion);
          return {status:res.status,body:await res.json()};
        },
      };
      const observed=await witness.runOne(name,engine,js,driver);
      expect(observed.pass).toBe(true);
      const reread=await loadEditableSections(manuscript,a);
      expect(reread?.sections[0].body).toBe(observed.pages[1].body);
      expect(reread?.version).toBe(2);
      expect(observed.store.saveCount).toBe(1);
      expect(observed.store.loadCount).toBe(2);
      expect(observed.errors).toEqual([]);
      expect(observed.external).toEqual([]);
    }
  }, 35000);

});
