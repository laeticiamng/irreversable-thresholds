import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTeams } from '@/hooks/useTeams';
import { cn } from '@/lib/utils';

interface CaseTeamAssignmentProps {
  caseId: string;
  organizationId: string;
  currentTeamId?: string | null;
  disabled?: boolean;
}

export function CaseTeamAssignment({ 
  caseId, 
  organizationId, 
  currentTeamId,
  disabled = false 
}: CaseTeamAssignmentProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { teams, isLoading: teamsLoading } = useTeams(organizationId);

  const currentTeam = teams.find(t => t.id === currentTeamId);

  const assignTeam = useMutation({
    mutationFn: async (teamId: string | null) => {
      const { error } = await supabase
        .from('cases')
        .update({ assigned_team_id: teamId })
        .eq('id', caseId);

      if (error) throw error;
    },
    onSuccess: (_, teamId) => {
      const team = teams.find(t => t.id === teamId);
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['org-activity'] });
      
      if (teamId) {
        toast.success(`Dossier assigné à ${team?.name || 'l\'équipe'}`);
      } else {
        toast.success('Assignation retirée');
      }
      setOpen(false);
    },
    onError: () => {
      toast.error('Erreur lors de l\'assignation');
    },
  });

  if (teamsLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (teams.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled || assignTeam.isPending}
          className="gap-2"
        >
          {assignTeam.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : currentTeam ? (
            <>
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: currentTeam.color || '#6366f1' }}
              />
              <span className="max-w-24 truncate">{currentTeam.name}</span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4" />
              <span>Assigner</span>
            </>
          )}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-display tracking-wider">
          Assigner à une équipe
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => assignTeam.mutate(team.id)}
            className="gap-2 cursor-pointer"
          >
            <div 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: team.color || '#6366f1' }}
            />
            <span className="flex-1 truncate">{team.name}</span>
            {currentTeamId === team.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        {currentTeamId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => assignTeam.mutate(null)}
              className="text-muted-foreground cursor-pointer"
            >
              Retirer l'assignation
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Component to display team badge on case cards
interface CaseTeamBadgeProps {
  teamId?: string | null;
  organizationId?: string;
  size?: 'sm' | 'md';
}

export function CaseTeamBadge({ teamId, organizationId, size = 'sm' }: CaseTeamBadgeProps) {
  const { teams } = useTeams(organizationId);
  
  if (!teamId || !organizationId) return null;
  
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1.5 border-transparent',
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
      )}
      style={{ 
        backgroundColor: `${team.color}15`,
        color: team.color,
      }}
    >
      <div 
        className={cn(
          'rounded-full',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
        )}
        style={{ backgroundColor: team.color }}
      />
      {team.name}
    </Badge>
  );
}

// List of cases assigned to a specific team
interface TeamCasesListProps {
  teamId: string;
  organizationId: string;
}

export function TeamCasesList({ teamId, organizationId }: TeamCasesListProps) {
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['team-cases', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, title, status, created_at')
        .eq('assigned_team_id', teamId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!teamId && !!organizationId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Aucun dossier assigné à cette équipe
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {cases.map((caseItem) => (
        <div 
          key={caseItem.id}
          className="flex items-center justify-between p-2 rounded bg-muted/30"
        >
          <span className="text-sm truncate">{caseItem.title}</span>
          <Badge variant="outline" className="text-[10px]">
            {caseItem.status === 'active' ? 'Actif' : 'Archivé'}
          </Badge>
        </div>
      ))}
    </div>
  );
}
