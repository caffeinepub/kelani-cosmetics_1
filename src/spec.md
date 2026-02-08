# Specification

## Summary
**Goal:** Add an admin Store Details management page for exactly two physical stores (storeId 1 and 2) with upgrade-safe backend persistence, per-day store hours, and independent save/restore workflows per store.

**Planned changes:**
- Implement Motoko StoreDetails persistence in the single backend actor using an in-memory `Map<Nat, StoreDetails>` backed by stable storage so records survive canister upgrades, with independent records for storeId 1 and 2 and per-day store hours (Mon–Sun fields).
- Add one-time auto-created backend default StoreDetails for storeId 1 and storeId 2 (created only when that specific storeId is requested and missing), persisted after creation.
- Expose backend APIs `getStoreDetails(storeId : Nat) : async StoreDetails` and `updateStoreDetails(storeId : Nat, details : StoreDetails) : async ()`, ensuring all fields are persisted and `lastUpdated` is set by the backend at save time; reject invalid storeIds outside {1,2}.
- Replace the placeholder admin page with a functional `/admin/store-details` page inside the existing DashboardLayout, using two tabs labeled exactly “Tienda 1” and “Tienda 2”, keeping state isolated per store.
- Build a per-store Spanish-labeled form with validations for name, email, WhatsApp, address, description, latitude/longitude, and a Store Hours section with 7 per-day inputs (Spanish day labels), required helper text, and placeholders.
- Add a live preview panel per active tab that updates as the admin types, including description rendering and formatted per-day store hours display.
- Implement per-store “Guardar Cambios” (loading/disabled while saving) and “Restaurar Valores Originales” controls, with Spanish success/error toast notifications and restore-to-last-successful-backend-state behavior.
- Create a Store Details frontend data layer using TanStack Query + existing actor hook, with correct Nat/BigInt handling and mandated utilities (no direct `JSON.parse`/`JSON.stringify`; use BigIntSerializer helpers where needed; use `safeConvertToNumber()` before coordinate validation; use existing toast-based error strategy).

**User-visible outcome:** Admin users can visit `/admin/store-details`, switch between “Tienda 1” and “Tienda 2”, edit each store’s details and per-day hours with live preview, save changes independently with feedback, and restore the last saved values; data persists across canister upgrades.
