# Specification

## Summary
**Goal:** Make the admin category dropdowns (Products page filter + Add/Edit Product modal) show a maximum of ~10 items at once with vertical scrolling, without affecting any other dropdowns.

**Planned changes:**
- Extend the app-level `SafeSelect` wrapper with an optional prop to apply a CSS class (or equivalent) specifically to the rendered dropdown content container, leaving default behavior unchanged when not provided.
- Add a new admin-scoped CSS class for scrollable dropdown content (max-height ~10 option rows, `overflow-y: auto`, touch momentum scrolling, admin-only scrollbar styling) by appending styles to `frontend/src/index.css` without modifying the existing `:root` block.
- Apply the new dropdown content class only to:
  - Admin Products page category filter dropdown
  - Add/Edit Product modal (`ProductUpsertModal`) category dropdown

**User-visible outcome:** In admin, category dropdowns no longer overflow when many categories exist; they show about 10 options and can be scrolled (mouse/touch) while keeping keyboard navigation working, with no changes to other pages’ dropdowns.
