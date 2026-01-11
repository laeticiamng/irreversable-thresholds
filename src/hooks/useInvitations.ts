import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Invitation, OrgRole } from '@/types/organization';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useInvitations(organizationId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['invitations', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', organizationId)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(inv => ({
        ...inv,
        role: inv.role as OrgRole,
      })) as Invitation[];
    },
    enabled: !!organizationId,
  });

  const createInvitation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: OrgRole }) => {
      if (!user || !organizationId) throw new Error('Missing data');

      // Check if invitation already exists
      const { data: existing } = await supabase
        .from('invitations')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('email', email)
        .is('accepted_at', null)
        .single();

      if (existing) {
        throw new Error('Une invitation existe déjà pour cet email');
      }

      // Check if user is already a member
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profile) {
        const { data: member } = await supabase
          .from('organization_members')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('user_id', profile.id)
          .single();

        if (member) {
          throw new Error('Cet utilisateur est déjà membre');
        }
      }

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          organization_id: organizationId,
          email,
          role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', organizationId] });
      toast.success('Invitation envoyée');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', organizationId] });
      toast.success('Invitation annulée');
    },
    onError: () => {
      toast.error('Erreur lors de l\'annulation');
    },
  });

  const resendInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      // Reset expiration date
      const { error } = await supabase
        .from('invitations')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', organizationId] });
      toast.success('Invitation renvoyée');
    },
    onError: () => {
      toast.error('Erreur lors du renvoi');
    },
  });

  return {
    invitations,
    isLoading,
    createInvitation,
    cancelInvitation,
    resendInvitation,
  };
}

export function useInvitationByToken(token?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) return null;

      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('token', token)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        role: data.role as OrgRole,
        organization: data.organization as Invitation['organization'],
      } as Invitation;
    },
    enabled: !!token,
  });

  const acceptInvitation = useMutation({
    mutationFn: async () => {
      if (!user || !invitation) throw new Error('Missing data');

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Cette invitation a expiré');
      }

      // Check if already accepted
      if (invitation.accepted_at) {
        throw new Error('Cette invitation a déjà été acceptée');
      }

      // Add user to organization
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: invitation.organization_id,
          user_id: user.id,
          role: invitation.role,
          invited_by: invitation.invited_by,
          invited_at: invitation.created_at,
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (inviteError) throw inviteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['invitation', token] });
      toast.success('Vous avez rejoint l\'organisation');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    invitation,
    isLoading,
    error,
    acceptInvitation,
  };
}
