import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { REIICPType, REIStrategyId, ConfidenceLevel, IntentHeat } from '@/lib/rei-icp-config';

const DEFAULT_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

// ============ TYPES ============

export interface REIICPExecuteParams {
  icps: REIICPType[];
  states: string[];
  city?: string;
  strategy: REIStrategyId;
  results_per_icp: number;
}

interface REIICPExecuteResponse {
  run_id: string;
  status: string;
  message: string;
  inserted_count: number;
  deduped_count: number;
  rejected_count: number;
}

export interface REIICPProspect {
  id: string;
  full_name: string | null;
  headline: string | null;
  linkedin_url_canonical: string;
  linkedin_url: string | null;
  location: string | null;
  geo_city: string | null;
  geo_state: string | null;
  icp: REIICPType;
  role_detected: string | null;
  icp_match_score: number;
  icp_confidence: ConfidenceLevel;
  intent_heat: IntentHeat;
  times_seen: number;
  first_seen_at: string;
  last_seen_at: string;
  source_run_id: string | null;
  created_at: string;
}

export interface REIICPProspectFilters {
  runId?: string;
  icp?: REIICPType;
  confidence?: ConfidenceLevel;
  intentHeat?: IntentHeat;
  state?: string;
}

// Legacy type for backwards compatibility
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

// ============ EXECUTE HOOK ============

export function useREIICPExecute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: REIICPExecuteParams): Promise<REIICPExecuteResponse> => {
      const response = await fetch('/api/rei-icp-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace_id: DEFAULT_WORKSPACE_ID,
          icps: params.icps,
          states: params.states,
          city: params.city,
          strategy: params.strategy,
          results_per_icp: params.results_per_icp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`REI ICP search completed: ${data.message}`);
      queryClient.invalidateQueries({ queryKey: ['rei-icp-prospects'] });
    },
    onError: (error: Error) => {
      toast.error(`Search failed: ${error.message}`);
    },
  });
}

// ============ PROSPECTS QUERY HOOK ============

export function useREIICPProspects(filters: REIICPProspectFilters = {}) {
  return useQuery({
    queryKey: ['rei-icp-prospects', filters],
    queryFn: async (): Promise<REIICPProspect[]> => {
      const params = new URLSearchParams();

      if (filters.runId) params.set('runId', filters.runId);
      if (filters.icp) params.set('icp', filters.icp);
      if (filters.confidence) params.set('confidence', filters.confidence);
      if (filters.intentHeat) params.set('intentHeat', filters.intentHeat);
      if (filters.state) params.set('state', filters.state);

      const response = await fetch(`/api/prospects?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch prospects: ${response.status}`);
      }

      const data = await response.json();
      // Handle both array response and {prospects: []} response
      return Array.isArray(data) ? data : (data.prospects || []);
    },
    enabled: true,
    refetchInterval: filters.runId ? 5000 : false,
  });
}

// ============ STATS HOOK ============

export interface REIICPStats {
  total: number;
  byICP: Record<REIICPType, number>;
  byConfidence: Record<ConfidenceLevel, number>;
  byIntentHeat: Record<IntentHeat, number>;
}

export function useREIICPStats() {
  return useQuery({
    queryKey: ['rei-icp-stats'],
    queryFn: async (): Promise<REIICPStats> => {
      const response = await fetch('/api/prospects/stats');

      if (!response.ok) {
        // Return empty stats if endpoint doesn't exist yet
        return {
          total: 0,
          byICP: { wholesaler: 0, flipper: 0, buy_hold: 0, agent: 0, institutional: 0 },
          byConfidence: { high: 0, medium: 0, low: 0 },
          byIntentHeat: { hot: 0, warm: 0, cold: 0 },
        };
      }

      return response.json();
    },
  });
}
