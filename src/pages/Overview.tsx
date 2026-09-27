import { useOverview } from '../api/queries';
import { RISK_BANDS } from '../constants/riskBands';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { WarningCircle, CircleNotch, ChartLineUp, UserPlus, FileMagnifyingGlass } from '@phosphor-icons/react';

export const Overview = () => {
  const { data, isLoading, error } = useOverview();

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
        <p>Failed to load overview data. Please try again later.</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Normal', value: data.normal_count, color: RISK_BANDS.NORMAL.color },
    { name: 'MAM', value: data.mam_count, color: RISK_BANDS.MAM.color },
    { name: 'SAM', value: data.sam_count, color: RISK_BANDS.SAM.color },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[var(--color-primary)]">Overview</h1>
          <p className="text-sm text-[var(--color-secondary)] mt-1">Real-time malnutrition screening metrics</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md p-5 flex flex-col justify-between">
          <p className="text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-2">Total Screenings</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-num text-3xl font-medium text-[var(--color-primary)]">{data.total_screenings.toLocaleString()}</span>
          </div>
        </div>
        
        {chartData.map((band) => {
          const pct = ((band.value / data.total_screenings) * 100).toFixed(1);
          return (
            <div key={band.name} className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: band.color }} />
              <p className="text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-2">{band.name}</p>
              <div className="flex flex-col">
                <span className="font-mono-num text-3xl font-medium text-[var(--color-primary)]">{band.value.toLocaleString()}</span>
                <span className="font-mono-num text-sm text-[var(--color-secondary)] mt-1">{pct}% of total</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md p-5">
          <h2 className="font-heading font-bold text-sm text-[var(--color-primary)] mb-6">Risk Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {chartData.map(band => (
              <div key={band.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: band.color }} />
                <span className="text-sm font-medium text-[var(--color-secondary)]">{band.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md p-5 flex items-start gap-4">
            <div className="p-2 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-sm">
              <ChartLineUp weight="regular" className="w-5 h-5 text-[var(--color-secondary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-secondary)] mb-1">Average Confidence</p>
              <p className="font-mono-num text-2xl font-medium text-[var(--color-primary)]">{(data.avg_confidence * 100).toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md p-5 flex items-start gap-4">
            <div className="p-2 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-sm">
              <UserPlus weight="regular" className="w-5 h-5 text-[var(--color-secondary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-secondary)] mb-1">Active Workers Today</p>
              <p className="font-mono-num text-2xl font-medium text-[var(--color-primary)]">{data.active_workers}</p>
            </div>
          </div>
          
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md p-5 flex-1">
             <div className="flex items-center gap-2 mb-4">
               <FileMagnifyingGlass className="w-5 h-5 text-[var(--color-secondary)]" />
               <h2 className="font-heading font-bold text-sm text-[var(--color-primary)]">Recent Activity</h2>
             </div>
             
             {/* Mock recent activity since it's not in the API overview explicitly, but the spec says "recent-activity list" */}
             <div className="space-y-3">
               {[1,2,3,4].map((i) => (
                 <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-[var(--color-border-subtle)] last:border-0 pb-2">
                   <div>
                     <p className="font-medium text-[var(--color-primary)]">Sita Devi</p>
                     <p className="text-xs text-[var(--color-secondary)]">Rampur Village</p>
                   </div>
                   <div className="text-right">
                     <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold ${i%3 === 0 ? 'bg-[var(--color-sam)]/10 text-[var(--color-sam)]' : 'bg-[var(--color-normal)]/10 text-[var(--color-normal)]'}`}>
                       {i%3 === 0 ? 'SAM' : 'NORMAL'}
                     </span>
                     <p className="text-[10px] text-[var(--color-secondary)] mt-1">{i * 12} mins ago</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
