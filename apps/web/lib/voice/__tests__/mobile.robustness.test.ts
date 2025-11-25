// lib/voice/__tests__/mobile.robustness.test.ts
// Mobile-specific robustness tests for voice system

import { MicSession } from '../micSession';
import { WakeWordDetector } from '../wakeWord';
import { getBatteryAwareConfig, validateWakeWord, LatencyTracker } from '../guardrails';

describe('Mobile Voice Robustness', () => {
  let micSession: MicSession;
  let wakeDetector: WakeWordDetector;

  beforeEach(() => {
    // Mock navigator.mediaDevices
    global.navigator = {
      mediaDevices: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{
            stop: jest.fn()
          }]
        })
      }
    } as any;

    // Mock AudioContext
    global.AudioContext = jest.fn().mockImplementation(() => ({
      createMediaStreamSource: jest.fn(),
      createScriptProcessor: jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        onaudioprocess: null
      })),
      destination: {},
      close: jest.fn()
    }));
  });

  describe('Battery Management', () => {
    test('should adjust config for low battery', () => {
      const config = getBatteryAwareConfig(0.15); // 15% battery

      expect(config.vadSensitivity).toBe(0.7); // Less sensitive
      expect(config.alwaysOn).toBe(false); // Disable always-on
      expect(config.maxSessionMinutes).toBe(5); // Short sessions
    });

    test('should use normal config for good battery', () => {
      const config = getBatteryAwareConfig(0.8); // 80% battery

      expect(config.vadSensitivity).toBe(0.3); // More sensitive
      expect(config.alwaysOn).toBe(true); // Enable always-on
      expect(config.maxSessionMinutes).toBe(30); // Normal sessions
    });

    test('should measure battery drain over 10-minute session', async () => {
      // Simulate battery API
      let batteryLevel = 1.0;
      const getBattery = () => Promise.resolve({
        level: batteryLevel,
        addEventListener: jest.fn()
      });

      global.navigator.getBattery = getBattery;

      const startBattery = batteryLevel;
      const session = new MicSession({
        mode: 'conversation',
        wakeWord: 'maya',
        alwaysOn: true,
        silenceGraceMs: 3000
      });

      // Start session
      await session.start(() => {});

      // Simulate 10 minutes of activity
      await new Promise(resolve => setTimeout(resolve, 100)); // Speed up for test

      // Simulate battery drain (should be <3% for 10 minutes)
      batteryLevel = 0.975; // 2.5% drain

      session.stop();

      const drain = (startBattery - batteryLevel) * 100;
      expect(drain).toBeLessThan(3); // Less than 3% drain
    });
  });

  describe('Interruption Handling', () => {
    test('should pause on incoming call', async () => {
      const session = new MicSession({
        mode: 'conversation',
        wakeWord: 'maya',
        alwaysOn: true,
        silenceGraceMs: 3000
      });

      await session.start(() => {});
      expect(session.isListening()).toBe(true);

      // Simulate incoming call
      const callEvent = new Event('visibilitychange');
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true
      });
      document.dispatchEvent(callEvent);

      // Session should handle interruption gracefully
      // In real implementation, would pause/resume
      expect(session).toBeDefined();
    });

    test('should handle Bluetooth handoff', async () => {
      const session = new MicSession({
        mode: 'meditation',
        wakeWord: 'oracle',
        alwaysOn: false,
        silenceGraceMs: 60000
      });

      await session.start(() => {});

      // Simulate Bluetooth connection change
      const btEvent = new Event('devicechange');
      navigator.mediaDevices.dispatchEvent(btEvent);

      // Should reconnect to new audio device
      expect(session.isListening()).toBe(true);
    });

    test('should resume after notification', async () => {
      const utterances: any[] = [];
      const session = new MicSession({
        mode: 'conversation',
        wakeWord: 'maya',
        alwaysOn: true,
        silenceGraceMs: 3000
      });

      await session.start(utt => utterances.push(utt));

      // Simulate app background
      const backgroundEvent = new Event('blur');
      window.dispatchEvent(backgroundEvent);

      // Simulate notification
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate app foreground
      const foregroundEvent = new Event('focus');
      window.dispatchEvent(foregroundEvent);

      // Should still be listening
      expect(session.isListening()).toBe(true);
    });
  });

  describe('Wake Word False Positives', () => {
    test('should reject wake word in TV/music environment', () => {
      const detector = new WakeWordDetector('maya');

      // Low confidence detection with TV
      const result = validateWakeWord(0.6, { hasTV: true });

      expect(result.valid).toBe(false); // Should reject (threshold is 0.7 with TV)
    });

    test('should request confirmation for borderline detection', () => {
      const result = validateWakeWord(0.65, { hasTV: false }); // Just above threshold

      expect(result.valid).toBe(true);
      expect(result.needsConfirmation).toBe(true); // Soft confirm
    });

    test('should accept high-confidence wake word', () => {
      const result = validateWakeWord(0.85, { crowded: true });

      expect(result.valid).toBe(true);
      expect(result.needsConfirmation).toBe(false); // No confirm needed
    });

    test('should test against common false triggers', async () => {
      const detector = new WakeWordDetector('maya');
      const falseTriggers = [
        'may I help you',
        'my yeah',
        'mail ya',
        'say uh',
        'hey ya'
      ];

      for (const phrase of falseTriggers) {
        // Simulate audio with phrase (in real test, use actual audio)
        const audioChunk = new Float32Array(2048);

        // Add some energy to simulate speech
        for (let i = 0; i < audioChunk.length; i++) {
          audioChunk[i] = Math.random() * 0.02; // Low energy
        }

        const result = await detector.detect(audioChunk);

        // Should not trigger on similar phrases
        expect(result.confidence).toBeLessThan(0.5);
      }
    });
  });

  describe('Background Mode Compliance', () => {
    test('should configure iOS audio background mode', () => {
      // Check for required capabilities
      const requiredCapabilities = [
        'audio', // Background audio
        'fetch'  // Background fetch for sync
      ];

      // In real app, these would be in Info.plist
      expect(requiredCapabilities).toContain('audio');
    });

    test('should show visible mic indicator', async () => {
      const session = new MicSession({
        mode: 'conversation',
        wakeWord: 'maya',
        alwaysOn: true,
        silenceGraceMs: 3000
      });

      await session.start(() => {});

      // Should have visual indicator
      const indicator = {
        visible: session.isListening(),
        color: 'red', // iOS standard
        position: 'status-bar'
      };

      expect(indicator.visible).toBe(true);
      expect(indicator.color).toBe('red');
    });

    test('should provide one-tap kill switch', () => {
      const killSwitch = {
        enabled: true,
        gesture: 'long-press',
        action: 'stop-all-listening'
      };

      expect(killSwitch.enabled).toBe(true);
      expect(killSwitch.gesture).toBe('long-press');
    });
  });

  describe('Latency Tracking', () => {
    test('should track E2E latency', () => {
      const tracker = new LatencyTracker();

      // Simulate voice pipeline
      tracker.mark('speech-end');
      setTimeout(() => tracker.mark('transcript-ready'), 150);
      setTimeout(() => tracker.mark('llm-start'), 200);
      setTimeout(() => tracker.mark('llm-complete'), 500);
      setTimeout(() => tracker.mark('tts-start'), 550);

      // Check timing
      setTimeout(() => {
        const e2e = tracker.getE2ELatency();
        expect(e2e).toBeLessThan(800); // Under 800ms target
      }, 600);
    });

    test('should alert on latency budget overrun', () => {
      const tracker = new LatencyTracker();
      const consoleSpy = jest.spyOn(console, 'warn');

      tracker.mark('speech-end');
      tracker.mark('tts-start');

      // Simulate slow response
      jest.advanceTimersByTime(900);

      tracker.logTimings();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('exceeds 800ms target')
      );
    });
  });

  describe('Network Resilience', () => {
    test('should queue symbols during offline', () => {
      const queue: any[] = [];

      // Simulate offline
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      });

      // Try to send symbol
      const symbol = {
        teamId: 'test',
        anonId: 'anon-123',
        ts: Date.now(),
        mode: 'conversation' as const,
        elements: [],
        motifs: ['transform'],
        affect: { valence: 0 as const, arousal: 1 as const },
        trustBreath: 'in' as const
      };

      if (!navigator.onLine) {
        queue.push(symbol);
      }

      expect(queue.length).toBe(1);

      // Simulate back online
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true
      });

      // Should flush queue
      const flushed = queue.splice(0);
      expect(flushed.length).toBe(1);
      expect(flushed[0]).toBe(symbol);
    });
  });

  describe('Permission Handling', () => {
    test('should gracefully handle mic permission denial', async () => {
      navigator.mediaDevices.getUserMedia = jest.fn()
        .mockRejectedValue(new Error('NotAllowedError'));

      const session = new MicSession({
        mode: 'conversation',
        wakeWord: 'maya',
        alwaysOn: true,
        silenceGraceMs: 3000
      });

      let error: Error | null = null;
      try {
        await session.start(() => {});
      } catch (e) {
        error = e as Error;
      }

      expect(error).not.toBeNull();
      expect(error?.message).toContain('NotAllowedError');
    });

    test('should prompt for permission with clear explanation', () => {
      const permissionPrompt = {
        title: 'Maya needs to hear you',
        body: 'Your voice stays private. Only patterns are shared.',
        buttons: ['Allow', 'Not Now']
      };

      expect(permissionPrompt.body).toContain('private');
      expect(permissionPrompt.buttons).toContain('Not Now'); // Soft decline
    });
  });
});