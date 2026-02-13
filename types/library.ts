export interface Video {
  id: string;
  title: string;
  description: string | null;
  heygen_url: string;
  thumbnail_url: string | null;
  tags: string[];
  visibility: 'member' | 'practitioner' | 'admin';
  is_featured: boolean;
  duration_seconds: number | null;
  sort_order: number;
  created_at: string;
}