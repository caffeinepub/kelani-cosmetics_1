# Specification

## Summary
**Goal:** Fix the CategoryPage infinite scroll so that products never disappear or reset during pagination.

**Planned changes:**
- Remove `pendingProductsRef`, `apiFetchDoneRef`, `timerDoneRef`, and all associated buffering/conditional logic that defers product rendering in CategoryPage
- Refactor product accumulation to always append new products immediately on API response using a functional state update with barcode-based deduplication, removing the page 0 vs page 1+ branching
- Decouple the loading spinner (`isLoadingMore`) from product visibility: spinner starts on load trigger, runs for a minimum display duration on its own independent timer, and hides only after that timer expires — products remain visible while spinner is showing
- Retain `processedPagesRef` to prevent the same page from being processed twice
- Ensure ProductGrid keys each product by barcode for stable rendering
- Preserve all existing Spanish-language UI messages in CategoryPage; do not modify existing CSS classes in `index.css`

**User-visible outcome:** Scrolling through category pages no longer causes existing products to disappear or flash; new products appear immediately as pages load, and the loading spinner displays independently without affecting product visibility.
