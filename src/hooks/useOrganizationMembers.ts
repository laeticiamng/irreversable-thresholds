import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizationMember, OrgRole } from '@/types/organization';
import { toast } from 'sonner';

export function useOrganizationMembers(organizationId?: string) {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['org-members', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
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
        role: member.role as OrgRole,
        profile: profileMap.get(member.user_id) as OrganizationMember['profile'],
      })) as OrganizationMember[];
    },
    enabled: !!organizationId,
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: OrgRole }) => {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', organizationId] });
      toast.success('Rôle mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du rôle');
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', organizationId] });
      toast.success('Membre retiré');
    },
    onError: () => {
      toast.error('Erreur lors du retrait');
    },
  });

  const getOwners = () => members.filter(m => m.role === 'owner');
  const getAdmins = () => members.filter(m => m.role === 'admin');
  const getMembersByRole = (role: OrgRole) => members.filter(m => m.role === role);

  return {
    members,
    isLoading,
    updateMemberRole,
    removeMember,
    getOwners,
    getAdmins,
    getMembersByRole,
  };
}
