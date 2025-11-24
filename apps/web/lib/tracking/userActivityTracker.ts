// frontend
// apps/web/lib/tracking/userActivityTracker.ts

export interface UserTracker {
  trackUserActivity: (activity: string, data?: any) => void;
  trackPageView: (page: string) => void;
  trackInteraction: (element: string, action: string) => void;
  trackUserRegistration: (userId: string, userName: string) => void;
}

// Core tracker object
export const userTracker: UserTracker = {
  trackUserActivity: (_activity: string, _data?: any) => {
    // no-op stub
  },
  trackPageView: (_page: string) => {
    // no-op stub
  },
  trackInteraction: (_element: string, _action: string) => {
    // no-op stub
  },
  trackUserRegistration: (_userId: string, _userName: string) => {
    // no-op stub
  },
};

// Convenience named functions (in case they're imported directly)
export function trackUserActivity(activity: string, data?: any) {
  userTracker.trackUserActivity(activity, data);
}

export function trackPageView(page: string) {
  userTracker.trackPageView(page);
}

export function trackInteraction(element: string, action: string) {
  userTracker.trackInteraction(element, action);
}

// Default export for `import userActivityTracker from ...`
export default userTracker;