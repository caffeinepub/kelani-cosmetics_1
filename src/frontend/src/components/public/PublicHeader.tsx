import { Link } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';

interface PublicHeaderProps {
  onToggleSidePanel: () => void;
}

export default function PublicHeader({ onToggleSidePanel }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: Hamburger + Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidePanel}
              aria-label="Abrir menú de navegación"
              className="hover:bg-accent"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link 
              to="/" 
              className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
            >
              Kelani Cosmetics
            </Link>
          </div>

          {/* Right section: Contact link */}
          <nav>
            <Link
              to="/contacto"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors px-4 py-2"
            >
              Contacto
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
