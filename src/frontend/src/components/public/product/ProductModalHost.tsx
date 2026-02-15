import ProductDetailsModal from './ProductDetailsModal';

/**
 * Modal host component that renders ProductDetailsModal.
 * Mounted at PublicLayout level to provide consistent modal behavior across all public pages.
 * History-based navigation is managed via useProductModalNavigation hook.
 */
export default function ProductModalHost() {
  return <ProductDetailsModal />;
}
