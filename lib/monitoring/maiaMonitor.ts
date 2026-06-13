import { query, pool } from '@/lib/db/postgres';

type CheckStatus = 'up' | 'down' | 'degraded';

interface MonitoringService {
  id: string;
  name: string;
  display_name: string;
  category: string;
  check_url: string | null;
  check_type: 'http' | 'postgres';
  expected_status: number;
  timeout_ms: number;
  is_active: boolean;
  sort_order: number;
}

interface CheckResult {
  service_id: string;
  service_name: string;
  display_name: string;
  status: CheckStatus;
  response_ms: number | null;
  http_status: number | null;
  error: string | null;
}

interface ServiceWithStatus {
  id: string;
  name: string;
  display_name: string;
  category: string;
  current_status: CheckStatus | null;
  last_checked_at: string | null;
  response_ms: number | null;
  uptime_bar: boolean[];
  uptime_pct_24h: number;
  uptime_pct_7d: number;
  open_incident: IncidentRow | null;
}

interface IncidentRow {
  id: string;
  service_id: string;
  service_name: string;
  started_at: string;
  resolved_at: string | null;
  downtime_seconds: number | null;
  error: string | null;
}

interface IncidentFormatted extends IncidentRow {
  downtime_formatted: string;
}

async function runHttpCheck(service: MonitoringService): Promise<CheckResult> {
  const url = service.check_url!;
  const start = Date.now();
  let status: CheckStatus = 'down';
  let http_status: number | null = null;
  let error: string | null = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), service.timeout_ms);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      http_status = res.status;
      const expected = service.expected_status;
      if (expected === 200) {
        status = res.status >= 200 && res.status < 300 ? 'up' : 'down';
      } else {
        status = res.status === expected ? 'up' : 'down';
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      error = 'timeout';
    } else {
      error = err instanceof Error ? err.message : String(err);
    }
    status = 'down';
  }

  return {
    service_id: service.id,
    service_name: service.name,
    display_name: service.display_name,
    status,
    response_ms: Date.now() - start,
    http_status,
    error,
  };
}

async function runPostgresCheck(service: MonitoringService): Promise<CheckResult> {
  const start = Date.now();
  let status: CheckStatus = 'down';
  let error: string | null = null;

  try {
    await query('SELECT 1');
    status = 'up';
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : String(err);
    status = 'down';
  }

  return {
    service_id: service.id,
    service_name: service.name,
    display_name: service.display_name,
    status,
    response_ms: Date.now() - start,
    http_status: null,
    error,
  };
}

async function openIncident(serviceId: string, error: string | null): Promise<void> {
  await query(
    `INSERT INTO monitoring_incidents (service_id, error) VALUES ($1, $2)`,
    [serviceId, error],
  );
}

async function closeIncident(incidentId: string): Promise<void> {
  await query(
    `UPDATE monitoring_incidents
     SET resolved_at = NOW(),
         downtime_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
     WHERE id = $1`,
    [incidentId],
  );
}

async function getOpenIncident(serviceId: string): Promise<{ id: string } | null> {
  const res = await query<{ id: string }>(
    `SELECT id FROM monitoring_incidents WHERE service_id = $1 AND resolved_at IS NULL LIMIT 1`,
    [serviceId],
  );
  return res.rows[0] ?? null;
}

export async function runAllChecks(): Promise<CheckResult[]> {
  const servicesRes = await query<MonitoringService>(
    `SELECT * FROM monitoring_services WHERE is_active = TRUE ORDER BY sort_order`,
  );
  const services = servicesRes.rows;

  const results = await Promise.all(
    services.map((svc) =>
      svc.check_type === 'postgres' ? runPostgresCheck(svc) : runHttpCheck(svc),
    ),
  );

  for (const result of results) {
    await query(
      `INSERT INTO monitoring_checks (service_id, status, response_ms, http_status, error)
       VALUES ($1, $2, $3, $4, $5)`,
      [result.service_id, result.status, result.response_ms, result.http_status, result.error],
    );

    const openIncident = await getOpenIncident(result.service_id);
    if (result.status === 'down' && !openIncident) {
      await openIncident(result.service_id, result.error);
    } else if (result.status === 'up' && openIncident) {
      await closeIncident(openIncident.id);
    }
  }

  await query(
    `DELETE FROM monitoring_checks WHERE checked_at < NOW() - INTERVAL '7 days'`,
  );

  return results;
}

export async function getServicesWithStatus(hours: number = 24): Promise<ServiceWithStatus[]> {
  const servicesRes = await query<MonitoringService>(
    `SELECT * FROM monitoring_services ORDER BY sort_order`,
  );

  const results: ServiceWithStatus[] = [];

  for (const svc of servicesRes.rows) {
    const lastCheckRes = await query<{
      status: CheckStatus;
      response_ms: number;
      checked_at: string;
    }>(
      `SELECT status, response_ms, checked_at
       FROM monitoring_checks
       WHERE service_id = $1
       ORDER BY checked_at DESC
       LIMIT 1`,
      [svc.id],
    );
    const last = lastCheckRes.rows[0] ?? null;

    const bar90Res = await query<{ status: CheckStatus }>(
      `SELECT status FROM monitoring_checks
       WHERE service_id = $1
       ORDER BY checked_at DESC
       LIMIT 90`,
      [svc.id],
    );
    const bar90 = bar90Res.rows.map((r) => r.status === 'up').reverse();

    const uptimeRes24 = await query<{ up_count: string; total_count: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'up') AS up_count,
         COUNT(*) AS total_count
       FROM monitoring_checks
       WHERE service_id = $1 AND checked_at > NOW() - INTERVAL '24 hours'`,
      [svc.id],
    );
    const u24 = uptimeRes24.rows[0];
    const uptime24 =
      Number(u24?.total_count) > 0
        ? Math.round((Number(u24.up_count) / Number(u24.total_count)) * 100)
        : 100;

    const uptimeRes7d = await query<{ up_count: string; total_count: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'up') AS up_count,
         COUNT(*) AS total_count
       FROM monitoring_checks
       WHERE service_id = $1 AND checked_at > NOW() - INTERVAL '7 days'`,
      [svc.id],
    );
    const u7d = uptimeRes7d.rows[0];
    const uptime7d =
      Number(u7d?.total_count) > 0
        ? Math.round((Number(u7d.up_count) / Number(u7d.total_count)) * 100)
        : 100;

    const openIncidentRes = await query<IncidentRow>(
      `SELECT i.*, ms.name AS service_name
       FROM monitoring_incidents i
       JOIN monitoring_services ms ON ms.id = i.service_id
       WHERE i.service_id = $1 AND i.resolved_at IS NULL
       LIMIT 1`,
      [svc.id],
    );

    results.push({
      id: svc.id,
      name: svc.name,
      display_name: svc.display_name,
      category: svc.category,
      current_status: last?.status ?? null,
      last_checked_at: last?.checked_at ?? null,
      response_ms: last?.response_ms ?? null,
      uptime_bar: bar90,
      uptime_pct_24h: uptime24,
      uptime_pct_7d: uptime7d,
      open_incident: openIncidentRes.rows[0] ?? null,
    });
  }

  return results;
}

function formatDowntime(seconds: number | null): string {
  if (seconds === null) return 'ongoing';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export async function getIncidents(limit: number = 20): Promise<IncidentFormatted[]> {
  const res = await query<IncidentRow>(
    `SELECT i.*, ms.name AS service_name, ms.display_name
     FROM monitoring_incidents i
     JOIN monitoring_services ms ON ms.id = i.service_id
     ORDER BY i.started_at DESC
     LIMIT $1`,
    [limit],
  );

  return res.rows.map((row) => ({
    ...row,
    downtime_formatted: formatDowntime(row.downtime_seconds),
  }));
}
