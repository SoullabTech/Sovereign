/**
 * Structured JSON logger — Phase 1 hardening.
 *
 * Zero dependencies. Outputs JSON lines to stdout/stderr,
 * parseable by Docker log drivers and any future aggregator.
 *
 * Interface matches Pino signature so Phase 2 swap is trivial:
 *   logger.info({ traceId, duration }, "message")
 *   logger.error({ traceId, error }, "message")
 */

type LogLevel = 'info' | 'warn' | 'error';

function emit(level: LogLevel, data: Record<string, unknown>, msg: string) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...data,
  };
  const line = JSON.stringify(entry);

  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info(data: Record<string, unknown>, msg: string) {
    emit('info', data, msg);
  },
  warn(data: Record<string, unknown>, msg: string) {
    emit('warn', data, msg);
  },
  error(data: Record<string, unknown>, msg: string) {
    emit('error', data, msg);
  },
};
