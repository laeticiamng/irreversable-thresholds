import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Workspace, UserWorkspaceRole, WorkspaceRole } from '@/types/database';

export function useWorkspaces(userId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch all workspaces the user has access to
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Workspace[];
    },
    enabled: !!userId,
  });

  // Get user's role in a specific workspace
  const getUserRole = async (workspaceId: string): Promise<WorkspaceRole | null> => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('user_workspace_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .single();
    
    if (error) return null;
    return data?.role as WorkspaceRole;
  };

  // Create a new workspace
  const createWorkspace = useMutation({
    mutationFn: async ({ 
      name, 
      description,
      isPersonal = false 
    }: { 
      name: string; 
      description?: string;
      isPersonal?: boolean;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      
      // Generate slug from name
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36);

      // Create workspace
      const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({ 
          name, 
          slug,
          owner_id: userId,
          description,
          is_personal: isPersonal,
        })
        .select()
        .single();
      
      if (wsError) throw wsError;

      // Add user as owner in roles table
      const { error: roleError } = await supabase
        .from('user_workspace_roles')
        .insert({
          user_id: userId,
          workspace_id: workspace.id,
          role: 'owner',
        });

      if (roleError) throw roleError;

      return workspace as Workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', userId] });
    },
  });

  // Invite user to workspace
  const inviteUser = useMutation({
    mutationFn: async ({ 
      workspaceId, 
      inviteeUserId, 
      role 
    }: { 
      workspaceId: string; 
      inviteeUserId: string; 
      role: WorkspaceRole;
    }) => {
      const { data, error } = await supabase
        .from('user_workspace_roles')
        .insert({
          user_id: inviteeUserId,
          workspace_id: workspaceId,
          role,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as UserWorkspaceRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });

  // Get personal workspace or create one
  const getOrCreatePersonalWorkspace = async (): Promise<Workspace> => {
    const personal = workspaces.find(w => w.is_personal && w.owner_id === userId);
    if (personal) return personal;

    // Create personal workspace
    const result = await createWorkspace.mutateAsync({
      name: 'Mon espace',
      description: 'Espace personnel',
      isPersonal: true,
    });
    return result;
  };

  return {
    workspaces,
    isLoading,
    createWorkspace,
    inviteUser,
    getUserRole,
    getOrCreatePersonalWorkspace,
    personalWorkspace: workspaces.find(w => w.is_personal && w.owner_id === userId),
  };
}
