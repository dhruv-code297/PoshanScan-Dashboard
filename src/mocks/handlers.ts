import { http, HttpResponse, delay } from 'msw';
import type { DashboardOverview, DashboardTrends, LocationData, WorkerData, FlaggedRecord } from '../api/types';
import { subDays, format } from 'date-fns';

const overviewMock: DashboardOverview = {
  total_screenings: 1420,
  normal_count: 980,
  mam_count: 310,
  sam_count: 130,
  avg_confidence: 0.92,
  screenings_today: 45,
  active_workers: 12,
};

const locationsMock: LocationData[] = [
  { location_id: 'L1', village: 'Rampur', block: 'B1', district: 'D1', lat: 21.1458, lng: 79.0882, total_screenings: 450, normal: 300, mam: 100, sam: 50, prevalence_pct: 11.1 },
  { location_id: 'L2', village: 'Sitapur', block: 'B1', district: 'D1', lat: 21.2, lng: 79.1, total_screenings: 320, normal: 250, mam: 50, sam: 20, prevalence_pct: 6.25 },
  { location_id: 'L3', village: 'Gopalpur', block: 'B2', district: 'D1', lat: 21.3, lng: 79.2, total_screenings: 500, normal: 350, mam: 110, sam: 40, prevalence_pct: 8.0 },
  { location_id: 'L4', village: 'Madhapur', block: 'B2', district: 'D1', lat: 21.1, lng: 79.3, total_screenings: 150, normal: 80, mam: 50, sam: 20, prevalence_pct: 13.3 },
];

const workersMock: WorkerData[] = [
  { worker_id: 'W1', name: 'Asha Devi', village: 'Rampur', total_screenings: 310, last_active_at: new Date().toISOString(), avg_confidence: 0.95, flagged_count: 2 },
  { worker_id: 'W2', name: 'Meena Kumari', village: 'Sitapur', total_screenings: 180, last_active_at: subDays(new Date(), 1).toISOString(), avg_confidence: 0.88, flagged_count: 5 },
  { worker_id: 'W3', name: 'Sunita Rao', village: 'Gopalpur', total_screenings: 400, last_active_at: new Date().toISOString(), avg_confidence: 0.97, flagged_count: 1 },
  { worker_id: 'W4', name: 'Kavita Singh', village: 'Madhapur', total_screenings: 120, last_active_at: subDays(new Date(), 2).toISOString(), avg_confidence: 0.85, flagged_count: 8 },
];

const flaggedMock: FlaggedRecord[] = [
  { screening_id: 'S101', child_ref: 'C-892', worker_name: 'Kavita Singh', muac_estimate_mm: 112, confidence: 0.84, risk_band: 'SAM', captured_at: new Date().toISOString(), quality_flags: ['Motion blur detected'], status: 'pending' },
  { screening_id: 'S102', child_ref: 'C-904', worker_name: 'Meena Kumari', muac_estimate_mm: 114, confidence: 0.91, risk_band: 'SAM', captured_at: subDays(new Date(), 1).toISOString(), quality_flags: [], status: 'pending' },
  { screening_id: 'S103', child_ref: 'C-915', worker_name: 'Asha Devi', muac_estimate_mm: 118, confidence: 0.75, risk_band: 'MAM', captured_at: subDays(new Date(), 2).toISOString(), quality_flags: ['Low lighting', 'Arm not straight'], status: 'pending' },
];

export const handlers = [
  http.post('/auth/login', async ({ request }) => {
    await delay(800);
    const body = await request.json() as { phone?: string; password?: string };
    if (body.phone === 'admin' && body.password === 'admin') {
      return HttpResponse.json({ token: 'mock-jwt-token', role: 'admin', name: 'Admin Supervisor' });
    }
    return new HttpResponse('Unauthorized', { status: 401 });
  }),

  http.get('/dashboard/overview', async () => {
    await delay(500);
    return HttpResponse.json(overviewMock);
  }),

  http.get('/dashboard/trends', async () => {
    await delay(600);
    const points = Array.from({ length: 14 }).map((_, i) => {
      const date = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
      const normal = Math.floor(Math.random() * 50) + 50;
      const mam = Math.floor(Math.random() * 20) + 10;
      const sam = Math.floor(Math.random() * 10) + 2;
      return { date, normal, mam, sam, total: normal + mam + sam };
    });
    return HttpResponse.json({ points } as DashboardTrends);
  }),

  http.get('/dashboard/locations', async () => {
    await delay(500);
    return HttpResponse.json(locationsMock);
  }),

  http.get('/dashboard/workers', async () => {
    await delay(500);
    return HttpResponse.json(workersMock);
  }),

  http.get('/dashboard/flagged', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const filtered = status ? flaggedMock.filter(f => f.status === status) : flaggedMock;
    return HttpResponse.json(filtered);
  }),
  
  // mock for marking flagged as reviewed
  http.post('/dashboard/flagged/:id/review', async () => {
    await delay(500);
    return HttpResponse.json({ success: true });
  }),
];
