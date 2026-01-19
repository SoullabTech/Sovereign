/**
 * Portal Routes
 *
 * Multi-tenant portal configuration and content.
 * Powers practitioner portals like loralee.soullab.life
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/error.js';
import { getPortalConfig } from './config.js';

const router = Router();

// GET /v1/portal/:slug/config - Get portal configuration
router.get('/:slug/config', asyncHandler(getPortalConfig));

// TODO: Add more portal routes as they are migrated
// GET /v1/portal/:slug/home
// GET /v1/portal/:slug/about
// GET /v1/portal/:slug/services
// GET /v1/portal/:slug/faq
// GET /v1/portal/:slug/articles
// POST /v1/portal/:slug/chat
// POST /v1/portal/:slug/book

export default router;
