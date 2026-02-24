import { useNavigate, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Package,
  Tag,
  FolderTree,
  Users,
  Store,
  Download,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
  },
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
    title: 'Usuarios Admin',
    icon: Users,
    path: '/admin/user-management',
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

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleNavigate = (path: string) => {
    navigate({ to: path });
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
            <span className="text-lg font-semibold">Menú</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
