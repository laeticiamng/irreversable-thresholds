import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Team, TeamMember } from '@/types/organization';
import { toast } from 'sonner';

export function useTeams(organizationId?: string) {
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(count)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data.map(team => ({
        ...team,
        member_count: (team.team_members as { count: number }[])?.[0]?.count || 0,
      })) as Team[];
    },
    enabled: !!organizationId,
  });

  const createTeam = useMutation({
    mutationFn: async ({ name, description, color }: { name: string; description?: string; color?: string }) => {
      if (!organizationId) throw new Error('Missing organization');

      const { data, error } = await supabase
        .from('teams')
        .insert({
          organization_id: organizationId,
          name,
          description,
          color: color || '#6366f1',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', organizationId] });
      toast.success('Équipe créée');
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });

  const updateTeam = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Team> & { id: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', organizationId] });
      toast.success('Équipe mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteTeam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', organizationId] });
      toast.success('Équipe supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  return {
    teams,
    isLoading,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}

export function useTeamMembers(teamId?: string) {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(member => ({
        ...member,
        profile: profileMap.get(member.user_id) as TeamMember['profile'],
      })) as TeamMember[];
    },
    enabled: !!teamId,
  });

  const addMember = useMutation({
    mutationFn: async (userId: string) => {
      if (!teamId) throw new Error('Missing team');

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TeamMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Membre ajouté à l\'équipe');
    },
    onError: () => {
      toast.error('Erreur lors de l\'ajout');
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Membre retiré de l\'équipe');
    },
    onError: () => {
      toast.error('Erreur lors du retrait');
    },
  });

  return {
    members,
    isLoading,
    addMember,
    removeMember,
  };
}
