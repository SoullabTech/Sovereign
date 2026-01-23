#!/usr/bin/env npx tsx
/**
 * maia focus <slug> - Deep-dive into a specific client
 * Opens links, shows logs, displays environment
 */

import chalk from 'chalk';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';
import { getClient, getProjectRoot } from '../lib/registry.js';
import { isContainerRunning, getContainerLogs } from '../lib/docker.js';
import { checkDomainHealth } from '../lib/health.js';
import { clientFolderExists, getClientFolderStats, getClientsPath } from '../lib/obsidian.js';

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.log(chalk.red('Usage: maia focus <slug>'));
    process.exit(1);
  }

  const client = getClient(slug);
  if (!client) {
    console.log(chalk.red(`Client "${slug}" not found in registry`));
    process.exit(1);
  }

  console.log(chalk.cyan.bold(`\n═══ FOCUS: ${client.name} ═══\n`));

  // Client Info
  console.log(chalk.yellow.bold('📋 CLIENT INFO'));
  console.log(`   Name:     ${client.name}`);
  console.log(`   Domain:   ${client.domain}`);
  console.log(`   Status:   ${client.status}`);
  console.log(`   Tier:     ${client.tier}`);
  console.log(`   Modules:  ${client.modules.join(', ')}`);
  console.log(`   Launched: ${client.launched_at || 'not yet'}`);
  if (client.notes) {
    console.log(`   Notes:    ${client.notes}`);
  }
  console.log();

  // Health Check
  console.log(chalk.yellow.bold('🏥 HEALTH'));
  const health = await checkDomainHealth(client.domain);
  if (health.healthy) {
    console.log(chalk.green(`   ✓ ${client.domain} is healthy (${health.latencyMs}ms)`));
  } else {
    console.log(chalk.red(`   ✗ ${client.domain} is not responding`));
    if (health.error) {
      console.log(chalk.dim(`     ${health.error}`));
    }
  }
  console.log();

  // Container Status
  console.log(chalk.yellow.bold('🐳 CONTAINER'));
  const isPortalClient = client.modules.includes('portal') || client.modules.includes('stellium');
  const containerName = isPortalClient ? 'maia' : slug;

  if (isContainerRunning(containerName)) {
    console.log(chalk.green(`   ✓ ${containerName} is running`));

    // Show recent logs
    console.log(chalk.dim(`\n   Recent logs (last 10 lines):`));
    const logs = getContainerLogs(containerName, 10);
    logs.split('\n').filter(Boolean).forEach(line => {
      console.log(chalk.dim(`   ${line.slice(0, 80)}`));
    });
  } else {
    console.log(chalk.red(`   ✗ ${containerName} is not running`));
  }
  console.log();

  // Vault Status
  console.log(chalk.yellow.bold('📁 VAULT'));
  const vaultFolderName = client.vault_folder.replace('Clients/', '');
  if (clientFolderExists(vaultFolderName)) {
    const stats = getClientFolderStats(vaultFolderName);
    console.log(chalk.green(`   ✓ ${getClientsPath()}/${vaultFolderName}/`));
    console.log(`     ${stats.files} files`);
    if (stats.lastModified) {
      console.log(`     Last modified: ${stats.lastModified.toLocaleDateString()}`);
    }
  } else {
    console.log(chalk.red(`   ✗ Vault folder not found`));
    console.log(chalk.dim(`     Expected: ~/Documents/AIN/${client.vault_folder}`));
  }
  console.log();

  // Runtime Config
  console.log(chalk.yellow.bold('⚙️  CONFIG'));
  const projectRoot = getProjectRoot();
  const runtimeDir = resolve(projectRoot, 'clients/runtime');
  const envPath = resolve(runtimeDir, `${slug}.env`);
  const caddyPath = resolve(runtimeDir, `${slug}.caddy`);

  if (existsSync(envPath)) {
    console.log(chalk.green(`   ✓ clients/runtime/${slug}.env`));
  } else {
    console.log(chalk.dim(`   ○ clients/runtime/${slug}.env (not created)`));
  }

  if (existsSync(caddyPath)) {
    console.log(chalk.green(`   ✓ clients/runtime/${slug}.caddy`));
  } else {
    console.log(chalk.dim(`   ○ clients/runtime/${slug}.caddy (not created)`));
  }
  console.log();

  // Quick Actions
  console.log(chalk.yellow.bold('⚡ QUICK ACTIONS'));
  console.log(chalk.dim(`   Open in browser:   open https://${client.domain}`));
  console.log(chalk.dim(`   Open vault:        open ~/Documents/AIN/${client.vault_folder}`));
  console.log(chalk.dim(`   Tail logs:         docker logs -f ${containerName}`));
  console.log(chalk.dim(`   Registry entry:    code ${projectRoot}/clients/registry.yml`));
  console.log();

  // Ask about opening
  const openArg = process.argv[3];
  if (openArg === '--open' || openArg === '-o') {
    console.log(chalk.cyan('→ Opening browser...'));
    try {
      execSync(`open https://${client.domain}`, { stdio: 'pipe' });
    } catch {
      // Ignore errors
    }
  }
}

main().catch(err => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
