import { useState } from 'react';
import { useFlagged } from '../api/queries';
import { RISK_BANDS } from '../constants/riskBands';
import { format } from 'date-fns';
import { CircleNotch, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const Flagged = () => {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'reviewed'>('pending');
  const { data, isLoading, error } = useFlagged(statusFilter);

  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

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
        <p>Failed to load flagged records.</p>
      </div>
    );
  }

  const handleReview = (_id: string) => {
    // TODO: confirm review endpoint with backend
    toast.success('Record marked as reviewed');
    setSelectedRecord(null);
    // In a real app we'd mutate and invalidate the query here.
  };

  const selectedData = data.find(r => r.screening_id === selectedRecord);

  return (
    <div className="p-6 lg:p-8 flex flex-col h-full max-w-7xl mx-auto w-full relative">
      <header className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[var(--color-primary)]">Flagged Records</h1>
          <p className="text-sm text-[var(--color-secondary)] mt-1">Review low-confidence and SAM cases</p>
        </div>

        <div className="flex p-1 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              statusFilter === 'pending'
                ? 'bg-[var(--color-border-subtle)]/50 text-[var(--color-primary)]'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              statusFilter === 'reviewed'
                ? 'bg-[var(--color-border-subtle)]/50 text-[var(--color-primary)]'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            Reviewed
          </button>
        </div>
      </header>

      <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--color-bg-base)] border-b border-[var(--color-border-subtle)]">
              <tr>
                <th className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider">Worker</th>
                <th className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider">Child Ref</th>
                <th className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider">Band</th>
                <th className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider">MUAC (mm)</th>
                <th className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {data.length > 0 ? data.map(record => (
                <tr 
                  key={record.screening_id} 
                  onClick={() => setSelectedRecord(record.screening_id)}
                  className="hover:bg-[var(--color-bg-base)] transition-colors cursor-pointer h-[48px]"
                >
                  <td className="px-4 text-sm text-[var(--color-secondary)]">
                    {format(new Date(record.captured_at), 'MMM d, HH:mm')}
                  </td>
                  <td className="px-4 text-sm font-medium text-[var(--color-primary)]">{record.worker_name}</td>
                  <td className="px-4 text-sm font-mono-num text-[var(--color-secondary)]">{record.child_ref}</td>
                  <td className="px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold ${RISK_BANDS[record.risk_band.toUpperCase() as keyof typeof RISK_BANDS].bgClass}/10 ${RISK_BANDS[record.risk_band.toUpperCase() as keyof typeof RISK_BANDS].textClass}`}>
                      {record.risk_band.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 text-sm font-mono-num text-[var(--color-primary)]">{record.muac_estimate_mm}</td>
                  <td className="px-4">
                    <div className="flex gap-1 flex-wrap">
                      {record.quality_flags.map((flag, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-[var(--color-border-subtle)]/50 text-[var(--color-secondary)] text-[10px] rounded-sm truncate max-w-[100px]" title={flag}>
                          {flag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--color-secondary)]">
                    No {statusFilter} records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-primary)]/20 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md shadow-lg w-full max-w-md flex flex-col">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
              <h2 className="font-heading font-bold text-lg text-[var(--color-primary)]">Review Record</h2>
              <button onClick={() => setSelectedRecord(null)} className="text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--color-secondary)] mb-1">Child Ref</p>
                  <p className="font-mono-num text-sm text-[var(--color-primary)]">{selectedData.child_ref}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-secondary)] mb-1">Worker</p>
                  <p className="text-sm text-[var(--color-primary)]">{selectedData.worker_name}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-secondary)] mb-1">Captured At</p>
                  <p className="text-sm text-[var(--color-primary)]">{format(new Date(selectedData.captured_at), 'MMM d, yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-secondary)] mb-1">MUAC Estimate</p>
                  <p className="font-mono-num text-sm text-[var(--color-primary)]">{selectedData.muac_estimate_mm} mm</p>
                </div>
              </div>
              
              <div className="p-3 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-sm">
                 <p className="text-xs text-[var(--color-secondary)] mb-2">Quality Flags</p>
                 <ul className="list-disc pl-4 text-sm text-[var(--color-primary)] space-y-1">
                   {selectedData.quality_flags.length > 0 ? selectedData.quality_flags.map((f,i) => <li key={i}>{f}</li>) : <li>None</li>}
                 </ul>
              </div>

              <div>
                <label className="block text-xs text-[var(--color-secondary)] mb-1">Review Note (Optional)</label>
                <textarea className="w-full text-sm p-2 border border-[var(--color-border-subtle)] rounded-sm focus:outline-none focus:border-[var(--color-accent)]" rows={3} placeholder="Add context..."></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--color-border-subtle)] flex justify-end gap-3 bg-[var(--color-bg-base)]">
              <button 
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 text-sm font-medium text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReview(selectedData.screening_id)}
                className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
              >
                <CheckCircle weight="bold" />
                Mark as Reviewed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
