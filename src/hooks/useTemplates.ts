import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Template, ModuleType } from '@/types/database';

export function useTemplates(module?: ModuleType) {
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

  const getPremiumTemplates = () => templates.filter(t => t.is_premium);
  const getFreeTemplates = () => templates.filter(t => !t.is_premium);
  const getByModule = (mod: ModuleType) => templates.filter(t => t.module === mod);

  return {
    templates,
    isLoading,
    getPremiumTemplates,
    getFreeTemplates,
    getByModule,
  };
}
