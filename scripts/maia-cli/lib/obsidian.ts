/**
 * Obsidian vault operations for MAIA CLI
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync, copyFileSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';

// Vault location
const VAULT_PATH = join(homedir(), 'Documents', 'AIN');
const CLIENTS_PATH = join(VAULT_PATH, 'Clients');

export function getVaultPath(): string {
  return VAULT_PATH;
}

export function getClientsPath(): string {
  return CLIENTS_PATH;
}

export function vaultExists(): boolean {
  return existsSync(VAULT_PATH);
}

export function clientFolderExists(folderName: string): boolean {
  return existsSync(join(CLIENTS_PATH, folderName));
}

export function getClientFolders(): string[] {
  if (!existsSync(CLIENTS_PATH)) {
    return [];
  }

  return readdirSync(CLIENTS_PATH, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_'))
    .map(dirent => dirent.name);
}

export function getClientFolderStats(folderName: string): { files: number; lastModified: Date | null } {
  const folderPath = join(CLIENTS_PATH, folderName);

  if (!existsSync(folderPath)) {
    return { files: 0, lastModified: null };
  }

  const files = readdirSync(folderPath, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name);

  let lastModified: Date | null = null;

  for (const file of files) {
    const stat = statSync(join(folderPath, file));
    if (!lastModified || stat.mtime > lastModified) {
      lastModified = stat.mtime;
    }
  }

  return { files: files.length, lastModified };
}

export interface TemplateVars {
  CLIENT_NAME: string;
  SLUG: string;
  DOMAIN: string;
  DATE: string;
}

export function createClientFolder(
  folderName: string,
  templatePath: string,
  vars: TemplateVars
): void {
  const targetPath = join(CLIENTS_PATH, folderName);

  // Ensure Clients folder exists
  if (!existsSync(CLIENTS_PATH)) {
    mkdirSync(CLIENTS_PATH, { recursive: true });
  }

  // Create client folder
  if (!existsSync(targetPath)) {
    mkdirSync(targetPath, { recursive: true });
  }

  // Copy and process template files
  if (existsSync(templatePath)) {
    const templateFiles = readdirSync(templatePath, { withFileTypes: true });

    for (const file of templateFiles) {
      if (file.isFile() && file.name.endsWith('.md')) {
        const sourcePath = join(templatePath, file.name);
        const destPath = join(targetPath, file.name);

        // Read, replace variables, write
        let content = readFileSync(sourcePath, 'utf-8');
        content = content.replace(/\{\{CLIENT_NAME\}\}/g, vars.CLIENT_NAME);
        content = content.replace(/\{\{SLUG\}\}/g, vars.SLUG);
        content = content.replace(/\{\{DOMAIN\}\}/g, vars.DOMAIN);
        content = content.replace(/\{\{DATE\}\}/g, vars.DATE);

        writeFileSync(destPath, content);
      } else if (file.isDirectory()) {
        // Create subdirectories like Assets/
        const subDir = join(targetPath, file.name);
        if (!existsSync(subDir)) {
          mkdirSync(subDir, { recursive: true });
        }
      }
    }

    // Create Assets folder if not in template
    const assetsPath = join(targetPath, 'Assets');
    if (!existsSync(assetsPath)) {
      mkdirSync(assetsPath, { recursive: true });
    }
  }
}

export function ensureVaultStructure(): void {
  // Ensure base folders exist
  const folders = [
    CLIENTS_PATH,
    join(CLIENTS_PATH, '_Template'),
    join(VAULT_PATH, 'Business'),
  ];

  for (const folder of folders) {
    if (!existsSync(folder)) {
      mkdirSync(folder, { recursive: true });
    }
  }
}
