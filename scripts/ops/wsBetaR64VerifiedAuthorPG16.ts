/**
 * R64 opt-in only: R54 real-browser fictional Apply/Undo through R53/R46/R47
 * preceded by the actual R56 session/consent/Source/Draft/Work SQL checks.
 * This does not mount Next.js routes or issue operationally independent keys.
 */
if(process.env.R64_REAL_SESSION_AUTHOR_FIXTURE!=='fictional-only'||
   process.env.R55_REAL_PC3_CONVERGENCE_FIXTURE!=='fictional-only'||
   process.env.NODE_ENV!=='test')
  throw Error('R64_EXACT_DISPOSABLE_AUTHOR_FIXTURE_REQUIRED');
// These are the accepted R55/R39 physical test marker names. Setting them
// here affects this child fixture process only, never a real Next runtime.
for(const k of [
 'R39_PHYSICAL_PG16_FIXTURE','R43_AUTHOR_CHOICE_FIXTURE',
 'R46_DURABLE_SIGNED_APPLY_FIXTURE','R47_DURABLE_UNDO_FIXTURE',
 'R48_SPENT_APPLY_RECOVERY_FIXTURE','R50_APPLY_UNDO_CONVERGENCE_FIXTURE',
 'R53_PHYSICAL_PG16_FIXTURE','R53_CANONICAL_AUTHOR_FIXTURE',
 'R54_PHYSICAL_PG16_FIXTURE','R54_PC3_BROWSER_FIXTURE',
])process.env[k]='fictional-only';
void import('./wsBetaR55ConvergedPc3PG16');
