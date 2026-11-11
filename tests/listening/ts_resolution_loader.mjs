/** REVIEW-ONLY Node 22 test loader for extensionless local TS dependencies.
 * Required because Soullab's actual Next/TypeScript config forbids import './x.ts'.
 * Do NOT add this loader to production runtime or package.json. */
export async function resolve(specifier, context, nextResolve) {
  try { return await nextResolve(specifier, context); }
  catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') &&
        !/\.(?:mjs|cjs|js|ts|tsx|json)$/.test(specifier)) {
      return nextResolve(specifier + '.ts', context);
    }
    throw error;
  }
}
