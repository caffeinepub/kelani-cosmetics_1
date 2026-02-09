# Specification

## Summary
**Goal:** Ensure backend product-fetching endpoints consistently include sale information, and update the frontend to display sale pricing when a sale is active.

**Planned changes:**
- Refactor Motoko backend functions `getProductsPageFeaturedFirst`, `getHomepageCategories`, and `getProduct` to always include `price` and also return `salePrice`, `discountPercentage`, and a boolean indicating whether the sale is active.
- Add a shared Motoko helper used by all three functions to compute/attach sale fields using existing sale rules, without changing persisted product/sale data models.
- Preserve existing pagination, total count semantics, sorting, and featured-first behavior while attaching sale info (prefer functional mapping / avoid repeated loops).
- Update frontend data fetching/mapping for these three endpoints to use backend-provided sale fields and render sale price when active; otherwise render normal price (removing any hardcoded sale defaults for these responses).

**User-visible outcome:** Product listings (homepage sections, category grids) and product detail pages show the sale price when a sale is active; otherwise they show the regular price.
