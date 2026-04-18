import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContextCore';

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (presetId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const existing = favoritesQuery.data?.find(f => f.preset_id === presetId);
      
      if (existing) {
        await supabase.from('favorites').delete().eq('id', existing.id);
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          preset_id: presetId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const isFavorite = (presetId: string) => {
    return favoritesQuery.data?.some(f => f.preset_id === presetId) ?? false;
  };

  return {
    favorites: favoritesQuery.data ?? [],
    isFavorite,
    toggleFavorite: toggleFavorite.mutate,
    loading: favoritesQuery.isLoading,
  };
}
