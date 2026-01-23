#!/usr/bin/env npx tsx
/**
 * maia doctor - System diagnostics
 * Checks: ports, docker, caddy, hosts, DNS, registry integrity
 */

import chalk from 'chalk';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { getAllClients, getProjectRoot, getRegistryPath } from '../lib/registry.js';
import { isDockerRunning, getContainers, getPortMappings } from '../lib/docker.js';
import { checkDomainHealth } from '../lib/health.js';
import { vaultExists, clientFolderExists, getClientsPath } from '../lib/obsidian.js';

interface Check {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const checks: Check[] = [];

function check(name: string, condition: boolean, passMsg: string, failMsg: string, isWarning = false) {
  checks.push({
    name,
    status: condition ? 'pass' : (isWarning ? 'warn' : 'fail'),
    message: condition ? passMsg : failMsg,
  });
}

async function main() {
  console.log(chalk.cyan.bold('\n═══ MAIA DOCTOR ═══\n'));
  console.log(chalk.dim('Running system diagnostics...\n'));

  const projectRoot = getProjectRoot();

  // Docker
  console.log(chalk.yellow.bold('🐳 DOCKER'));
  const dockerRunning = isDockerRunning();
  check('Docker Daemon', dockerRunning, 'Running', 'Not running');

  if (dockerRunning) {
    const containers = getContainers();
    check('Containers', containers.length > 0, `${containers.length} containers up`, 'No containers running');

    // Check for key containers
    const hasMain = containers.some(c => c.name === 'maia' || c.name.includes('maia'));
    check('MAIA Container', hasMain, 'Found', 'Not found', true);

    const hasCaddy = containers.some(c => c.name.includes('caddy'));
    check('Caddy Container', hasCaddy, 'Found', 'Not found', true);

    const hasPostgres = containers.some(c => c.name.includes('postgres'));
    check('Postgres Container', hasPostgres, 'Found', 'Not found', true);
  }
  console.log();

  // Ports
  console.log(chalk.yellow.bold('🔌 PORTS'));
  if (dockerRunning) {
    const portMap = getPortMappings();

    // Check for port conflicts
    const port80 = portMap[80];
    const port443 = portMap[443];
    const port3000 = portMap[3000];

    check('Port 80', !!port80, `Mapped to ${port80}`, 'Not mapped', true);
    check('Port 443', !!port443, `Mapped to ${port443}`, 'Not mapped', true);
    check('Port 3000', !!port3000, `Mapped to ${port3000}`, 'Not mapped', true);
  } else {
    check('Port Check', false, '', 'Skipped (Docker not running)', true);
  }
  console.log();

  // Registry
  console.log(chalk.yellow.bold('📋 REGISTRY'));
  const registryPath = getRegistryPath();
  const registryExists = existsSync(registryPath);
  check('Registry File', registryExists, 'Found', 'Not found at clients/registry.yml');

  if (registryExists) {
    try {
      const clients = getAllClients();
      const clientCount = Object.keys(clients).length;
      check('Registry Parse', true, `${clientCount} clients defined`, 'Parse error');

      // Validate each client
      for (const [slug, config] of Object.entries(clients)) {
        // Check required fields
        const hasRequired = config.name && config.domain && config.status && config.tier;
        check(`Client: ${slug}`, !!hasRequired, 'Valid config', 'Missing required fields');

        // Check vault folder exists
        const vaultFolderName = config.vault_folder?.replace('Clients/', '');
        if (vaultFolderName) {
          const vaultOk = clientFolderExists(vaultFolderName);
          check(`  Vault: ${slug}`, vaultOk, 'Folder exists', 'Vault folder missing', true);
        }
      }
    } catch (e) {
      check('Registry Parse', false, '', `Error: ${e}`);
    }
  }
  console.log();

  // Vault
  console.log(chalk.yellow.bold('📁 OBSIDIAN VAULT'));
  const hasVault = vaultExists();
  check('Vault Location', hasVault, `Found at ${getClientsPath()}`, 'Not found at ~/Documents/AIN');
  console.log();

  // Caddyfile
  console.log(chalk.yellow.bold('🔒 CADDY'));
  const caddyfilePath = resolve(projectRoot, 'Caddyfile');
  const hasCaddyfile = existsSync(caddyfilePath);
  check('Caddyfile', hasCaddyfile, 'Found', 'Not found');

  if (hasCaddyfile) {
    const caddyContent = readFileSync(caddyfilePath, 'utf-8');
    const clients = getAllClients();

    for (const [slug, config] of Object.entries(clients)) {
      if (config.status === 'active') {
        const hasEntry = caddyContent.includes(config.domain);
        check(`  Route: ${config.domain}`, hasEntry, 'Configured', 'Not in Caddyfile', true);
      }
    }
  }
  console.log();

  // DNS (quick check)
  console.log(chalk.yellow.bold('🌐 CONNECTIVITY'));
  const clients = getAllClients();
  for (const [slug, config] of Object.entries(clients)) {
    if (config.status === 'active') {
      const health = await checkDomainHealth(config.domain);
      check(`  ${config.domain}`, health.healthy, `Responding (${health.latencyMs}ms)`, 'Not responding', true);
    }
  }
  console.log();

  // Summary
  console.log(chalk.cyan.bold('═══ SUMMARY ═══\n'));

  const passed = checks.filter(c => c.status === 'pass').length;
  const warned = checks.filter(c => c.status === 'warn').length;
  const failed = checks.filter(c => c.status === 'fail').length;

  for (const c of checks) {
    const icon = c.status === 'pass' ? chalk.green('✓') :
                 c.status === 'warn' ? chalk.yellow('⚠') :
                 chalk.red('✗');
    const color = c.status === 'pass' ? chalk.green :
                  c.status === 'warn' ? chalk.yellow :
                  chalk.red;
    console.log(`${icon} ${c.name.padEnd(25)} ${color(c.message)}`);
  }

  console.log();
  console.log(`${chalk.green(passed)} passed, ${chalk.yellow(warned)} warnings, ${chalk.red(failed)} failed`);

  if (failed > 0) {
    console.log(chalk.red('\nSome checks failed. Review the issues above.'));
    process.exit(1);
  } else if (warned > 0) {
    console.log(chalk.yellow('\nAll critical checks passed with some warnings.'));
  } else {
    console.log(chalk.green('\nAll checks passed! System is healthy.'));
  }
  console.log();
}

main().catch(err => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
