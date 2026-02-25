# Specification

## Summary
**Goal:** Fix the category page infinite scroll by extracting pagination logic into a dedicated custom hook and refactoring the CategoryPage component to mirror the home page pattern.

**Planned changes:**
- Create a new `useCategoryProductsInfinite` hook in `frontend/src/hooks/useCategoryProductsInfinite.ts` that manages accumulated products, pagination state, loading flags, hasMore, and totalCount, using `useCategoryProductsPaginated` as the underlying fetcher with an in-flight guard and cleanup on unmount/category change
- Refactor `CategoryPage.tsx` to use the new hook, removing all manual `page` state, `accumulatedProducts` state, and `useEffect`-based accumulation logic
- Use `useIsMobile` to set page size (5 mobile / 10 desktop) in CategoryPage
- Integrate `useInfiniteScroll` with a 500px threshold and a sentinel ref via `useIntersectionObserver` for scroll-triggered loading
- Render product grid at all times when products exist; show load-more spinner separately below the grid; show full-screen spinner only on initial load; show Spanish end-of-results message when all products are loaded

**User-visible outcome:** Scrolling to the bottom of a category page appends more products below the existing grid without flickering, grid resets, or duplicate fetches, matching the infinite scroll behavior of the home page.
