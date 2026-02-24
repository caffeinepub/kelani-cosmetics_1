import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../ui/button';
import { openWhatsAppForProduct } from '../../../utils/whatsappContact';
import type { StoreDetails } from '../../../backend';

interface StoreSelectorProps {
  productName: string;
  barcode: string;
  storeDetails: StoreDetails[] | null;
}

export default function StoreSelector({ productName, barcode, storeDetails }: StoreSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleStoreSelect = (store: StoreDetails) => {
    openWhatsAppForProduct(store.whatsapp, productName, barcode);
    // Optionally collapse after selection
    setIsExpanded(false);
  };

  const hasStores = storeDetails && storeDetails.length > 0;

  return (
    <div className="space-y-3">
      {/* Main Toggle Button */}
      <Button
        onClick={handleToggle}
        className="w-full"
        size="lg"
        disabled={!hasStores}
      >
        <span className="flex-1">Contactar sobre este producto</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 ml-2" />
        ) : (
          <ChevronDown className="h-5 w-5 ml-2" />
        )}
      </Button>

      {/* Expandable Store Options */}
      {isExpanded && hasStores && (
        <div
          className="space-y-2 animate-in slide-in-from-top-2 duration-200"
          role="region"
          aria-label="Seleccionar tienda"
        >
          {storeDetails.map((store) => (
            <Button
              key={store.storeId.toString()}
              onClick={() => handleStoreSelect(store)}
              variant="outline"
              size="lg"
              className="w-full min-h-[44px] justify-start text-left"
            >
              {store.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
