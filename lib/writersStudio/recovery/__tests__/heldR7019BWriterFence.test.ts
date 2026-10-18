/**
 * R70.19B — default-off and unsafe-fixture refusals.
 * Purely fictional; no database, filesystem bytes or external network used.
 */
import {
  withHeldR7019BWriter, holdR7019BDirectSectionTransaction,
  withHeldR7019BCapture, R7019B_PRODUCTION_WRITER_FENCE_ENABLED,
  R7019B_REAL_BACKUP_AND_RESTORE_APPROVED,
} from '../heldR7019BWriterFence';

const MEMBER='4c0782ca-9074-43ee-9f3c-5f8500026780';
const keys=['DATABASE_URL','FILE_STORAGE_PATH',
  'R7019B_WRITER_FIXTURE','R7019B_FIXTURE_NONCE'] as const;
const original=Object.fromEntries(keys.map(x=>[x,process.env[x]]));
afterAll(()=>{for(const k of keys){
 const v=original[k];if(v===undefined)delete process.env[k];
 else process.env[k]=v;
}});
beforeEach(()=>{for(const k of keys)delete process.env[k];});

test('normal runtime passes the exact writer action once with no SQL',async()=>{
 const action=jest.fn(async()=>({receipt:'fictional once-only'}));
 const got=await withHeldR7019BWriter(MEMBER,'confirmed_paste',action);
 expect(action).toHaveBeenCalledTimes(1);
 expect(got).toEqual({receipt:'fictional once-only'});
 expect(R7019B_PRODUCTION_WRITER_FENCE_ENABLED).toBe(false);
 expect(R7019B_REAL_BACKUP_AND_RESTORE_APPROVED).toBe(false);
});

test('direct section mutator with flag absent adds no transaction SQL',async()=>{
 const tx={query:jest.fn(async()=>({rows:[],rowCount:0}))};
 await holdR7019BDirectSectionTransaction(tx as any,MEMBER);
 expect(tx.query).not.toHaveBeenCalled();
});

test('malformed fixture flag refuses before invoking even a fictional writer',async()=>{
 process.env.R7019B_WRITER_FIXTURE='true';
 const writer=jest.fn(async()=>42);
 await expect(withHeldR7019BWriter(MEMBER,'confirmed_paste',writer))
  .rejects.toMatchObject({code:'not_fictional'});
 expect(writer).not.toHaveBeenCalled();
});

test('unverified DATABASE_URL refuses before any bytes or SQL',async()=>{
 process.env.R7019B_WRITER_FIXTURE='fictional-only';
 process.env.DATABASE_URL='postgresql://prod-user@production.invalid/soullab';
 const writer=jest.fn(async()=>42);
 await expect(withHeldR7019BWriter(MEMBER,'studio_file_upload',writer))
  .rejects.toMatchObject({code:'untrusted_database_url'});
 expect(writer).not.toHaveBeenCalled();
});

test('unknown writer kind cannot acquire a fixture lease',async()=>{
 process.env.R7019B_WRITER_FIXTURE='fictional-only';
 const writer=jest.fn(async()=>42);
 await expect(withHeldR7019BWriter(MEMBER,'different_writer' as any,writer))
  .rejects.toMatchObject({code:'unknown_writer'});
 expect(writer).not.toHaveBeenCalled();
});

test('capture refuses all non-fixture environments before reading any writing',async()=>{
 const read=jest.fn(async()=>({fake:true}));
 await expect(withHeldR7019BCapture(MEMBER,read))
  .rejects.toMatchObject({code:'not_fictional'});
 expect(read).not.toHaveBeenCalled();
});
