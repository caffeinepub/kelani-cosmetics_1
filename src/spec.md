# Specification

## Summary
**Goal:** Implement persistent backend Categories CRUD + reorder in the Motoko canister and wire the frontend to use these backend APIs (including dropdowns), ensuring changes persist across reloads and canister upgrades.

**Planned changes:**
- Add persistent Categories storage in `backend/main.mo` using an in-memory `Map<Nat, Category>` plus stable state for upgrades, including a stable `lastCategoryId : Nat` counter.
- Define a backend `Category` record with `categoryId`, `name`, `order`, `createdDate`, and `lastUpdatedDate`, using canister time for timestamps and preserving `createdDate` on updates/reorders.
- Implement backend Categories APIs: `createCategory`, `updateCategory`, `deleteCategory`, `getAllCategories` (sorted by `order`), `getCategoryById`, and `reorderCategories` (validate all IDs before applying).
- Enforce admin-only access for category write operations (create/update/delete/reorder) while keeping read operations available for authenticated usage in the app.
- Update `frontend/src/hooks/useQueries.ts` to call the real backend Categories APIs, removing placeholder behavior and handling Nat/Int type conversions correctly so create/update/delete/reorder persist and refetch properly.
- Remove hardcoded category lists in the frontend and populate category dropdowns from backend `getAllCategories()` via the existing React Query approach, preserving current UI behavior/layout and error handling.

**User-visible outcome:** Admin users can create, edit, delete, and reorder categories and have those changes persist after reloads and upgrades; all category dropdowns in the UI are populated from backend categories rather than hardcoded lists.
