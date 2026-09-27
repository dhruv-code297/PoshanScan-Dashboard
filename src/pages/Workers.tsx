import { useState } from 'react';
import { useWorkers } from '../api/queries';
import { formatDistanceToNow, subDays, format } from 'date-fns';
import { CircleNotch, WarningCircle, MagnifyingGlass, Funnel, X } from '@phosphor-icons/react';
import type { WorkerData } from '../api/types';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export const Workers = () => {
  const { data, isLoading, error } = useWorkers();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof WorkerData>('last_active_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <CircleNotch weight="bold" className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 flex flex-col justify-center items-center h-full text-[var(--color-secondary)]">
        <WarningCircle weight="regular" className="w-12 h-12 mb-4" />
        <p>Failed to load workers data.</p>
      </div>
    );
  }

  const handleSort = (field: keyof WorkerData) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = data.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.village.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const selectedWorker = data?.find(w => w.worker_id === selectedWorkerId);

  // Generate mock sparkline data for the selected worker
  const sparklineData = selectedWorker ? Array.from({ length: 7 }).map((_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'MMM d'),
    screenings: Math.floor(Math.random() * (selectedWorker.total_screenings / 10)) + 1
  })) : [];

  return (
    <div className="p-6 lg:p-8 flex flex-col h-full max-w-7xl mx-auto w-full">
      <header className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[var(--color-primary)]">Workers</h1>
          <p className="text-sm text-[var(--color-secondary)] mt-1">Monitor activity and compliance</p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search name or village..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border-subtle)] rounded-md focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
            />
          </div>
          <button className="p-2 border border-[var(--color-border-subtle)] rounded-md text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-base)] transition-colors">
            <Funnel className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--color-bg-base)] border-b border-[var(--color-border-subtle)]">
              <tr>
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'village', label: 'Village' },
                  { key: 'total_screenings', label: 'Total Screenings' },
                  { key: 'last_active_at', label: 'Last Active' },
                  { key: 'avg_confidence', label: 'Avg Confidence' },
                  { key: 'flagged_count', label: 'Flags' },
                ].map(col => (
                  <th 
                    key={col.key}
                    onClick={() => handleSort(col.key as keyof WorkerData)}
                    className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--color-border-subtle)]/50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortField === col.key && (
                        <span className="text-[var(--color-accent)]">{sortAsc ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filtered.length > 0 ? filtered.map(worker => (
                <tr 
                  key={worker.worker_id} 
                  onClick={() => setSelectedWorkerId(worker.worker_id)}
                  className="hover:bg-[var(--color-bg-base)] transition-colors h-[48px] cursor-pointer"
                >
                  <td className="px-4 text-sm font-medium text-[var(--color-primary)]">{worker.name}</td>
                  <td className="px-4 text-sm text-[var(--color-secondary)]">{worker.village}</td>
                  <td className="px-4 text-sm font-mono-num text-[var(--color-primary)]">{worker.total_screenings}</td>
                  <td className="px-4 text-sm text-[var(--color-secondary)]">
                    {formatDistanceToNow(new Date(worker.last_active_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 text-sm font-mono-num text-[var(--color-primary)]">
                    {(worker.avg_confidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-4">
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-sm text-xs font-mono-num font-medium ${
                      worker.flagged_count > 0 
                        ? 'bg-[var(--color-sam)]/10 text-[var(--color-sam)]' 
                        : 'bg-[var(--color-normal)]/10 text-[var(--color-normal)]'
                    }`}>
                      {worker.flagged_count}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--color-secondary)]">
                    No workers found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedWorker && (
        <>
          <div className="fixed inset-0 bg-[var(--color-primary)]/10 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedWorkerId(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-[var(--color-surface)] border-l border-[var(--color-border-subtle)] shadow-xl z-50 transform transition-transform overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex justify-between items-center bg-[var(--color-bg-base)] sticky top-0 z-10">
              <h2 className="font-heading font-bold text-lg text-[var(--color-primary)]">Worker Profile</h2>
              <button onClick={() => setSelectedWorkerId(null)} className="p-1 text-[var(--color-secondary)] hover:text-[var(--color-primary)] rounded-sm hover:bg-[var(--color-border-subtle)]/50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-heading font-bold text-xl text-[var(--color-primary)]">{selectedWorker.name}</h3>
                <p className="text-sm text-[var(--color-secondary)] mt-1">{selectedWorker.village}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-sm">
                  <p className="text-xs text-[var(--color-secondary)] mb-1">Total Screenings</p>
                  <p className="font-mono-num text-lg font-medium text-[var(--color-primary)]">{selectedWorker.total_screenings}</p>
                </div>
                <div className="p-3 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-sm">
                  <p className="text-xs text-[var(--color-secondary)] mb-1">Avg Confidence</p>
                  <p className="font-mono-num text-lg font-medium text-[var(--color-primary)]">{(selectedWorker.avg_confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-sm">
                  <p className="text-xs text-[var(--color-secondary)] mb-1">Flags</p>
                  <p className="font-mono-num text-lg font-medium text-[var(--color-sam)]">{selectedWorker.flagged_count}</p>
                </div>
                <div className="p-3 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-sm">
                  <p className="text-xs text-[var(--color-secondary)] mb-1">Last Active</p>
                  <p className="text-sm font-medium text-[var(--color-primary)]">
                    {formatDistanceToNow(new Date(selectedWorker.last_active_at))} ago
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-[var(--color-primary)] mb-3 border-b border-[var(--color-border-subtle)] pb-1">Activity (Last 7 Days)</h4>
                <div className="h-32 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                      <Line 
                        type="monotone" 
                        dataKey="screenings" 
                        stroke="var(--color-accent)" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--color-surface)', stroke: 'var(--color-accent)', strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[10px] text-[var(--color-secondary)] mt-1 px-1">
                  <span>{sparklineData[0]?.date}</span>
                  <span>{sparklineData[sparklineData.length-1]?.date}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
