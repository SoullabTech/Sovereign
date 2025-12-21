'use client';

import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';

interface AgentMetrics {
  agent: string;
  total_routes: number;
  unique_users: number;
  avg_latency_ms: number;
  p50_latency: number;
  p95_latency: number;
  p99_latency: number;
  first_route: string;
  last_route: string;
}

interface AgentData {
  ok: boolean;
  data: AgentMetrics[];
  meta: {
    count: number;
    filters: {
      minRoutes: number;
      limit: number;
    };
  };
}

const columnHelper = createColumnHelper<AgentMetrics>();

const columns = [
  columnHelper.accessor('agent', {
    header: 'Agent',
    cell: (info) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('total_routes', {
    header: 'Routes',
    cell: (info) => (
      <span className="text-gray-700 dark:text-gray-300">
        {info.getValue().toLocaleString()}
      </span>
    ),
  }),
  columnHelper.accessor('unique_users', {
    header: 'Users',
    cell: (info) => (
      <span className="text-gray-700 dark:text-gray-300">
        {info.getValue().toLocaleString()}
      </span>
    ),
  }),
  columnHelper.accessor('avg_latency_ms', {
    header: 'Avg Latency',
    cell: (info) => (
      <span className="text-gray-700 dark:text-gray-300">
        {Math.round(info.getValue())}ms
      </span>
    ),
  }),
  columnHelper.accessor('p50_latency', {
    header: 'P50',
    cell: (info) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {info.getValue()}ms
      </span>
    ),
  }),
  columnHelper.accessor('p95_latency', {
    header: 'P95',
    cell: (info) => (
      <span className="text-sm text-yellow-600 dark:text-yellow-400">
        {info.getValue()}ms
      </span>
    ),
  }),
  columnHelper.accessor('p99_latency', {
    header: 'P99',
    cell: (info) => (
      <span className="text-sm text-orange-600 dark:text-orange-400">
        {info.getValue()}ms
      </span>
    ),
  }),
];

export default function AgentPerformanceTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'total_routes', desc: true },
  ]);

  const { data, isLoading, error } = useQuery<AgentData>({
    queryKey: ['analytics', 'agents'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/agents?limit=50&minRoutes=1');
      if (!res.ok) throw new Error('Failed to fetch agent metrics');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Agent Performance
        </h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-300 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.ok) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Agent Performance
        </h3>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-800 dark:text-red-200">
          Failed to load agent metrics
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Agent Performance
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {data.meta.count} agent{data.meta.count !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() && (
                        <span className="text-blue-500">
                          {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.meta.count === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No agent metrics available yet
        </div>
      )}
    </div>
  );
}
