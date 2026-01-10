import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Collaborator {
  id: string;
  case_id: string;
  user_id: string;
  invited_by: string;
  role: 'viewer' | 'editor' | 'admin';
  invited_at: string;
  accepted_at: string | null;
  profile?: {
    email: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export function useCaseCollaborators(caseId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ['case-collaborators', caseId],
    queryFn: async () => {
      if (!caseId) return [];
      const { data, error } = await supabase
        .from('case_collaborators')
        .select('*')
        .eq('case_id', caseId);
      if (error) throw error;
      
      // Fetch profiles for collaborators
      const userIds = data.map(c => c.user_id);
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, display_name, avatar_url')
          .in('id', userIds);
        
        return data.map(collab => ({
          ...collab,
          profile: profiles?.find(p => p.id === collab.user_id),
        })) as Collaborator[];
      }
      
      return data as Collaborator[];
    },
    enabled: !!caseId,
  });

  const inviteCollaborator = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'viewer' | 'editor' | 'admin' }) => {
      if (!caseId) throw new Error('Case ID required');
      
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (profileError || !profile) {
        throw new Error('Utilisateur non trouvé avec cet email');
      }

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('case_collaborators')
        .insert({
          case_id: caseId,
          user_id: profile.id,
          invited_by: currentUser.user.id,
          role,
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Cet utilisateur est déjà collaborateur');
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-collaborators', caseId] });
      toast.success('Collaborateur invité');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateCollaboratorRole = useMutation({
    mutationFn: async ({ collaboratorId, role }: { collaboratorId: string; role: 'viewer' | 'editor' | 'admin' }) => {
      const { error } = await supabase
        .from('case_collaborators')
        .update({ role })
        .eq('id', collaboratorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-collaborators', caseId] });
      toast.success('Rôle mis à jour');
    },
  });

  const removeCollaborator = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from('case_collaborators')
        .delete()
        .eq('id', collaboratorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-collaborators', caseId] });
      toast.success('Collaborateur retiré');
    },
  });

  return {
    collaborators,
    isLoading,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
  };
}
