import { useState } from 'react';
import { Users, MoreHorizontal, Pencil, Trash2, UserPlus } from 'lucide-react';
import { Team } from '@/types/organization';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
  onManageMembers: (team: Team) => void;
}

export function TeamCard({ team, onEdit, onDelete, onManageMembers }: TeamCardProps) {
  const { canManageMembers } = useOrganizationContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(team.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="group relative overflow-hidden">
        {/* Color indicator */}
        <div 
          className="absolute top-0 left-0 right-0 h-1" 
          style={{ backgroundColor: team.color }} 
        />
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${team.color}20` }}
              >
                <Users className="h-4 w-4" style={{ color: team.color }} />
              </div>
              <CardTitle className="text-base">{team.name}</CardTitle>
            </div>
            
            {canManageMembers && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(team)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onManageMembers(team)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Gérer les membres
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {team.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {team.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {team.member_count || 0} membre{(team.member_count || 0) !== 1 ? 's' : ''}
            </Badge>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onManageMembers(team)}
              className="text-xs"
            >
              Voir l'équipe
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette équipe ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'équipe "{team.name}" sera supprimée. Les membres ne seront pas retirés de l'organisation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
