import type { AetherConnectorSourceClass } from './connectorContract';

export type AetherSourceFieldPurpose=
  | 'identify_source'
  | 'bind_member_scope'
  | 'represent_observation'
  | 'represent_time'
  | 'represent_domain'
  | 'represent_source_standing';

export interface AetherSourceFieldDeclaration {
  field:string;
  purpose:AetherSourceFieldPurpose;
  required:boolean;
}

export interface AetherSourceManifestEntry {
  sourceClass:AetherConnectorSourceClass;
  fields:AetherSourceFieldDeclaration[];
}

export interface AetherConnectorSourceManifest {
  manifestRef:string;
  entries:AetherSourceManifestEntry[];
  minimumNecessary:true;
  zeroRecordRead:true;
}

export interface SourceFieldDryRunRequest {
  manifestRef:string;
  sourceClass:AetherConnectorSourceClass;
  requestedFields:string[];
}

export interface SourceFieldDryRunResult {
  allowed:boolean;
  errors:string[];
  sourceClass:AetherConnectorSourceClass;
  allowedFields:string[];
  requestedFields:string[];
  zeroRecordRead:true;
  recordReadExecuted:false;
  recordCountRead:0;
}

export function createSourceManifest(
  manifestRef:string,
  entries:AetherSourceManifestEntry[],
):AetherConnectorSourceManifest{
  return {
    manifestRef,
    entries:entries.map(entry=>({
      sourceClass:entry.sourceClass,
      fields:entry.fields.map(field=>({...field})),
    })),
    minimumNecessary:true,
    zeroRecordRead:true,
  };
}

export function adjudicateSourceFieldDryRun(
  manifest:AetherConnectorSourceManifest,
  request:SourceFieldDryRunRequest,
):SourceFieldDryRunResult{
  const errors:string[]=[];
  if(manifest.manifestRef!==request.manifestRef) errors.push('manifest_ref_mismatch');
  if(manifest.minimumNecessary!==true) errors.push('manifest_not_minimum_necessary');
  if(manifest.zeroRecordRead!==true) errors.push('manifest_zero_read_contract_missing');

  const entry=manifest.entries.find(e=>e.sourceClass===request.sourceClass);
  if(!entry){
    errors.push('source_class_not_in_manifest:'+request.sourceClass);
    return {
      allowed:false,
      errors,
      sourceClass:request.sourceClass,
      allowedFields:[],
      requestedFields:[...request.requestedFields],
      zeroRecordRead:true,
      recordReadExecuted:false,
      recordCountRead:0,
    };
  }

  const allowedFields=entry.fields.map(f=>f.field);
  for(const field of request.requestedFields){
    if(!allowedFields.includes(field)){
      errors.push('field_not_allowlisted:'+field);
    }
  }

  for(const declaration of entry.fields){
    if(!declaration.field.trim()) errors.push('empty_field_declaration');
    if(!declaration.purpose) errors.push('field_purpose_required:'+declaration.field);
  }

  return {
    allowed:errors.length===0,
    errors:[...new Set(errors)],
    sourceClass:request.sourceClass,
    allowedFields,
    requestedFields:[...request.requestedFields],
    zeroRecordRead:true,
    recordReadExecuted:false,
    recordCountRead:0,
  };
}
