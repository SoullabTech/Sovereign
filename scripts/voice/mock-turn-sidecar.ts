#!/usr/bin/env npx tsx
import readline from 'node:readline';
import { mockPrediction } from '../../lib/voice/predictors/mockTurnSidecar';
import { TURN_PREDICTOR_CHANNELS, TURN_PREDICTOR_PROTOCOL, type TurnSidecarClientMessage } from '../../lib/voice/predictors/sidecarProtocol';

const model = { provider: 'other' as const, modelId: 'deterministic-pipe-test', modelVersion: '1', weightLicense: 'INTERNAL-TEST-ONLY' };
console.log(JSON.stringify({ type: 'hello', protocol: TURN_PREDICTOR_PROTOCOL, sampleRateHz: 16000, channels: TURN_PREDICTOR_CHANNELS, frameSamples: 1280, model }));

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const message = JSON.parse(line) as TurnSidecarClientMessage;
    if (message.type === 'reset') {
      console.log(JSON.stringify({ type: 'prediction_reset', seq: message.seq }));
      return;
    }
    if (message.type !== 'audio') throw new Error('unsupported message type');
    console.log(JSON.stringify(mockPrediction(message)));
  } catch (error) {
    console.log(JSON.stringify({ type: 'error', code: error instanceof Error ? error.message : 'unknown' }));
  }
});
