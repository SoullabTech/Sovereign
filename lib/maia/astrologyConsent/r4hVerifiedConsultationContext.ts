/**
 * Only server-fetched, member-scoped prior exchanges can enter consultation.
 * Never merge a caller-provided conversationContext or a browser transcript.
 */
export type R4hPriorExchange = { userMessage: string; maiaResponse: string };
export type R4hContextTurn = { role: 'user' | 'maia'; content: string };

export function toVerifiedR4hContext(
  exchanges: readonly R4hPriorExchange[],
): R4hContextTurn[] {
  return exchanges.slice(-10).flatMap(exchange => {
    const output: R4hContextTurn[] = [];
    if (typeof exchange.userMessage === 'string' && exchange.userMessage.trim()) {
      output.push({ role: 'user', content: exchange.userMessage });
    }
    if (typeof exchange.maiaResponse === 'string' && exchange.maiaResponse.trim()) {
      output.push({ role: 'maia', content: exchange.maiaResponse });
    }
    return output;
  });
}
