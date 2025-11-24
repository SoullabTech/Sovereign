// Beta tracking analytics
export const betaTracker = {
  trackEvent: (event: string, data?: any) => {
    console.log('Beta Event:', event, data);
  },
  trackPageView: (page: string) => {
    console.log('Beta Page View:', page);
  }
};