# Specification

## Summary
**Goal:** Update only Section 12 (“Contacto”) on the Privacy Policy page to remove hardcoded store contact details and instead link users to the /contacto page.

**Planned changes:**
- In `frontend/src/pages/public/PrivacyPage.tsx`, remove the entire contact-details container div (`bg-muted p-6 rounded-lg space-y-3`) from Section 12.
- Replace Section 12 content with the specified Spanish paragraph and a standalone router `Link` to `/contacto` using link text “Ir a la página de contacto” and className `text-primary hover:underline`.
- Keep all other Privacy Policy sections, layout, and styling unchanged; make no backend changes.

**User-visible outcome:** On `/privacy`, the “Contacto” section no longer shows store contact details and instead directs users to the contact page via a clear link.
