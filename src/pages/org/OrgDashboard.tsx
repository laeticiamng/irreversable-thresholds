import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Users, Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useAuth } from '@/hooks/useAuth';
import { OrgStats } from '@/components/org/OrgStats';
import { MemberList } from '@/components/org/MemberList';
import { GlobalNav } from '@/components/GlobalNav';

export default function OrgDashboard() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { organizations, currentOrganization, switchOrganization, isLoading } = useOrganizationContext();

  // Find organization by slug
  const org = organizations.find(o => o.slug === orgSlug);

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

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-display font-bold">{org.name}</h1>
                <p className="text-muted-foreground">Dashboard de l'organisation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/org/${orgSlug}/members`}>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Membres
                </Button>
              </Link>
              <Link to={`/org/${orgSlug}/teams`}>
                <Button variant="outline" size="sm">
                  <Layers className="w-4 h-4 mr-2" />
                  Équipes
                </Button>
              </Link>
              <Link to={`/org/${orgSlug}/settings`}>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <OrgStats organizationId={org.id} />

          {/* Quick access to territories */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Accès rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/irreversa/home">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <span className="text-lg font-display">IRREVERSA</span>
                    <span className="text-xs text-muted-foreground">Seuils irréversibles</span>
                  </Button>
                </Link>
                <Link to="/nulla/home">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <span className="text-lg font-display">NULLA</span>
                    <span className="text-xs text-muted-foreground">Absences structurantes</span>
                  </Button>
                </Link>
                <Link to="/thresh/home">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <span className="text-lg font-display">THRESH</span>
                    <span className="text-xs text-muted-foreground">Seuils ressentis</span>
                  </Button>
                </Link>
                <Link to="/silva/home">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <span className="text-lg font-display">SILVA</span>
                    <span className="text-xs text-muted-foreground">Espace neutre</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Members preview */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Membres récents</CardTitle>
              <Link to={`/org/${orgSlug}/members`}>
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <MemberList organizationId={org.id} limit={5} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
