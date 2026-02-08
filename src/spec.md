# Specification

## Summary
**Goal:** Refine the home page and navigation for better mobile UX: simplify the mobile header, adjust mobile banner height, and make category loading occur only when the user scrolls near the page bottom with clear loading/end states.

**Planned changes:**
- Update the public header so the “Contacto” link is hidden on mobile breakpoints (hamburger + logo only), while keeping desktop header behavior unchanged and retaining “Contacto” in the left side panel navigation linking to `/contacto`.
- Replace the home page categories IntersectionObserver infinite-scroll trigger with a throttled window scroll listener that loads more only when the user scrolls within 500px of the bottom (and only when not already fetching and more categories exist).
- Change incremental category pagination so each scroll trigger appends exactly 5 more categories (including associated products per current implementation), preserving category ordering and avoiding duplicates or resetting previously rendered categories.
- Add a centered loading area beneath the last category: show a spinner with the exact text “Cargando más categorías...” during fetches, and when all categories are loaded show the persistent message “No hay más categorías para mostrar”.
- Reduce the home page banner height by 20% on mobile only via media-query CSS appended to `frontend/src/index.css`, without modifying the existing `:root` CSS variables block.

**User-visible outcome:** On mobile, the header shows only the menu button and logo (with “Contacto” still available in the side panel), the home banner is shorter, and more categories load only as the user scrolls near the bottom—showing “Cargando más categorías...” while loading and “No hay más categorías para mostrar” when finished.
