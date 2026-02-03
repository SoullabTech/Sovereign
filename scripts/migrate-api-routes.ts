#!/usr/bin/env npx tsx
/**
 * API Route Migration Script
 *
 * Helps migrate Next.js API routes to the new MAIA API service.
 *
 * Usage:
 *   npx tsx scripts/migrate-api-routes.ts [--list] [--migrate <domain>]
 *
 * Examples:
 *   npx tsx scripts/migrate-api-routes.ts --list              # List all routes
 *   npx tsx scripts/migrate-api-routes.ts --migrate members   # Migrate members routes
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename } from 'path';

const PROJECT_ROOT = process.cwd();
const NEXT_API_DIR = join(PROJECT_ROOT, 'app/api');
const EXPRESS_API_DIR = join(PROJECT_ROOT, 'apps/api/src/routes');

interface RouteInfo {
  path: string;         // e.g., "members/check"
  filePath: string;     // Full path to route.ts
  methods: string[];    // GET, POST, PUT, DELETE, etc.
  hasDynamicParams: boolean;
  domain: string;       // First segment, e.g., "members"
}

/**
 * Find all Next.js API routes
 */
async function findAllRoutes(): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = [];

  async function walkDir(dir: string, prefix: string = '') {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip _backend and other internal dirs
        if (entry.name.startsWith('_')) continue;

        const newPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
        await walkDir(fullPath, newPrefix);
      } else if (entry.name === 'route.ts') {
        const routePath = prefix;
        const content = await readFile(fullPath, 'utf-8');

        // Detect HTTP methods
        const methods: string[] = [];
        if (content.includes('async function GET')) methods.push('GET');
        if (content.includes('export async function GET')) methods.push('GET');
        if (content.includes('async function POST')) methods.push('POST');
        if (content.includes('export async function POST')) methods.push('POST');
        if (content.includes('async function PUT')) methods.push('PUT');
        if (content.includes('export async function PUT')) methods.push('PUT');
        if (content.includes('async function PATCH')) methods.push('PATCH');
        if (content.includes('export async function PATCH')) methods.push('PATCH');
        if (content.includes('async function DELETE')) methods.push('DELETE');
        if (content.includes('export async function DELETE')) methods.push('DELETE');

        // Check for dynamic params
        const hasDynamicParams = routePath.includes('[') && routePath.includes(']');

        // Get domain (first segment)
        const domain = routePath.split('/')[0];

        routes.push({
          path: routePath,
          filePath: fullPath,
          methods,
          hasDynamicParams,
          domain
        });
      }
    }
  }

  await walkDir(NEXT_API_DIR);
  return routes.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Group routes by domain
 */
function groupByDomain(routes: RouteInfo[]): Map<string, RouteInfo[]> {
  const grouped = new Map<string, RouteInfo[]>();

  for (const route of routes) {
    const existing = grouped.get(route.domain) || [];
    existing.push(route);
    grouped.set(route.domain, existing);
  }

  return grouped;
}

/**
 * List all routes with status
 */
async function listRoutes() {
  const routes = await findAllRoutes();
  const grouped = groupByDomain(routes);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                 MAIA API Route Migration Status                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');

  let totalRoutes = 0;
  let migratedRoutes = 0;

  for (const [domain, domainRoutes] of grouped) {
    console.log(`\n┌─ ${domain.toUpperCase()} (${domainRoutes.length} routes)`);

    for (const route of domainRoutes) {
      totalRoutes++;
      const expressPath = getExpressRoutePath(route.path);
      const migrated = existsSync(join(EXPRESS_API_DIR, domain, 'index.ts'));
      const status = migrated ? '✓' : '○';

      if (migrated) migratedRoutes++;

      const methodStr = route.methods.join(',').padEnd(12);
      const dynamicStr = route.hasDynamicParams ? '[dynamic]' : '';

      console.log(`│  ${status} ${methodStr} /v1/${route.path} ${dynamicStr}`);
    }
  }

  console.log('\n╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total: ${totalRoutes} routes | Migrated: ${migratedRoutes} | Remaining: ${totalRoutes - migratedRoutes}`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Print summary by domain
  console.log('Routes by domain:');
  for (const [domain, domainRoutes] of grouped) {
    console.log(`  ${domain}: ${domainRoutes.length}`);
  }
}

/**
 * Convert Next.js route path to Express route path
 * e.g., "portal/[slug]/config" -> "portal/:slug/config"
 */
function getExpressRoutePath(nextPath: string): string {
  return nextPath.replace(/\[([^\]]+)\]/g, ':$1');
}

/**
 * Generate Express route stub from Next.js route
 */
async function generateRouteStub(route: RouteInfo): Promise<string> {
  const content = await readFile(route.filePath, 'utf-8');
  const expressPath = getExpressRoutePath(route.path);

  let stub = `/**
 * ${route.path} Route
 *
 * Migrated from: ${route.filePath.replace(PROJECT_ROOT, '')}
 */

import { Request, Response } from 'express';
import { query } from '../../db/postgres.js';
import { Errors, asyncHandler } from '../../middleware/error.js';

`;

  // Generate handler for each method
  for (const method of route.methods) {
    const methodName = method.toLowerCase();
    const handlerName = `handle${method.charAt(0) + method.slice(1).toLowerCase()}`;

    stub += `export async function ${handlerName}(req: Request, res: Response) {
  // TODO: Migrate logic from ${route.filePath.replace(PROJECT_ROOT, '')}
  ${route.hasDynamicParams ? `const { ${extractParams(route.path).join(', ')} } = req.params;` : ''}

  return res.json({
    success: true,
    data: {
      message: 'Not yet implemented',
      path: '${expressPath}'
    }
  });
}

`;
  }

  return stub;
}

/**
 * Extract dynamic params from path
 */
function extractParams(path: string): string[] {
  const matches = path.match(/\[([^\]]+)\]/g) || [];
  return matches.map(m => m.slice(1, -1));
}

/**
 * Migrate routes for a domain
 */
async function migrateDomain(domain: string) {
  const routes = await findAllRoutes();
  const domainRoutes = routes.filter(r => r.domain === domain);

  if (domainRoutes.length === 0) {
    console.log(`No routes found for domain: ${domain}`);
    return;
  }

  console.log(`\nMigrating ${domainRoutes.length} routes for domain: ${domain}`);

  // Create domain directory
  const domainDir = join(EXPRESS_API_DIR, domain);
  await mkdir(domainDir, { recursive: true });

  // Generate index.ts
  let indexContent = `/**
 * ${domain.charAt(0).toUpperCase() + domain.slice(1)} Routes
 *
 * Auto-generated migration stub.
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/error.js';
`;

  const handlers: string[] = [];

  for (const route of domainRoutes) {
    const routeName = route.path.split('/').slice(1).join('-') || 'root';
    const safeRouteName = routeName.replace(/\[|\]/g, '').replace(/-/g, '_');
    const handlerFile = `./${safeRouteName}.js`;

    // Generate handler imports
    for (const method of route.methods) {
      const handlerName = `handle${method.charAt(0) + method.slice(1).toLowerCase()}`;
      handlers.push(`import { ${handlerName} as ${safeRouteName}_${handlerName} } from '${handlerFile}';`);
    }

    // Generate route file
    const routeStub = await generateRouteStub(route);
    const routeFilePath = join(domainDir, `${safeRouteName}.ts`);

    if (!existsSync(routeFilePath)) {
      await writeFile(routeFilePath, routeStub);
      console.log(`  Created: ${routeFilePath.replace(PROJECT_ROOT, '')}`);
    } else {
      console.log(`  Skipped (exists): ${routeFilePath.replace(PROJECT_ROOT, '')}`);
    }
  }

  indexContent += `
${handlers.join('\n')}

const router = Router();

// TODO: Wire up routes
// Example:
// router.get('/:slug/config', asyncHandler(slug_config_handleGet));

export default router;
`;

  const indexPath = join(domainDir, 'index.ts');
  if (!existsSync(indexPath)) {
    await writeFile(indexPath, indexContent);
    console.log(`  Created: ${indexPath.replace(PROJECT_ROOT, '')}`);
  }

  console.log(`\nDone! Don't forget to:`);
  console.log(`  1. Import and use in apps/api/src/index.ts`);
  console.log(`  2. Update lib/api-client.ts with new methods`);
  console.log(`  3. Test the migrated routes`);
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list') || args.length === 0) {
    await listRoutes();
  } else if (args.includes('--migrate')) {
    const domainIndex = args.indexOf('--migrate') + 1;
    const domain = args[domainIndex];

    if (!domain) {
      console.error('Error: --migrate requires a domain name');
      console.log('Usage: npx tsx scripts/migrate-api-routes.ts --migrate <domain>');
      process.exit(1);
    }

    await migrateDomain(domain);
  } else {
    console.log('MAIA API Route Migration Tool');
    console.log('');
    console.log('Usage:');
    console.log('  npx tsx scripts/migrate-api-routes.ts --list              # List all routes');
    console.log('  npx tsx scripts/migrate-api-routes.ts --migrate <domain>  # Migrate routes');
  }
}

main().catch(console.error);
