# Specification

## Summary
**Goal:** Replace the direct WhatsApp contact action on product views with a reusable, expandable store selector so users choose which store to contact, using a consistent Spanish pre-filled message.

**Planned changes:**
- Create a reusable `StoreSelector` UI used in both the Product Details Modal and the Product Details Page: a primary button labeled “Contactar sobre este producto” that expands/collapses a section containing one touch-friendly store button (>=44px height) per available store; add smooth expand/collapse animation; open WhatsApp in a new tab only after a store is selected, with a Spanish message including product name and barcode.
- Refactor the Product Details Modal to use `StoreSelector` and receive a full store details array from its parent (no API calls inside the modal); ensure selector is collapsed by default when the modal opens and Spanish UI text remains unchanged.
- Update the modal state/data flow and all modal openers to pass/store an array of both store details (using the existing `useBothStoreDetails()` results) so both store options can be shown.
- Update `frontend/src/pages/public/ProductPage.tsx` to use `StoreSelector`, fetch both store details via `useBothStoreDetails()`, and remove the current behavior that auto-uses only the first store for WhatsApp.
- Preserve all existing product display behavior (images, pricing/sale, share link, etc.) and keep all UI/message text Spanish, with store names taken from configured store details.

**User-visible outcome:** On both the product page and product modal, clicking “Contactar sobre este producto” expands a store list; selecting a store opens WhatsApp in a new tab with a Spanish pre-filled message that includes the product name and barcode, and all other product details behave as before.
