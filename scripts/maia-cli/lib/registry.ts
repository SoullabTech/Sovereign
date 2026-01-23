/**
 * Registry management for MAIA clients
 * Single source of truth: clients/registry.yml
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { parse, stringify } from 'yaml';
import { resolve } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '../../..');
const REGISTRY_PATH = resolve(PROJECT_ROOT, 'clients/registry.yml');

export interface ClientConfig {
  name: string;
  domain: string;
  status: 'lead' | 'onboarding' | 'active' | 'paused' | 'archived';
  tier: 'seed' | 'root' | 'crown';
  modules: string[];
  db_schema: string;
  vault_folder: string;
  stripe_customer: string | null;
  launched_at: string | null;
  notes?: string;
}

export interface Registry {
  clients: Record<string, ClientConfig>;
}

export function loadRegistry(): Registry {
  if (!existsSync(REGISTRY_PATH)) {
    throw new Error(`Registry not found at ${REGISTRY_PATH}`);
  }
  const content = readFileSync(REGISTRY_PATH, 'utf-8');
  return parse(content) as Registry;
}

export function saveRegistry(registry: Registry): void {
  const content = stringify(registry, {
    indent: 2,
    lineWidth: 120,
  });
  writeFileSync(REGISTRY_PATH, content);
}

export function getClient(slug: string): ClientConfig | null {
  const registry = loadRegistry();
  return registry.clients[slug] || null;
}

export function getAllClients(): Record<string, ClientConfig> {
  const registry = loadRegistry();
  return registry.clients;
}

export function addClient(slug: string, config: ClientConfig): void {
  const registry = loadRegistry();
  if (registry.clients[slug]) {
    throw new Error(`Client "${slug}" already exists in registry`);
  }
  registry.clients[slug] = config;
  saveRegistry(registry);
}

export function updateClient(slug: string, updates: Partial<ClientConfig>): void {
  const registry = loadRegistry();
  if (!registry.clients[slug]) {
    throw new Error(`Client "${slug}" not found in registry`);
  }
  registry.clients[slug] = { ...registry.clients[slug], ...updates };
  saveRegistry(registry);
}

export function getActiveClients(): Record<string, ClientConfig> {
  const all = getAllClients();
  return Object.fromEntries(
    Object.entries(all).filter(([_, config]) => config.status === 'active')
  );
}

export function getRegistryPath(): string {
  return REGISTRY_PATH;
}

export function getProjectRoot(): string {
  return PROJECT_ROOT;
}
