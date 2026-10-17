/**
 * R66 disposable-only author proof. The R47 review, R44 one-use approval,
 * and R66 immutable link are held within one fictional SQL/vault fixture.
 * No real member, independent signer, Next public route or deployment.
 */
if(process.env.NODE_ENV!=='test'||
   process.env.R66_SEALED_APPROVAL_LINK_FIXTURE!=='fictional-only'||
   process.env.R65_PRIVATE_APPROVED_AUTHOR_FIXTURE!=='fictional-only'||
   process.env.R64_REAL_SESSION_AUTHOR_FIXTURE!=='fictional-only'||
   process.env.R55_REAL_PC3_CONVERGENCE_FIXTURE!=='fictional-only')
 throw Error('R66_EXPLICIT_DISPOSABLE_EXACT_FICTION_REQUIRED');
for(const marker of [
 'R39_PHYSICAL_PG16_FIXTURE','R43_AUTHOR_CHOICE_FIXTURE',
 'R46_DURABLE_SIGNED_APPLY_FIXTURE','R47_DURABLE_UNDO_FIXTURE',
 'R48_SPENT_APPLY_RECOVERY_FIXTURE','R50_APPLY_UNDO_CONVERGENCE_FIXTURE',
 'R53_PHYSICAL_PG16_FIXTURE','R53_CANONICAL_AUTHOR_FIXTURE',
 'R54_PHYSICAL_PG16_FIXTURE','R54_PC3_BROWSER_FIXTURE',
])process.env[marker]='fictional-only';
void import('./wsBetaR55ConvergedPc3PG16');
