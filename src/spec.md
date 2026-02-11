# Specification

## Summary
**Goal:** Add static SEO discovery files (sitemap.xml, robots.txt) and page-level SEO `<head>` meta tags for the public static pages on kelanicosmetics.es.

**Planned changes:**
- Add a static `frontend/public/sitemap.xml` that matches the user-provided XML exactly and is served at `/sitemap.xml` (only `/`, `/contacto`, `/privacy`).
- Add a static `frontend/public/robots.txt` that matches the user-provided text exactly, including `Sitemap: https://kelanicosmetics.es/sitemap.xml`, and is served at `/robots.txt`.
- Implement a frontend-only per-route `<head>` management approach (e.g., React Helmet or equivalent) to set/override title and meta tags when navigating between `/`, `/contacto`, and `/privacy`.
- Update `HomePage.tsx`, `ContactoPage.tsx`, and `PrivacyPage.tsx` to use the exact user-provided Spanish SEO values (title, meta tags, canonical, Open Graph, Twitter where specified), using production-domain URLs and preserving accents/special characters; keep privacy page as `noindex, follow`.
- Ensure no existing page behavior is changed and do not modify the `:root` CSS custom properties block in `frontend/src/index.css` (append-only below if ever needed).

**User-visible outcome:** Search engines can discover the site via `/sitemap.xml` and `/robots.txt`, and each static public page shows the correct Spanish title/meta/canonical/OG (and Twitter where required) tags when visited or navigated to, without any UI/behavior changes.
