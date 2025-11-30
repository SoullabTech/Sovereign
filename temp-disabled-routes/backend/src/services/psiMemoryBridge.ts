import { promises as fs } from "fs";
import { dirname, resolve } from "path";
import { PsiEpisode } from "../ain/motivation";

export type PsiEpisodeWriter = (ep: PsiEpisode) => Promise<void>;

let writer: PsiEpisodeWriter | null = null;

async function defaultJsonlWriter(ep: PsiEpisode) {
  const file = resolve(process.cwd(), "logs/psi-episodes.jsonl");
  await fs.mkdir(dirname(file), { recursive: true });
  await fs.appendFile(file, JSON.stringify(ep) + "\n", "utf8");
}

export function setPsiEpisodeWriter(w: PsiEpisodeWriter) { writer = w; }

export async function savePsiEpisode(ep: PsiEpisode) {
  if (process.env.PSI_MEMORY_ENABLED === "false") return;
  const w = writer ?? defaultJsonlWriter;
  await w(ep);
}

/**
 * Example adapter hook you can wire later to AIN memory service:
 *
 * setPsiEpisodeWriter(async (ep) => {
 *   // import your service here (kept inline to avoid circular deps)
 *   const { logEpisode } = await import("./memoryServiceAdapter");
 *   await logEpisode(ep);
 * });
 */