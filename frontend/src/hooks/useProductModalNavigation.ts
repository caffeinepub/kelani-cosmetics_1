import { useEffect, useRef, useCallback } from 'react';
import { useProductModalStore } from '../stores/productModalStore';
import type { ProductWithSale, HomepageSearchResult, StoreDetails } from '../backend';

interface ModalHistoryState {
  modalOpen: boolean;
  sourceRoute: string;
  source: string;
}

export function useProductModalNavigation() {
  const { isOpen, openModal: storeOpenModal, closeModal: storeCloseModal } = useProductModalStore();
  const isClosingRef = useRef(false);
  const skipNextPopstateRef = useRef(false);

  // Open modal with history push
  const openModalWithHistory = useCallback(
    (product: ProductWithSale | HomepageSearchResult, stores: StoreDetails[] | null, source?: string, blobUrl?: string | null) => {
      // Prevent opening if already open
      if (isOpen) return;

      // Store current route context
      const sourceRoute = window.location.pathname + window.location.search + window.location.hash;

      // Determine source identifier
      let sourceIdentifier = source || 'unknown';
      if (!source) {
        if (sourceRoute === '/') {
          sourceIdentifier = 'homepage-category';
        } else if (sourceRoute.startsWith('/category/')) {
          sourceIdentifier = 'category-page';
        }
      }

      // Push modal-open state to history without changing URL
      const state: ModalHistoryState = {
        modalOpen: true,
        sourceRoute,
        source: sourceIdentifier,
      };
      window.history.pushState(state, '', window.location.href);

      // Open modal in store with optional precomputed blob URL
      storeOpenModal(product, stores, blobUrl);
    },
    [isOpen, storeOpenModal]
  );

  // Close modal via UI (button, ESC, overlay)
  const closeModalViaUI = useCallback(() => {
    // Prevent duplicate close attempts
    if (isClosingRef.current || !isOpen) return;

    isClosingRef.current = true;

    // Close modal immediately in store
    storeCloseModal();

    // Skip the next popstate event since we're triggering history.back
    skipNextPopstateRef.current = true;

    // Go back in history to remove the modal-open entry
    window.history.back();

    // Reset closing flag after a short delay
    setTimeout(() => {
      isClosingRef.current = false;
    }, 100);
  }, [isOpen, storeCloseModal]);

  // Close modal via back button (popstate)
  const closeModalViaBack = useCallback(() => {
    // Prevent duplicate close attempts
    if (isClosingRef.current || !isOpen) return;

    isClosingRef.current = true;

    // Close modal immediately in store (no history.back call)
    storeCloseModal();

    // Reset closing flag after a short delay
    setTimeout(() => {
      isClosingRef.current = false;
    }, 100);
  }, [isOpen, storeCloseModal]);

  // Handle popstate events (back/forward navigation)
  useEffect(() => {
    const handlePopstate = (event: PopStateEvent) => {
      // Skip if we triggered this popstate via UI close
      if (skipNextPopstateRef.current) {
        skipNextPopstateRef.current = false;
        return;
      }

      const state = event.state as ModalHistoryState | null;

      // If modal is open and we're navigating back (no modal state), close it
      if (isOpen && (!state || !state.modalOpen)) {
        closeModalViaBack();
      }
      // If modal is closed and we're navigating forward to a modal state, reopen it
      else if (!isOpen && state && state.modalOpen) {
        // Forward navigation to modal-open state - reopen modal
        // Note: We don't have the product data in history, so this is a limitation
        // The modal will remain closed, but the history state is correct
      }
    };

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [isOpen, closeModalViaBack]);

  return {
    openModalWithHistory,
    closeModalViaUI,
  };
}
