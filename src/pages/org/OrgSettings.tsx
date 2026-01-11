import { useState } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizations } from '@/hooks/useOrganization';
import { GlobalNav } from '@/components/GlobalNav';
import { ORG_PLAN_LABELS, ORG_PLAN_COLORS, OrgPlan } from '@/types/organization';

export default function OrgSettings() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { organizations, currentOrganization, switchOrganization, isLoading, userRole, refreshOrganizations } = useOrganizationContext();
  const { updateOrganization, deleteOrganization } = useOrganizations();

  const org = organizations.find(o => o.slug === orgSlug);
  
  const [name, setName] = useState(org?.name || '');
  const [domain, setDomain] = useState(org?.domain || '');

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

  const isOwner = userRole === 'owner';
  const plan = org.plan as OrgPlan;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    updateOrganization.mutate(
      { id: org.id, name, domain: domain || undefined },
      {
        onSuccess: () => {
          refreshOrganizations();
        },
      }
    );
  };

  const handleDelete = async () => {
    deleteOrganization.mutate(org.id, {
      onSuccess: () => {
        navigate('/dashboard');
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      
      <div className="container max-w-2xl mx-auto py-8 px-4">
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
              <h1 className="text-3xl font-display font-bold">Paramètres</h1>
              <p className="text-muted-foreground">{org.name}</p>
            </div>
          </div>

          {/* Plan info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Plan actuel</CardTitle>
              <CardDescription>
                Gérez votre abonnement et vos limites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={ORG_PLAN_COLORS[plan]}>
                    {ORG_PLAN_LABELS[plan]}
                  </Badge>
                  {org.trial_ends_at && new Date(org.trial_ends_at) > new Date() && (
                    <span className="text-sm text-muted-foreground">
                      Essai jusqu'au {new Date(org.trial_ends_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
                <Button variant="outline" disabled>
                  Gérer l'abonnement
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* General settings */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Modifiez les informations de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Nom</Label>
                  <Input
                    id="org-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isOwner}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-slug">Identifiant URL</Label>
                  <Input
                    id="org-slug"
                    value={org.slug}
                    disabled
                    className="opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    L'identifiant ne peut pas être modifié
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-domain">Domaine email</Label>
                  <Input
                    id="org-domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    disabled={!isOwner}
                  />
                </div>
                {isOwner && (
                  <Button 
                    type="submit" 
                    disabled={updateOrganization.isPending}
                  >
                    {updateOrganization.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Danger zone */}
          {isOwner && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Zone de danger
                </CardTitle>
                <CardDescription>
                  Actions irréversibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer l'organisation
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer {org.name} ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes les données de l'organisation
                        seront définitivement supprimées, y compris les membres, équipes,
                        et toutes les données associées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer définitivement
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
