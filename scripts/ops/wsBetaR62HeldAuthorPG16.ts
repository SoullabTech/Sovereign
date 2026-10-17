/**
 * R62 fictional-only physical acceptance harness.
 * Does NOT mount a Next.js route, enable protected author writes or use real
 * credentials, keys, manuscripts, member records, paid providers or KMS.
 */
if(process.env.R62_HELD_AUTHOR_PG16_FIXTURE!=='fictional-only'||
   process.env.R61_HELD_AUTHOR_POST_FIXTURE!=='fictional-only'||
   process.env.R56_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
   process.env.NODE_ENV!=='test') {
  throw Error('R62_DISPOSABLE_POSTGRES16_EXPLICIT_OPT_IN_REQUIRED');
}
void import('./wsBetaR56SessionWorkPG16');
