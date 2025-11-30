// 📁 BACKEND/src/lib/memorySpiral.ts
import { HarmonicConstants } from "./harmonicPetalMap";

interface MemoryEntry {
  content: string;
  element: string;
  phase: number;
  constant: keyof typeof HarmonicConstants;
  timestamp: string;
}

const memorySpiral: MemoryEntry[] = [];

export function logMemory(entry: MemoryEntry) {
  memorySpiral.push(entry);
}

export function getMemorySpiral() {
  return memorySpiral;
}
