import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import {
  useGetAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
  type Category,
} from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryFormData {
  name: string;
  order: string;
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    order: '0',
  });
  const [formErrors, setFormErrors] = useState<Partial<CategoryFormData>>({});

  // Queries and mutations
  const { data: categories = [], isLoading } = useGetAllCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories();

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.categoryId.toString().includes(query)
    );
  }, [categories, searchQuery]);

  // Open modal for adding new category
  const handleAddClick = () => {
    setEditingCategory(null);
    setFormData({ name: '', order: '0' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing existing category
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      order: category.order.toString(),
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    const orderNum = parseInt(formData.order, 10);
    if (isNaN(orderNum) || orderNum < 0) {
      errors.order = 'El orden debe ser un número válido mayor o igual a 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const orderNum = parseInt(formData.order, 10);

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          categoryId: editingCategory.categoryId,
          name: formData.name.trim(),
          order: orderNum,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name.trim(),
          order: orderNum,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmCategory) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirmCategory.categoryId);
      setDeleteConfirmCategory(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Move category up in order
  const handleMoveUp = async (category: Category) => {
    const currentIndex = filteredCategories.findIndex(
      (c) => c.categoryId === category.categoryId
    );
    if (currentIndex <= 0) return;

    const prevCategory = filteredCategories[currentIndex - 1];
    const newOrder: Array<[number, number]> = [
      [category.categoryId, prevCategory.order],
      [prevCategory.categoryId, category.order],
    ];

    try {
      await reorderMutation.mutateAsync(newOrder);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Move category down in order
  const handleMoveDown = async (category: Category) => {
    const currentIndex = filteredCategories.findIndex(
      (c) => c.categoryId === category.categoryId
    );
    if (currentIndex >= filteredCategories.length - 1) return;

    const nextCategory = filteredCategories[currentIndex + 1];
    const newOrder: Array<[number, number]> = [
      [category.categoryId, nextCategory.order],
      [nextCategory.categoryId, category.order],
    ];

    try {
      await reorderMutation.mutateAsync(newOrder);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || reorderMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Categorías</h2>
        <Button onClick={handleAddClick} size="icon" className="h-10 w-10">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Agregar Categoría</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre o ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Categories Table */}
      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Cargando categorías...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No se encontraron categorías' : 'No hay categorías creadas'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-32">Orden</TableHead>
                <TableHead className="w-32 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category, index) => (
                <TableRow key={category.categoryId}>
                  <TableCell className="font-mono text-sm">{category.categoryId}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{category.order}</span>
                      <div className="ml-2 flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleMoveUp(category)}
                          disabled={index === 0 || isSubmitting}
                        >
                          <ChevronUp className="h-3 w-3" />
                          <span className="sr-only">Mover arriba</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleMoveDown(category)}
                          disabled={index === filteredCategories.length - 1 || isSubmitting}
                        >
                          <ChevronDown className="h-3 w-3" />
                          <span className="sr-only">Mover abajo</span>
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditClick(category)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmCategory(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Modifica los datos de la categoría existente.'
                : 'Completa los datos para crear una nueva categoría.'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej: Maquillaje"
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, order: e.target.value }))
                  }
                  placeholder="0"
                  className={formErrors.order ? 'border-destructive' : ''}
                />
                {formErrors.order && (
                  <p className="text-sm text-destructive">{formErrors.order}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Número que determina el orden de visualización (menor = primero)
                </p>
              </div>
            </form>
          </ScrollArea>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : editingCategory
                  ? 'Actualizar'
                  : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmCategory}
        onOpenChange={(open) => !open && setDeleteConfirmCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría "
              {deleteConfirmCategory?.name}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
