/**
 * Practitioner Portal Module
 *
 * Multi-tenant astrology platform for professional practitioners.
 * Each practitioner gets their own branded app with a custom AI companion.
 */

// Types
export * from './types';

// Core services
export * from './practitionerService';
export * from './systemPromptBuilder';
export * from './multiTenantMiddleware';
export * from './stripeConnect';
