/**
 * Database Configuration
 * TODO: Implement proper database pool when needed
 */

// Stub pool for services that import it but may not use it yet
export const pool = {
  query: async (...args: any[]) => {
    console.warn('Database pool.query called but not configured');
    return { rows: [], rowCount: 0 };
  },
  connect: async () => {
    console.warn('Database pool.connect called but not configured');
    return null;
  }
};
