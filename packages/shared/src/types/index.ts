/**
 * Shared Types for MAIA Platform
 *
 * Type definitions used across all MAIA services.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// API Response Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  processingTime?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Member Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface Member {
  id: string;
  passkey: string;
  username: string;
  password_hash?: string;
  name: string;
  preferred_name?: string;
  email?: string;
  onboarded: boolean;
  onboarding_step: OnboardingStep;
  created_at: Date;
  last_sign_in?: Date;
}

export type OnboardingStep =
  | 'begin'
  | 'intro-maia'
  | 'intro-daimon'
  | 'test-elemental'
  | 'faq'
  | 'onboarding'
  | 'complete';

export interface MemberSession {
  id: string;
  username: string;
  name: string;
  preferredName: string;
  onboarded: boolean;
  onboardingStep: OnboardingStep;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Portal/Tenant Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface Portal {
  id: string;
  slug: string;
  name: string;
  practitioner_id: string;
  theme: PortalTheme;
  modules_enabled: string[];
  config: PortalConfig;
  created_at: Date;
  updated_at: Date;
}

export interface PortalTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily?: string;
  logoUrl?: string;
  heroImage?: string;
}

export interface PortalConfig {
  siteName: string;
  tagline?: string;
  description?: string;
  contactEmail?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  features?: {
    booking: boolean;
    articles: boolean;
    faq: boolean;
    chat: boolean;
    leadMagnets: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Practitioner Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface Practitioner {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  slug: string;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  image_url?: string;
  theme?: PortalTheme;
  ai_config?: PractitionerAIConfig;
  stripe_account_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PractitionerAIConfig {
  enabled: boolean;
  personality?: string;
  greeting?: string;
  systemPrompt?: string;
  allowedTopics?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Authentication Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface AuthSession {
  userId: string;
  memberId?: string;
  role: UserRole;
  expiresAt: Date;
}

export type UserRole = 'member' | 'practitioner' | 'admin' | 'steward';

export interface JWTPayload {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Service Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface Service {
  id: string;
  practitioner_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price_cents: number;
  currency: string;
  booking_url?: string;
  is_active: boolean;
  created_at: Date;
}

export interface Booking {
  id: string;
  service_id: string;
  client_email: string;
  client_name: string;
  scheduled_at: Date;
  status: BookingStatus;
  notes?: string;
  created_at: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// ═══════════════════════════════════════════════════════════════════════════════
// Content Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface Article {
  id: string;
  practitioner_id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  published: boolean;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FAQ {
  id: string;
  practitioner_id: string;
  question: string;
  answer: string;
  order: number;
  is_visible: boolean;
  created_at: Date;
}

export interface LeadMagnet {
  id: string;
  practitioner_id: string;
  title: string;
  description: string;
  type: LeadMagnetType;
  file_url?: string;
  content?: string;
  is_active: boolean;
  created_at: Date;
}

export type LeadMagnetType = 'pdf' | 'video' | 'audio' | 'checklist' | 'worksheet';
