import { memo } from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '../../../hooks/useQueries';

interface CategoriesCardsProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onMoveUp: (category: Category) => void;
  onMoveDown: (category: Category) => void;
  isLoading: boolean;
  isSubmitting: boolean;
}

const CategoryCard = memo(({
  category,
  index,
  totalCount,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isSubmitting
}: {
  category: Category;
  index: number;
  totalCount: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onMoveUp: (category: Category) => void;
  onMoveDown: (category: Category) => void;
  isSubmitting: boolean;
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Category Name */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="break-words text-base font-semibold leading-tight">{category.name}</h3>
          </div>

          {/* ID and Order */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span>
              <div className="font-mono font-medium">{category.categoryId}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Orden:</span>
              <div className="font-medium">{category.order}</div>
            </div>
          </div>

          {/* Reorder Controls */}
          <div className="flex items-center gap-2 border-t pt-3">
            <span className="text-sm text-muted-foreground">Reordenar:</span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => onMoveUp(category)}
                disabled={index === 0 || isSubmitting}
              >
                <ChevronUp className="h-4 w-4" />
                <span className="sr-only">Mover arriba</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => onMoveDown(category)}
                disabled={index === totalCount - 1 || isSubmitting}
              >
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Mover abajo</span>
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
              className="min-h-[44px] w-full sm:flex-1"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category)}
              className="min-h-[44px] w-full text-destructive hover:text-destructive sm:flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default function CategoriesCards({
  categories,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isLoading,
  isSubmitting,
}: CategoriesCardsProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Cargando categorías...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No se encontraron categorías</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category, index) => (
        <CategoryCard
          key={category.categoryId}
          category={category}
          index={index}
          totalCount={categories.length}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isSubmitting={isSubmitting}
        />
      ))}
    </div>
  );
}
