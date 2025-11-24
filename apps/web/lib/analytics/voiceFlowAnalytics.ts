// Voice flow analytics
export const voiceFlowAnalytics = {
  trackVoiceInteraction: (type: string, duration?: number) => {
    console.log('Voice Interaction:', type, { duration });
  },
  trackFlowCompletion: (flowId: string, success: boolean) => {
    console.log('Flow Completion:', flowId, { success });
  }
};