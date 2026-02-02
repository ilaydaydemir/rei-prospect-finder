import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useREIICPProspects } from "@/hooks/useREIICPSearch";
import { Users, Target, Activity, Search, TrendingUp, Building2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: prospects = [], isLoading } = useREIICPProspects();

  // Calculate stats
  const totalProspects = prospects.length;
  const highConfidence = prospects.filter(p => p.icp_confidence === 'high').length;
  const hotLeads = prospects.filter(p => p.intent_heat === 'hot').length;
  const warmLeads = prospects.filter(p => p.intent_heat === 'warm').length;

  // ICP breakdown
  const icpCounts = prospects.reduce((acc, p) => {
    if (p.icp) {
      acc[p.icp] = (acc[p.icp] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your REI prospect pipeline</p>
        </div>
        <Button onClick={() => navigate('/search')}>
          <Search className="h-4 w-4 mr-2" />
          New Search
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : totalProspects}</div>
            <p className="text-xs text-muted-foreground">
              All discovered prospects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : highConfidence}
            </div>
            <p className="text-xs text-muted-foreground">
              Score 4+ matches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? '...' : hotLeads}
            </div>
            <p className="text-xs text-muted-foreground">
              Seen 3+ times in 14 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warm Leads</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {isLoading ? '...' : warmLeads}
            </div>
            <p className="text-xs text-muted-foreground">
              Seen 2+ times in 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ICP Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            ICP Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {['wholesaler', 'flipper', 'buy_hold', 'agent', 'institutional'].map(icp => (
              <div key={icp} className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{icpCounts[icp] || 0}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {icp.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/search')}>
            <Search className="h-4 w-4 mr-2" />
            Run New Search
          </Button>
          <Button variant="outline" onClick={() => navigate('/prospects')}>
            <Users className="h-4 w-4 mr-2" />
            View All Prospects
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
