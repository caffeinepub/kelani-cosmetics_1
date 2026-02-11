import { create } from 'zustand';
import type { ProductWithSale, HomepageSearchResult, StoreDetails } from '../backend';

interface ProductModalState {
  isOpen: boolean;
  productData: ProductWithSale | HomepageSearchResult | null;
  storeDetails: StoreDetails[] | null;
  openModal: (product: ProductWithSale | HomepageSearchResult, stores: StoreDetails[] | null) => void;
  closeModal: () => void;
  setStoreDetails: (stores: StoreDetails[] | null) => void;
}

export const useProductModalStore = create<ProductModalState>((set) => ({
  isOpen: false,
  productData: null,
  storeDetails: null,
  openModal: (product, stores) => set({ isOpen: true, productData: product, storeDetails: stores }),
  closeModal: () => set({ isOpen: false, productData: null, storeDetails: null }),
  setStoreDetails: (stores) => set({ storeDetails: stores }),
}));
