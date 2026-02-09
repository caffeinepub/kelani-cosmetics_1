import { create } from 'zustand';
import type { ProductWithSale, HomepageSearchResult, StoreDetails } from '../backend';

interface ProductModalState {
  isOpen: boolean;
  productData: ProductWithSale | HomepageSearchResult | null;
  storeDetails: StoreDetails | null;
  openModal: (data: ProductWithSale | HomepageSearchResult, store?: StoreDetails | null) => void;
  closeModal: () => void;
  setStoreDetails: (store: StoreDetails | null) => void;
}

export const useProductModalStore = create<ProductModalState>((set) => ({
  isOpen: false,
  productData: null,
  storeDetails: null,
  openModal: (data, store = null) => set({ isOpen: true, productData: data, storeDetails: store }),
  closeModal: () => set({ isOpen: false, productData: null, storeDetails: null }),
  setStoreDetails: (store) => set({ storeDetails: store }),
}));
