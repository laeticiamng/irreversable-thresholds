import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useAuth } from '@/hooks/useAuth';
import { MemberList } from '@/components/org/MemberList';
import { InviteForm } from '@/components/org/InviteForm';
import { GlobalNav } from '@/components/GlobalNav';

export default function OrgMembers() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { organizations, currentOrganization, switchOrganization, isLoading, canManageMembers } = useOrganizationContext();

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

  if (currentOrganization?.id !== org.id) {
    switchOrganization(org.id);
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link to={`/org/${orgSlug}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold">Membres</h1>
              <p className="text-muted-foreground">{org.name}</p>
            </div>
          </div>

          {/* Invite form (only for admins/owners) */}
          {canManageMembers && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Inviter un membre</CardTitle>
                <CardDescription>
                  Envoyez une invitation par email pour ajouter un nouveau membre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InviteForm organizationId={org.id} />
              </CardContent>
            </Card>
          )}

          {/* Members list */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Membres de l'organisation</CardTitle>
              <CardDescription>
                Gérez les membres et leurs rôles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MemberList organizationId={org.id} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
