import type { OperatorSandboxEndpointAttestation } from './sandboxEndpointCustody';

export interface SandboxEndpointIntakeInput {
  endpointRef:string;
  url:string;
  realMemberDataPresent:boolean;
  productionDataPresent:boolean;
  productionCredentialsAccepted:boolean;
  note:string;
}

export interface SandboxEndpointIntakeResult {
  accepted:boolean;
  errors:string[];
  attestation:OperatorSandboxEndpointAttestation|null;
}

const FORBIDDEN_HOSTS=new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  'soullab.life',
  'www.soullab.life',
  'staging.soullab.life',
]);

export function intakeOperatorSandboxEndpoint(
  input:SandboxEndpointIntakeInput,
):SandboxEndpointIntakeResult{
  const errors:string[]=[];
  let parsed:URL|null=null;

  try{
    parsed=new URL(input.url);
  }catch{
    errors.push('sandbox_url_invalid');
  }

  if(parsed){
    if(parsed.protocol!=='https:') errors.push('sandbox_https_required');
    if(FORBIDDEN_HOSTS.has(parsed.hostname)) errors.push('sandbox_host_forbidden');
    if(parsed.port&&parsed.port!=='443') errors.push('sandbox_port_must_be_443');
    if(parsed.pathname!=='/'&&parsed.pathname!=='') errors.push('sandbox_base_url_must_not_include_path');
    if(parsed.search) errors.push('sandbox_base_url_query_forbidden');
    if(parsed.hash) errors.push('sandbox_base_url_fragment_forbidden');
  }

  if(!input.endpointRef.trim()) errors.push('endpoint_ref_required');
  if(input.realMemberDataPresent!==false) errors.push('real_member_data_present_forbidden');
  if(input.productionDataPresent!==false) errors.push('production_data_present_forbidden');
  if(input.productionCredentialsAccepted!==false){
    errors.push('production_credentials_acceptance_forbidden');
  }
  if(!input.note.trim()) errors.push('attestation_note_required');

  if(errors.length>0||!parsed){
    return {
      accepted:false,
      errors:[...new Set(errors)],
      attestation:null,
    };
  }

  return {
    accepted:true,
    errors:[],
    attestation:{
      attestationRef:'operator-sandbox:'+input.endpointRef,
      operator:'human',
      endpointRef:input.endpointRef,
      host:parsed.hostname,
      environment:'sandbox',
      realMemberDataPresent:false,
      productionDataPresent:false,
      productionCredentialsAccepted:false,
      healthPath:'/health',
      attested:true,
      note:input.note,
    },
  };
}
