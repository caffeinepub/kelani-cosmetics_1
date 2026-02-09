# Specification

## Summary
**Goal:** Prevent duplicate admin-page GET requests by stabilizing the backend actor reference in React Query hooks, standardizing cache behavior, and clearing relevant caches on page unmount.

**Planned changes:**
- Update all admin-page GET React Query hooks to use a stable-actor pattern (`useState` + `useEffect`) and only run queries once the stable actor is available.
- Apply a standardized React Query configuration to every admin GET query (staleTime, gcTime, refetch behaviors, retry, and enabled gating) while keeping existing query-key patterns.
- Ensure the admin Products, Categories, On-Sale Products, Store Details, Export, and User Management GET hooks all follow the same stable-actor + standardized cache configuration approach.
- Add per-admin-page unmount cleanup that removes cached queries by the specified query-key prefixes (exact: false) so revisiting pages triggers a fresh load.
- Preserve all existing Spanish UI labels and user-facing error/toast messages while implementing these changes.

**User-visible outcome:** Admin pages load more reliably with fewer duplicate GET calls, consistent caching behavior, and fresh data reloads when returning to an admin page after navigating away—without changing the UI or Spanish messaging.
