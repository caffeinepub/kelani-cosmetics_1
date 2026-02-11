import { formatWhatsAppApiNumber } from './phoneFormat';

/**
 * Build WhatsApp message for product contact in Spanish
 */
export function buildProductWhatsAppMessage(productName: string, barcode: string): string {
  return `Hola, estoy interesado en el producto:\n${productName}\nCódigo de barras: ${barcode}`;
}

/**
 * Build complete WhatsApp URL with pre-filled message
 */
export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const formattedNumber = formatWhatsAppApiNumber(whatsappNumber);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
}

/**
 * Open WhatsApp with product contact message
 */
export function openWhatsAppForProduct(
  whatsappNumber: string,
  productName: string,
  barcode: string
): void {
  const message = buildProductWhatsAppMessage(productName, barcode);
  const url = buildWhatsAppUrl(whatsappNumber, message);
  window.open(url, '_blank');
}
