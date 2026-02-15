import { useState, useRef, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import type { StoreDetails } from '../../../backend';

interface StockStatusIndicatorsProps {
  store1InStock: boolean;
  store2InStock: boolean;
  storeDetails: StoreDetails[];
  variant?: 'default' | 'compact';
}

export default function StockStatusIndicators({
  store1InStock,
  store2InStock,
  storeDetails,
  variant = 'default',
}: StockStatusIndicatorsProps) {
  const isMobile = useIsMobile();
  const [openTooltip, setOpenTooltip] = useState<'store1' | 'store2' | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const store1Name = storeDetails[0]?.name || 'Tienda 1';
  const store2Name = storeDetails[1]?.name || 'Tienda 2';

  const store1Tooltip = store1InStock
    ? `Disponible en ${store1Name}`
    : `Agotado en ${store1Name}`;
  const store2Tooltip = store2InStock
    ? `Disponible en ${store2Name}`
    : `Agotado en ${store2Name}`;

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle outside click for mobile
  useEffect(() => {
    if (!isMobile || !openTooltip) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenTooltip(null);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, openTooltip]);

  const handleTooltipToggle = (store: 'store1' | 'store2') => {
    if (!isMobile) return;

    if (openTooltip === store) {
      // Close if already open
      setOpenTooltip(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      // Open and set auto-dismiss timer (1 second for mobile)
      setOpenTooltip(store);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setOpenTooltip(null);
        timeoutRef.current = null;
      }, 1000);
    }
  };

  const handleStore1Click = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile) {
      e.stopPropagation();
      handleTooltipToggle('store1');
    }
  };

  const handleStore2Click = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile) {
      e.stopPropagation();
      handleTooltipToggle('store2');
    }
  };

  // Determine text size based on variant
  const textSizeClass = variant === 'compact' ? 'text-[0.625rem]' : 'text-xs';

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex gap-2" ref={containerRef}>
        <Tooltip open={isMobile ? openTooltip === 'store1' : undefined}>
          <TooltipTrigger asChild>
            <div
              className={`flex-1 rounded px-2 py-1 text-center ${textSizeClass} font-medium truncate ${
                store1InStock
                  ? 'bg-success/20 text-success'
                  : 'bg-destructive/20 text-destructive'
              } ${isMobile ? 'cursor-pointer active:opacity-70' : ''}`}
              onClick={handleStore1Click}
              onTouchEnd={handleStore1Click}
            >
              {store1Name}
            </div>
          </TooltipTrigger>
          <TooltipContent className="z-50">
            <p>{store1Tooltip}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip open={isMobile ? openTooltip === 'store2' : undefined}>
          <TooltipTrigger asChild>
            <div
              className={`flex-1 rounded px-2 py-1 text-center ${textSizeClass} font-medium truncate ${
                store2InStock
                  ? 'bg-success/20 text-success'
                  : 'bg-destructive/20 text-destructive'
              } ${isMobile ? 'cursor-pointer active:opacity-70' : ''}`}
              onClick={handleStore2Click}
              onTouchEnd={handleStore2Click}
            >
              {store2Name}
            </div>
          </TooltipTrigger>
          <TooltipContent className="z-50">
            <p>{store2Tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
