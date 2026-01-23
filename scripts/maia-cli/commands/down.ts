#!/usr/bin/env npx tsx
/**
 * maia down <slug> - Bring a client stack down
 */

import chalk from 'chalk';
import { getClient, updateClient } from '../lib/registry.js';
import { isDockerRunning, isContainerRunning, stopContainer } from '../lib/docker.js';

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.log(chalk.red('Usage: maia down <slug>'));
    process.exit(1);
  }

  const client = getClient(slug);
  if (!client) {
    console.log(chalk.red(`Client "${slug}" not found in registry`));
    process.exit(1);
  }

  console.log(chalk.cyan.bold(`\n═══ BRINGING DOWN: ${client.name} ═══\n`));

  // Check Docker
  if (!isDockerRunning()) {
    console.log(chalk.yellow('Docker is not running. Nothing to stop.'));
    process.exit(0);
  }

  // Determine container strategy
  const isPortalClient = client.modules.includes('portal') || client.modules.includes('stellium');

  if (isPortalClient) {
    console.log(chalk.yellow(`⚠ ${slug} runs through the main MAIA portal`));
    console.log(chalk.dim('  Stopping would affect all portal clients.'));
    console.log(chalk.dim('  To pause this client, update the registry status instead.'));

    updateClient(slug, { status: 'paused' });
    console.log(chalk.green('✓ Registry updated to paused'));

  } else {
    // Stop dedicated container
    if (isContainerRunning(slug)) {
      console.log(chalk.cyan(`→ Stopping ${slug}...`));
      if (stopContainer(slug)) {
        console.log(chalk.green(`✓ ${slug} stopped`));
      } else {
        console.log(chalk.red(`Failed to stop ${slug}`));
        process.exit(1);
      }
    } else {
      console.log(chalk.dim(`${slug} is not running`));
    }

    updateClient(slug, { status: 'paused' });
    console.log(chalk.green('✓ Registry updated to paused'));
  }

  console.log(chalk.green.bold(`\n═══ ${slug.toUpperCase()} IS DOWN ═══\n`));
}

main().catch(err => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
