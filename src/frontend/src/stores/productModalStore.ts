import { create } from 'zustand';
import type { ProductWithSale, HomepageSearchResult } from '../backend';

interface ProductModalState {
  isOpen: boolean;
  productData: ProductWithSale | HomepageSearchResult | null;
  openModal: (data: ProductWithSale | HomepageSearchResult) => void;
  closeModal: () => void;
}

export const useProductModalStore = create<ProductModalState>((set) => ({
  isOpen: false,
  productData: null,
  openModal: (data) => set({ isOpen: true, productData: data }),
  closeModal: () => set({ isOpen: false, productData: null }),
}));
