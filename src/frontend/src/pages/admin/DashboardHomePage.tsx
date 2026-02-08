import DashboardNavCard from '../../components/admin/DashboardNavCard';
import {
  Package,
  Tag,
  FolderTree,
  Store,
  Download,
  Upload,
} from 'lucide-react';

export default function DashboardHomePage() {
  const cards = [
    {
      title: 'Productos',
      icon: Package,
      path: '/admin/products',
    },
    {
      title: 'Productos en Oferta',
      icon: Tag,
      path: '/admin/on-sale-products',
    },
    {
      title: 'Categorías',
      icon: FolderTree,
      path: '/admin/categories',
    },
    {
      title: 'Datos de Tienda',
      icon: Store,
      path: '/admin/store-details',
    },
    {
      title: 'Exportar',
      icon: Download,
      path: '/admin/export',
    },
    {
      title: 'Importar',
      icon: Upload,
      path: '/admin/import',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Panel de Administración
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona tu tienda de cosméticos desde aquí
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <DashboardNavCard
            key={card.path}
            title={card.title}
            icon={card.icon}
            path={card.path}
          />
        ))}
      </div>
    </div>
  );
}
