import { useState } from 'react';
import { useCaseCollaborators } from '@/hooks/useCaseCollaborators';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, UserPlus, Trash2, Mail, Crown, Edit, Eye, 
  Clock, CheckCircle, AlertCircle, Send, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CollaborationPanelProps {
  caseId: string;
  caseTitle: string;
  isOwner: boolean;
}

const ROLE_CONFIG = {
  viewer: { 
    label: 'Lecteur', 
    icon: Eye, 
    description: 'Peut voir le dossier',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  editor: { 
    label: 'Éditeur', 
    icon: Edit, 
    description: 'Peut modifier le dossier',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  admin: { 
    label: 'Admin', 
    icon: Crown, 
    description: 'Peut gérer les collaborateurs',
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
};

export function CollaborationPanel({ caseId, caseTitle, isOwner }: CollaborationPanelProps) {
  const { 
    collaborators, 
    isLoading, 
    inviteCollaborator, 
    updateCollaboratorRole, 
    removeCollaborator 
  } = useCaseCollaborators(caseId);
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [message, setMessage] = useState('');

  const handleInvite = async () => {
    if (!email.trim()) return;
    await inviteCollaborator.mutateAsync({ email: email.trim(), role });
    setEmail('');
    setMessage('');
  };

  const pendingInvites = collaborators.filter(c => !c.accepted_at);
  const activeCollaborators = collaborators.filter(c => c.accepted_at);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Collaboration
          {collaborators.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {collaborators.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite Form */}
        {isOwner && (
          <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserPlus className="w-4 h-4" />
              Inviter un collaborateur
            </div>
            
            <div className="grid gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborateur@email.com"
                  type="email"
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Rôle</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className={`w-3 h-3 ${config.color}`} />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleInvite} 
                    disabled={!email.trim() || inviteCollaborator.isPending}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Inviter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-500">
              <Clock className="w-4 h-4" />
              Invitations en attente ({pendingInvites.length})
            </div>
            <div className="space-y-2">
              {pendingInvites.map((collab) => {
                const roleConfig = ROLE_CONFIG[collab.role];
                return (
                  <div
                    key={collab.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collab.profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-amber-500/20">
                        {collab.profile?.email?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {collab.profile?.email || 'En attente...'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Invité {format(new Date(collab.invited_at), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>

                    <Badge variant="outline" className={`${roleConfig.color} border-current`}>
                      <roleConfig.icon className="w-3 h-3 mr-1" />
                      {roleConfig.label}
                    </Badge>

                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeCollaborator.mutate(collab.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Collaborators */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Collaborateurs actifs ({activeCollaborators.length})
          </div>
          
          {activeCollaborators.length === 0 && pendingInvites.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucun collaborateur pour l'instant
              </p>
              {isOwner && (
                <p className="text-xs text-muted-foreground mt-1">
                  Invitez quelqu'un pour travailler ensemble
                </p>
              )}
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {activeCollaborators.map((collab) => {
                  const roleConfig = ROLE_CONFIG[collab.role];
                  return (
                    <div
                      key={collab.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={collab.profile?.avatar_url || undefined} />
                        <AvatarFallback className={roleConfig.bgColor}>
                          {collab.profile?.display_name?.charAt(0) || collab.profile?.email?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {collab.profile?.display_name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {collab.profile?.email || 'Email non disponible'}
                        </p>
                      </div>

                      {isOwner ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={collab.role}
                            onValueChange={(newRole) => 
                              updateCollaboratorRole.mutate({ 
                                collaboratorId: collab.id, 
                                role: newRole as typeof collab.role 
                              })
                            }
                          >
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <config.icon className={`w-3 h-3 ${config.color}`} />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeCollaborator.mutate(collab.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className={`${roleConfig.color} border-current`}>
                          <roleConfig.icon className="w-3 h-3 mr-1" />
                          {roleConfig.label}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Role Descriptions */}
        <Separator />
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Niveaux d'accès</p>
          <div className="grid gap-2 text-xs">
            {Object.entries(ROLE_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2 text-muted-foreground">
                <config.icon className={`w-3 h-3 ${config.color}`} />
                <span className="font-medium">{config.label}:</span>
                <span>{config.description}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
