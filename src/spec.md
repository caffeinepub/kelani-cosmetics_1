# Specification

## Summary
**Goal:** Refine the homepage responsive layout so the hero banner background positioning, search width alignment, and mobile category headers match the intended desktop/mobile designs.

**Planned changes:**
- Apply a desktop-only (>=768px) vertical background-position Y offset of `-170px` to the homepage hero banner background image container, keeping mobile behavior unchanged.
- Expand the homepage search box container on desktop to match the page container width (max 1200px) and align its left/right edges with the categories and product grid sections below; preserve current mobile sizing/centering.
- Adjust mobile (<768px) category section headers: move product count under the category name (left-aligned, smaller/secondary styling), truncate long category names to a single line with ellipsis, and reduce the “Ver todos” link font size on mobile only (desktop unchanged).
- Preserve the existing `:root { ... }` CSS variables block in `frontend/src/index.css` exactly; append any new global CSS only below it if needed.

**User-visible outcome:** On desktop, the banner background is shifted and the search bar aligns with the main content width; on mobile, category headers display more cleanly with truncated titles, a stacked product count, and a smaller “Ver todos” link—without changing existing mobile banner/search behavior.
