import { useState, ComponentPropsWithoutRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
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
