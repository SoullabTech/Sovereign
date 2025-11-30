export function validateMathResult(
  result: any,
  expected: number,
  tolerance: number = 0.001
): { correct: boolean; difference?: number } {
  if (typeof result !== 'number' || isNaN(result)) {
    return { correct: false };
  }

  const difference = Math.abs(result - expected);
  const correct = difference <= tolerance;

  return { correct, difference };
}

export function extractMathResult(parsed: any): number | null {
  if (typeof parsed?.result === 'number') {
    return parsed.result;
  }
  if (typeof parsed?.answer === 'number') {
    return parsed.answer;
  }
  return null;
}