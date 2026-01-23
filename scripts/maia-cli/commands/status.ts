#!/usr/bin/env npx tsx
/**
 * maia status - Reality check command
 * Shows: Docker health, client domains, ports, vault status
 *
 * Flags:
 *   --local    Check localhost endpoints instead of production domains
 */

import chalk from 'chalk';
import { getAllClients, getActiveClients } from '../lib/registry.js';
import { isDockerRunning, getContainerCount, getPortMappings, getContainers } from '../lib/docker.js';
import { checkDomainHealth, checkHealth } from '../lib/health.js';
import { vaultExists, getClientFolders, getClientFolderStats, getClientsPath } from '../lib/obsidian.js';

const SEPARATOR = '═'.repeat(62);
const LOCAL_MODE = process.argv.includes('--local') || process.argv.includes('-l');

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
  const modeLabel = LOCAL_MODE ? chalk.blue(' [LOCAL]') : '';
  console.log(chalk.cyan.bold('MAIA STATUS') + modeLabel + '                               ' + chalk.dim(today));
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

  // Local API Health (when in local mode)
  let localHealthOk = true;
  let localReadyOk = true;
  let localReadyFallback = false;

  if (LOCAL_MODE) {
    console.log(chalk.yellow.bold('🏥 LOCAL API'));
    const healthResult = await checkHealth('http://localhost/api/health');
    const readyResult = await checkHealth('http://localhost/api/ready');

    // Check if /api/health is ok
    if (healthResult.healthy) {
      console.log(chalk.green(`   ✓ /api/health    ok (${healthResult.latencyMs}ms)`));
    } else {
      localHealthOk = false;
      console.log(chalk.red(`   ✗ /api/health    ${healthResult.error || 'failed'}`));
    }

    // Check /api/ready - but distinguish between "truly broken" and "fallback mode"
    if (readyResult.healthy) {
      console.log(chalk.green(`   ✓ /api/ready     ok (${readyResult.latencyMs}ms)`));
    } else {
      // Check if it's just running in fallback mode (not truly broken)
      const readyData = readyResult.data as { critical?: string[]; dependencies?: Record<string, { status: string }> } | undefined;
      const criticalMessages = readyData?.critical || [];
      const hasFallback = criticalMessages.some((msg: string) => msg.toLowerCase().includes('fall back'));
      const dbOk = readyData?.dependencies?.dbSchema?.status === 'ready';

      if (hasFallback && dbOk) {
        // It's degraded but functional - Ollama offline but falling back to Claude
        localReadyFallback = true;
        console.log(chalk.blue(`   ℹ /api/ready     ok (fallback mode, ${readyResult.latencyMs}ms)`));
      } else {
        localReadyOk = false;
        console.log(chalk.yellow(`   ⚠ /api/ready     not ready (${readyResult.latencyMs}ms)`));
      }
    }
    console.log();
  }

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
        if (LOCAL_MODE) {
          // In local mode, skip domain checks - just show registry status
          statusIcon = '○';
          statusColor = chalk.dim;
        } else {
          // Check actual health via production domain
          const health = await checkDomainHealth(config.domain);
          if (health.healthy) {
            statusIcon = '✓';
            statusColor = chalk.green;
          } else {
            statusIcon = '✗';
            statusColor = chalk.red;
          }
        }
      } else if (config.status === 'paused') {
        statusIcon = '⏸';
        statusColor = chalk.yellow;
      } else if (config.status === 'onboarding') {
        statusIcon = '◐';
        statusColor = chalk.blue;
      }

      const domain = config.domain.padEnd(26);
      const healthLabel = LOCAL_MODE ? config.status : (config.status === 'active' ? 'healthy' : config.status);
      const status = healthLabel.padEnd(10);
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

  if (LOCAL_MODE) {
    // Use cached results from earlier checks
    if (!localHealthOk) {
      issues.push('API not responding: check docker logs maia-sovereign');
    }
    if (!localReadyOk && !localReadyFallback) {
      issues.push('API not ready: check /api/ready for missing deps');
    }
    // Don't warn about fallback mode - it's functional
  } else {
    // In production mode, check domain health
    const activeClients = getActiveClients();
    for (const [slug, config] of Object.entries(activeClients)) {
      const health = await checkDomainHealth(config.domain);
      if (!health.healthy) {
        issues.push(`Check ${slug}: ${config.domain} is not responding`);
      }
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
