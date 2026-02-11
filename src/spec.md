# Specification

## Summary
**Goal:** Simplify the public ProductCard UI by hiding the price area when no price exists (and not on sale) and removing the stock status text badge below the price.

**Planned changes:**
- Update `frontend/src/components/public/products/ProductCard.tsx` to render no price UI at all when `product.price` is undefined/null/missing and the product is not on an active sale (remove the “Precio no disponible” placeholder and avoid rendering an empty price wrapper for that case).
- Remove the “Stock Status Text Badge” block that displays “Disponible”/“Agotado” below the price, while keeping the stock overlay badge within the image area unchanged.

**User-visible outcome:** On product cards, products without a price (and not on sale) show no price section, and the “Disponible”/“Agotado” text badge under the price is no longer displayed; all other card behaviors and existing price/sale displays remain the same.
