import {
  adjudicateSourceFieldDryRun,
  createSourceManifest,
} from '../sourceManifest';

const manifest=createSourceManifest('manifest:r2',[
  {
    sourceClass:'member_authored_text',
    fields:[
      {field:'recordRef',purpose:'identify_source',required:true},
      {field:'memberRef',purpose:'bind_member_scope',required:true},
      {field:'text',purpose:'represent_observation',required:true},
      {field:'createdAt',purpose:'represent_time',required:true},
      {field:'domain',purpose:'represent_domain',required:true},
    ],
  },
  {
    sourceClass:'system_observed_event',
    fields:[
      {field:'eventRef',purpose:'identify_source',required:true},
      {field:'memberRef',purpose:'bind_member_scope',required:true},
      {field:'summary',purpose:'represent_observation',required:true},
      {field:'observedAt',purpose:'represent_time',required:true},
      {field:'domain',purpose:'represent_domain',required:true},
      {field:'sourceStanding',purpose:'represent_source_standing',required:true},
    ],
  },
]);

describe('AIN-AETHER-CONNECTOR-01R2 source manifest',()=>{
  test('allows only explicitly declared minimum-necessary fields',()=>{
    const result=adjudicateSourceFieldDryRun(manifest,{
      manifestRef:'manifest:r2',
      sourceClass:'member_authored_text',
      requestedFields:['recordRef','memberRef','text','createdAt','domain'],
    });
    expect(result.allowed).toBe(true);
    expect(result.recordReadExecuted).toBe(false);
    expect(result.recordCountRead).toBe(0);
  });

  test('refuses undeclared attribute even when source class is allowed',()=>{
    const result=adjudicateSourceFieldDryRun(manifest,{
      manifestRef:'manifest:r2',
      sourceClass:'member_authored_text',
      requestedFields:['recordRef','memberRef','text','createdAt','domain','email'],
    });
    expect(result.allowed).toBe(false);
    expect(result.errors).toContain('field_not_allowlisted:email');
  });

  test('refuses source class absent from manifest',()=>{
    const result=adjudicateSourceFieldDryRun(manifest,{
      manifestRef:'manifest:r2',
      sourceClass:'member_confirmed_import',
      requestedFields:['recordRef'],
    });
    expect(result.allowed).toBe(false);
    expect(result.errors).toContain('source_class_not_in_manifest:member_confirmed_import');
  });

  test('manifest preserves field-purpose justifications',()=>{
    const entry=manifest.entries.find(e=>e.sourceClass==='system_observed_event')!;
    expect(entry.fields).toContainEqual({
      field:'summary',
      purpose:'represent_observation',
      required:true,
    });
    expect(entry.fields).toContainEqual({
      field:'sourceStanding',
      purpose:'represent_source_standing',
      required:true,
    });
  });

  test('field dry-run remains zero-read',()=>{
    const result=adjudicateSourceFieldDryRun(manifest,{
      manifestRef:'manifest:r2',
      sourceClass:'system_observed_event',
      requestedFields:['eventRef','memberRef','summary','observedAt','domain','sourceStanding'],
    });
    expect(result.zeroRecordRead).toBe(true);
    expect(result.recordReadExecuted).toBe(false);
    expect(result.recordCountRead).toBe(0);
  });
});
