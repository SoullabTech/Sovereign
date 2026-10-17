/**
 * R65 fiction-only one-PG16 encrypted Source/Draft/private proposal ->
 * verified session -> exact reviewed author Apply -> separate Undo.
 * No real key issuer, member, outbound model, live Next route or deployment.
 */
if(process.env.R65_PRIVATE_APPROVED_AUTHOR_FIXTURE!=='fictional-only'||
   process.env.R64_REAL_SESSION_AUTHOR_FIXTURE!=='fictional-only'||
   process.env.R55_REAL_PC3_CONVERGENCE_FIXTURE!=='fictional-only'||
   process.env.NODE_ENV!=='test')
 throw Error('R65_DISPOSABLE_EXACT_PRIVATE_AUTHOR_OPT_IN_REQUIRED');
for(const marker of [
 'R39_PHYSICAL_PG16_FIXTURE','R43_AUTHOR_CHOICE_FIXTURE',
 'R46_DURABLE_SIGNED_APPLY_FIXTURE','R47_DURABLE_UNDO_FIXTURE',
 'R48_SPENT_APPLY_RECOVERY_FIXTURE','R50_APPLY_UNDO_CONVERGENCE_FIXTURE',
 'R53_PHYSICAL_PG16_FIXTURE','R53_CANONICAL_AUTHOR_FIXTURE',
 'R54_PHYSICAL_PG16_FIXTURE','R54_PC3_BROWSER_FIXTURE',
])process.env[marker]='fictional-only';
void import('./wsBetaR55ConvergedPc3PG16');
