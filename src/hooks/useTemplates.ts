import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Template, ModuleType } from '@/types/database';
import { toast } from 'sonner';

export function useTemplates(module?: ModuleType) {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates', module],
    queryFn: async () => {
      let query = supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: true });

      if (module && module !== 'all') {
        query = query.eq('module', module);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Template[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async ({
      name,
      description,
      module: templateModule,
      isPremium = false,
      structure = {},
    }: {
      name: string;
      description?: string;
      module: ModuleType;
      isPremium?: boolean;
      structure?: Record<string, unknown>;
    }) => {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36);

      const { data, error } = await supabase
        .from('templates')
        .insert({
          name,
          slug,
          description,
          module: templateModule,
          is_premium: isPremium,
          structure,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template créé');
    },
    onError: () => {
      toast.error('Erreur lors de la création du template');
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      module: templateModule,
      isPremium,
      structure,
    }: {
      id: string;
      name?: string;
      description?: string;
      module?: ModuleType;
      isPremium?: boolean;
      structure?: Record<string, unknown>;
    }) => {
      const updates: Record<string, unknown> = {};
      if (name !== undefined) {
        updates.name = name;
        updates.slug = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          + '-' + Date.now().toString(36);
      }
      if (description !== undefined) updates.description = description;
      if (templateModule !== undefined) updates.module = templateModule;
      if (isPremium !== undefined) updates.is_premium = isPremium;
      if (structure !== undefined) updates.structure = structure;

      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du template');
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du template');
    },
  });

  const duplicateTemplate = useMutation({
    mutationFn: async (id: string) => {
      const template = templates.find(t => t.id === id);
      if (!template) throw new Error('Template not found');

      const slug = template.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-copy-' + Date.now().toString(36);

      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: `${template.name} (copie)`,
          slug,
          description: template.description,
          module: template.module,
          is_premium: template.is_premium,
          structure: template.structure,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template dupliqué');
    },
    onError: () => {
      toast.error('Erreur lors de la duplication du template');
    },
  });

  const getPremiumTemplates = () => templates.filter(t => t.is_premium);
  const getFreeTemplates = () => templates.filter(t => !t.is_premium);
  const getByModule = (mod: ModuleType) => templates.filter(t => t.module === mod);
  const getTemplateById = (id: string) => templates.find(t => t.id === id);

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    getPremiumTemplates,
    getFreeTemplates,
    getByModule,
    getTemplateById,
  };
}
