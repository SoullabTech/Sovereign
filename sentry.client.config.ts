// Sentry Client Configuration
import { initializeSentry } from './lib/monitoring/sentry';

// Initialize Sentry on the client side
if (typeof window !== 'undefined') {
  initializeSentry();
}
