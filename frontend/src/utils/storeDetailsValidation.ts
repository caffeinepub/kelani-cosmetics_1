import { safeConvertToNumber } from './NumericConverter';

// StoreDetails validation type (without description field which doesn't exist in backend)
export interface StoreDetailsFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  latitude: number;
  longitude: number;
  storeHours: Array<[string, string]>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone: string): boolean {
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-()+ ]+$/;
  return phone.length >= 9 && phoneRegex.test(phone);
}

/**
 * Validate WhatsApp number (basic validation)
 */
export function validateWhatsApp(whatsapp: string): boolean {
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const whatsappRegex = /^[\d\s\-()+ ]+$/;
  return whatsapp.length >= 9 && whatsappRegex.test(whatsapp);
}

/**
 * Validate latitude (-90 to 90)
 */
export function validateLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

/**
 * Validate longitude (-180 to 180)
 */
export function validateLongitude(lng: number): boolean {
  return lng >= -180 && lng <= 180;
}

/**
 * Validate complete store details form
 */
export function validateStoreDetails(formData: StoreDetailsFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (!formData.name || !formData.name.trim()) {
    errors.name = 'El nombre de la tienda es requerido';
  }

  // Email validation
  if (!formData.email || !formData.email.trim()) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'El formato del correo electrónico no es válido';
  }

  // Phone validation
  if (!formData.phone || !formData.phone.trim()) {
    errors.phone = 'El teléfono es requerido';
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'El formato del teléfono no es válido';
  }

  // WhatsApp validation
  if (!formData.whatsapp || !formData.whatsapp.trim()) {
    errors.whatsapp = 'El número de WhatsApp es requerido';
  } else if (!validateWhatsApp(formData.whatsapp)) {
    errors.whatsapp = 'El formato del número de WhatsApp no es válido';
  }

  // Address validation
  if (!formData.address || !formData.address.trim()) {
    errors.address = 'La dirección es requerida';
  }

  // Latitude validation
  if (!validateLatitude(formData.latitude)) {
    errors.latitude = 'La latitud debe estar entre -90 y 90';
  }

  // Longitude validation
  if (!validateLongitude(formData.longitude)) {
    errors.longitude = 'La longitud debe estar entre -180 y 180';
  }

  // Store hours validation
  if (!formData.storeHours || formData.storeHours.length === 0) {
    errors.storeHours = 'Los horarios de la tienda son requeridos';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
