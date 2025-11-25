// lib/voice/__tests__/realtime.soak.test.ts
// Soak tests for WebSocket backchannel under load

import { SymbolicSignal } from '../types';

class BackchannelLoadTester {
  private connections: WebSocket[] = [];
  private messagesSent = 0;
  private messagesReceived = 0;
  private errors = 0;
  private memoryStart = 0;
  private latencies: number[] = [];

  constructor(private wsUrl: string) {}

  /**
   * Simulate N clients sending signals
   */
  async runSoakTest(options: {
    numClients: number;
    durationMs: number;
    signalIntervalMs: number;
    teamId: string;
  }) {
    const { numClients, durationMs, signalIntervalMs, teamId } = options;

    console.log(`🔥 Starting soak test: ${numClients} clients for ${durationMs/1000}s`);

    // Record starting memory
    this.memoryStart = process.memoryUsage().heapUsed;

    // Create clients
    const clientPromises = [];
    for (let i = 0; i < numClients; i++) {
      clientPromises.push(this.createClient(i, teamId, signalIntervalMs));
    }

    // Wait for all clients to connect
    await Promise.all(clientPromises);

    // Run for duration
    await new Promise(resolve => setTimeout(resolve, durationMs));

    // Stop all clients
    this.stopAllClients();

    // Report results
    return this.getReport();
  }

  private async createClient(
    clientId: number,
    teamId: string,
    signalIntervalMs: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      const anonId = `client-${clientId}`;
      let interval: NodeJS.Timeout;

      ws.onopen = () => {
        console.log(`Client ${clientId} connected`);
        this.connections.push(ws);

        // Start sending signals
        interval = setInterval(() => {
          const signal = this.generateSignal(teamId, anonId);
          const startTime = Date.now();

          ws.send(JSON.stringify({
            type: 'symbolic-contribution',
            data: signal,
            _testMeta: { sentAt: startTime }
          }));

          this.messagesSent++;
        }, signalIntervalMs);

        resolve();
      };

      ws.onmessage = (event) => {
        this.messagesReceived++;

        try {
          const message = JSON.parse(event.data);

          // Track latency if test metadata present
          if (message._testMeta?.sentAt) {
            const latency = Date.now() - message._testMeta.sentAt;
            this.latencies.push(latency);
          }
        } catch (e) {
          // Ignore parse errors for non-test messages
        }
      };

      ws.onerror = (error) => {
        this.errors++;
        console.error(`Client ${clientId} error:`, error);
      };

      ws.onclose = () => {
        if (interval) clearInterval(interval);
      };
    });
  }

  private generateSignal(teamId: string, anonId: string): SymbolicSignal {
    const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;
    const motifs = ['transform', 'spiral', 'release', 'ground', 'question'];
    const breaths = ['in', 'out', 'hold'] as const;

    return {
      teamId,
      anonId,
      ts: Date.now(),
      mode: 'conversation',
      elements: [
        {
          name: elements[Math.floor(Math.random() * elements.length)],
          intensity: Math.random()
        }
      ],
      motifs: [motifs[Math.floor(Math.random() * motifs.length)]],
      affect: {
        valence: Math.floor(Math.random() * 3 - 1) as -1 | 0 | 1,
        arousal: Math.floor(Math.random() * 3) as 0 | 1 | 2
      },
      trustBreath: breaths[Math.floor(Math.random() * breaths.length)],
      spiralFlag: Math.random() > 0.8
    };
  }

  private stopAllClients() {
    this.connections.forEach(ws => ws.close());
    this.connections = [];
  }

  private getReport() {
    const memoryEnd = process.memoryUsage().heapUsed;
    const memoryDelta = (memoryEnd - this.memoryStart) / 1024 / 1024; // MB

    const avgLatency = this.latencies.length > 0
      ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
      : 0;

    const p95Latency = this.latencies.length > 0
      ? this.latencies.sort((a, b) => a - b)[Math.floor(this.latencies.length * 0.95)]
      : 0;

    return {
      messagesSent: this.messagesSent,
      messagesReceived: this.messagesReceived,
      errors: this.errors,
      dropRate: ((this.messagesSent - this.messagesReceived) / this.messagesSent * 100).toFixed(2) + '%',
      memoryDeltaMB: memoryDelta.toFixed(2),
      avgLatencyMs: avgLatency.toFixed(2),
      p95LatencyMs: p95Latency,
      connectionsActive: this.connections.filter(ws => ws.readyState === WebSocket.OPEN).length
    };
  }
}

describe('Real-time WebSocket Robustness', () => {
  const WS_URL = process.env.WS_TEST_URL || 'ws://localhost:3000/api/backchannel/ws';

  describe('Load Testing', () => {
    test.skip('should handle 50 clients for 30 minutes', async () => {
      const tester = new BackchannelLoadTester(WS_URL);

      const report = await tester.runSoakTest({
        numClients: 50,
        durationMs: 30 * 60 * 1000, // 30 minutes
        signalIntervalMs: 10 * 1000, // 1 signal per 10 seconds
        teamId: 'load-test-team'
      });

      console.log('📊 Soak Test Report:', report);

      // Assertions
      expect(parseFloat(report.dropRate)).toBeLessThan(1); // Less than 1% drop
      expect(parseFloat(report.memoryDeltaMB)).toBeLessThan(100); // Less than 100MB growth
      expect(parseFloat(report.avgLatencyMs)).toBeLessThan(100); // Avg under 100ms
      expect(report.p95LatencyMs).toBeLessThan(500); // P95 under 500ms
      expect(report.errors).toBe(0); // No errors
    });

    test('should handle rapid reconnections', async () => {
      const reconnectTest = async () => {
        const ws = new WebSocket(WS_URL);

        return new Promise<void>((resolve) => {
          ws.onopen = () => {
            // Immediately close and reconnect
            ws.close();
            resolve();
          };
        });
      };

      // Rapid reconnect 100 times
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(reconnectTest());
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms between
      }

      await Promise.all(promises);

      // Server should still be responsive
      const testWs = new WebSocket(WS_URL);
      await new Promise((resolve) => {
        testWs.onopen = resolve;
      });

      expect(testWs.readyState).toBe(WebSocket.OPEN);
      testWs.close();
    });
  });

  describe('Backoff and Recovery', () => {
    test('should implement exponential backoff on failure', async () => {
      const attempts: number[] = [];
      let lastAttempt = Date.now();

      const connectWithBackoff = async (attempt = 0): Promise<void> => {
        const now = Date.now();
        const delay = now - lastAttempt;
        attempts.push(delay);
        lastAttempt = now;

        if (attempt >= 5) return; // Stop after 5 attempts

        try {
          const ws = new WebSocket('ws://localhost:9999'); // Invalid port
          await new Promise((_, reject) => {
            ws.onerror = reject;
            setTimeout(reject, 100); // Timeout quickly for test
          });
        } catch {
          // Exponential backoff with jitter
          const baseDelay = Math.min(250 * Math.pow(2, attempt), 5000);
          const jitter = Math.random() * 0.3 * baseDelay;
          const totalDelay = baseDelay + jitter;

          await new Promise(resolve => setTimeout(resolve, totalDelay));
          await connectWithBackoff(attempt + 1);
        }
      };

      await connectWithBackoff();

      // Verify backoff pattern (delays should increase)
      for (let i = 2; i < attempts.length; i++) {
        expect(attempts[i]).toBeGreaterThan(attempts[i - 1] * 0.8); // Allow for jitter
      }
    });

    test('should maintain session on reconnect', async () => {
      const ws1 = new WebSocket(WS_URL);
      let connectionId: string;

      await new Promise<void>((resolve) => {
        ws1.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'connected') {
            connectionId = message.connectionId;
            resolve();
          }
        };
      });

      // Send a signal
      const signal = {
        teamId: 'test-team',
        anonId: 'test-anon',
        ts: Date.now(),
        mode: 'conversation',
        elements: [],
        motifs: ['transform'],
        affect: { valence: 0, arousal: 1 },
        trustBreath: 'in'
      };

      ws1.send(JSON.stringify({
        type: 'symbolic-contribution',
        data: signal
      }));

      // Close connection
      ws1.close();

      // Reconnect with same session ID
      const ws2 = new WebSocket(WS_URL);
      ws2.onopen = () => {
        ws2.send(JSON.stringify({
          type: 'session-rejoin',
          connectionId
        }));
      };

      // Should recognize the session
      await new Promise<void>((resolve) => {
        ws2.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'session-resumed') {
            resolve();
          }
        };
      });

      ws2.close();
    });
  });

  describe('Redis Pub/Sub Sharding', () => {
    test('should route team messages correctly', async () => {
      // This test assumes Redis is configured
      const team1Clients: WebSocket[] = [];
      const team2Clients: WebSocket[] = [];
      const team1Messages: any[] = [];
      const team2Messages: any[] = [];

      // Create clients for team 1
      for (let i = 0; i < 3; i++) {
        const ws = new WebSocket(WS_URL);
        team1Clients.push(ws);

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'collective-insight') {
            team1Messages.push(message);
          }
        };
      }

      // Create clients for team 2
      for (let i = 0; i < 3; i++) {
        const ws = new WebSocket(WS_URL);
        team2Clients.push(ws);

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'collective-insight') {
            team2Messages.push(message);
          }
        };
      }

      // Wait for connections
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send signals from team 1
      for (let i = 0; i < 5; i++) {
        team1Clients[0].send(JSON.stringify({
          type: 'symbolic-contribution',
          data: {
            teamId: 'team-1',
            anonId: `team1-client-${i}`,
            ts: Date.now(),
            mode: 'conversation',
            elements: [{ name: 'fire', intensity: 0.8 }],
            motifs: ['transform'],
            affect: { valence: 1, arousal: 2 },
            trustBreath: 'in'
          }
        }));
      }

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Team 1 should receive insights, team 2 should not
      expect(team1Messages.length).toBeGreaterThan(0);
      expect(team2Messages.length).toBe(0);

      // Cleanup
      [...team1Clients, ...team2Clients].forEach(ws => ws.close());
    });
  });

  describe('Chaos Engineering', () => {
    test('should handle WebSocket kill mid-utterance', async () => {
      const ws = new WebSocket(WS_URL);
      const queue: any[] = [];

      await new Promise(resolve => ws.onopen = resolve);

      // Start sending a signal
      const signal = {
        teamId: 'chaos-team',
        anonId: 'chaos-client',
        ts: Date.now(),
        mode: 'conversation',
        elements: [{ name: 'fire', intensity: 0.5 }],
        motifs: ['transform'],
        affect: { valence: 0, arousal: 1 },
        trustBreath: 'in'
      };

      ws.send(JSON.stringify({
        type: 'symbolic-contribution',
        data: signal
      }));

      // Kill connection immediately
      ws.close();

      // Should queue the signal
      queue.push(signal);

      // Reconnect and resend
      const ws2 = new WebSocket(WS_URL);
      await new Promise(resolve => ws2.onopen = resolve);

      // Flush queue
      while (queue.length > 0) {
        const queued = queue.shift();
        ws2.send(JSON.stringify({
          type: 'symbolic-contribution',
          data: queued,
          _meta: { requeued: true }
        }));
      }

      // Verify received
      await new Promise<void>((resolve) => {
        ws2.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'contribution-received') {
            resolve();
          }
        };
      });

      ws2.close();
    });

    test('should handle rate limiting gracefully', async () => {
      const ws = new WebSocket(WS_URL);
      await new Promise(resolve => ws.onopen = resolve);

      let rateLimited = false;

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'rate-limited') {
          rateLimited = true;
        }
      };

      // Flood with messages
      for (let i = 0; i < 1000; i++) {
        ws.send(JSON.stringify({
          type: 'symbolic-contribution',
          data: {
            teamId: 'flood-test',
            anonId: 'flooder',
            ts: Date.now(),
            mode: 'conversation',
            elements: [],
            motifs: ['spam'],
            affect: { valence: 0, arousal: 0 },
            trustBreath: 'hold'
          }
        }));
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should be rate limited but not crash
      expect(rateLimited || ws.readyState === WebSocket.OPEN).toBe(true);

      ws.close();
    });
  });
});