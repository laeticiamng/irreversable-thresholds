import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Organization } from '@/types/organization';
import { toast } from 'sonner';

export function useOrganization(orgId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();
      
      if (error) throw error;
      return data as Organization;
    },
    enabled: !!orgId && !!user,
  });

  return {
    organization,
    isLoading,
  };
}

export function useOrganizations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;
      if (!memberships?.length) return [];

      const orgIds = memberships.map(m => m.organization_id);
      
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds);

      if (orgsError) throw orgsError;
      return orgs as Organization[];
    },
    enabled: !!user,
  });

  const createOrganization = useMutation({
    mutationFn: async ({ name, slug, domain }: { name: string; slug: string; domain?: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name, slug, domain })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      return org as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organisation créée avec succès');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('Ce slug est déjà utilisé');
      } else {
        toast.error('Erreur lors de la création');
      }
    },
  });

  const updateOrganization = useMutation({
    mutationFn: async ({ id, name, slug, logo_url, domain }: { id: string; name?: string; slug?: string; logo_url?: string; domain?: string }) => {
      const { data, error } = await supabase
        .from('organizations')
        .update({ name, slug, logo_url, domain })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organisation mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteOrganization = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organisation supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  return { 
    organizations, 
    isLoading,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  };
}
