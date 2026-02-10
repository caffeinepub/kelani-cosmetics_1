# Specification

## Summary
**Goal:** Make specified backend read/query endpoints permanently public by removing all user-auth gating (e.g., `checkUser(caller)`), while keeping existing admin-only enforcement unchanged.

**Planned changes:**
- In `backend/main.mo`, remove every remaining call site of `checkUser(caller)` across the actor (resulting in zero `checkUser(` usages).
- Ensure the following functions contain no authentication/permission/user-identity gating logic (including `checkUser` and user permission checks like `AccessControl.hasPermission(..., #user)`), without changing their non-auth logic or response shapes: `getBothStoreDetails`, `getAllCategories`, `getProduct`, `getProductPhoto`, `getTotalProductCount`, `getFeaturedProducts`, `getActiveSales`, `getHomepageCategories`, `getCategoryProductCounts`, `getProductsPageFeaturedFirst`, `searchHomepageProducts`.
- Add a prominent guardrail comment immediately above each permanently-public function listed above stating it must remain permanently public and must never add auth/permission checks in future changes.
- Preserve all existing `checkAdmin(caller)` behavior exactly as-is wherever it currently applies.

**User-visible outcome:** Anonymous (non-authenticated) callers can successfully call the listed backend read/query functions without authorization traps, while admin-only protections remain enforced as before.
