/**
 * Descript API Client
 *
 * Integrates with Descript for video/audio editing
 * API Docs: https://docs.descriptapi.com/
 */

const DESCRIPT_API_BASE = 'https://descriptapi.com/v1';

export interface DescriptConfig {
  apiToken: string;
  partnerDriveId?: string;
}

export interface ImportFileSchema {
  uri: string;
  name: string;
  mimeType?: string;
}

export interface ImportProjectSchema {
  name: string;
  files: ImportFileSchema[];
}

export interface ImportUrlResponse {
  import_url: string;
  expires_at: string;
}

export interface PublishedProjectMetadata {
  title: string;
  duration: number;
  publisher: {
    name: string;
    avatar_url?: string;
  };
  privacy: 'public' | 'unlisted' | 'private';
  subtitles_url?: string;
  thumbnail_url?: string;
}

export class DescriptClient {
  private apiToken: string;
  private partnerDriveId: string;

  constructor(config: DescriptConfig) {
    this.apiToken = config.apiToken;
    this.partnerDriveId = config.partnerDriveId || 'soullab-studio';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${DESCRIPT_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Descript API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Create an import URL for sending files to Descript
   * URLs are one-time use and expire after 3 hours
   */
  async createImportUrl(project: ImportProjectSchema): Promise<ImportUrlResponse> {
    return this.request<ImportUrlResponse>('/edit_in_descript/schema', {
      method: 'POST',
      body: JSON.stringify({
        partner_drive_id: this.partnerDriveId,
        project_schema: {
          name: project.name,
          files: project.files.map(file => ({
            uri: file.uri,
            name: file.name,
            mime_type: file.mimeType || 'video/webm',
          })),
        },
      }),
    });
  }

  /**
   * Get metadata for a published Descript project
   */
  async getPublishedProject(slug: string): Promise<PublishedProjectMetadata> {
    return this.request<PublishedProjectMetadata>(`/published_projects/${slug}`);
  }

  /**
   * Validate API token by making a simple request
   */
  async validateToken(): Promise<boolean> {
    try {
      // Try to fetch a non-existent project - will fail with 404 if token is valid
      // or 401 if token is invalid
      await this.request('/published_projects/test-validation');
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return true; // Token is valid, project just doesn't exist
      }
      return false;
    }
  }
}

/**
 * Get Descript client instance
 * Token should be stored in environment or database
 */
export function getDescriptClient(apiToken: string): DescriptClient {
  return new DescriptClient({ apiToken });
}
