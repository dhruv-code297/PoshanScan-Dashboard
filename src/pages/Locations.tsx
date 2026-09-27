import { useLocations } from '../api/queries';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RISK_BANDS } from '../constants/riskBands';
import { CircleNotch, WarningCircle } from '@phosphor-icons/react';

export const Locations = () => {
  const { data, isLoading, error } = useLocations();

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
        <p>Failed to load location data.</p>
      </div>
    );
  }

  // Calculate bounds to fit all markers
  const bounds = data.length > 0 
    ? data.map(l => [l.lat, l.lng] as [number, number]) 
    : [[21.1458, 79.0882] as [number, number]];

  const getMarkerColor = (prevalence: number) => {
    if (prevalence > 10) return RISK_BANDS.SAM.color;
    if (prevalence > 5) return RISK_BANDS.MAM.color;
    return RISK_BANDS.NORMAL.color;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="w-full lg:w-2/3 h-96 lg:h-full border-b lg:border-b-0 lg:border-r border-[var(--color-border-subtle)] relative z-0">
        <MapContainer 
          bounds={bounds.length > 1 ? bounds : undefined} 
          center={bounds.length === 1 ? bounds[0] : undefined}
          zoom={10} 
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {data.map(loc => (
            <CircleMarker
              key={loc.location_id}
              center={[loc.lat, loc.lng]}
              radius={Math.max(5, Math.min(25, loc.total_screenings / 20))}
              fillColor={getMarkerColor(loc.prevalence_pct)}
              color="white"
              weight={1}
              fillOpacity={0.7}
            >
              <Popup className="font-sans">
                <div className="min-w-[150px]">
                  <h3 className="font-heading font-bold text-[var(--color-primary)] text-sm border-b border-[var(--color-border-subtle)] pb-2 mb-2">
                    {loc.village}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--color-secondary)]">Total:</span>
                      <span className="font-mono-num font-medium text-[var(--color-primary)]">{loc.total_screenings}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--color-secondary)]">SAM Prevalence:</span>
                      <span className="font-mono-num font-medium text-[var(--color-sam)]">{loc.prevalence_pct}%</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="w-full lg:w-1/3 bg-[var(--color-surface)] flex flex-col h-full">
        <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]">
          <h2 className="font-heading font-bold text-sm text-[var(--color-primary)]">Villages List</h2>
        </div>
        <div className="overflow-auto flex-1 p-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--color-bg-base)] z-10 border-b border-[var(--color-border-subtle)]">
              <tr>
                <th className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider">Village</th>
                <th className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider text-right">Total</th>
                <th className="px-4 py-3 text-xs font-heading font-bold text-[var(--color-secondary)] uppercase tracking-wider text-right">SAM %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {data.sort((a,b) => b.prevalence_pct - a.prevalence_pct).map(loc => (
                <tr key={loc.location_id} className="hover:bg-[var(--color-bg-base)] transition-colors cursor-pointer h-[44px]">
                  <td className="px-4 text-sm font-medium text-[var(--color-primary)]">{loc.village}</td>
                  <td className="px-4 text-sm font-mono-num text-right text-[var(--color-secondary)]">{loc.total_screenings}</td>
                  <td className="px-4 text-sm font-mono-num text-right font-medium" style={{ color: getMarkerColor(loc.prevalence_pct) }}>
                    {loc.prevalence_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
