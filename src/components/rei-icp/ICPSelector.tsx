import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { REI_ICP_CONFIG, type REIICPType } from '@/lib/rei-icp-config';

interface ICPSelectorProps {
  selectedICPs: REIICPType[];
  onSelect: (icps: REIICPType[]) => void;
  batchMode: boolean;
  onBatchModeChange: (batch: boolean) => void;
}

const ICP_ICONS: Record<REIICPType, string> = {
  wholesaler: '📦',
  flipper: '🔨',
  buy_hold: '🏠',
  agent: '🏷️',
  institutional: '🏢',
};

const ICP_COLORS: Record<REIICPType, string> = {
  wholesaler: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 data-[active=true]:bg-blue-500 data-[active=true]:text-white',
  flipper: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 data-[active=true]:bg-orange-500 data-[active=true]:text-white',
  buy_hold: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 data-[active=true]:bg-green-500 data-[active=true]:text-white',
  agent: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 data-[active=true]:bg-purple-500 data-[active=true]:text-white',
  institutional: 'bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20 data-[active=true]:bg-slate-500 data-[active=true]:text-white',
};

export function ICPSelector({
  selectedICPs,
  onSelect,
  batchMode,
  onBatchModeChange,
}: ICPSelectorProps) {
  const allICPs = Object.keys(REI_ICP_CONFIG) as REIICPType[];

  const handleICPClick = (icp: REIICPType) => {
    if (batchMode) {
      // In batch mode, toggle the ICP
      if (selectedICPs.includes(icp)) {
        onSelect(selectedICPs.filter(i => i !== icp));
      } else {
        onSelect([...selectedICPs, icp]);
      }
    } else {
      // In single mode, select only this ICP
      onSelect([icp]);
    }
  };

  const handleBatchToggle = (enabled: boolean) => {
    onBatchModeChange(enabled);
    if (enabled && selectedICPs.length === 0) {
      // Select all ICPs when enabling batch mode
      onSelect(allICPs);
    } else if (!enabled && selectedICPs.length > 1) {
      // Keep only the first selected ICP when disabling batch mode
      onSelect([selectedICPs[0]]);
    }
  };

  const selectAll = () => onSelect(allICPs);
  const clearAll = () => onSelect([]);

  return (
    <div className="space-y-4">
      {/* Batch Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="batch-mode"
            checked={batchMode}
            onCheckedChange={handleBatchToggle}
          />
          <Label htmlFor="batch-mode" className="text-sm cursor-pointer">
            Batch Mode
          </Label>
          {batchMode && (
            <Badge variant="secondary" className="text-xs">
              {selectedICPs.length} of {allICPs.length} selected
            </Badge>
          )}
        </div>

        {batchMode && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* ICP Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {allICPs.map(icp => {
          const config = REI_ICP_CONFIG[icp];
          const isActive = selectedICPs.includes(icp);

          return (
            <Button
              key={icp}
              variant="outline"
              data-active={isActive}
              className={`h-auto py-3 px-4 flex flex-col items-center gap-1 transition-all ${ICP_COLORS[icp]}`}
              onClick={() => handleICPClick(icp)}
            >
              <span className="text-2xl">{ICP_ICONS[icp]}</span>
              <span className="text-xs font-medium">{config.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Selected ICPs Description */}
      {selectedICPs.length > 0 && (
        <div className="p-3 rounded-lg bg-muted/50 text-sm">
          <div className="font-medium mb-1">Selected ICPs:</div>
          <div className="flex flex-wrap gap-2">
            {selectedICPs.map(icp => (
              <Badge key={icp} variant="outline" className="gap-1">
                {ICP_ICONS[icp]} {REI_ICP_CONFIG[icp].label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
