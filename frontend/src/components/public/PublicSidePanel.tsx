import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { X, Home, Mail, Shield, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { usePublicCategories } from '../../hooks/usePublicCategories';

interface PublicSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PublicSidePanel({ isOpen, onClose }: PublicSidePanelProps) {
  const { data: categories, isLoading, isError } = usePublicCategories(isOpen);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Side Panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-card border-r shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b shrink-0">
            <Link 
              to="/" 
              onClick={onClose}
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              Kelani Cosmetics
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Content - Fixed Section */}
          <div className="p-4 space-y-2 shrink-0">
            {/* Main Links */}
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px]"
            >
              <Home className="h-4 w-4 shrink-0" />
              Inicio
            </Link>
            
            <Link
              to="/contacto"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px]"
            >
              <Mail className="h-4 w-4 shrink-0" />
              Contacto
            </Link>

            <Link
              to="/privacy"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px]"
            >
              <Shield className="h-4 w-4 shrink-0" />
              Política de Privacidad
            </Link>
          </div>

          <Separator className="shrink-0" />

          {/* Categories Section - Scrollable */}
          <div className="flex flex-col min-h-0 flex-1 px-4 pt-4">
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
              Categorías
            </h3>
            
            {/* Scrollable Categories Container */}
            <div className="public-sidepanel-categories-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Cargando categorías...
                  </span>
                </div>
              )}

              {isError && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Error al cargar categorías
                </div>
              )}

              {!isLoading && !isError && categories && categories.length > 0 && (
                <div className="space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.categoryId}
                      to="/category/$id"
                      params={{ id: category.categoryId.toString() }}
                      onClick={onClose}
                      className="flex items-center px-3 py-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px]"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              {!isLoading && !isError && categories && categories.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No hay categorías disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
