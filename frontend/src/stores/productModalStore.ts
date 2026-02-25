import { create } from 'zustand';
import type { ProductWithSale } from '@/backend';

interface ProductModalState {
  isOpen: boolean;
  product: ProductWithSale | null;
  photoBlobUrl: string | undefined;
  openModal: (product: ProductWithSale, photoBlobUrl?: string) => void;
  closeModal: () => void;
}

export const useProductModalStore = create<ProductModalState>((set) => ({
  isOpen: false,
  product: null,
  photoBlobUrl: undefined,

  openModal: (product, photoBlobUrl) => {
    set({ isOpen: true, product, photoBlobUrl });
  },

  closeModal: () => {
    set({ isOpen: false, product: null, photoBlobUrl: undefined });
  },
}));
