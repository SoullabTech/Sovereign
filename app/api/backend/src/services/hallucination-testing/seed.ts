import * as crypto from 'crypto';

export interface SeededRng {
  int: (min: number, max: number) => number;
  pick: <T>(arr: T[]) => T;
  bool: (probability?: number) => boolean;
  real: () => number;
  shuffle: <T>(arr: T[]) => T[];
}

export function makeSeededRng(seed: string): SeededRng {
  let state = hashSeed(seed);

  function next(): number {
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return state / 0x100000000;
  }

  return {
    int: (min: number, max: number) => {
      return Math.floor(next() * (max - min + 1)) + min;
    },

    pick: <T>(arr: T[]): T => {
      if (arr.length === 0) throw new Error('Cannot pick from empty array');
      return arr[Math.floor(next() * arr.length)];
    },

    bool: (probability = 0.5) => {
      return next() < probability;
    },

    real: () => next(),

    shuffle: <T>(arr: T[]): T[] => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
  };
}

function hashSeed(seed: string): number {
  const hash = crypto.createHash('sha256').update(seed).digest();
  return hash.readUInt32BE(0);
}

export function generateSeed(prefix = 'test'): string {
  const date = new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${date}-${random}`;
}