import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useREIICPProspects, type REIICPProspect } from "@/hooks/useREIICPSearch";
import { Search, ExternalLink, Download, Filter, Users, Loader2 } from "lucide-react";

export default function Prospects() {
  const { data: prospects = [], isLoading } = useREIICPProspects();
  const [searchQuery, setSearchQuery] = useState('');
  const [icpFilter, setIcpFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');

  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          p.full_name?.toLowerCase().includes(query) ||
          p.role_detected?.toLowerCase().includes(query) ||
          p.geo_city?.toLowerCase().includes(query) ||
          p.geo_state?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // ICP filter
      if (icpFilter !== 'all' && p.icp !== icpFilter) return false;

      // Confidence filter
      if (confidenceFilter !== 'all' && p.icp_confidence !== confidenceFilter) return false;

      // Intent filter
      if (intentFilter !== 'all' && p.intent_heat !== intentFilter) return false;

      return true;
    });
  }, [prospects, searchQuery, icpFilter, confidenceFilter, intentFilter]);

  const exportCSV = () => {
    const headers = ['Name', 'ICP', 'Role', 'City', 'State', 'Score', 'Confidence', 'Intent', 'LinkedIn'];
    const rows = filteredProspects.map(p => [
      p.full_name || '',
      p.icp || '',
      p.role_detected || '',
      p.geo_city || '',
      p.geo_state || '',
      String(p.icp_match_score || ''),
      p.icp_confidence || '',
      p.intent_heat || '',
      p.linkedin_url || ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rei-prospects-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8" />
            Prospects
          </h1>
          <p className="text-muted-foreground">
            {filteredProspects.length} of {prospects.length} prospects
          </p>
        </div>
        <Button onClick={exportCSV} disabled={filteredProspects.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, role, location..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ICP Type</label>
              <Select value={icpFilter} onValueChange={setIcpFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ICPs</SelectItem>
                  <SelectItem value="wholesaler">Wholesalers</SelectItem>
                  <SelectItem value="flipper">Flippers</SelectItem>
                  <SelectItem value="buy_hold">Buy & Hold</SelectItem>
                  <SelectItem value="agent">Agents</SelectItem>
                  <SelectItem value="institutional">Institutional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confidence</label>
              <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Intent Heat</label>
              <Select value={intentFilter} onValueChange={setIntentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intent</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading prospects...</p>
            </div>
          ) : filteredProspects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No prospects found matching your filters.</p>
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
                  {filteredProspects.map((prospect: REIICPProspect) => (
                    <tr key={prospect.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">
                        {prospect.full_name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">
                          {prospect.icp?.replace('_', ' ') || '-'}
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
  );
}
