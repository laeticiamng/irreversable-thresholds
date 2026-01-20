import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Users, Layers, Loader2, TrendingUp, Activity, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useAuth } from '@/hooks/useAuth';
import { OrgStats } from '@/components/org/OrgStats';
import { MemberList } from '@/components/org/MemberList';
import { OrgActivityFeed } from '@/components/org/OrgActivityFeed';
import { ModuleDistributionChart } from '@/components/charts/ModuleDistributionChart';
import { GlobalNav } from '@/components/GlobalNav';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ORG_PLAN_LABELS, ORG_PLAN_COLORS, OrgPlan } from '@/types/organization';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function OrgDashboard() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { organizations, currentOrganization, switchOrganization, isLoading } = useOrganizationContext();

  // Find organization by slug
  const org = organizations.find(o => o.slug === orgSlug);

  // Fetch distribution data for chart
  const { data: chartData } = useQuery({
    queryKey: ['org-distribution', org?.id],
    queryFn: async () => {
      if (!org?.id) return { irreversa: 0, nulla: 0, thresh: 0, silva: 0 };
      
      const [thresholdsRes, absencesRes, invisibleRes, silvaRes] = await Promise.all([
        supabase.from('thresholds').select('id', { count: 'exact', head: true }).eq('organization_id', org.id),
        supabase.from('absences').select('id', { count: 'exact', head: true }).eq('organization_id', org.id),
        supabase.from('invisible_thresholds').select('id', { count: 'exact', head: true }).eq('organization_id', org.id),
        supabase.from('silva_sessions').select('id', { count: 'exact', head: true }).eq('organization_id', org.id),
      ]);

      return {
        irreversa: thresholdsRes.count || 0,
        nulla: absencesRes.count || 0,
        thresh: invisibleRes.count || 0,
        silva: silvaRes.count || 0,
      };
    },
    enabled: !!org?.id,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!org) {
    return <Navigate to="/dashboard" replace />;
  }

  // Ensure current organization is set
  if (currentOrganization?.id !== org.id) {
    switchOrganization(org.id);
  }

  const planKey = (org.plan || 'trial') as OrgPlan;

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">{org.name}</h1>
                  <Badge className={cn('font-display', ORG_PLAN_COLORS[planKey])}>
                    {ORG_PLAN_LABELS[planKey]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Dashboard de l'organisation
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/org/${orgSlug}/members`}>
                <Button variant="outline" size="sm" className="font-display tracking-wider">
                  <Users className="w-4 h-4 mr-2" />
                  Membres
                </Button>
              </Link>
              <Link to={`/org/${orgSlug}/teams`}>
                <Button variant="outline" size="sm" className="font-display tracking-wider">
                  <Layers className="w-4 h-4 mr-2" />
                  Équipes
                </Button>
              </Link>
              <Link to={`/org/${orgSlug}/settings`}>
                <Button variant="outline" size="sm" className="font-display tracking-wider">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <OrgStats organizationId={org.id} />

          {/* Main content area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Charts & Quick access */}
            <div className="lg:col-span-2 space-y-6">
              {/* Distribution Chart */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Répartition par module
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ModuleDistributionChart 
                    data={chartData || { irreversa: 0, nulla: 0, thresh: 0, silva: 0 }}
                    size="md"
                  />
                </CardContent>
              </Card>

              {/* Quick access to territories */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-display">Accès rapide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/irreversa/home">
                      <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <span className="text-lg font-display text-primary">IRREVERSA</span>
                        <span className="text-xs text-muted-foreground">Seuils irréversibles</span>
                      </Button>
                    </Link>
                    <Link to="/nulla/home">
                      <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:border-nulla/50 hover:bg-nulla/5 transition-colors">
                        <span className="text-lg font-display text-nulla">NULLA</span>
                        <span className="text-xs text-muted-foreground">Absences structurantes</span>
                      </Button>
                    </Link>
                    <Link to="/thresh/home">
                      <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors">
                        <span className="text-lg font-display text-amber-500">THRESH</span>
                        <span className="text-xs text-muted-foreground">Seuils ressentis</span>
                      </Button>
                    </Link>
                    <Link to="/silva/home">
                      <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:border-silva/50 hover:bg-silva/5 transition-colors">
                        <span className="text-lg font-display text-silva">SILVA</span>
                        <span className="text-xs text-muted-foreground">Espace neutre</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Activity & Members */}
            <div className="space-y-6">
              {/* Activity Feed */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Activity className="w-4 h-4 text-primary" />
                    Activité récente
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  <OrgActivityFeed organizationId={org.id} limit={8} />
                </CardContent>
              </Card>

              {/* Members preview */}
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Users className="w-4 h-4 text-primary" />
                    Membres
                  </CardTitle>
                  <Link to={`/org/${orgSlug}/members`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Voir tout
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <MemberList organizationId={org.id} limit={5} />
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
