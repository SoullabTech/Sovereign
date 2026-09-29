import type {
  MessagePolicy,
  MessageType,
  MessageUrgency,
  QuickResponseType,
} from './messages';

export const QUICK_RESPONSES: Record<QuickResponseType, { label: string; body: string }> = {
  noted: {
    label: 'Noted',
    body: "Thank you for sharing this. I've noted it and we can discuss further in our next session.",
  },
  discuss_next_session: {
    label: 'Discuss Next Session',
    body: "Thank you for this. Let's discuss this in depth during our next session together.",
  },
  acknowledged: {
    label: 'Acknowledged',
    body: 'Received and acknowledged. Thank you for keeping me informed.',
  },
};

export function formatCheckDays(days: string[]): string {
  const dayMap: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
    friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
  };
  return days.map(d => dayMap[d.toLowerCase()] || d).join(', ');
}

export function formatPolicyForClient(policy: MessagePolicy): string {
  const days = formatCheckDays(policy.check_days);
  const tz = policy.timezone.split('/').pop()?.replace('_', ' ') || policy.timezone;
  return `I check messages ${days} between ${policy.check_window_start}-${policy.check_window_end} (${tz}). I typically respond within ${policy.max_response_hours} hours.`;
}

export function getUrgencyConfig(urgency: MessageUrgency) {
  switch (urgency) {
    case 'safety_concern':
      return { label: 'Safety Concern', color: 'text-red-700', bgColor: 'bg-red-100' };
    case 'time_sensitive':
      return { label: 'Time Sensitive', color: 'text-amber-700', bgColor: 'bg-amber-100' };
    default:
      return { label: 'Not Urgent', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  }
}

export function getMessageTypeConfig(type: MessageType | null) {
  switch (type) {
    case 'reflection': return { label: 'Reflection', icon: 'thought-bubble', color: 'text-purple-600' };
    case 'question': return { label: 'Question', icon: 'help-circle', color: 'text-blue-600' };
    case 'win': return { label: 'Win', icon: 'star', color: 'text-green-600' };
    case 'struggle': return { label: 'Struggle', icon: 'heart', color: 'text-orange-600' };
    case 'logistics': return { label: 'Logistics', icon: 'calendar', color: 'text-gray-600' };
    case 'reply': return { label: 'Reply', icon: 'reply', color: 'text-gray-600' };
    default: return { label: 'Note', icon: 'message', color: 'text-gray-600' };
  }
}
