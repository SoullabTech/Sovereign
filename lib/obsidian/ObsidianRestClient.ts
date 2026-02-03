/**
 * Obsidian Local REST API Client
 *
 * Enables MAIA to write directly to an Obsidian vault via the Local REST API plugin.
 * Requires the plugin to be installed and running in Obsidian.
 *
 * @see https://github.com/coddingtonbear/obsidian-local-rest-api
 */

import { Agent } from 'undici';

type PatchTargetType = 'heading' | 'block' | 'frontmatter';
type PatchOperation = 'append' | 'prepend' | 'replace';

export interface ObsidianClientConfig {
  baseUrl: string;  // e.g., "http://127.0.0.1:27123" or "https://127.0.0.1:27124"
  apiKey: string;   // Bearer token from Obsidian Local REST API settings
}

// Custom agent for localhost HTTPS with self-signed cert
// Only used for 127.0.0.1 and localhost - safe for local development
let localhostAgent: Agent | null = null;

function getLocalhostAgent(): Agent {
  if (!localhostAgent) {
    localhostAgent = new Agent({
      connect: {
        rejectUnauthorized: false, // Accept self-signed cert for localhost only
      },
    });
  }
  return localhostAgent;
}

function isLocalhost(url: string): boolean {
  return url.includes('127.0.0.1') || url.includes('localhost');
}

export class ObsidianRestClient {
  private baseUrl: string;
  private apiKey: string;
  private useLocalhostAgent: boolean;

  constructor(opts: ObsidianClientConfig) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.apiKey = opts.apiKey;
    this.useLocalhostAgent = this.baseUrl.startsWith('https://') && isLocalhost(this.baseUrl);
  }

  /**
   * Encode vault path segments while preserving folder separators
   */
  private encodeVaultPath(filename: string): string {
    return filename
      .split('/')
      .map((seg) => encodeURIComponent(seg))
      .join('/');
  }

  private async request(
    method: string,
    path: string,
    opts?: { body?: string; headers?: Record<string, string> }
  ): Promise<Response> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      ...(opts?.headers ?? {}),
    };

    // Use custom agent for localhost HTTPS (self-signed cert)
    const fetchOpts: RequestInit & { dispatcher?: Agent } = {
      method,
      headers,
      body: opts?.body,
    };

    if (this.useLocalhostAgent) {
      fetchOpts.dispatcher = getLocalhostAgent();
    }

    const res = await fetch(`${this.baseUrl}${path}`, fetchOpts);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `Obsidian REST API ${method} ${path} failed: ${res.status} ${res.statusText}\n${text}`
      );
    }

    return res;
  }

  /**
   * Check if the Obsidian REST API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const res = await this.request('GET', '/');
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Create or overwrite a note (PUT)
   */
  async upsertNote(filename: string, markdown: string): Promise<void> {
    const p = this.encodeVaultPath(filename);
    await this.request('PUT', `/vault/${p}`, {
      body: markdown,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  /**
   * Append to a note (creates if missing)
   */
  async appendToNote(filename: string, markdownToAppend: string): Promise<void> {
    const p = this.encodeVaultPath(filename);
    await this.request('POST', `/vault/${p}`, {
      body: markdownToAppend,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  /**
   * Read a note's content
   */
  async readNote(filename: string): Promise<string> {
    const p = this.encodeVaultPath(filename);
    const res = await this.request('GET', `/vault/${p}`);
    return res.text();
  }

  /**
   * Patch a note (insert/replace at heading, block, or frontmatter)
   */
  async patchNote(opts: {
    filename: string;
    operation: PatchOperation;
    targetType: PatchTargetType;
    target: string;
    content: string;
    contentType?: string;
    createTargetIfMissing?: boolean;
  }): Promise<void> {
    const p = this.encodeVaultPath(opts.filename);
    await this.request('PATCH', `/vault/${p}`, {
      body: opts.content,
      headers: {
        Operation: opts.operation,
        'Target-Type': opts.targetType,
        Target: opts.target,
        ...(opts.createTargetIfMissing ? { 'Create-Target-If-Missing': 'true' } : {}),
        'Content-Type': opts.contentType ?? 'text/markdown; charset=utf-8',
      },
    });
  }

  /**
   * List files in a directory
   */
  async listFiles(directory?: string): Promise<{ files: string[] }> {
    const path = directory ? `/vault/${this.encodeVaultPath(directory)}/` : '/vault/';
    const res = await this.request('GET', path);
    return res.json();
  }

  /**
   * Delete a note
   */
  async deleteNote(filename: string): Promise<void> {
    const p = this.encodeVaultPath(filename);
    await this.request('DELETE', `/vault/${p}`);
  }

  /**
   * Search vault content
   */
  async search(query: string): Promise<Array<{ filename: string; matches: Array<{ match: { start: number; end: number }; context: string }> }>> {
    const res = await this.request('POST', '/search/simple/', {
      body: JSON.stringify({ query }),
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  }
}

// Singleton factory for convenience
let defaultClient: ObsidianRestClient | null = null;

export function getObsidianClient(): ObsidianRestClient {
  if (!defaultClient) {
    const baseUrl = process.env.OBSIDIAN_REST_URL;
    const apiKey = process.env.OBSIDIAN_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error(
        'Missing OBSIDIAN_REST_URL or OBSIDIAN_API_KEY environment variables. ' +
        'Ensure the Obsidian Local REST API plugin is running.'
      );
    }

    defaultClient = new ObsidianRestClient({ baseUrl, apiKey });
  }
  return defaultClient;
}
