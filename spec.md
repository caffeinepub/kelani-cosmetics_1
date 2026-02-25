# Specification

## Summary
**Goal:** Refactor all GET query hooks in the Kelani Cosmetics frontend to use a stable actor pattern, preventing unnecessary React Query re-runs caused by actor reference changes.

**Planned changes:**
- Create `useStableActor` hook in `frontend/src/hooks/useStableActor.ts` that stabilizes the raw actor reference via `useRef` and returns `{ stableActor, isActorFetching }`
- Create `useStableActorQuery` hook in `frontend/src/hooks/useStableActorQuery.ts` as a generic wrapper around React Query's `useQuery`, using `useStableActor` internally and merging actor fetching state with query loading state
- Refactor all public page GET query hooks (`useGetAllCategories`, `useGetHomepageCategories`, `useHomepageAutocomplete`, `useGetCategoryById`, `useGetProduct`, `useGetProductPhoto`, `useGetBothStoreDetails`/`useBothStoreDetails`) to use `useStableActorQuery` with named selector functions
- Refactor all admin page GET query hooks in `useQueries.ts`, `useProductQueries.ts`, `useSaleItemQueries.ts`, `useStoreDetailsQueries.ts`, `useAdminUserManagement.ts`, `useAdminExport.ts`, `usePublicCategories.ts`, `useCategoryProductsPaginated.ts`, and `useProductSearchForSales.ts` to use `useStableActorQuery`
- Adapt `useHomepageCategoriesInfinite` and `useCategoryProductsInfinite` (which use `useInfiniteQuery`) to gate their `enabled` option using `useStableActor` directly, preserving all pagination behavior
- Preserve all existing query keys, cache settings (`staleTime`, `gcTime`, retry), Spanish error messages, and external hook interfaces throughout

**User-visible outcome:** All pages (public and admin) continue to function identically with no duplicate API calls on re-renders, while the codebase uses a consistent stable actor pattern across all GET query hooks.
