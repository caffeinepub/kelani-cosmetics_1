# Specification

## Summary
**Goal:** Make the featured-first product pagination endpoint usable from the public site and fix minor alignment/sizing issues in the public header.

**Planned changes:**
- Backend: Update `getProductsPageFeaturedFirst(search, categoryId, page, pageSize)` to allow unauthenticated callers by removing the current auth/admin verification that traps, while preserving existing pagination, filtering, featured-first sorting, and non-auth validation/error behavior.
- Frontend: In `frontend/src/components/public/PublicHeader.tsx`, reduce the hamburger icon size from `size-9` to `size-6` (or equivalent sizing control) without changing its toggle behavior.
- Frontend: In `frontend/src/components/public/PublicHeader.tsx`, remove the `px-4` class from the desktop-only Contact link so the right edge aligns with the page content boundary, keeping other styles and `/contacto` navigation intact.

**User-visible outcome:** Public visitors can browse category products on the homepage without logging in, and the public header’s hamburger icon and Contact link align/size correctly across breakpoints.
