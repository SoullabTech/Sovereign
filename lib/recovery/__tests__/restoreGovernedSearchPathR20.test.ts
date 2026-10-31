import fs from 'node:fs';
import path from 'node:path';
const source=fs.readFileSync(path.join(process.cwd(),'scripts/restore-governed.sh'),'utf8');
describe('R20 governed restore atomic compatibility',()=>{
  it('normalizes exact pg_dump compatibility lines only',()=>{
    expect(source).toContain(`SELECT pg_catalog.set_config('search_path', '', false);`);
    expect(source).toContain('SET search_path = pg_catalog, public;');
    expect(source).toContain('$0 == "SET transaction_timeout = 0;" { next }');
    expect(source).toContain('filter_pg_dump_compat');
  });
  it('joins restore, governance reapply, and sweep in one psql transaction',()=>{
    expect(source).toContain('PSQL_ATOMIC=(psql -v ON_ERROR_STOP=1 --single-transaction');
    expect(source).toMatch(/stream_governed_dump[\s\S]+stream_preserved_governance[\s\S]+restore sweep complete[\s\S]+PSQL_ATOMIC/);
    expect(source).toContain('dump contains explicit transaction control');
  });
  it('refuses unambiguous transaction controls without misclassifying PL/pgSQL END',()=>{
    expect(source).toContain('(BEGIN|START[[:space:]]+TRANSACTION|COMMIT)');
    expect(source).not.toContain('(BEGIN|START[[:space:]]+TRANSACTION|COMMIT|END)');
    expect(source).toContain('Do not match a bare `END;`');
  });
  it('enforces Writer tombstones across separately retained editorial lineage',()=>{
    expect(source).toContain('CREATE TEMP TABLE r20_restore_writer_targets');
    expect(source).toContain("to_regprocedure('public.r20_erase_writer_editorial_history(uuid,uuid,uuid)')");
    expect(source).toContain('PERFORM public.r20_erase_writer_editorial_history(');
    expect(source).toContain("WHERE object_kind <> 'member_manuscripts'");
    expect(source).toContain('Writer manuscript tombstone has missing or ambiguous owner');
  });
  it('keeps fail-closed controls and never disables database enforcement',()=>{
    expect(source).not.toContain('session_replication_role');
    expect(source).toContain('governance export failed');
    expect(source).toContain('existing public tables without deletion governance');
    expect(source).toContain('restored snapshot lacks required deletion-governance tables');
  });
});
