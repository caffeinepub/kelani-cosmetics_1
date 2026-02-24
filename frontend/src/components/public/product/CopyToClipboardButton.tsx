import { useState, ComponentPropsWithoutRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '../../../stores/toastStore';

interface CopyToClipboardButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  textToCopy: string;
  showLabel?: boolean;
}

export default function CopyToClipboardButton({
  textToCopy,
  showLabel = false,
  children,
  ...buttonProps
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        toast.success('Enlace copiado al portapapeles');
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
            toast.success('Enlace copiado al portapapeles');
            setTimeout(() => setCopied(false), 2000);
          } else {
            throw new Error('Copy command failed');
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Error al copiar el enlace');
    }
  };

  if (showLabel) {
    return (
      <Button onClick={handleCopy} {...buttonProps}>
        {copied ? (
          <>
            <Check className="h-5 w-5 mr-2" />
            {children || 'Copiado'}
          </>
        ) : (
          children || (
            <>
              <Copy className="h-5 w-5 mr-2" />
              Copiar
            </>
          )
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleCopy}
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      aria-label={copied ? 'Copiado' : 'Copiar al portapapeles'}
      {...buttonProps}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
