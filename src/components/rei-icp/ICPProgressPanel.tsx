import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { REI_ICP_CONFIG, type REIICPType } from '@/lib/rei-icp-config';

export interface LaneProgress {
  icp: REIICPType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  queries_total: number;
  queries_completed: number;
  results_found: number;
  results_kept: number;
  results_dropped: number;
  error?: string;
}

interface ICPProgressPanelProps {
  lanes: LaneProgress[];
  isRunning: boolean;
}

const ICP_ICONS: Record<REIICPType, string> = {
  wholesaler: '📦',
  flipper: '🔨',
  buy_hold: '🏠',
  agent: '🏷️',
  institutional: '🏢',
};

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-muted-foreground',
    badge: 'secondary',
    label: 'Pending',
  },
  running: {
    icon: Loader2,
    color: 'text-blue-500',
    badge: 'default',
    label: 'Running',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    badge: 'outline',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'text-destructive',
    badge: 'destructive',
    label: 'Failed',
  },
} as const;

export function ICPProgressPanel({ lanes, isRunning: _isRunning }: ICPProgressPanelProps) {
  if (lanes.length === 0) {
    return null;
  }

  const totalKept = lanes.reduce((sum, lane) => sum + lane.results_kept, 0);
  const totalDropped = lanes.reduce((sum, lane) => sum + lane.results_dropped, 0);
  const completedLanes = lanes.filter(l => l.status === 'completed').length;
  const failedLanes = lanes.filter(l => l.status === 'failed').length;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">{completedLanes}/{lanes.length}</span>
            <span className="text-muted-foreground ml-1">lanes completed</span>
          </div>
          {failedLanes > 0 && (
            <Badge variant="destructive">{failedLanes} failed</Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-green-600 font-medium">{totalKept}</span>
            <span className="text-muted-foreground ml-1">kept</span>
          </div>
          <div>
            <span className="text-red-600 font-medium">{totalDropped}</span>
            <span className="text-muted-foreground ml-1">dropped</span>
          </div>
        </div>
      </div>

      {/* Lane Progress Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">ICP</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Progress</th>
              <th className="text-right p-3 font-medium">Kept</th>
              <th className="text-right p-3 font-medium">Dropped</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lanes.map(lane => {
              const config = REI_ICP_CONFIG[lane.icp];
              const statusConfig = STATUS_CONFIG[lane.status];
              const StatusIcon = statusConfig.icon;
              const progress = lane.queries_total > 0
                ? (lane.queries_completed / lane.queries_total) * 100
                : 0;

              return (
                <tr key={lane.icp} className="hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ICP_ICONS[lane.icp]}</span>
                      <span className="font-medium">{config.label}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        className={`h-4 w-4 ${statusConfig.color} ${lane.status === 'running' ? 'animate-spin' : ''}`}
                      />
                      <Badge variant={statusConfig.badge as any}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-3 min-w-[150px]">
                    <div className="space-y-1">
                      <Progress value={progress} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {lane.queries_completed} / {lane.queries_total} queries
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-green-600 font-medium">
                      {lane.results_kept}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-red-600 font-medium">
                      {lane.results_dropped}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Error Messages */}
      {lanes.some(l => l.error) && (
        <div className="space-y-2">
          {lanes.filter(l => l.error).map(lane => (
            <div
              key={lane.icp}
              className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm"
            >
              <span className="font-medium">{REI_ICP_CONFIG[lane.icp].label}:</span>{' '}
              <span className="text-destructive">{lane.error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
