import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { createBlobUrl } from '../../../utils/imageWebp';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3ESin foto%3C/text%3E%3C/svg%3E';

/**
 * Hook to load and cache product thumbnails
 */
export function useProductThumbnail(barcode: string) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<string>({
    queryKey: ['productThumbnail', barcode],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');

      try {
        const photoBytes = await actor.getProductPhoto(barcode);
        return createBlobUrl(photoBytes);
      } catch (error) {
        // If no photo available, return placeholder
        return PLACEHOLDER_IMAGE;
      }
    },
    enabled: !!actor && !actorFetching && !!barcode,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    imageUrl: query.data ?? PLACEHOLDER_IMAGE,
    isLoading: query.isLoading,
  };
}
