import { useParams } from '@tanstack/react-router';

export default function CategoryPage() {
  const { id } = useParams({ from: '/public/category/$id' });

  return (
    <div className="space-y-8">
      <div className="py-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Categoría
        </h1>
        <p className="text-lg text-muted-foreground">
          Mostrando productos de la categoría ID: {id}
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Listado de productos próximamente...
        </p>
      </div>
    </div>
  );
}
