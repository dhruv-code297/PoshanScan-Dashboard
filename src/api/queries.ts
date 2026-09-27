import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  DashboardOverview,
  DashboardTrends,
  LocationData,
  WorkerData,
  FlaggedRecord,
} from './types';

export const useOverview = () => {
  return useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardOverview>('/dashboard/overview');
      return data;
    },
  });
};

export const useTrends = (
  from: string,
  to: string,
  groupBy: 'worker' | 'region',
  interval: 'day' | 'week'
) => {
  return useQuery({
    queryKey: ['trends', { from, to, groupBy, interval }],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardTrends>('/dashboard/trends', {
        params: { from, to, group_by: groupBy, interval },
      });
      return data;
    },
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await apiClient.get<LocationData[]>('/dashboard/locations');
      return data;
    },
  });
};

export const useWorkers = () => {
  return useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      const { data } = await apiClient.get<WorkerData[]>('/dashboard/workers');
      return data;
    },
  });
};

export const useFlagged = (status: 'pending' | 'reviewed' | 'all' = 'pending') => {
  return useQuery({
    queryKey: ['flagged', { status }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (status !== 'all') params.status = status;
      const { data } = await apiClient.get<FlaggedRecord[]>('/dashboard/flagged', { params });
      return data;
    },
  });
};
