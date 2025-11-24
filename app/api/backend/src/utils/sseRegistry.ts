import type { Response, Request, NextFunction } from "express";

export const sseClients = new Set<Response>();
let shuttingDown = false;

export function attachSSE(res: Response) {
  sseClients.add(res);
  res.on("close", () => sseClients.delete(res));
}

export function sseGuard(req: Request, res: Response, next: NextFunction) {
  if (shuttingDown && req.path.includes("/stream")) {
    res.setHeader("Retry-After", "30");
    return res.status(503).json({ success: false, error: "shutdown", message: "Server restarting, try again shortly." });
  }
  next();
}

export function initSSEShutdown() {
  const signal = async () => {
    shuttingDown = true;
    for (const res of sseClients) {
      try {
        res.write(`event: shutdown\n`);
        res.write(`data: {"message":"Server restarting, reconnect soon","retry":30000}\n\n`);
        res.end();
      } catch {}
    }
    // give connections a moment to flush, then exit
    setTimeout(() => process.exit(0), 5000);
  };

  process.on("SIGTERM", signal);
  process.on("SIGINT", signal);
}