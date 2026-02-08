import { safeConvertToNumber } from './NumericConverter';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface StoreDetailsFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  latitude: string | number;
  longitude: string | number;
  storeHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  if (!email || email.trim() === '') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates phone number (basic validation)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim() === '') {
    return false;
  }
  // Allow digits, spaces, +, -, (, )
  const phoneRegex = /^[\d\s+\-()]+$/;
  const cleaned = phone.trim();
  return phoneRegex.test(cleaned) && cleaned.length >= 9;
}

/**
 * Validates latitude (-90 to 90)
 */
export function validateLatitude(lat: string | number): boolean {
  const num = safeConvertToNumber(lat);
  if (num === null) {
    return false;
  }
  return num >= -90 && num <= 90;
}

/**
 * Validates longitude (-180 to 180)
 */
export function validateLongitude(lng: string | number): boolean {
  const num = safeConvertToNumber(lng);
  if (num === null) {
    return false;
  }
  return num >= -180 && num <= 180;
}

/**
 * Validates all store details form fields
 */
export function validateStoreDetails(data: StoreDetailsFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Required field validations
  if (!data.name || data.name.trim() === '') {
    errors.name = 'El nombre de la tienda es obligatorio';
  }

  if (!data.email || data.email.trim() === '') {
    errors.email = 'El email es obligatorio';
  } else if (!validateEmail(data.email)) {
    errors.email = 'El formato del email no es válido';
  }

  if (!data.phone || data.phone.trim() === '') {
    errors.phone = 'El WhatsApp es obligatorio';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'El formato del número no es válido';
  }

  if (!data.address || data.address.trim() === '') {
    errors.address = 'La dirección es obligatoria';
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = 'La descripción es obligatoria';
  }

  // Coordinate validations
  if (!validateLatitude(data.latitude)) {
    errors.latitude = 'La latitud debe estar entre -90 y 90';
  }

  if (!validateLongitude(data.longitude)) {
    errors.longitude = 'La longitud debe estar entre -180 y 180';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
