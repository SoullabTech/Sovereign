import { readFileSync } from 'fs';
import { join } from 'path';

describe('original MAIA new-encounter cache-clear hold (source-bound client safeguard)', () => {
  it('never clears an existing conversation under an unchanged session ID', () => {
    const code = readFileSync(
      join(process.cwd(), 'components/OracleConversation.tsx'), 'utf8',
    );
    const start = code.indexOf('  // New Conversation must mint a fresh authenticated');
    const end = code.indexOf('  // 🧭 THERAPEUTIC FRAMEWORK:', start);
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    const handler = code.slice(start, end);
    expect(handler).toContain("window.addEventListener('maia-new-conversation'");
    expect(handler).toContain('Your existing conversation was preserved.');
    expect(handler).not.toContain('setMessages([])');
    expect(handler).not.toContain('historicalMessagesRef.current = []');
    expect(handler).not.toContain('localStorage.removeItem(');
    expect(handler).not.toContain('clearSession()');
    expect(handler).not.toContain('apiFetch(');
  });
});
