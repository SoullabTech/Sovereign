/**
 * Next.js instrumentation hook — runs once at server startup.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Node.js runtime only (edge runtime has no DB access).
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runSchemaCheck } = await import('@/lib/db/schemaCheck');
    await runSchemaCheck();
  }
}
