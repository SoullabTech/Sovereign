#!/usr/bin/env npx tsx
import readline from 'node:readline';
import { mockPrediction } from '../../lib/voice/predictors/mockTurnSidecar';
import { TURN_PREDICTOR_CHANNELS, TURN_PREDICTOR_PROTOCOL, TURN_PREDICTOR_SAMPLE_RATE, type TurnSidecarClientMessage } from '../../lib/voice/predictors/sidecarProtocol';

const model = { provider: 'other' as const, modelId: 'deterministic-pipe-test', modelVersion: '1', weightLicense: 'INTERNAL-TEST-ONLY' };
console.log(JSON.stringify({ type: 'hello', protocol: TURN_PREDICTOR_PROTOCOL, sampleRateHz: TURN_PREDICTOR_SAMPLE_RATE, channels: TURN_PREDICTOR_CHANNELS, model }));

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
