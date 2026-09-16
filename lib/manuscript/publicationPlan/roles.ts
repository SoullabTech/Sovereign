export const PUBLICATION_MATTER_ROLES = [
  'half-title',
  'title-page',
  'imprint',
  'copyright',
  'permissions',
  'dedication',
  'disclaimer',
  'contents',
  'preface',
  'acknowledgments',
  'bibliography',
  'resources',
  'afterword',
  'omit',
] as const;

export type PublicationMatterRole = (typeof PUBLICATION_MATTER_ROLES)[number];

export function isPublicationMatterRole(value: string): value is PublicationMatterRole {
  return (PUBLICATION_MATTER_ROLES as readonly string[]).includes(value);
}
