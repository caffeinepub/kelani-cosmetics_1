import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';
import type { StoreDetails as BackendStoreDetails } from '../backend';
import { numberToBigInt, bigIntToNumber } from '../utils/categoryNumeric';

// UI StoreDetails type with number fields and parsed coordinates
export interface StoreDetails {
  storeId: number;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  latitude: number;
  longitude: number;
  storeHours: Array<[string, string]>;
  createdDate: number;
  lastUpdated: number;
  isActive: boolean;
}

/**
 * Parse coordinates JSON string to lat/lng numbers
 */
function parseCoordinates(coordinatesJson: string): { lat: number; lng: number } {
  try {
    const parsed = JSON.parse(coordinatesJson);
    return {
      lat: typeof parsed.lat === 'number' ? parsed.lat : 0,
      lng: typeof parsed.lng === 'number' ? parsed.lng : 0,
    };
  } catch {
    return { lat: 0, lng: 0 };
  }
}

/**
 * Serialize coordinates to JSON string
 */
function serializeCoordinates(lat: number, lng: number): string {
  return JSON.stringify({ lat, lng });
}

/**
 * Convert backend StoreDetails to UI StoreDetails
 */
function backendStoreDetailsToUI(backendStore: BackendStoreDetails): StoreDetails {
  const coords = parseCoordinates(backendStore.coordinates);
  
  return {
    storeId: bigIntToNumber(backendStore.storeId),
    name: backendStore.name,
    address: backendStore.address,
    phone: backendStore.phone,
    whatsapp: backendStore.whatsapp,
    email: backendStore.email,
    facebook: backendStore.facebook,
    instagram: backendStore.instagram,
    website: backendStore.website,
    latitude: coords.lat,
    longitude: coords.lng,
    storeHours: backendStore.storeHours,
    createdDate: bigIntToNumber(backendStore.createdDate),
    lastUpdated: bigIntToNumber(backendStore.lastUpdated),
    isActive: backendStore.isActive,
  };
}

/**
 * Convert UI StoreDetails to backend StoreDetails
 */
function uiStoreDetailsToBackend(uiStore: StoreDetails): BackendStoreDetails {
  return {
    storeId: numberToBigInt(uiStore.storeId),
    name: uiStore.name,
    address: uiStore.address,
    phone: uiStore.phone,
    whatsapp: uiStore.whatsapp,
    email: uiStore.email,
    facebook: uiStore.facebook ?? undefined,
    instagram: uiStore.instagram ?? undefined,
    website: uiStore.website ?? undefined,
    coordinates: serializeCoordinates(uiStore.latitude, uiStore.longitude),
    storeHours: uiStore.storeHours,
    createdDate: numberToBigInt(uiStore.createdDate),
    lastUpdated: numberToBigInt(uiStore.lastUpdated),
    isActive: uiStore.isActive,
  };
}

// Query Keys
const QUERY_KEYS = {
  storeDetails: (storeId: number) => ['store-details', storeId] as const,
};

// ============================================================================
// STORE DETAILS QUERIES
// ============================================================================

/**
 * Fetch store details by ID
 */
export function useGetStoreDetails(storeId: 1 | 2) {
  const actorState = useActor();
  const rawActor = actorState.actor;
  const actorFetching = actorState.isFetching;

  const [stableActor, setStableActor] = React.useState<typeof rawActor>(null);

  // Stabilize actor reference
  React.useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  return useQuery<StoreDetails>({
    queryKey: QUERY_KEYS.storeDetails(storeId),
    queryFn: async ({ signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');

      const backendStore = await stableActor.getStoreDetails(numberToBigInt(storeId));
      return backendStoreDetailsToUI(backendStore);
    },
    enabled: Boolean(stableActor) && !actorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ============================================================================
// STORE DETAILS MUTATIONS
// ============================================================================

/**
 * Update store details
 */
export function useUpdateStoreDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uiStore: StoreDetails) => {
      if (!actor) throw new Error('Actor not available');

      const backendStore = uiStoreDetailsToBackend(uiStore);
      await actor.updateStoreDetails(backendStore.storeId, backendStore);
      return uiStore;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storeDetails(data.storeId) });
      reportSuccessWithToast('Datos de tienda guardados exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al guardar los datos de la tienda', {
        operation: 'updateStoreDetails',
      });
    },
  });
}
