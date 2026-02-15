import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '../../ui/button';

interface ShareProductButtonProps {
  productBarcode: string;
}

export default function ShareProductButton({ productBarcode }: ShareProductButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${productBarcode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Producto',
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className="w-full gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          ¡Copiado!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Compartir Producto
        </>
      )}
    </Button>
  );
}
