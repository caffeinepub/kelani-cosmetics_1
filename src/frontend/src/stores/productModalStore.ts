import { create } from 'zustand';
import type { ProductWithSale, HomepageSearchResult, StoreDetails } from '../backend';

interface ProductModalState {
  isOpen: boolean;
  productData: ProductWithSale | HomepageSearchResult | null;
  storeDetails: StoreDetails[] | null;
  precomputedBlobUrl: string | null;
  openModal: (product: ProductWithSale | HomepageSearchResult, stores: StoreDetails[] | null, blobUrl?: string | null) => void;
  closeModal: () => void;
  setStoreDetails: (stores: StoreDetails[] | null) => void;
}

export const useProductModalStore = create<ProductModalState>((set) => ({
  isOpen: false,
  productData: null,
  storeDetails: null,
  precomputedBlobUrl: null,
  openModal: (product, stores, blobUrl = null) => set({ 
    isOpen: true, 
    productData: product, 
    storeDetails: stores,
    precomputedBlobUrl: blobUrl 
  }),
  closeModal: () => {
    // Revoke precomputed blob URL on close
    const state = useProductModalStore.getState();
    if (state.precomputedBlobUrl) {
      URL.revokeObjectURL(state.precomputedBlobUrl);
    }
    set({ 
      isOpen: false, 
      productData: null, 
      storeDetails: null,
      precomputedBlobUrl: null 
    });
  },
  setStoreDetails: (stores) => set({ storeDetails: stores }),
}));
