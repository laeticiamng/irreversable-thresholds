import { useState } from 'react';
import { useCaseCollaborators } from '@/hooks/useCaseCollaborators';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Trash2, Mail, Crown, Edit, Eye } from 'lucide-react';

interface ShareCaseModalProps {
  caseId: string;
  caseTitle: string;
  isOwner: boolean;
}

const ROLE_LABELS = {
  viewer: { label: 'Lecteur', icon: Eye, description: 'Peut voir le dossier' },
  editor: { label: 'Éditeur', icon: Edit, description: 'Peut modifier le dossier' },
  admin: { label: 'Admin', icon: Crown, description: 'Peut gérer les collaborateurs' },
};

export function ShareCaseModal({ caseId, caseTitle, isOwner }: ShareCaseModalProps) {
  const { collaborators, inviteCollaborator, updateCollaboratorRole, removeCollaborator } = useCaseCollaborators(caseId);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [isOpen, setIsOpen] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    await inviteCollaborator.mutateAsync({ email: email.trim(), role });
    setEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          Partager
          {collaborators.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {collaborators.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Partager "{caseTitle}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invite form */}
          {isOwner && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-xs">Inviter un collaborateur</Label>
                <div className="flex gap-2">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    type="email"
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  />
                  <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([key, { label, icon: Icon }]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-3 h-3" />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleInvite} 
                disabled={!email.trim() || inviteCollaborator.isPending}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Inviter
              </Button>
            </div>
          )}

          {/* Collaborators list */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Collaborateurs ({collaborators.length})
            </Label>
            
            {collaborators.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun collaborateur pour l'instant
              </p>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collab) => {
                  const roleInfo = ROLE_LABELS[collab.role];
                  return (
                    <div
                      key={collab.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collab.profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {collab.profile?.display_name?.charAt(0) || collab.profile?.email?.charAt(0) || '?'}
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
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ROLE_LABELS).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
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
                        <Badge variant="outline" className="text-xs">
                          <roleInfo.icon className="w-3 h-3 mr-1" />
                          {roleInfo.label}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
