import { useState } from 'react';
import { Search, Users, Building2, Home, Landmark, Briefcase, Loader2, ExternalLink } from 'lucide-react';
import { REI_ICP_CONFIG, REI_STRATEGIES, US_STATES, type REIICPType, type REIStrategyId } from '../lib/rei-icp-config';
import { useREIICPExecute, useREIICPProspects, type Prospect } from '../hooks/useREIICPSearch';

const ICP_ICONS: Record<REIICPType, typeof Users> = {
  wholesaler: Briefcase,
  flipper: Home,
  buy_hold: Building2,
  agent: Users,
  institutional: Landmark
};

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

  const handleStateToggle = (state: string) => {
    setSelectedStates(prev =>
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    );
  };

  const handleSearch = () => {
    if (selectedICPs.length === 0 || selectedStates.length === 0) return;

    executeMutation.mutate({
      icps: selectedICPs,
      states: selectedStates,
      city: city || undefined,
      strategy,
      results_per_icp: resultsPerIcp
    }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const getConfidenceBadgeColor = (confidence: string | null) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntentHeatBadgeColor = (heat: string | null) => {
    switch (heat) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-orange-100 text-orange-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">REI ICP Prospect Search</h1>
        <p className="text-gray-500 mt-1">Find real estate investor prospects by ICP type</p>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Search Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* ICP Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Select ICPs</h2>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={batchMode}
                    onChange={handleBatchToggle}
                    className="rounded border-gray-300"
                  />
                  <span>Batch (All 5)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(REI_ICP_CONFIG) as [REIICPType, typeof REI_ICP_CONFIG.wholesaler][]).map(([id, config]) => {
                  const Icon = ICP_ICONS[id];
                  const isSelected = selectedICPs.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => handleICPToggle(id)}
                      disabled={batchMode}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      } ${batchMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* State Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Select States</h2>
              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-1">
                  {US_STATES.map(state => (
                    <label key={state} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStates.includes(state)}
                        onChange={() => handleStateToggle(state)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{state}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* City Input */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">City (Optional)</h2>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g., Houston, Dallas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Strategy Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Search Strategy</h2>
              <div className="space-y-2">
                {REI_STRATEGIES.map(s => (
                  <label key={s.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      value={s.id}
                      checked={strategy === s.id}
                      onChange={() => setStrategy(s.id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{s.label}</div>
                      <div className="text-sm text-gray-500">{s.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Results Per ICP */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Results Per ICP: {resultsPerIcp}</h2>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={resultsPerIcp}
                onChange={e => setResultsPerIcp(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10</span>
                <span>100</span>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={selectedICPs.length === 0 || selectedStates.length === 0 || executeMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {executeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Start Search
                </>
              )}
            </button>

            {executeMutation.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {executeMutation.error.message}
              </div>
            )}

            {executeMutation.data && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
                Search completed! Found {executeMutation.data.total_kept} prospects.
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  Prospects ({prospects.length})
                </h2>
              </div>

              {prospectsLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Loading prospects...
                </div>
              ) : prospects.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No prospects found. Run a search to discover new prospects.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ICP</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Confidence</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Intent</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {prospects.map((prospect: Prospect) => (
                        <tr key={prospect.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {prospect.full_name || 'Unknown'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {prospect.icp || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {prospect.role_detected || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {[prospect.geo_city, prospect.geo_state].filter(Boolean).join(', ') || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {prospect.icp_match_score ?? '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadgeColor(prospect.icp_confidence)}`}>
                              {prospect.icp_confidence || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getIntentHeatBadgeColor(prospect.intent_heat)}`}>
                              {prospect.intent_heat || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {prospect.linkedin_url && (
                              <a
                                href={prospect.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
