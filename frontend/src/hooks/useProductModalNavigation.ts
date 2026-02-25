import { useEffect, useRef, useCallback } from 'react';
import { useProductModalStore } from '../stores/productModalStore';
import type { ProductWithSale, StoreDetails } from '../backend';

export function useProductModalNavigation() {
  const { isOpen, openModal: storeOpenModal, closeModal: storeCloseModal } = useProductModalStore();
  const isClosingRef = useRef(false);
  const skipNextPopstateRef = useRef(false);

  // Open modal with history push
  const openModalWithHistory = useCallback(
    (product: ProductWithSale, stores?: StoreDetails[] | null, source?: string, blobUrl?: string | null) => {
      if (isOpen) return;

      const sourceRoute = window.location.pathname + window.location.search + window.location.hash;

      let sourceIdentifier = source || 'unknown';
      if (!source) {
        if (sourceRoute === '/') {
          sourceIdentifier = 'homepage-category';
        } else if (sourceRoute.startsWith('/category/')) {
          sourceIdentifier = 'category-page';
        }
      }

      window.history.pushState(
        { modalOpen: true, sourceRoute, source: sourceIdentifier },
        '',
        window.location.href
      );

      storeOpenModal(product, blobUrl ?? undefined);
    },
    [isOpen, storeOpenModal]
  );

  // Close modal via UI (button, ESC, overlay)
  const closeModalViaUI = useCallback(() => {
    if (isClosingRef.current || !isOpen) return;

    isClosingRef.current = true;
    storeCloseModal();
    skipNextPopstateRef.current = true;
    window.history.back();

    setTimeout(() => {
      isClosingRef.current = false;
    }, 100);
  }, [isOpen, storeCloseModal]);

  // Close modal via back button (popstate)
  const closeModalViaBack = useCallback(() => {
    if (isClosingRef.current || !isOpen) return;

    isClosingRef.current = true;
    storeCloseModal();

    setTimeout(() => {
      isClosingRef.current = false;
    }, 100);
  }, [isOpen, storeCloseModal]);

  // Handle popstate events (back/forward navigation)
  useEffect(() => {
    const handlePopstate = (event: PopStateEvent) => {
      if (skipNextPopstateRef.current) {
        skipNextPopstateRef.current = false;
        return;
      }

      const state = event.state as { modalOpen?: boolean } | null;

      if (isOpen && (!state || !state.modalOpen)) {
        closeModalViaBack();
      }
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [isOpen, closeModalViaBack]);

  return {
    openModalWithHistory,
    closeModalViaUI,
  };
}
