import { useState } from 'react';
import { DownloadSimple, Printer } from '@phosphor-icons/react';
import { useOverview, useTrends, useLocations } from '../api/queries';
import { format, subDays } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { RISK_BANDS } from '../constants/riskBands';

export const Export = () => {
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  
  const toDate = format(new Date(), 'yyyy-MM-dd');
  const fromDate = format(subDays(new Date(), parseInt(range)), 'yyyy-MM-dd');

  const { data: overview } = useOverview();
  const { data: trends } = useTrends(fromDate, toDate, 'region', 'day');
  const { data: locations } = useLocations();

  const handleDownloadCsv = () => {
    // Mock CSV download
    const url = `/api/dashboard/export?format=csv&from=${fromDate}&to=${toDate}`;
    console.log('Downloading from:', url);
    
    // Create dummy CSV and trigger download
    const csv = 'date,normal,mam,sam,total\n' + (trends?.points.map(p => `${p.date},${p.normal},${p.mam},${p.sam},${p.total}`).join('\n') || '');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `poshanscan_export_${fromDate}_to_${toDate}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[var(--color-primary)]">Export & Reports</h1>
          <p className="text-sm text-[var(--color-secondary)] mt-1">Download raw data or print summary reports</p>
        </div>
      </header>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 border-b border-[var(--color-border-subtle)] pb-4">
        <h1 className="font-heading font-bold text-3xl text-[var(--color-primary)]">PoshanScan Report</h1>
        <p className="text-[var(--color-secondary)] mt-2">
          Period: {fromDate} to {toDate} <br/>
          Generated: {format(new Date(), 'yyyy-MM-dd HH:mm')}
        </p>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-md p-6 print:border-0 print:p-0 print:shadow-none">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 print:hidden">
          <div className="flex items-center gap-3 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] p-1 rounded-md">
            {(['7', '30', '90'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                  range === r 
                    ? 'bg-[var(--color-border-subtle)]/50 text-[var(--color-primary)]' 
                    : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
                }`}
              >
                Last {r} Days
              </button>
            ))}
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleDownloadCsv}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] hover:bg-[var(--color-border-subtle)]/20 text-[var(--color-primary)] text-sm font-medium rounded-md transition-colors"
            >
              <DownloadSimple className="w-5 h-5" />
              Download CSV
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium rounded-md transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print Report
            </button>
          </div>
        </div>

        {/* Print Layout Section */}
        <div className="print:block space-y-8">
          
          <h2 className="font-heading font-bold text-lg text-[var(--color-primary)] border-b border-[var(--color-border-subtle)] pb-2 print:block">Key Metrics</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {overview && [
              { label: 'Total', value: overview.total_screenings },
              { label: 'Normal', value: overview.normal_count, color: RISK_BANDS.NORMAL.color },
              { label: 'MAM', value: overview.mam_count, color: RISK_BANDS.MAM.color },
              { label: 'SAM', value: overview.sam_count, color: RISK_BANDS.SAM.color },
            ].map(stat => (
              <div key={stat.label} className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-md p-4 print:bg-white print:border-gray-300">
                <p className="text-xs font-heading font-bold text-[var(--color-secondary)] uppercase">{stat.label}</p>
                <p className="font-mono-num text-2xl font-medium mt-1" style={{ color: stat.color || 'var(--color-primary)' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <h2 className="font-heading font-bold text-lg text-[var(--color-primary)] border-b border-[var(--color-border-subtle)] pb-2 mt-8 print:block">Trend Overview</h2>
          
          {trends && (
            <div className="h-64 border border-[var(--color-border-subtle)] rounded-md p-4 print:border-gray-300 print:break-inside-avoid">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.points}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                  <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), 'MM/dd')} tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Area type="monotone" dataKey="normal" stackId="1" stroke={RISK_BANDS.NORMAL.color} fill={RISK_BANDS.NORMAL.color} fillOpacity={0.2} />
                  <Area type="monotone" dataKey="mam" stackId="1" stroke={RISK_BANDS.MAM.color} fill={RISK_BANDS.MAM.color} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="sam" stackId="1" stroke={RISK_BANDS.SAM.color} fill={RISK_BANDS.SAM.color} fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <h2 className="font-heading font-bold text-lg text-[var(--color-primary)] border-b border-[var(--color-border-subtle)] pb-2 mt-8 print:block print:page-break-before">Top Villages by SAM Prevalence</h2>
          
          {locations && (
            <table className="w-full text-left text-sm print:break-inside-avoid">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  <th className="py-2">Village</th>
                  <th className="py-2">Total Screenings</th>
                  <th className="py-2 text-right">SAM %</th>
                </tr>
              </thead>
              <tbody>
                {locations.sort((a,b) => b.prevalence_pct - a.prevalence_pct).slice(0,10).map(loc => (
                  <tr key={loc.location_id} className="border-b border-[var(--color-border-subtle)]/50">
                    <td className="py-2">{loc.village}</td>
                    <td className="py-2 font-mono-num">{loc.total_screenings}</td>
                    <td className="py-2 font-mono-num text-right font-medium text-[var(--color-sam)] print:text-black">{loc.prevalence_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
        </div>
      </div>
    </div>
  );
};
