import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useInvitationByToken } from '@/hooks/useInvitations';
import { ORG_ROLE_LABELS, ORG_ROLE_COLORS } from '@/types/organization';

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { invitation, isLoading, error, acceptInvitation } = useInvitationByToken(token);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Invitation invalide</CardTitle>
              <CardDescription>
                Cette invitation n'existe pas ou a été supprimée
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/">
                <Button variant="outline">Retour à l'accueil</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Expired invitation
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <CardTitle>Invitation expirée</CardTitle>
              <CardDescription>
                Cette invitation a expiré. Demandez une nouvelle invitation à l'administrateur.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/">
                <Button variant="outline">Retour à l'accueil</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Already accepted
  if (invitation.accepted_at) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle>Invitation déjà acceptée</CardTitle>
              <CardDescription>
                Cette invitation a déjà été utilisée
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to={invitation.organization ? `/org/${invitation.organization.slug}` : '/dashboard'}>
                <Button>Accéder à l'organisation</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Rejoindre {invitation.organization?.name}</CardTitle>
              <CardDescription>
                Vous avez été invité(e) à rejoindre cette organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Rôle proposé :</p>
                <Badge className={ORG_ROLE_COLORS[invitation.role]}>
                  {ORG_ROLE_LABELS[invitation.role]}
                </Badge>
              </div>
              <div className="space-y-2">
                <Link to={`/auth?redirect=/invite/${token}`}>
                  <Button className="w-full">
                    Se connecter pour accepter
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground">
                  Vous devez vous connecter ou créer un compte pour accepter l'invitation
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Ready to accept
  const handleAccept = async () => {
    acceptInvitation.mutate(undefined, {
      onSuccess: () => {
        navigate(invitation.organization ? `/org/${invitation.organization.slug}` : '/dashboard');
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="max-w-md w-full border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Rejoindre {invitation.organization?.name}</CardTitle>
            <CardDescription>
              Vous avez été invité(e) par un membre de l'organisation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Rôle proposé :</p>
              <Badge className={ORG_ROLE_COLORS[invitation.role]}>
                {ORG_ROLE_LABELS[invitation.role]}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={handleAccept}
                disabled={acceptInvitation.isPending}
              >
                {acceptInvitation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Acceptation...
                  </>
                ) : (
                  'Accepter l\'invitation'
                )}
              </Button>
              <Link to="/dashboard" className="block">
                <Button variant="ghost" className="w-full">
                  Refuser
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
