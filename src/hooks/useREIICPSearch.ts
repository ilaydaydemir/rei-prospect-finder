import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { REIICPType, REIStrategyId } from '../lib/rei-icp-config';

export interface REIICPExecuteParams {
  icps: REIICPType[];
  states: string[];
  city?: string;
  strategy: REIStrategyId;
  results_per_icp: number;
}

export interface REIICPExecuteResponse {
  run_id: string;
  status: string;
  lanes: {
    icp: REIICPType;
    status: string;
    queries_executed: number;
    results_found: number;
    kept: number;
    dropped: number;
  }[];
  total_kept: number;
  total_dropped: number;
}

export interface Prospect {
  id: string;
  full_name: string | null;
  linkedin_url: string | null;
  icp: string | null;
  role_detected: string | null;
  icp_match_score: number | null;
  icp_confidence: string | null;
  intent_heat: string | null;
  source_url: string | null;
  geo_state: string | null;
  geo_city: string | null;
  created_at: string;
}

export interface ProspectFilters {
  icp?: REIICPType;
  confidence?: string;
  intentHeat?: string;
  state?: string;
}

const DEFAULT_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

export function useREIICPExecute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: REIICPExecuteParams): Promise<REIICPExecuteResponse> => {
      const response = await fetch('/api/rei-icp-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: DEFAULT_WORKSPACE_ID,
          ...params
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rei-icp-prospects'] });
    }
  });
}

export function useREIICPProspects(filters: ProspectFilters = {}) {
  const params = new URLSearchParams();
  if (filters.icp) params.set('icp', filters.icp);
  if (filters.confidence) params.set('confidence', filters.confidence);
  if (filters.intentHeat) params.set('intentHeat', filters.intentHeat);
  if (filters.state) params.set('state', filters.state);

  return useQuery({
    queryKey: ['rei-icp-prospects', filters],
    queryFn: async (): Promise<Prospect[]> => {
      const response = await fetch(`/api/prospects?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch prospects');
      }
      const data = await response.json();
      return data.prospects || [];
    }
  });
}
