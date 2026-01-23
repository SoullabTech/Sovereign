#!/usr/bin/env npx tsx
/**
 * maia status - Reality check command
 * Shows: Docker health, client domains, ports, vault status
 */

import chalk from 'chalk';
import { getAllClients, getActiveClients } from '../lib/registry.js';
import { isDockerRunning, getContainerCount, getPortMappings, getContainers } from '../lib/docker.js';
import { checkDomainHealth } from '../lib/health.js';
import { vaultExists, getClientFolders, getClientFolderStats, getClientsPath } from '../lib/obsidian.js';

const SEPARATOR = '═'.repeat(62);

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

async function main() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  console.log(chalk.cyan(SEPARATOR));
  console.log(chalk.cyan.bold('MAIA STATUS') + '                                       ' + chalk.dim(today));
  console.log(chalk.cyan(SEPARATOR));
  console.log();

  // Docker Status
  const dockerRunning = isDockerRunning();
  const containerCount = dockerRunning ? getContainerCount() : 0;

  console.log(chalk.yellow.bold('🐳 DOCKER'));
  if (dockerRunning) {
    console.log(chalk.green('   ✓ daemon running'));
    console.log(chalk.green(`   ✓ ${containerCount} containers up`));
  } else {
    console.log(chalk.red('   ✗ daemon not running'));
  }
  console.log();

  // Client Status
  console.log(chalk.yellow.bold('🌐 CLIENTS'));
  const clients = getAllClients();
  const clientEntries = Object.entries(clients);

  if (clientEntries.length === 0) {
    console.log(chalk.dim('   No clients registered'));
  } else {
    for (const [slug, config] of clientEntries) {
      let statusIcon = '○';
      let statusColor = chalk.dim;

      if (config.status === 'active') {
        // Check actual health
        const health = await checkDomainHealth(config.domain);
        if (health.healthy) {
          statusIcon = '✓';
          statusColor = chalk.green;
        } else {
          statusIcon = '✗';
          statusColor = chalk.red;
        }
      } else if (config.status === 'paused') {
        statusIcon = '⏸';
        statusColor = chalk.yellow;
      } else if (config.status === 'onboarding') {
        statusIcon = '◐';
        statusColor = chalk.blue;
      }

      const domain = config.domain.padEnd(26);
      const healthStatus = config.status === 'active' ? 'healthy' : config.status;
      const status = healthStatus.padEnd(10);
      const lastUpdate = config.launched_at ? formatTime(new Date(config.launched_at)) : 'never';

      console.log(statusColor(`   ${statusIcon} ${domain}${status}${lastUpdate}`));
    }
  }
  console.log();

  // Port Mappings
  console.log(chalk.yellow.bold('🔌 PORTS'));
  if (dockerRunning) {
    const portMap = getPortMappings();
    const commonPorts = [80, 443, 3000, 3001, 5432];

    for (const port of commonPorts) {
      const container = portMap[port];
      if (container) {
        console.log(chalk.green(`   ${String(port).padEnd(5)} → ${container}`));
      } else {
        console.log(chalk.dim(`   ${String(port).padEnd(5)} → (not mapped)`));
      }
    }

    // Show other mapped ports
    for (const [port, container] of Object.entries(portMap)) {
      const portNum = parseInt(port, 10);
      if (!commonPorts.includes(portNum)) {
        console.log(chalk.green(`   ${String(portNum).padEnd(5)} → ${container}`));
      }
    }
  } else {
    console.log(chalk.dim('   Docker not running'));
  }
  console.log();

  // Vault Status
  console.log(chalk.yellow.bold('📁 VAULT'));
  if (vaultExists()) {
    console.log(chalk.dim(`   ${getClientsPath()}/`));
    const folders = getClientFolders();
    for (const folder of folders) {
      const stats = getClientFolderStats(folder);
      console.log(chalk.green(`   ├── ${folder}/     (${stats.files} files)`));
    }
    if (folders.length === 0) {
      console.log(chalk.dim('   (no client folders)'));
    }
  } else {
    console.log(chalk.red('   ✗ Vault not found at ~/Documents/AIN'));
  }
  console.log();

  // Next Action
  console.log(chalk.yellow.bold('⚡ NEXT ACTION'));

  // Determine what needs attention
  const issues: string[] = [];

  if (!dockerRunning) {
    issues.push('Start Docker: docker compose up -d');
  }

  const activeClients = getActiveClients();
  for (const [slug, config] of Object.entries(activeClients)) {
    const health = await checkDomainHealth(config.domain);
    if (!health.healthy) {
      issues.push(`Check ${slug}: ${config.domain} is not responding`);
    }
  }

  if (issues.length === 0) {
    console.log(chalk.green('   None pending. All systems nominal.'));
  } else {
    for (const issue of issues) {
      console.log(chalk.yellow(`   → ${issue}`));
    }
  }

  console.log(chalk.cyan(SEPARATOR));
}

main().catch(console.error);
