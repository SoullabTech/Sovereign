#!/usr/bin/env npx tsx
/**
 * maia up <slug> - Bring a client stack up
 */

import chalk from 'chalk';
import { execSync } from 'child_process';
import { getClient, updateClient, getProjectRoot } from '../lib/registry.js';
import { isDockerRunning, isContainerRunning, startContainer } from '../lib/docker.js';
import { checkDomainHealth } from '../lib/health.js';

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.log(chalk.red('Usage: maia up <slug>'));
    process.exit(1);
  }

  const client = getClient(slug);
  if (!client) {
    console.log(chalk.red(`Client "${slug}" not found in registry`));
    process.exit(1);
  }

  console.log(chalk.cyan.bold(`\n═══ BRINGING UP: ${client.name} ═══\n`));

  // Check Docker
  if (!isDockerRunning()) {
    console.log(chalk.red('Docker is not running. Start Docker first.'));
    process.exit(1);
  }
  console.log(chalk.green('✓ Docker running'));

  // Determine container strategy
  const containerName = `${slug}`;
  const projectRoot = getProjectRoot();

  // Check if this is a portal client or dedicated container
  const isPortalClient = client.modules.includes('portal') || client.modules.includes('stellium');
  const isAstroClient = client.modules.includes('astro-site');

  if (isPortalClient) {
    // Portal clients run through the main maia container
    console.log(chalk.cyan(`→ ${slug} uses the main MAIA portal`));

    // Ensure maia container is running
    if (!isContainerRunning('maia')) {
      console.log(chalk.yellow('→ Main MAIA container not running, starting...'));
      try {
        execSync('docker compose up -d maia', { cwd: projectRoot, stdio: 'inherit' });
      } catch {
        console.log(chalk.red('Failed to start MAIA container'));
        process.exit(1);
      }
    }
    console.log(chalk.green('✓ MAIA container running'));

  } else if (isAstroClient) {
    // Astro clients have their own container
    console.log(chalk.cyan(`→ ${slug} is an Astro site`));

    if (!isContainerRunning(slug)) {
      console.log(chalk.yellow(`→ Starting ${slug} container...`));
      if (!startContainer(slug)) {
        console.log(chalk.yellow(`→ Container not found, trying docker compose...`));
        try {
          execSync(`docker compose up -d ${slug}`, { cwd: projectRoot, stdio: 'inherit' });
        } catch {
          console.log(chalk.red(`Failed to start ${slug} container`));
          console.log(chalk.dim(`You may need to add ${slug} to docker-compose.production.yml`));
          process.exit(1);
        }
      }
    }
    console.log(chalk.green(`✓ ${slug} container running`));

  } else {
    // Generic container handling
    console.log(chalk.cyan(`→ Starting ${slug}...`));
    if (!isContainerRunning(slug)) {
      if (!startContainer(slug)) {
        try {
          execSync(`docker compose up -d ${slug}`, { cwd: projectRoot, stdio: 'inherit' });
        } catch {
          console.log(chalk.red(`Failed to start ${slug}`));
          process.exit(1);
        }
      }
    }
    console.log(chalk.green(`✓ ${slug} running`));
  }

  // Health check
  console.log(chalk.cyan(`→ Checking health of ${client.domain}...`));
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for startup

  const health = await checkDomainHealth(client.domain);
  if (health.healthy) {
    console.log(chalk.green(`✓ ${client.domain} is healthy (${health.latencyMs}ms)`));
  } else {
    console.log(chalk.yellow(`⚠ ${client.domain} not responding yet`));
    console.log(chalk.dim(`  This might be normal during startup. Check: maia status`));
  }

  // Update registry status
  if (client.status === 'onboarding' || client.status === 'paused') {
    const today = new Date().toISOString().split('T')[0];
    updateClient(slug, {
      status: 'active',
      launched_at: client.launched_at || today,
    });
    console.log(chalk.green('✓ Registry updated to active'));
  }

  console.log(chalk.green.bold(`\n═══ ${slug.toUpperCase()} IS UP ═══\n`));
  console.log(`  URL: https://${client.domain}`);
  console.log(`  Status: ${chalk.green('active')}`);
  console.log();
}

main().catch(err => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
