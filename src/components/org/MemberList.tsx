import { useState } from 'react';
import { MoreHorizontal, Shield, User, Eye, Crown, Trash2 } from 'lucide-react';
import { OrganizationMember, OrgRole, ORG_ROLE_LABELS, ORG_ROLE_COLORS } from '@/types/organization';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MemberListProps {
  members: OrganizationMember[];
  onUpdateRole: (memberId: string, role: OrgRole) => void;
  onRemove: (memberId: string) => void;
  isUpdating?: boolean;
}

const ROLE_ICONS: Record<OrgRole, React.ComponentType<{ className?: string }>> = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

export function MemberList({ members, onUpdateRole, onRemove, isUpdating }: MemberListProps) {
  const { user } = useAuth();
  const { userRole } = useOrganizationContext();
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);

  const canManage = userRole === 'owner' || userRole === 'admin';
  const isOwner = userRole === 'owner';

  const handleRemove = () => {
    if (memberToRemove) {
      onRemove(memberToRemove.id);
      setMemberToRemove(null);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {members.map((member) => {
          const RoleIcon = ROLE_ICONS[member.role];
          const isCurrentUser = member.user_id === user?.id;
          const canEditThisMember = canManage && !isCurrentUser && (isOwner || member.role !== 'owner');

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {member.profile?.avatar_url && (
                    <AvatarImage src={member.profile.avatar_url} />
                  )}
                  <AvatarFallback>
                    {member.profile?.display_name?.charAt(0) || 
                     member.profile?.email?.charAt(0) || 
                     'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {member.profile?.display_name || 'Utilisateur'}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-[10px]">Vous</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {member.profile?.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={cn('gap-1', ORG_ROLE_COLORS[member.role])}>
                  <RoleIcon className="h-3 w-3" />
                  {ORG_ROLE_LABELS[member.role]}
                </Badge>

                {member.joined_at && (
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {format(new Date(member.joined_at), 'dd MMM yyyy', { locale: fr })}
                  </span>
                )}

                {canEditThisMember && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isUpdating}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOwner && member.role !== 'owner' && (
                        <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'owner')}>
                          <Crown className="h-4 w-4 mr-2" />
                          Transférer la propriété
                        </DropdownMenuItem>
                      )}
                      {member.role !== 'admin' && (
                        <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'admin')}>
                          <Shield className="h-4 w-4 mr-2" />
                          Définir comme admin
                        </DropdownMenuItem>
                      )}
                      {member.role !== 'member' && (
                        <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'member')}>
                          <User className="h-4 w-4 mr-2" />
                          Définir comme membre
                        </DropdownMenuItem>
                      )}
                      {member.role !== 'viewer' && (
                        <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'viewer')}>
                          <Eye className="h-4 w-4 mr-2" />
                          Définir comme lecteur
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setMemberToRemove(member)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Retirer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.profile?.display_name || memberToRemove?.profile?.email} sera retiré de l'organisation. 
              Cette action peut être annulée en le réinvitant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground">
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
