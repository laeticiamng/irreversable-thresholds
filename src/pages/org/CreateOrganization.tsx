import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganizations } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function CreateOrganization() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createOrganization } = useOrganizations();
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isSlugEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setIsSlugEdited(true);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createOrganization.mutate(
      { name, slug, domain: domain || undefined },
      {
        onSuccess: (org) => {
          navigate(`/org/${org.slug}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Créer une organisation</CardTitle>
              <CardDescription>
                Créez un espace de travail pour votre équipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'organisation</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Acme Inc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Identifiant URL</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">/org/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="acme-inc"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Utilisé dans les URLs de votre organisation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domaine email (optionnel)</Label>
                  <Input
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="acme.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pour le SSO et l'auto-inscription future
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!name || !slug || createOrganization.isPending}
                >
                  {createOrganization.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer l\'organisation'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
