# Specification

## Summary
**Goal:** Replace the existing static `/contacto` page with a fully featured contact page that shows two-store details, fetched reliably via a stabilized actor pattern, including store info, hours, and embedded maps.

**Planned changes:**
- Rebuild `frontend/src/pages/public/ContactoPage.tsx` to render within `PublicLayout`, with all content centered in a 1200px max-width container and a responsive two-store layout (two columns on desktop, stacked on mobile) with clear visual separation.
- Fetch both stores via a single `getBothStoreDetails()` call using React Query with a stabilized actor reference (useState + useEffect), `queryKey: ['both-store-details']`, `enabled` only when the stable actor exists, `staleTime` 30 minutes, and `refetchOnWindowFocus: false`.
- Add an immediate first-paint loading controller (`isInitialLoading`) that shows a centered spinner and the text “Cargando información de contacto...” using the same styling pattern as the public category page, and only clears after the fetch resolves (success or error).
- After initial load, handle error/empty/partial data states: error message with retry button, empty-state message when no details are returned, messaging when one store is missing, and never render inactive stores (`isActive === false`).
- Render the page header copy exactly: title “Contacto - Variety Discount Store” and subtitle “Visítanos en nuestras tiendas o contáctanos directamente”, keeping the page UI text in Spanish including “Tienda 1” / “Tienda 2”.
- For each active store, render a store card with contact details: name, address (with location icon and clickable directions link only when coordinates are valid), phone (tel:), WhatsApp (wa.me), email (mailto:), and optional social links (Facebook/Instagram/Website) with icons, opening in a new tab when applicable.
- Add a per-store “Horario de Apertura” section that parses `storeHours` tuples and displays Spanish day labels (Lunes–Domingo) with hours on a separate line, omitting (or consistently messaging) when hours are missing.
- Add a per-store map section that parses `coordinates` JSON (`{ "lat": number, "lng": number }`), lazy-loads a responsive Google Maps embed (~300px height, rounded corners), and shows an “Obtener Direcciones” button linking to `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`; show a clear fallback and hide map/button when coordinates are invalid.
- Ensure any styling updates do not modify the existing `:root` CSS variables block in `frontend/src/index.css` (only append new styles below it if needed) and do not edit files under `frontend/src/components/ui`.

**User-visible outcome:** Visiting `/contacto` shows a polished, Spanish contact page with up-to-date details for up to two active stores, including contact links, opening hours, and embedded maps with a directions button, plus clear loading, retry, and empty/partial-data messaging.
