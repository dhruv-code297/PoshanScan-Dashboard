import { useState } from 'react';
import { useTrends, useWorkers } from '../api/queries';
import { RISK_BANDS } from '../constants/riskBands';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CircleNotch, WarningCircle, CalendarBlank } from '@phosphor-icons/react';
import { subDays, format } from 'date-fns';

export const Trends = () => {
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const [groupBy, setGroupBy] = useState<'worker' | 'region'>('region');

  const toDate = format(new Date(), 'yyyy-MM-dd');
  const fromDate = format(subDays(new Date(), parseInt(range)), 'yyyy-MM-dd');

  const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useTrends(fromDate, toDate, groupBy, 'day');
  const { data: workersData } = useWorkers();

  if (trendsLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <CircleNotch weight="bold" className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
      </div>
    );
  }

  if (trendsError || !trendsData) {
    return (
      <div className="p-8 flex flex-col justify-center items-center h-full text-[var(--color-secondary)]">
        <WarningCircle weight="regular" className="w-12 h-12 mb-4" />
        <p>Failed to load trend data.</p>
      </div>
    );
  }

  // Sort workers by flagged count (proxy for SAM cases)
  const topWorkers = workersData ? [...workersData].sort((a, b) => b.flagged_count - a.flagged_count).slice(0, 5) : [];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[var(--color-primary)]">Trends</h1>
          <p className="text-sm text-[var(--color-secondary)] mt-1">Screening volume and malnutrition risk over time</p>
        </div>

        <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-1 rounded-md">
          {(['7', '30', '90'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                range === r 
                  ? 'bg-[var(--color-border-subtle)]/50 text-[var(--color-primary)]' 
                  : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
              }`}
            >
              {r}d
            </button>
          ))}
          <div className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />
          <button className="px-3 py-1.5 text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2 hover:text-[var(--color-primary)]">
            <CalendarBlank weight="regular" /> Custom
          </button>
        </div>
      </header>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading font-bold text-sm text-[var(--color-primary)]">Daily Screenings by Risk Band</h2>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setGroupBy('region')}
              className={`text-xs px-2 py-1 border rounded-sm transition-colors ${groupBy === 'region' ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'border-[var(--color-border-subtle)] text-[var(--color-secondary)]'}`}
            >
              By Region
            </button>
            <button 
              onClick={() => setGroupBy('worker')}
              className={`text-xs px-2 py-1 border rounded-sm transition-colors ${groupBy === 'worker' ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'border-[var(--color-border-subtle)] text-[var(--color-secondary)]'}`}
            >
              By Worker
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendsData.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-secondary)' }}
                tickFormatter={(val) => format(new Date(val), 'MMM d')}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-secondary)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)', 
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-card)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem'
                }}
                itemStyle={{ fontFamily: 'var(--font-mono)' }}
                labelStyle={{ color: 'var(--color-secondary)', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="normal" stackId="1" stroke={RISK_BANDS.NORMAL.color} fill={RISK_BANDS.NORMAL.color} fillOpacity={0.2} name="Normal" />
              <Area type="monotone" dataKey="mam" stackId="1" stroke={RISK_BANDS.MAM.color} fill={RISK_BANDS.MAM.color} fillOpacity={0.3} name="MAM" />
              <Area type="monotone" dataKey="sam" stackId="1" stroke={RISK_BANDS.SAM.color} fill={RISK_BANDS.SAM.color} fillOpacity={0.4} name="SAM" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]">
            <h2 className="font-heading font-bold text-sm text-[var(--color-primary)]">Top Workers by Flagged Cases</h2>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {topWorkers.length > 0 ? topWorkers.map((worker) => (
              <div key={worker.worker_id} className="p-4 flex justify-between items-center hover:bg-[var(--color-bg-base)] transition-colors">
                <div>
                  <p className="text-sm font-medium text-[var(--color-primary)]">{worker.name}</p>
                  <p className="text-xs text-[var(--color-secondary)] mt-0.5">{worker.village}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono-num font-medium text-[var(--color-sam)]">{worker.flagged_count}</span>
                  <p className="text-xs text-[var(--color-secondary)] mt-0.5">flags</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-[var(--color-secondary)] text-sm">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
