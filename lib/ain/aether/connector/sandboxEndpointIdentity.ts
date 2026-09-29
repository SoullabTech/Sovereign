export interface SandboxEndpointIdentity {
  endpointRef:string;
  environment:'sandbox';
  scheme:'https';
  host:string;
  port:443;
  realMemberDataPresent:false;
  productionDataPresent:false;
}
