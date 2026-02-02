import { useState } from 'react';
import { Target, Play, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ICPSelector } from '@/components/rei-icp/ICPSelector';
import { ICPProgressPanel, type LaneProgress } from '@/components/rei-icp/ICPProgressPanel';
import { ICPResultsTable, type ICPProspect } from '@/components/rei-icp/ICPResultsTable';
import { useREIICPExecute, useREIICPProspects } from '@/hooks/useREIICPSearch';
import { REI_ICP_CONFIG, US_STATES, type REIICPType, type REIStrategyId } from '@/lib/rei-icp-config';

const STRATEGY_OPTIONS: { id: REIStrategyId; name: string; description: string }[] = [
  { id: 'balanced', name: 'Balanced', description: 'Default mix of all query types' },
  { id: 'role_focused', name: 'Role Focused', description: 'Emphasize job titles and executive roles' },
  { id: 'aggressive_geo', name: 'Aggressive Geo', description: 'Deep city and suburb-level coverage' },
  { id: 'fresh_sources', name: 'Fresh Sources', description: 'More neutral queries to find new profiles' },
];

export default function REIICPSearch() {
  const { mutate: executeSearch, isPending } = useREIICPExecute();

  // Form state
  const [selectedICPs, setSelectedICPs] = useState<REIICPType[]>(['wholesaler']);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [strategy, setStrategy] = useState<REIStrategyId>('balanced');
  const [resultsPerICP, setResultsPerICP] = useState(100);

  // Results state
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [laneProgress, setLaneProgress] = useState<LaneProgress[]>([]);

  // Fetch prospects for the current run
  const { data: prospects = [], isLoading: prospectsLoading } = useREIICPProspects({
    runId: currentRunId || undefined,
  });

  // State toggle helper
  const toggleState = (state: string) => {
    setSelectedStates(prev =>
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleStartSearch = () => {
    if (selectedICPs.length === 0 || selectedStates.length === 0) {
      return;
    }

    // Initialize lane progress
    const initialProgress: LaneProgress[] = selectedICPs.map(icp => ({
      icp,
      status: 'pending',
      queries_total: 80,
      queries_completed: 0,
      results_found: 0,
      results_kept: 0,
      results_dropped: 0,
    }));
    setLaneProgress(initialProgress);

    executeSearch(
      {
        icps: selectedICPs,
        states: selectedStates,
        city: city || undefined,
        strategy,
        results_per_icp: resultsPerICP,
      },
      {
        onSuccess: (data) => {
          setCurrentRunId(data.run_id);
          // Update lane statuses to completed
          setLaneProgress(prev =>
            prev.map(lane => ({
              ...lane,
              status: 'completed',
              results_kept: Math.floor(data.inserted_count / prev.length),
              results_dropped: Math.floor(data.rejected_count / prev.length),
              queries_completed: lane.queries_total
            }))
          );
        },
        onError: (error) => {
          // Mark all lanes as failed
          setLaneProgress(prev =>
            prev.map(lane => ({ ...lane, status: 'failed', error: error.message }))
          );
        },
      }
    );
  };

  const canStartSearch = selectedICPs.length > 0 && selectedStates.length > 0;

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-500" />
            REI ICP Prospect Search
          </h1>
          <p className="text-muted-foreground mt-1">
            Find real estate investor prospects by ICP type - Wholesalers, Flippers, Buy & Hold, Agents, Institutional
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* ICP Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Select ICPs
                </CardTitle>
                <CardDescription>
                  Choose one or more Ideal Customer Profiles to target
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ICPSelector
                  selectedICPs={selectedICPs}
                  onSelect={setSelectedICPs}
                  batchMode={batchMode}
                  onBatchModeChange={setBatchMode}
                />
              </CardContent>
            </Card>

            {/* Geographic Scope */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Geographic Scope</CardTitle>
                <CardDescription>
                  Select states to search (required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* State Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      States ({selectedStates.length} selected)
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStates([...US_STATES])}
                        className="text-xs h-6"
                      >
                        Select All
                      </Button>
                      {selectedStates.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStates([])}
                          className="text-xs h-6"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 border rounded-md bg-muted/30">
                    {US_STATES.map(state => (
                      <Button
                        key={state}
                        variant={selectedStates.includes(state) ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toggleState(state)}
                      >
                        {state}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Optional City */}
                <div className="space-y-2">
                  <Label>City (optional)</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Houston, Miami, Phoenix"
                  />
                  <p className="text-xs text-muted-foreground">
                    Specify a city to focus search queries on that metro area
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Search Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Strategy */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Query Strategy
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Different strategies generate different query patterns to optimize for coverage vs precision.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select value={strategy} onValueChange={(v) => setStrategy(v as REIStrategyId)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STRATEGY_OPTIONS.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>
                          <div>
                            <div className="font-medium">{opt.name}</div>
                            <div className="text-xs text-muted-foreground">{opt.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results per ICP */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Results per ICP</Label>
                    <Input
                      type="number"
                      min={10}
                      max={2000}
                      value={resultsPerICP}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setResultsPerICP(Math.min(2000, Math.max(10, val)));
                        }
                      }}
                      className="w-24 h-8 text-right"
                    />
                  </div>
                  <Slider
                    value={[resultsPerICP]}
                    onValueChange={([v]) => setResultsPerICP(v)}
                    min={10}
                    max={2000}
                    step={50}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10</span>
                    <span>2000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Panel (shown when running) */}
            {laneProgress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ICPProgressPanel
                    lanes={laneProgress}
                    isRunning={isPending}
                  />
                </CardContent>
              </Card>
            )}

            {/* Results Table (shown when we have results) */}
            {(prospects.length > 0 || currentRunId) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ICPResultsTable
                    prospects={prospects as ICPProspect[]}
                    isLoading={prospectsLoading}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-4">
            {/* Summary Card */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Search Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ICPs</span>
                  <span className="font-medium">
                    {selectedICPs.length === 0
                      ? 'None selected'
                      : batchMode
                      ? `${selectedICPs.length} ICPs (batch)`
                      : REI_ICP_CONFIG[selectedICPs[0]].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">States</span>
                  <span className="font-medium">
                    {selectedStates.length === 0
                      ? 'None selected'
                      : selectedStates.length > 3
                      ? `${selectedStates.length} states`
                      : selectedStates.join(', ')}
                  </span>
                </div>
                {city && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City</span>
                    <span className="font-medium">{city}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Strategy</span>
                  <span className="font-medium">
                    {STRATEGY_OPTIONS.find(s => s.id === strategy)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Results/ICP</span>
                  <span className="font-medium">{resultsPerICP}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-muted-foreground">Est. Total</span>
                  <span className="font-medium">
                    ~{(selectedICPs.length * resultsPerICP).toLocaleString()} prospects
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Scoring Info Card */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Scoring Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>+2 Keyword match</p>
                <p>+2 Role/title match</p>
                <p>+1 Geographic match</p>
                <p>-3 Coaching/course penalty</p>
                <p>-2 Wrong industry penalty</p>
                <div className="border-t pt-1 mt-1">
                  <p>Score 4+ = High confidence</p>
                  <p>Score 2-3 = Medium confidence</p>
                  <p>Score 1 = Dropped</p>
                </div>
              </CardContent>
            </Card>

            {/* Start Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleStartSearch}
              disabled={isPending || !canStartSearch}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start ICP Search
                </>
              )}
            </Button>

            {!canStartSearch && (
              <p className="text-sm text-destructive text-center">
                {selectedICPs.length === 0
                  ? 'Select at least one ICP'
                  : 'Select at least one state'}
              </p>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
