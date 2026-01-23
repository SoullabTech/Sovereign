#!/usr/bin/env npx tsx
/**
 * maia new-client <slug> - Create a new client
 * Generates: registry entry, vault folder, config templates
 */

import chalk from 'chalk';
import { createInterface } from 'readline';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import {
  loadRegistry,
  saveRegistry,
  getClient,
  getProjectRoot,
  type ClientConfig
} from '../lib/registry.js';
import {
  createClientFolder,
  clientFolderExists,
  type TemplateVars
} from '../lib/obsidian.js';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string, defaultValue?: string): Promise<string> {
  const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  return new Promise(resolve => {
    rl.question(chalk.cyan(prompt), answer => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

function askChoice(question: string, options: string[]): Promise<string> {
  console.log(chalk.cyan(question));
  options.forEach((opt, i) => console.log(chalk.dim(`  ${i + 1}. ${opt}`)));
  return new Promise(resolve => {
    rl.question(chalk.cyan('Choice: '), answer => {
      const index = parseInt(answer, 10) - 1;
      resolve(options[index] || options[0]);
    });
  });
}

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.log(chalk.red('Usage: maia new-client <slug>'));
    console.log(chalk.dim('Example: maia new-client acme'));
    process.exit(1);
  }

  // Validate slug
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.log(chalk.red('Slug must be lowercase alphanumeric with hyphens only'));
    process.exit(1);
  }

  // Check if client already exists
  const existing = getClient(slug);
  if (existing) {
    console.log(chalk.red(`Client "${slug}" already exists in registry`));
    process.exit(1);
  }

  console.log(chalk.cyan.bold('\n═══ NEW CLIENT WIZARD ═══\n'));
  console.log(chalk.dim(`Creating client: ${slug}\n`));

  // Gather information
  const name = await ask('Client name (display name)', slug.charAt(0).toUpperCase() + slug.slice(1));
  const domain = await ask('Domain', `${slug}.soullab.life`);
  const tier = await askChoice('Business tier', ['seed', 'root', 'crown']) as 'seed' | 'root' | 'crown';
  const modulesInput = await ask('Modules (comma-separated)', 'portal');
  const modules = modulesInput.split(',').map(m => m.trim()).filter(Boolean);
  const notes = await ask('Notes (optional)', '');

  // Derive vault folder name (PascalCase)
  const vaultFolderName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const vaultFolder = `Clients/${vaultFolderName}`;

  // Confirm
  console.log(chalk.yellow('\n═══ REVIEW ═══\n'));
  console.log(`  Slug:     ${chalk.white(slug)}`);
  console.log(`  Name:     ${chalk.white(name)}`);
  console.log(`  Domain:   ${chalk.white(domain)}`);
  console.log(`  Tier:     ${chalk.white(tier)}`);
  console.log(`  Modules:  ${chalk.white(modules.join(', '))}`);
  console.log(`  Vault:    ${chalk.white(vaultFolder)}`);
  if (notes) console.log(`  Notes:    ${chalk.white(notes)}`);

  const confirm = await ask('\nCreate this client? (y/n)', 'y');
  if (confirm.toLowerCase() !== 'y') {
    console.log(chalk.dim('Cancelled'));
    rl.close();
    process.exit(0);
  }

  // Create registry entry
  console.log(chalk.cyan('\n→ Adding to registry...'));
  const today = new Date().toISOString().split('T')[0];
  const clientConfig: ClientConfig = {
    name,
    domain,
    status: 'onboarding',
    tier,
    modules,
    db_schema: 'public',
    vault_folder: vaultFolder,
    stripe_customer: null,
    launched_at: null,
    notes: notes || undefined,
  };

  const registry = loadRegistry();
  registry.clients[slug] = clientConfig;
  saveRegistry(registry);
  console.log(chalk.green('  ✓ Registry updated'));

  // Create vault folder
  console.log(chalk.cyan('→ Creating vault folder...'));
  const projectRoot = getProjectRoot();
  const templatePath = resolve(projectRoot, 'clients/templates/obsidian-client');

  const templateVars: TemplateVars = {
    CLIENT_NAME: name,
    SLUG: slug,
    DOMAIN: domain,
    DATE: today,
  };

  if (!clientFolderExists(vaultFolderName)) {
    createClientFolder(vaultFolderName, templatePath, templateVars);
    console.log(chalk.green(`  ✓ Created ~/Documents/AIN/${vaultFolder}`));
  } else {
    console.log(chalk.yellow(`  ⚠ Vault folder already exists`));
  }

  // Create runtime config files
  console.log(chalk.cyan('→ Creating config templates...'));
  const runtimeDir = resolve(projectRoot, 'clients/runtime');
  if (!existsSync(runtimeDir)) {
    mkdirSync(runtimeDir, { recursive: true });
  }

  // Caddy block
  const caddyTemplatePath = resolve(projectRoot, 'clients/templates/caddy-block.template');
  if (existsSync(caddyTemplatePath)) {
    let caddyContent = readFileSync(caddyTemplatePath, 'utf-8');
    caddyContent = caddyContent.replace(/\{\{SLUG\}\}/g, slug);
    caddyContent = caddyContent.replace(/\{\{DOMAIN\}\}/g, domain);
    writeFileSync(resolve(runtimeDir, `${slug}.caddy`), caddyContent);
    console.log(chalk.green(`  ✓ Created clients/runtime/${slug}.caddy`));
  }

  // Env template
  const envTemplatePath = resolve(projectRoot, 'clients/templates/env.template');
  if (existsSync(envTemplatePath)) {
    let envContent = readFileSync(envTemplatePath, 'utf-8');
    envContent = envContent.replace(/\{\{SLUG\}\}/g, slug);
    envContent = envContent.replace(/\{\{CLIENT_NAME\}\}/g, name);
    envContent = envContent.replace(/\{\{DOMAIN\}\}/g, domain);
    writeFileSync(resolve(runtimeDir, `${slug}.env`), envContent);
    console.log(chalk.green(`  ✓ Created clients/runtime/${slug}.env`));
  }

  console.log(chalk.green.bold('\n═══ CLIENT CREATED ═══\n'));
  console.log(chalk.dim('Next steps:'));
  console.log(`  1. Edit vault intake: ~/Documents/AIN/${vaultFolder}/00-Intake.md`);
  console.log(`  2. Configure Caddy: cat clients/runtime/${slug}.caddy >> Caddyfile`);
  console.log(`  3. When ready: maia up ${slug}`);
  console.log();

  rl.close();
}

main().catch(err => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
