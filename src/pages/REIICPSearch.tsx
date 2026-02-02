import { useState } from 'react';
import { Target, Play, Loader2, Users, Building2, Home, Landmark, Briefcase, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Select components available if needed
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { REI_ICP_CONFIG, REI_STRATEGIES, US_STATES, type REIICPType, type REIStrategyId } from '@/lib/rei-icp-config';
import { useREIICPExecute, useREIICPProspects, type Prospect } from '@/hooks/useREIICPSearch';
import { toast } from 'sonner';

const ICP_ICONS: Record<REIICPType, typeof Users> = {
  wholesaler: Briefcase,
  flipper: Home,
  buy_hold: Building2,
  agent: Users,
  institutional: Landmark
};

// ICP colors for future use
// const ICP_COLORS: Record<REIICPType, string> = {
//   wholesaler: 'bg-blue-500', flipper: 'bg-orange-500',
//   buy_hold: 'bg-green-500', agent: 'bg-purple-500', institutional: 'bg-amber-500'
// };

export default function REIICPSearch() {
  const [selectedICPs, setSelectedICPs] = useState<REIICPType[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [strategy, setStrategy] = useState<REIStrategyId>('balanced');
  const [resultsPerIcp, setResultsPerIcp] = useState(50);

  const executeMutation = useREIICPExecute();
  const { data: prospects = [], isLoading: prospectsLoading, refetch } = useREIICPProspects();

  const handleICPToggle = (icp: REIICPType) => {
    if (batchMode) return;
    setSelectedICPs(prev =>
      prev.includes(icp) ? prev.filter(i => i !== icp) : [...prev, icp]
    );
  };

  const handleBatchToggle = () => {
    setBatchMode(!batchMode);
    if (!batchMode) {
      setSelectedICPs(Object.keys(REI_ICP_CONFIG) as REIICPType[]);
    } else {
      setSelectedICPs([]);
    }
  };

  const toggleState = (state: string) => {
    setSelectedStates(prev =>
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    );
  };

  const handleSearch = () => {
    if (selectedICPs.length === 0 || selectedStates.length === 0) {
      toast.error('Please select at least one ICP and one state');
      return;
    }

    executeMutation.mutate({
      icps: selectedICPs,
      states: selectedStates,
      city: city || undefined,
      strategy,
      results_per_icp: resultsPerIcp
    }, {
      onSuccess: (data) => {
        toast.success(`Search completed! Found ${data.total_kept} prospects.`);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || 'Search failed');
      }
    });
  };

  const getConfidenceBadgeVariant = (confidence: string | null) => {
    switch (confidence) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getIntentHeatColor = (heat: string | null) => {
    switch (heat) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-orange-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-500" />
            REI ICP Prospect Search
          </h1>
          <p className="text-muted-foreground mt-1">
            Find real estate investor prospects by ICP type using AI-powered search
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* ICP Selection */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Select ICPs
                </CardTitle>
                <CardDescription>
                  Choose which Ideal Customer Profiles to search for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="batch-mode"
                      checked={batchMode}
                      onCheckedChange={handleBatchToggle}
                    />
                    <Label htmlFor="batch-mode">Batch Mode (All 5 ICPs)</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(Object.entries(REI_ICP_CONFIG) as [REIICPType, typeof REI_ICP_CONFIG.wholesaler][]).map(([id, config]) => {
                    const Icon = ICP_ICONS[id];
                    const isSelected = selectedICPs.includes(id);
                    return (
                      <Button
                        key={id}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`h-auto py-3 flex-col gap-1 ${batchMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleICPToggle(id)}
                        disabled={batchMode}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </Button>
                    );
                  })}
                </div>

                {selectedICPs.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedICPs.map(icp => (
                      <Badge key={icp} variant="secondary" className="gap-1">
                        {REI_ICP_CONFIG[icp].label}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Geographic Scope */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Geographic Scope</CardTitle>
                <CardDescription>
                  Select states and optionally specify a city
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">
                      States ({selectedStates.length} selected)
                    </Label>
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
                  <ScrollArea className="h-40 rounded-md border p-2">
                    <div className="flex flex-wrap gap-1.5">
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
                  </ScrollArea>
                </div>

                <div className="space-y-2">
                  <Label>City (Optional)</Label>
                  <Input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g., Houston, Dallas, Austin"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adding a city narrows down the search to that specific area
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Search Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Search Strategy
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Different strategies optimize for different goals - coverage, precision, or fresh results.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {REI_STRATEGIES.map(s => (
                    <div
                      key={s.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        strategy === s.id
                          ? 'bg-primary/5 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setStrategy(s.id)}
                    >
                      <Checkbox
                        checked={strategy === s.id}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-medium">{s.label}</div>
                        <div className="text-sm text-muted-foreground">{s.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Search Summary */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Search Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ICPs Selected</span>
                  <span className="font-medium">{selectedICPs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">States</span>
                  <span className="font-medium">{selectedStates.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">City Filter</span>
                  <span className="font-medium">{city || 'None'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Strategy</span>
                  <span className="font-medium">{REI_STRATEGIES.find(s => s.id === strategy)?.label}</span>
                </div>
              </CardContent>
            </Card>

            {/* Results Per ICP */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results Per ICP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold">{resultsPerIcp}</span>
                  <span className="text-muted-foreground ml-1">prospects</span>
                </div>
                <Slider
                  value={[resultsPerIcp]}
                  onValueChange={([v]) => setResultsPerIcp(v)}
                  min={10}
                  max={100}
                  step={10}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10</span>
                  <span>100</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Total: ~{selectedICPs.length * resultsPerIcp} prospects max
                </p>
              </CardContent>
            </Card>

            {/* Start Search Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleSearch}
              disabled={selectedICPs.length === 0 || selectedStates.length === 0 || executeMutation.isPending}
            >
              {executeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Search
                </>
              )}
            </Button>

            {executeMutation.data && (
              <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {executeMutation.data.total_kept}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      prospects found
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Results Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Prospects ({prospects.length})</span>
              {prospectsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prospects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No prospects found. Run a search to discover new prospects.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ICP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Confidence</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Intent</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {prospects.map((prospect: Prospect) => (
                      <tr key={prospect.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-medium">
                          {prospect.full_name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="gap-1">
                            {prospect.icp || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {prospect.role_detected || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {[prospect.geo_city, prospect.geo_state].filter(Boolean).join(', ') || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {prospect.icp_match_score ?? '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getConfidenceBadgeVariant(prospect.icp_confidence)}>
                            {prospect.icp_confidence || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getIntentHeatColor(prospect.intent_heat)}`} />
                            <span className="text-sm">{prospect.intent_heat || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {prospect.linkedin_url && (
                            <a
                              href={prospect.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
