import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetSaleItemsPage, type SaleItem } from '../../hooks/useSaleItemQueries';
import { useIsMobile } from '../../hooks/useMediaQuery';
import SaleItemsTable from '../../components/admin/sales/SaleItemsTable';
import SaleItemsCards from '../../components/admin/sales/SaleItemsCards';
import SaleItemsPagination from '../../components/admin/sales/SaleItemsPagination';
import SaleItemsFilters from '../../components/admin/sales/SaleItemsFilters';
import SaleItemUpsertModal from '../../components/admin/sales/SaleItemUpsertModal';
import DeleteSaleItemDialog from '../../components/admin/sales/DeleteSaleItemDialog';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export default function OnSaleProductsPage() {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSaleItem, setEditingSaleItem] = useState<SaleItem | null>(null);
  const [deletingSaleItem, setDeletingSaleItem] = useState<SaleItem | null>(null);

  // Clear query cache on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['sale-items'], exact: false });
      queryClient.removeQueries({ queryKey: ['products', 'search'], exact: false });
    };
  }, [queryClient]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [statusFilter, pageSize]);

  // Fetch sale items with pagination
  const includeInactive = statusFilter === 'all';
  const { data, isLoading } = useGetSaleItemsPage(
    debouncedSearch,
    currentPage,
    pageSize,
    includeInactive
  );

  const saleItems = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleAddClick = () => {
    setEditingSaleItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (saleItem: SaleItem) => {
    setEditingSaleItem(saleItem);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (saleItem: SaleItem) => {
    setDeletingSaleItem(saleItem);
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
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Productos en Oferta</h2>
        <Button onClick={handleAddClick} size="icon" className="h-10 w-10">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Agregar producto en oferta</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre de producto..."
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
              <span className="sr-only">Limpiar búsqueda</span>
            </Button>
          )}
        </div>

        <SaleItemsFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      {/* Sale Items Table or Cards */}
      {isMobile ? (
        <SaleItemsCards
          saleItems={saleItems}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          isLoading={isLoading}
        />
      ) : (
        <SaleItemsTable
          saleItems={saleItems}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          isLoading={isLoading}
        />
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <SaleItemsPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Add/Edit Modal */}
      <SaleItemUpsertModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingSaleItem={editingSaleItem}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteSaleItemDialog
        saleItem={deletingSaleItem}
        onOpenChange={(open) => !open && setDeletingSaleItem(null)}
      />
    </div>
  );
}
