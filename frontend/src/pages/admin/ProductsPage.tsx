import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import { ProductsTable } from '@/components/admin/products/ProductsTable';
import { ProductsCards } from '@/components/admin/products/ProductsCards';
import ProductsPagination from '@/components/admin/products/ProductsPagination';
import { ProductUpsertModal } from '@/components/admin/products/ProductUpsertModal';
import { DeleteProductDialog } from '@/components/admin/products/DeleteProductDialog';
import { CategoryFilterSelect } from '@/components/admin/products/CategoryFilterSelect';
import { useGetProductsPage, type UIProduct } from '@/hooks/useProductQueries';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useBothStoreDetails } from '@/hooks/useBothStoreDetails';
import { useDebounce } from 'react-use';

export default function ProductsPage() {
  const isMobile = useIsMobile();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<UIProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<UIProduct | null>(null);

  useDebounce(() => {
    setDebouncedSearch(search);
    setPage(0);
  }, 400, [search]);

  const { data, isLoading, isError, refetch } = useGetProductsPage(
    debouncedSearch,
    categoryId,
    page,
    pageSize
  );

  // Derive store names from useBothStoreDetails
  const { data: storeDetailsArray, isLoading: storeLoading } = useBothStoreDetails();
  const store1Name = storeLoading
    ? 'Cargando...'
    : storeDetailsArray && storeDetailsArray.length >= 1
    ? storeDetailsArray[0].name
    : 'Tienda 1';
  const store2Name = storeLoading
    ? 'Cargando...'
    : storeDetailsArray && storeDetailsArray.length >= 2
    ? storeDetailsArray[1].name
    : 'Tienda 2';

  const handleEdit = useCallback((product: UIProduct) => {
    // Pass product data without photo — modal fetches photo lazily
    setEditProduct(product);
    setUpsertOpen(true);
  }, []);

  const handleDelete = useCallback((product: UIProduct) => {
    setDeleteProduct(product);
  }, []);

  const handleAddNew = () => {
    setEditProduct(null);
    setUpsertOpen(true);
  };

  const handleUpsertClose = (open: boolean) => {
    setUpsertOpen(open);
    if (!open) setEditProduct(null);
  };

  const handleCategoryChange = (val: number | null) => {
    setCategoryId(val);
    setPage(0);
  };

  const products = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nuevo producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <CategoryFilterSelect
          value={categoryId}
          onChange={handleCategoryChange}
        />
        <Button variant="ghost" size="icon" onClick={() => refetch()} title="Actualizar">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando productos...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive">
          <p>Error al cargar los productos.</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      ) : isMobile ? (
        <ProductsCards
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          store1Name={store1Name}
          store2Name={store2Name}
        />
      ) : (
        <ProductsTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          store1Name={store1Name}
          store2Name={store2Name}
        />
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalCount > 0 && (
        <ProductsPagination
          currentPage={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
        />
      )}

      {/* Modals */}
      <ProductUpsertModal
        open={upsertOpen}
        onOpenChange={handleUpsertClose}
        product={editProduct}
        store1Name={store1Name}
        store2Name={store2Name}
      />

      {deleteProduct && (
        <DeleteProductDialog
          product={deleteProduct}
          onClose={() => setDeleteProduct(null)}
        />
      )}
    </div>
  );
}
