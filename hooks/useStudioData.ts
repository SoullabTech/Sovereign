import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

// ============================================================================
// Team Context
// ============================================================================

export type StudioMode = 'personal' | 'practice';

interface TeamContextValue {
  currentTeamId: string | null;
  setCurrentTeamId: (teamId: string | null) => void;
  includePersonal: boolean;
  setIncludePersonal: (include: boolean) => void;
  studioMode: StudioMode;
  setStudioMode: (mode: StudioMode) => void;
}

const TeamContext = createContext<TeamContextValue>({
  currentTeamId: null,
  setCurrentTeamId: () => {},
  includePersonal: true,
  setIncludePersonal: () => {},
  studioMode: 'practice',
  setStudioMode: () => {},
});

export function useTeamContext() {
  return useContext(TeamContext);
}

export { TeamContext };

// ============================================================================
// Types
// ============================================================================

export interface Team {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface TriageItem {
  id: string;
  title: string;
  description: string | null;
  source: 'manual' | 'user_report' | 'monitoring' | 'agent';
  source_ref: string | null;
  priority: 'unset' | 'urgent' | 'today' | 'this_week' | 'backlog' | 'wont_fix';
  status: 'pending' | 'delegated' | 'in_review' | 'shipped' | 'rejected';
  triaged_at: string | null;
  created_at: string;
  updated_at: string;
  team_id?: string | null;
  scope?: 'personal' | 'team';
}

export interface AgentTask {
  id: string;
  triage_id: string | null;
  title: string;
  prompt: string;
  agent_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output: string | null;
  artifacts: { type: string; path: string }[];
  review_status: 'pending_review' | 'approved' | 'rejected' | 'needs_changes' | null;
  review_notes: string | null;
  reviewed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  team_id?: string | null;
  scope?: 'personal' | 'team';
}

export interface DailyLog {
  id: string;
  log_date: string;
  hours_at_computer: number | null;
  hours_debugging: number | null;
  hours_strategic: number | null;
  hours_content: number | null;
  hours_support: number | null;
  fires_fought: number;
  tasks_delegated: number;
  tasks_reviewed: number;
  shipments: number;
  notes: string | null;
  wins: string | null;
  blocks: string | null;
}

export interface ProofSignals {
  period_start: string;
  period_end: string;
  avg_hours_per_day: number;
  total_fires_fought: number;
  total_delegated: number;
  total_shipped: number;
  zero_debugging_days: number;
  target_hours_met: boolean;
  delegation_ratio: number;
  days_logged: number;
}

// Teams hook
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/studio/teams');
      const data = await response.json();
      setTeams(data.teams || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (team: { name: string; description?: string }) => {
    const response = await apiFetch('/api/studio/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
    });
    const data = await response.json();
    if (data.team) {
      setTeams(prev => [...prev, data.team]);
    }
    return data.team;
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refetch: fetchTeams, createTeam };
}

// Triage hook with team support
export function useTriageItems(teamId?: string | null, includePersonal: boolean = true) {
  const [items, setItems] = useState<TriageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (teamId) {
        params.set('teamId', teamId);
        params.set('includePersonal', includePersonal.toString());
      }
      const url = `/api/studio/triage${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiFetch(url);
      const data = await response.json();
      setItems(data.items || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch triage items');
    } finally {
      setLoading(false);
    }
  }, [teamId, includePersonal]);

  const createItem = useCallback(async (item: Partial<TriageItem>) => {
    const response = await apiFetch('/api/studio/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, team_id: teamId }),
    });
    const data = await response.json();
    if (data.item) {
      setItems(prev => [data.item, ...prev]);
    }
    return data.item;
  }, [teamId]);

  const updateItem = useCallback(async (id: string, updates: Partial<TriageItem>) => {
    const response = await apiFetch('/api/studio/triage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await response.json();
    if (data.item) {
      setItems(prev => prev.map(i => i.id === id ? data.item : i));
    }
    return data.item;
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems, createItem, updateItem };
}

// Agent Tasks hook with team support
export function useAgentTasks(teamId?: string | null, includePersonal: boolean = true) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (teamId) {
        params.set('teamId', teamId);
        params.set('includePersonal', includePersonal.toString());
      }
      const url = `/api/studio/agent-tasks${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiFetch(url);
      const data = await response.json();
      setTasks(data.tasks || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent tasks');
    } finally {
      setLoading(false);
    }
  }, [teamId, includePersonal]);

  const createTask = useCallback(async (task: { title: string; prompt: string; agent_type?: string; triage_id?: string }) => {
    const response = await apiFetch('/api/studio/agent-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, team_id: teamId }),
    });
    const data = await response.json();
    if (data.task) {
      setTasks(prev => [data.task, ...prev]);
    }
    return data.task;
  }, [teamId]);

  const updateTask = useCallback(async (id: string, updates: Partial<AgentTask>) => {
    const response = await apiFetch('/api/studio/agent-tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await response.json();
    if (data.task) {
      setTasks(prev => prev.map(t => t.id === id ? data.task : t));
    }
    return data.task;
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks, createTask, updateTask };
}

// Daily Log hook
export function useDailyLog() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (range: 'week' | 'month' = 'week') => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/studio/daily-log?range=${range}`);
      const data = await response.json();
      setLogs(data.logs || []);

      // Find today's log
      const today = new Date().toISOString().split('T')[0];
      const todaysLog = data.logs?.find((log: DailyLog) => log.log_date === today);
      setTodayLog(todaysLog || null);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch daily logs');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLog = useCallback(async (log: Partial<DailyLog>) => {
    const response = await apiFetch('/api/studio/daily-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    const data = await response.json();
    if (data.log) {
      setTodayLog(data.log);
      // Update logs array
      setLogs(prev => {
        const existing = prev.findIndex(l => l.log_date === data.log.log_date);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data.log;
          return updated;
        }
        return [data.log, ...prev];
      });
    }
    return data.log;
  }, []);

  const incrementCounter = useCallback(async (counter: 'fires' | 'delegated' | 'reviewed' | 'shipments') => {
    const body: Record<string, boolean> = {};
    body[`increment_${counter}`] = true;

    const response = await apiFetch('/api/studio/daily-log', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (data.log) {
      setTodayLog(data.log);
    }
    return data.log;
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, todayLog, loading, error, refetch: fetchLogs, saveLog, incrementCounter };
}

// Proof Signals hook
export function useProofSignals() {
  const [current, setCurrent] = useState<ProofSignals | null>(null);
  const [history, setHistory] = useState<ProofSignals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = useCallback(async (periodType: 'week' | 'month' = 'week') => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/studio/proof-signals?period_type=${periodType}`);
      const data = await response.json();
      setCurrent(data.current || null);
      setHistory(data.history || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proof signals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  return { current, history, loading, error, refetch: fetchSignals };
}

// Booking types
export interface Booking {
  id: string;
  startAt: string;
  endAt: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  practitionerNotes: string | null;
  priceCents: number | null;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'waived';
  serviceName: string | null;
  durationMinutes: number | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  googleEventId: string | null;
  calendarSyncStatus: 'pending' | 'synced' | 'failed' | 'not_connected' | null;
  calendarSyncError: string | null;
  calendarDisclosure: 'busy_only' | 'generic' | 'full' | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
  available: boolean;
}

export interface IntegrationStatus {
  google_calendar: {
    connected: boolean;
    email: string | null;
    connectedAt: string | null;
    error: string | null;
  };
  microsoft_calendar?: {
    connected: boolean;
    email: string | null;
    connectedAt: string | null;
    error: string | null;
  };
}

// Bookings hook
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (options: {
    status?: string;
    from?: string;
    to?: string;
    limit?: number;
  } = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.from) params.set('from', options.from);
      if (options.to) params.set('to', options.to);
      if (options.limit) params.set('limit', options.limit.toString());

      const response = await apiFetch(`/api/studio/bookings?${params.toString()}`);
      const data = await response.json();
      setBookings(data.bookings || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  /* `status` is typed against Booking's own union rather than `string`: a bare
     string widened the spread below and made the optimistic state update
     unassignable to Booking[]. It also let a caller send a status the API
     would reject, with nothing catching it here. */
  const updateBooking = useCallback(async (id: string, updates: {
    status?: Booking['status'];
    practitionerNotes?: string;
  }) => {
    const response = await apiFetch('/api/studio/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await response.json();
    if (data.success) {
      setBookings(prev => prev.map(b =>
        b.id === id ? { ...b, ...updates } : b
      ));
    }
    return data;
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings, updateBooking };
}

// Availability hook
export function useBookingAvailability() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async (from: Date, to: Date, durationMinutes: number = 60) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        duration: durationMinutes.toString(),
      });

      const response = await apiFetch(`/api/studio/bookings/availability?${params.toString()}`);
      const data = await response.json();
      setSlots(data.slots || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  }, []);

  return { slots, loading, error, fetchAvailability };
}

// Integrations hook
export function useIntegrations() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/studio/integrations');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch integration status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, error, refetch: fetchStatus };
}
