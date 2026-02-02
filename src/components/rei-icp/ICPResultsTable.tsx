import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Search, Filter, Download } from 'lucide-react';
import { REI_ICP_CONFIG, type REIICPType, type ConfidenceLevel, type IntentHeat } from '@/lib/rei-icp-config';

export interface ICPProspect {
  id: string;
  full_name: string | null;
  headline: string | null;
  linkedin_url_canonical: string;
  location: string | null;
  icp: REIICPType;
  role_detected: string | null;
  icp_match_score: number;
  icp_confidence: ConfidenceLevel;
  intent_heat: IntentHeat;
  times_seen: number;
  first_seen_at: string;
  last_seen_at: string;
}

interface ICPResultsTableProps {
  prospects: ICPProspect[];
  isLoading: boolean;
  onExport?: () => void;
}

const ICP_ICONS: Record<REIICPType, string> = {
  wholesaler: '📦',
  flipper: '🔨',
  buy_hold: '🏠',
  agent: '🏷️',
  institutional: '🏢',
};

const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  high: 'bg-green-500/10 text-green-700 border-green-500/30',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
  low: 'bg-red-500/10 text-red-700 border-red-500/30',
};

const INTENT_COLORS: Record<IntentHeat, string> = {
  cold: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  warm: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
  hot: 'bg-red-500/10 text-red-700 border-red-500/30',
};

const INTENT_ICONS: Record<IntentHeat, string> = {
  cold: '❄️',
  warm: '🌡️',
  hot: '🔥',
};

export function ICPResultsTable({ prospects, isLoading, onExport }: ICPResultsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [icpFilter, setIcpFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');

  // Apply filters
  const filteredProspects = prospects.filter(prospect => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        prospect.full_name?.toLowerCase().includes(query) ||
        prospect.headline?.toLowerCase().includes(query) ||
        prospect.location?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // ICP filter
    if (icpFilter !== 'all' && prospect.icp !== icpFilter) return false;

    // Confidence filter
    if (confidenceFilter !== 'all' && prospect.icp_confidence !== confidenceFilter) return false;

    // Intent filter
    if (intentFilter !== 'all' && prospect.intent_heat !== intentFilter) return false;

    return true;
  });

  // Stats
  const stats = {
    total: prospects.length,
    filtered: filteredProspects.length,
    byICP: Object.fromEntries(
      (Object.keys(REI_ICP_CONFIG) as REIICPType[]).map(icp => [
        icp,
        prospects.filter(p => p.icp === icp).length,
      ])
    ),
    byConfidence: {
      high: prospects.filter(p => p.icp_confidence === 'high').length,
      medium: prospects.filter(p => p.icp_confidence === 'medium').length,
      low: prospects.filter(p => p.icp_confidence === 'low').length,
    },
    byIntent: {
      hot: prospects.filter(p => p.intent_heat === 'hot').length,
      warm: prospects.filter(p => p.intent_heat === 'warm').length,
      cold: prospects.filter(p => p.intent_heat === 'cold').length,
    },
  };

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm">
        <div>
          <span className="font-medium">{stats.total}</span>
          <span className="text-muted-foreground ml-1">total prospects</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">By confidence:</span>
          <Badge variant="outline" className={CONFIDENCE_COLORS.high}>
            {stats.byConfidence.high} high
          </Badge>
          <Badge variant="outline" className={CONFIDENCE_COLORS.medium}>
            {stats.byConfidence.medium} medium
          </Badge>
          <Badge variant="outline" className={CONFIDENCE_COLORS.low}>
            {stats.byConfidence.low} low
          </Badge>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Intent:</span>
          <Badge variant="outline" className={INTENT_COLORS.hot}>
            {INTENT_ICONS.hot} {stats.byIntent.hot}
          </Badge>
          <Badge variant="outline" className={INTENT_COLORS.warm}>
            {INTENT_ICONS.warm} {stats.byIntent.warm}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, headline, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={icpFilter} onValueChange={setIcpFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="ICP" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ICPs</SelectItem>
            {(Object.keys(REI_ICP_CONFIG) as REIICPType[]).map(icp => (
              <SelectItem key={icp} value={icp}>
                {ICP_ICONS[icp]} {REI_ICP_CONFIG[icp].label} ({stats.byICP[icp]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Confidence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Confidence</SelectItem>
            <SelectItem value="high">High ({stats.byConfidence.high})</SelectItem>
            <SelectItem value="medium">Medium ({stats.byConfidence.medium})</SelectItem>
            <SelectItem value="low">Low ({stats.byConfidence.low})</SelectItem>
          </SelectContent>
        </Select>

        <Select value={intentFilter} onValueChange={setIntentFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Intent</SelectItem>
            <SelectItem value="hot">{INTENT_ICONS.hot} Hot ({stats.byIntent.hot})</SelectItem>
            <SelectItem value="warm">{INTENT_ICONS.warm} Warm ({stats.byIntent.warm})</SelectItem>
            <SelectItem value="cold">{INTENT_ICONS.cold} Cold ({stats.byIntent.cold})</SelectItem>
          </SelectContent>
        </Select>

        {onExport && (
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      {/* Results count */}
      {searchQuery || icpFilter !== 'all' || confidenceFilter !== 'all' || intentFilter !== 'all' ? (
        <div className="text-sm text-muted-foreground">
          Showing {filteredProspects.length} of {prospects.length} prospects
        </div>
      ) : null}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ICP</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Confidence</TableHead>
              <TableHead className="text-center">Intent</TableHead>
              <TableHead className="text-right">LinkedIn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading prospects...
                </TableCell>
              </TableRow>
            ) : filteredProspects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No prospects found
                </TableCell>
              </TableRow>
            ) : (
              filteredProspects.slice(0, 100).map(prospect => (
                <TableRow key={prospect.id}>
                  <TableCell>
                    <div className="font-medium">
                      {prospect.full_name || 'Unknown'}
                    </div>
                    {prospect.headline && (
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {prospect.headline}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {ICP_ICONS[prospect.icp]}
                      {REI_ICP_CONFIG[prospect.icp].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm truncate max-w-[150px] block">
                      {prospect.role_detected || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{prospect.location || '-'}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{prospect.icp_match_score}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={CONFIDENCE_COLORS[prospect.icp_confidence]}>
                      {prospect.icp_confidence}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={INTENT_COLORS[prospect.intent_heat]}>
                      {INTENT_ICONS[prospect.intent_heat]} {prospect.intent_heat}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <a
                      href={prospect.linkedin_url_canonical}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredProspects.length > 100 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing first 100 of {filteredProspects.length} results
        </div>
      )}
    </div>
  );
}
