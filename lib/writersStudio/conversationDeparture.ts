/** A mounted conversation can protect unsent text before Studio navigation. */
export const CONVERSATION_DEPARTURE_EVENT = 'writer:conversation-departure';

export function requestConversationDeparture(): boolean {
  if (typeof window === 'undefined') return true;
  return window.dispatchEvent(new Event(CONVERSATION_DEPARTURE_EVENT, { cancelable: true }));
}
