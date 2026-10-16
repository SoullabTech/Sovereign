/** R32 new Source storage remains route-unmounted and disabled for real writers. */
import path from 'node:path';
import {readFileSync,readdirSync} from 'node:fs';
jest.mock('@/lib/db/postgres',()=>({
  query:jest.fn(()=>{throw Error('r32_test_must_not_connect_database');}),
  transaction:jest.fn(()=>{throw Error('r32_test_must_not_open_transaction');}),
}));
jest.mock('@/lib/storage/fileVault',()=>({
  readVaultBytes:jest.fn(()=>{throw Error('r32_test_must_not_read_vault');}),
  writeDurableVaultBytes:jest.fn(()=>{throw Error('r32_test_must_not_write_vault');}),
}));
import {query,transaction} from '@/lib/db/postgres';
import {writeDurableVaultBytes,readVaultBytes} from '@/lib/storage/fileVault';
import {
  persistHeldOriginalR32,readHeldOriginalR32,
  R32_REAL_WRITER_SOURCE_IMPORT_ENABLED,
} from '../heldOriginalSourceR32';
const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const ARRIVAL='4c0782ca-9074-43ee-9f3c-5f8500026782';
const subject={memberId:MEMBER,
  assertedBy:'server_verified_member_session' as const};
const source={
  kind:'supplied_text' as const,sourceText:'fictional confirmation',
  originalBytes:null,originalFilename:null,mimeType:null,extractorId:null,
};
const parameters={subject,workId:WORK,arrivalId:ARRIVAL,
  generation:1,source,authority:null as never};
const prior=process.env.R32_HELD_SOURCE_FIXTURE;
function files(root:string):string[]{
  return readdirSync(root,{withFileTypes:true}).flatMap(e=>{
    const file=path.join(root,e.name);
    return e.isDirectory()?files(file):
      e.isFile()&&/^route\.(ts|tsx)$/.test(e.name)?[file]:[];
  });
}
afterEach(()=>{
  if(prior===undefined)delete process.env.R32_HELD_SOURCE_FIXTURE;
  else process.env.R32_HELD_SOURCE_FIXTURE=prior;
});
describe('R32 encrypted original Source held-until-custody source gate',()=>{
  it('cannot activate real member Source imports through a source flag',()=>{
    expect(R32_REAL_WRITER_SOURCE_IMPORT_ENABLED).toBe(false);
  });
  it('refuses writing before touching vault or SQL when test-only gate absent',async()=>{
    delete process.env.R32_HELD_SOURCE_FIXTURE;
    await expect(persistHeldOriginalR32(parameters)).rejects
      .toHaveProperty('code','r32_real_source_writer_disabled');
    expect(query).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(writeDurableVaultBytes).not.toHaveBeenCalled();
  });
  it('refuses reopening before even reading a SQL manifest when gate absent',async()=>{
    delete process.env.R32_HELD_SOURCE_FIXTURE;
    await expect(readHeldOriginalR32(parameters)).rejects
      .toHaveProperty('code','r32_real_source_writer_disabled');
    expect(readVaultBytes).not.toHaveBeenCalled();
  });
  it('a browser-supplied owner label is not a verified writer subject',async()=>{
    process.env.R32_HELD_SOURCE_FIXTURE='fictional-only';
    await expect(persistHeldOriginalR32({
      ...parameters,subject:{...subject,assertedBy:'client_claim'} as never,
    })).rejects.toHaveProperty('code','r32_verified_session_required');
    expect(query).not.toHaveBeenCalled();
  });
  it('rejects invalid Work/generation before requiring a key',async()=>{
    process.env.R32_HELD_SOURCE_FIXTURE='fictional-only';
    await expect(persistHeldOriginalR32({...parameters,
      workId:'other'})).rejects.toHaveProperty('code','r32_invalid_identity');
    await expect(persistHeldOriginalR32({...parameters,
      generation:0})).rejects.toHaveProperty('code','r32_invalid_generation');
    expect(writeDurableVaultBytes).not.toHaveBeenCalled();
  });
  it('refuses missing independently verified key and deletion authority',async()=>{
    process.env.R32_HELD_SOURCE_FIXTURE='fictional-only';
    await expect(persistHeldOriginalR32(parameters)).rejects
      .toHaveProperty('code','r32_external_key_custody_required');
    expect(query).not.toHaveBeenCalled();
  });
  it('no active Next.js route imports the encrypted-original fixture',()=>{
    const routes=files(path.join(process.cwd(),'app/api'));
    const linked=routes.filter(file=>/heldOriginalSourceR32|persistHeldOriginalR32|readHeldOriginalR32/
      .test(readFileSync(file,'utf8')));
    expect(linked).toEqual([]);
  });
});
