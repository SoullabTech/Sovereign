import { v4 as uuidv4 } from 'uuid';
import type { SeededRng } from '../seed';
import type { TestCase } from '../types';

export function generateMathCases(rng: SeededRng, count: number): TestCase[] {
  const cases: TestCase[] = [];

  for (let i = 0; i < count; i++) {
    const difficulty = rng.pick(['easy', 'medium', 'hard'] as const);
    const operation = rng.pick(['add', 'subtract', 'multiply', 'divide'] as const);

    let a: number, b: number, expected: number, prompt: string;

    switch (difficulty) {
      case 'easy':
        a = rng.int(1, 20);
        b = rng.int(1, 20);
        break;
      case 'medium':
        a = rng.int(10, 99);
        b = rng.int(10, 99);
        break;
      case 'hard':
        a = rng.int(100, 999);
        b = rng.int(100, 999);
        break;
    }

    switch (operation) {
      case 'add':
        expected = a + b;
        prompt = `Compute ${a} + ${b}. Return strictly JSON: {"result": <number>, "confidence": <0-1>}`;
        break;
      case 'subtract':
        expected = a - b;
        prompt = `Compute ${a} - ${b}. Return strictly JSON: {"result": <number>, "confidence": <0-1>}`;
        break;
      case 'multiply':
        expected = a * b;
        prompt = `Compute ${a} × ${b}. Return strictly JSON: {"result": <number>, "confidence": <0-1>}`;
        break;
      case 'divide':
        b = rng.pick([2, 3, 4, 5, 10]);
        a = b * rng.int(2, 50);
        expected = a / b;
        prompt = `Compute ${a} ÷ ${b}. Return strictly JSON: {"result": <number>, "confidence": <0-1>}`;
        break;
    }

    cases.push({
      id: uuidv4(),
      domain: 'math',
      taxonomy: ['logic_fallacy', 'unsupported_specificity'],
      prompt,
      context: { a, b, operation },
      expected,
      difficulty
    });
  }

  return cases;
}