#!/usr/bin/env node
/**
 * Generate Access Matrix from Offerings Inventory
 *
 * Reads OFFERINGS_INVENTORY.json and generates the ACCESS_RULES array
 * for config/accessMatrix.ts
 *
 * Usage:
 *   npx tsx scripts/generate-access-matrix.ts
 *   # or
 *   npm run generate:access-matrix
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Offering {
  name: string;
  route: string;
  minTier: string | null;
  public?: boolean;
  roles?: string[];
  notes?: string;
}

interface Category {
  id: string;
  name: string;
  offerings: Offering[];
}

interface Inventory {
  version: string;
  generated: string;
  tiers: Record<string, { price: number; label: string }>;
  roles: string[];
  categories: Category[];
}

interface AccessRule {
  exact?: string;
  prefix?: string;
  regex?: string;
  minTier?: string;
  rolesAnyOf?: string[];
  public?: boolean;
  notes?: string;
}

function routeToRule(offering: Offering): AccessRule {
  const rule: AccessRule = {};

  // Determine route type
  const route = offering.route;

  if (route.includes('*')) {
    // Wildcard → prefix
    // /foo/* → /foo
    // /foo* → /foo
    rule.prefix = route.replace(/\/?\*$/, '').replace(/\*$/, '');
  } else if (route.includes('[') || route.includes(':')) {
    // Dynamic segment → regex
    // /api/members/[id] → /api/members/[^/]+
    const regexPattern = route
      .replace(/\[([^\]]+)\]/g, '[^/]+')
      .replace(/:([^/]+)/g, '[^/]+');
    rule.regex = `^${regexPattern}$`;
  } else {
    // Exact match
    rule.exact = route;
  }

  // Set tier
  if (offering.public) {
    rule.public = true;
  } else if (offering.minTier) {
    rule.minTier = offering.minTier;
  }

  // Set roles
  if (offering.roles && offering.roles.length > 0) {
    rule.rolesAnyOf = offering.roles;
  }

  // Add notes
  if (offering.notes) {
    rule.notes = offering.notes;
  } else {
    rule.notes = offering.name;
  }

  return rule;
}

function ruleToString(rule: AccessRule): string {
  const parts: string[] = [];

  if (rule.exact) {
    parts.push(`exact: '${rule.exact}'`);
  } else if (rule.prefix) {
    parts.push(`prefix: '${rule.prefix}'`);
  } else if (rule.regex) {
    parts.push(`regex: /^${rule.regex.slice(1, -1)}$/`);
  }

  if (rule.public) {
    parts.push(`public: true`);
  } else if (rule.minTier) {
    parts.push(`minTier: '${rule.minTier}'`);
  }

  if (rule.rolesAnyOf && rule.rolesAnyOf.length > 0) {
    parts.push(`rolesAnyOf: [${rule.rolesAnyOf.map((r) => `'${r}'`).join(', ')}]`);
  }

  if (rule.notes) {
    parts.push(`notes: '${rule.notes.replace(/'/g, "\\'")}'`);
  }

  return `  { ${parts.join(', ')} }`;
}

function generateAccessRules(inventory: Inventory): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * ACCESS_RULES - Auto-generated from OFFERINGS_INVENTORY.json');
  lines.push(` * Generated: ${new Date().toISOString()}`);
  lines.push(` * Source version: ${inventory.version}`);
  lines.push(' *');
  lines.push(' * DO NOT EDIT MANUALLY - Run scripts/generate-access-matrix.ts');
  lines.push(' */');
  lines.push('');
  lines.push('export const ACCESS_RULES: AccessRule[] = [');

  for (const category of inventory.categories) {
    lines.push(`  // ${category.name}`);

    for (const offering of category.offerings) {
      const rule = routeToRule(offering);
      lines.push(`${ruleToString(rule)},`);
    }

    lines.push('');
  }

  // Remove trailing comma from last rule
  const lastRuleIndex = lines.findLastIndex((l) => l.endsWith(','));
  if (lastRuleIndex !== -1) {
    lines[lastRuleIndex] = lines[lastRuleIndex].slice(0, -1);
  }

  lines.push('];');

  return lines.join('\n');
}

function main() {
  // Read inventory JSON - try multiple paths
  const possiblePaths = [
    path.resolve(__dirname, '../../practitioner-os/docs/OFFERINGS_INVENTORY.json'),
    path.resolve(__dirname, '../docs/OFFERINGS_INVENTORY.json'),
    '/Users/soullab/practitioner-os/docs/OFFERINGS_INVENTORY.json',
  ];

  let inventoryPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      inventoryPath = p;
      break;
    }
  }

  if (!inventoryPath) {
    console.error('Error: Inventory file not found. Checked:');
    possiblePaths.forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
  }

  const inventoryJson = fs.readFileSync(inventoryPath, 'utf-8');
  const inventory: Inventory = JSON.parse(inventoryJson);

  console.log(`Reading inventory v${inventory.version} (${inventory.generated})`);
  console.log(`Found ${inventory.categories.length} categories`);

  let totalOfferings = 0;
  for (const cat of inventory.categories) {
    totalOfferings += cat.offerings.length;
  }
  console.log(`Total offerings: ${totalOfferings}`);

  // Generate rules
  const rulesCode = generateAccessRules(inventory);

  // Output to stdout for review
  console.log('\n--- Generated ACCESS_RULES ---\n');
  console.log(rulesCode);
  console.log('\n--- End ---\n');

  // Write to a generated file
  const outputPath = path.resolve(__dirname, '../config/accessMatrix.generated.ts');
  fs.writeFileSync(outputPath, rulesCode);
  console.log(`Written to: ${outputPath}`);
  console.log('');
  console.log('To apply:');
  console.log('  1. Review the generated rules');
  console.log('  2. Copy ACCESS_RULES into config/accessMatrix.ts');
  console.log('  3. Or replace the file content if structure matches');
}

main();
