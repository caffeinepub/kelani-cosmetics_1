# Specification

## Summary
**Goal:** Integrate active sale pricing into public product data and ensure all public UI surfaces display sale pricing only when the sale is currently valid via strict time-window validation.

**Planned changes:**
- Update Motoko backend public product query methods (`getProductsPageFeaturedFirst()`, `getHomepageCategories()`, `getProduct()`) to include computed sale fields per product: optional `salePrice`, optional `discountPercentage`, and `isOnSale` (true only for currently-valid sales).
- Add a shared Motoko helper to resolve an active sale for a product barcode by scanning `saleItems` and validating `isActive == true` and `startDate <= now <= endDate` using `Time.now()` nanosecond timestamps (with deterministic selection when multiple matches exist).
- Ensure timestamp/price handling uses existing shared utilities/patterns for BigInt/Int timestamp serialization and numeric/price conversions; keep existing function signatures where possible (or update frontend bindings/types if required).
- Update frontend public price displays to use backend-provided sale fields consistently across home page cards, category page cards, search results cards, product details modal, and the standalone product details page.
- Update the product details page data flow (React Query hook and `ProductPage.tsx`) to fetch and render sale-aware product details from `getProduct()` while preserving existing fallbacks for missing prices.
- Update the product details modal to show discount percentage and an English on-sale badge/label only when `isOnSale` is true and sale fields are present.

**User-visible outcome:** Public users see sale price, discount, and an “On Sale” indicator only for products with a currently active, in-date sale; expired or future sales never appear anywhere in the public UI.
