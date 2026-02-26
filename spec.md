# Specification

## Summary
**Goal:** Add the `description` field to the `searchHomepageProducts` backend function's returned product records.

**Planned changes:**
- Update the `searchHomepageProducts` function in `backend/main.mo` to include the `description` field in each returned product record, while preserving all existing functionality (10-result limit, barcode search logic, name/description search logic, case-insensitive and partial substring matching, all other returned fields, and the function signature).

**User-visible outcome:** When a user opens a product details modal from a search result dropdown, the product description is now displayed, matching what is shown when opening the modal from a homepage product card.
