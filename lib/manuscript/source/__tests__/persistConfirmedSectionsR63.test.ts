/** Standard beta: a confirmed import is an all-or-nothing SQL unit. */
jest.mock('@/lib/db/postgres',()=>({transaction:jest.fn()}));
import {transaction} from '@/lib/db/postgres';
import {persistConfirmedSectionsR63} from '../persistConfirmedSectionsR63';

const MEMBER='11111111-1111-4111-8111-111111111111';
const MANUSCRIPT='33333333-3333-4333-8333-333333333333';
const sections=[
 {position:0,heading:'One',body:'Fictional beginning.',
  headingDepth:1,headingSignal:'explicit_heading'},
 {position:1,heading:null,body:'Fictional continuation.',
  headingDepth:null,headingSignal:null},
];
const tx=transaction as jest.Mock;
const write=jest.fn();
beforeEach(()=>{
 jest.resetAllMocks();
 write.mockResolvedValueOnce({rows:[{id:MANUSCRIPT}],rowCount:1})
  .mockResolvedValueOnce({rows:[],rowCount:1})
  .mockResolvedValueOnce({rows:[],rowCount:1});
 tx.mockImplementation(async fn=>fn({query:write}));
});

describe('confirmed conventional manuscript import SQL atomicity',()=>{
 it('inserts one manuscript and every distinct section inside one transaction',async()=>{
  const result=await persistConfirmedSectionsR63({
   verifiedMemberId:MEMBER,title:'Fictional manuscript',sections,
  });
  expect(result).toBe(MANUSCRIPT);
  expect(tx).toHaveBeenCalledTimes(1);
  expect(write).toHaveBeenCalledTimes(3);
  expect(write.mock.calls[0][0]).toContain('INSERT INTO member_manuscripts');
  expect(write.mock.calls[0][1]).toEqual([MEMBER,'Fictional manuscript']);
  expect(write.mock.calls[1][1]).toEqual([
   MANUSCRIPT,0,'One','Fictional beginning.',1,'explicit_heading']);
  expect(write.mock.calls[2][1]).toEqual([
   MANUSCRIPT,1,null,'Fictional continuation.',null,null]);
 });
 it('refuses missing member, title or every-section-less import before any SQL',async()=>{
  for(const input of [
   {verifiedMemberId:'',title:'T',sections},
   {verifiedMemberId:MEMBER,title:'',sections},
   {verifiedMemberId:MEMBER,title:'T',sections:[]},
  ]){
   await expect(persistConfirmedSectionsR63(input)).rejects.toThrow(
    'confirmed_import_scope_absent');
  }
  expect(tx).not.toHaveBeenCalled();
 });
 it('failed second section interrupts the SAME transaction, never returns success',async()=>{
  write.mockReset().mockResolvedValueOnce({
   rows:[{id:MANUSCRIPT}],rowCount:1,
  }).mockResolvedValueOnce({rows:[],rowCount:1})
   .mockRejectedValueOnce(new Error('fictional_section_constraint'));
  await expect(persistConfirmedSectionsR63({
   verifiedMemberId:MEMBER,title:'T',sections,
  })).rejects.toThrow('fictional_section_constraint');
  expect(tx).toHaveBeenCalledTimes(1);
  expect(write).toHaveBeenCalledTimes(3);
 });
 it('unverified minted manuscript or unverified section row count aborts',async()=>{
  for(const rows of [
   [{rows:[],rowCount:0}],
   [{rows:[{id:MANUSCRIPT}],rowCount:1},{rows:[],rowCount:0}],
  ]){
   write.mockReset();
   rows.forEach(r=>write.mockResolvedValueOnce(r));
   await expect(persistConfirmedSectionsR63({
    verifiedMemberId:MEMBER,title:'T',sections,
   })).rejects.toThrow(/confirmed_import_(manuscript|section)_unverified/);
  }
 });
});
