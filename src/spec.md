# Specification

## Summary
**Goal:** Make public product photos render consistently without cropping and fix the homepage search-to-product-modal image flow by using binary photo data + blob URLs (with cleanup), while keeping the autocomplete dropdown text-only.

**Planned changes:**
- Add Tailwind `object-contain` to every public-facing `<img>` that renders a product photo (including fallback/default images) without altering other existing classes or layout behavior.
- Update backend `searchHomepageProducts` to return full product data including the binary `photo` field (`?[Nat8]` or null), remove any image URL string construction, and keep results capped at 10.
- Ensure the homepage autocomplete dropdown renders text-only items (no `<img>`, no blob URLs, no binary-to-image conversion).
- When opening the product details modal from a homepage search selection, generate a blob URL from the selected product’s binary `photo` (if present), store/pass it with modal state, and have the modal prefer this blob URL (otherwise use the existing fallback image) without any extra API calls.
- Implement blob URL lifecycle management for created product-photo blob URLs, revoking them on appropriate cleanup events (e.g., modal close and/or active modal product change) without revoking URLs still in use.
- Preserve existing modal-opening behavior from non-search entry points (homepage/category product cards) while aligning public product image sourcing to the binary photo → blob URL → image display pattern with correct fallback handling.

**User-visible outcome:** Product photos across the public UI no longer appear cropped, homepage search still shows text-only suggestions, and selecting a search result opens the product details modal with the correct image (or fallback) without extra photo-fetch calls or blob URL memory leaks.
