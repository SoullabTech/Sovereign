'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  maxRows?: number;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'No data available',
  maxRows,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return;

    if (sortKey === columnKey) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const displayData = maxRows ? sortedData.slice(0, maxRows) : sortedData;
  const hasMore = maxRows && sortedData.length > maxRows;

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  if (data.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key, column.sortable)}
                  className={`
                    px-6 py-4 text-sm font-medium text-gray-400
                    ${alignClasses[column.align || 'left']}
                    ${column.sortable ? 'cursor-pointer hover:text-gray-300 select-none' : ''}
                  `}
                >
                  <div className="flex items-center gap-2 justify-start">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortKey === column.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp size={14} className="text-amber-500" />
                          ) : (
                            <ChevronDown size={14} className="text-amber-500" />
                          )
                        ) : (
                          <div className="text-gray-600">
                            <ChevronUp size={14} className="mb-[-4px]" />
                            <ChevronDown size={14} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: rowIndex * 0.02 }}
                className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30 transition-colors"
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  const content = column.render ? column.render(value, row) : value;

                  return (
                    <td
                      key={column.key}
                      className={`
                        px-6 py-4 text-sm text-gray-300
                        ${alignClasses[column.align || 'left']}
                      `}
                    >
                      <div className="truncate max-w-xs">{content}</div>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="px-6 py-3 bg-zinc-950 border-t border-zinc-800 text-center">
          <p className="text-xs text-gray-500">
            Showing {displayData.length} of {sortedData.length} rows
          </p>
        </div>
      )}
    </div>
  );
}
