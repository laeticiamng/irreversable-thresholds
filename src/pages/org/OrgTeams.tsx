import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useAuth } from '@/hooks/useAuth';
import { useTeams } from '@/hooks/useTeams';
import { TeamCard } from '@/components/org/TeamCard';
import { GlobalNav } from '@/components/GlobalNav';

const TEAM_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
];

export default function OrgTeams() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { organizations, currentOrganization, switchOrganization, isLoading: orgLoading, canManageMembers } = useOrganizationContext();

  const org = organizations.find(o => o.slug === orgSlug);
  const { teams, isLoading: teamsLoading, createTeam } = useTeams(org?.id);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(TEAM_COLORS[0]);

  if (authLoading || orgLoading) {
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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createTeam.mutate(
      { name, description, color },
      {
        onSuccess: () => {
          setIsOpen(false);
          setName('');
          setDescription('');
          setColor(TEAM_COLORS[0]);
        },
      }
    );
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/org/${orgSlug}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-display font-bold">Équipes</h1>
                <p className="text-muted-foreground">{org.name}</p>
              </div>
            </div>
            
            {canManageMembers && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle équipe
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une équipe</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Nom</Label>
                      <Input
                        id="team-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Équipe Design"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team-description">Description</Label>
                      <Textarea
                        id="team-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description de l'équipe..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Couleur</Label>
                      <div className="flex gap-2 flex-wrap">
                        {TEAM_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full transition-all ${
                              color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : ''
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!name || createTeam.isPending}
                    >
                      {createTeam.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Création...
                        </>
                      ) : (
                        'Créer l\'équipe'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Teams list */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Équipes de l'organisation</CardTitle>
              <CardDescription>
                Organisez vos membres en équipes pour mieux collaborer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teamsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucune équipe créée</p>
                  {canManageMembers && (
                    <p className="text-sm mt-1">
                      Créez votre première équipe pour organiser vos membres
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {teams.map((team) => (
                    <TeamCard 
                      key={team.id} 
                      team={team} 
                      organizationId={org.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
