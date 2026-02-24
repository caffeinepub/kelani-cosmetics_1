/**
 * ApiResponseHandler.ts
 * 
 * Standardize API error handling and response formatting.
 * Uses BigInt-aware JSON parsing for all responses.
 */

import { parseJSONWithBigInt } from './BigIntSerializer';

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string; // BigInt as string
}

/**
 * Standardized API error object
 */
export class ApiError extends Error {
  code: string;
  details?: any;
  status?: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: any, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

/**
 * Creates a standardized API error
 * @param message - Spanish user-facing error message
 * @param code - Error code for debugging
 * @param details - Optional error details
 * @param status - Optional HTTP status code
 * @returns ApiError instance
 */
export function createApiError(message: string, code?: string, details?: any, status?: number): ApiError {
  const errorCode = code || 'ERROR_DESCONOCIDO';
  const error = new ApiError(message, errorCode, details, status);
  
  // Log for developers
  console.error('[ApiResponseHandler] Error:', {
    code: errorCode,
    message,
    details,
    status,
  });

  return error;
}

/**
 * Handles API response with BigInt-aware JSON parsing
 * @param response - Fetch Response object
 * @returns Parsed response data
 * @throws ApiError on failure
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  try {
    // Check if response is OK
    if (!response.ok) {
      const errorMessage = `Error del servidor: ${response.status} ${response.statusText}`;
      throw createApiError(
        errorMessage,
        `HTTP_${response.status}`,
        undefined,
        response.status
      );
    }

    // Get response text
    const responseText = await response.text();

    // Parse with BigInt support
    let parsedData: any;
    try {
      parsedData = parseJSONWithBigInt(responseText);
    } catch (parseError) {
      throw createApiError(
        'Error al procesar la respuesta del servidor',
        'PARSE_ERROR',
        parseError
      );
    }

    // Check if response indicates success
    if (parsedData && typeof parsedData === 'object' && 'success' in parsedData) {
      const apiResponse = parsedData as ApiResponse<T>;
      
      if (!apiResponse.success) {
        const errorMessage = apiResponse.error?.message || 'Error desconocido del servidor';
        const errorCode = apiResponse.error?.code || 'SERVER_ERROR';
        throw createApiError(errorMessage, errorCode, apiResponse.error?.details);
      }

      // Return data if available
      if ('data' in apiResponse) {
        return apiResponse.data as T;
      }
    }

    // Return parsed data directly if not in ApiResponse format
    return parsedData as T;
  } catch (error) {
    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap other errors
    const message = error instanceof Error ? error.message : 'Error desconocido';
    throw createApiError(
      `Error de red: ${message}`,
      'NETWORK_ERROR',
      error
    );
  }
}

/**
 * Determines if a failed request should be retried
 * @param error - ApiError instance
 * @returns True if request should be retried
 */
export function shouldRetryRequest(error: ApiError): boolean {
  // Retry on network errors
  if (error.code === 'NETWORK_ERROR') {
    return true;
  }

  // Retry on server errors (5xx)
  if (error.status && error.status >= 500 && error.status < 600) {
    return true;
  }

  // Retry on specific HTTP errors
  if (error.status === 408 || error.status === 429 || error.status === 503) {
    return true;
  }

  // Don't retry on client errors (4xx) except the above
  if (error.status && error.status >= 400 && error.status < 500) {
    return false;
  }

  // Don't retry on validation errors
  if (error.code === 'VALIDATION_ERROR' || error.code === 'PARSE_ERROR') {
    return false;
  }

  // Default: don't retry
  return false;
}
