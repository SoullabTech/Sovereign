/**
 * Members Routes
 *
 * Handles member authentication and registration.
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/error.js';
import { checkPasskey } from './check.js';
import { signin } from './signin.js';

const router = Router();

// POST /v1/members/check - Check if passkey exists
router.post('/check', asyncHandler(checkPasskey));

// POST /v1/members/signin - Sign in existing member
router.post('/signin', asyncHandler(signin));

// TODO: Add more routes as they are migrated
// POST /v1/members/register
// POST /v1/members/recover
// GET /v1/members/progress
// POST /v1/members/progress

export default router;
