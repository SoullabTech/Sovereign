// @ts-nocheck
// src/types/express.d.ts

declare global {
  namespace Express {
    interface Request {
      /** Populated by authenticateToken(), if the incoming JWT is valid */
      user?: User;
    }
  }
}

// This file needs no exports—its mere presence augments Express’s Request
export {};
