# Specification

## Summary
**Goal:** Add an admin-only Import page to upload an exported JSON file and import categories and products in a single, atomic backend batch request.

**Planned changes:**
- Create a new admin-protected route `/admin/import` that accepts previously exported JSON files matching the `ImportData` structure.
- Add navigation to `/admin/import` from the admin sidebar and admin dashboard, positioned after Export, with correct active-route styling.
- Build the Import page UI: JSON-only drag-and-drop/click upload, Import Information (filename/counts/date/validity), cancel/clear behavior (including aborting an in-flight request), progress states, and Spanish validation/error messages.
- Implement client flow to read the file, parse via `parseJSONWithBigInt()`, validate/convert numeric fields, and automatically start the import call (no manual submit button).
- Use shared API utilities and standardized `ApiResponseHandler` patterns; show Spanish success toast and errors; keep UI responsive for large files.
- Show Import Results (imported/updated counts + error count), provide links to `/admin/categories` and `/admin/products`, and allow resetting the interface.
- Add backend actor method `batchImportData(importData: ImportData): async ImportResult` to upsert categories first, then products, in a single request.
- Enforce atomic/transactional semantics: on any validation/consistency failure, persist nothing and return structured errors.
- Update backend `lastCategoryId` after category import to avoid future ID conflicts (without decreasing it).
- Import products by matching on `barcode` (update if exists, create if not) and preserve existing product photo when the incoming photo field is empty/missing on update.
- Validate category-product references during import and reject/abort atomically if any product references an invalid categoryId.

**User-visible outcome:** Admins can navigate to `/admin/import`, drop/select an exported JSON file, see validation info, and have categories/products imported automatically in one atomic operation, with Spanish status messages, a success toast, and a results summary plus links to manage categories/products.
