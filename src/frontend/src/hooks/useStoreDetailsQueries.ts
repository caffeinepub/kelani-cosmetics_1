import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';
import type { StoreDetails as BackendStoreDetails } from '../backend';

// UI StoreDetails type matching backend structure
export interface StoreHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface StoreDetails {
  storeId: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  storeHours: StoreHours;
  lastUpdated: bigint;
}

// Query Keys
const QUERY_KEYS = {
  storeDetails: (storeId: number) => ['storeDetails', storeId] as const,
};

/**
 * Convert backend StoreDetails to UI StoreDetails
 */
function backendStoreDetailsToUI(backend: BackendStoreDetails): StoreDetails {
  // Parse coordinates JSON string
  let latitude = 36.69699092702079;
  let longitude = -4.447439687321973;
  try {
    const coords = JSON.parse(backend.coordinates);
    latitude = coords.lat || latitude;
    longitude = coords.lng || longitude;
  } catch (e) {
    console.warn('Failed to parse coordinates, using defaults');
  }

  // Convert storeHours array to object
  const storeHoursObj: StoreHours = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  };

  const dayMap: Record<string, keyof StoreHours> = {
    'Monday': 'monday',
    'Tuesday': 'tuesday',
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday',
    'Sunday': 'sunday',
  };

  backend.storeHours.forEach(([day, hours]) => {
    const key = dayMap[day];
    if (key) {
      storeHoursObj[key] = hours;
    }
  });

  // Extract description from website field or use default
  const description = backend.website || 'Tienda especializada en cosmética y productos de belleza.';

  return {
    storeId: Number(backend.storeId),
    name: backend.name,
    email: backend.email,
    phone: backend.phone,
    whatsapp: backend.whatsapp,
    address: backend.address,
    description,
    latitude,
    longitude,
    storeHours: storeHoursObj,
    lastUpdated: backend.lastUpdated,
  };
}

/**
 * Convert UI StoreDetails to backend StoreDetails
 */
function uiStoreDetailsToBackend(ui: StoreDetails): BackendStoreDetails {
  // Convert storeHours object to array with explicit tuple typing
  const storeHoursArray: Array<[string, string]> = [
    ['Monday', ui.storeHours.monday] as [string, string],
    ['Tuesday', ui.storeHours.tuesday] as [string, string],
    ['Wednesday', ui.storeHours.wednesday] as [string, string],
    ['Thursday', ui.storeHours.thursday] as [string, string],
    ['Friday', ui.storeHours.friday] as [string, string],
    ['Saturday', ui.storeHours.saturday] as [string, string],
    ['Sunday', ui.storeHours.sunday] as [string, string],
  ].filter(([_, hours]) => hours.trim() !== '') as Array<[string, string]>;

  // Create coordinates JSON string
  const coordinates = JSON.stringify({
    lat: ui.latitude,
    lng: ui.longitude,
  });

  return {
    storeId: BigInt(ui.storeId),
    name: ui.name,
    email: ui.email,
    phone: ui.phone,
    whatsapp: ui.whatsapp,
    address: ui.address,
    facebook: undefined,
    instagram: undefined,
    website: ui.description,
    coordinates,
    storeHours: storeHoursArray,
    createdDate: BigInt(Date.now()) * BigInt(1000000),
    lastUpdated: ui.lastUpdated,
    isActive: true,
  };
}

/**
 * Hook to fetch store details by storeId
 */
export function useGetStoreDetails(storeId: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoreDetails>({
    queryKey: QUERY_KEYS.storeDetails(storeId),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const backendData = await actor.getStoreDetails(BigInt(storeId));
        return backendStoreDetailsToUI(backendData);
      } catch (error) {
        console.error(`Error fetching store ${storeId} details:`, error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

/**
 * Hook to update store details
 */
export function useUpdateStoreDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<StoreDetails, Error, StoreDetails>({
    mutationFn: async (storeDetails: StoreDetails) => {
      if (!actor) throw new Error('Actor not available');

      try {
        const backendData = uiStoreDetailsToBackend(storeDetails);
        await actor.updateStoreDetails(backendData.storeId, backendData);
        
        // Return the updated data
        return storeDetails;
      } catch (error) {
        console.error('Error updating store details:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch the specific store details
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.storeDetails(data.storeId),
      });
      
      reportSuccessWithToast(
        `Datos de Tienda ${data.storeId} guardados correctamente`
      );
    },
    onError: (error) => {
      reportErrorWithToast(
        error,
        'Error al guardar los datos de la tienda',
        { operation: 'updateStoreDetails' }
      );
    },
  });
}
