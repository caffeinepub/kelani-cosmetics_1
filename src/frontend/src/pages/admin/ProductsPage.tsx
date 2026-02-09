import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetProductsPage, type Product } from '../../hooks/useProductQueries';
import ProductsTable from '../../components/admin/products/ProductsTable';
import ProductsPagination from '../../components/admin/products/ProductsPagination';
import CategoryFilterSelect from '../../components/admin/products/CategoryFilterSelect';
import ProductUpsertModal from '../../components/admin/products/ProductUpsertModal';
import DeleteProductDialog from '../../components/admin/products/DeleteProductDialog';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Clear query cache on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['products'], exact: false });
    };
  }, [queryClient]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length === 0 || searchQuery.length >= MIN_SEARCH_LENGTH) {
        setDebouncedSearch(searchQuery);
        setCurrentPage(0); // Reset to first page on search
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [categoryFilter, pageSize]);

  // Fetch products with pagination
  const categoryIdNumber = categoryFilter ? Number(categoryFilter) : null;
  const { data, isLoading } = useGetProductsPage(
    debouncedSearch,
    categoryIdNumber,
    currentPage,
    pageSize
  );

  const products = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Products</h2>
        <Button onClick={handleAddClick} size="icon" className="h-10 w-10">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Add product</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by barcode, name, description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <CategoryFilterSelect
          value={categoryFilter ?? 'all'}
          onValueChange={(value) => setCategoryFilter(value)}
          className="w-full sm:w-64"
        />
      </div>

      {/* Products Table */}
      <ProductsTable
        products={products}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {totalCount > 0 && (
        <ProductsPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Add/Edit Modal */}
      <ProductUpsertModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingProduct={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        product={deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      />
    </div>
  );
}
