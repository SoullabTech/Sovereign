import { createClient } from './client';

export const supabase = createClient();

// Export for backward compatibility
export const createClientComponentClient = createClient;
export { createClient };