/**
 * Utility for parsing store coordinates and generating Google Maps links
 */

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Parse coordinates JSON string into typed object
 * Returns null if parsing fails or coordinates are invalid
 */
export function parseCoordinates(coordinatesJson: string): Coordinates | null {
  try {
    const coords: Coordinates = JSON.parse(coordinatesJson);
    
    if (
      typeof coords.lat !== 'number' ||
      typeof coords.lng !== 'number' ||
      isNaN(coords.lat) ||
      isNaN(coords.lng)
    ) {
      return null;
    }

    return coords;
  } catch (error) {
    // Invalid JSON or missing properties
    return null;
  }
}

/**
 * Generate Google Maps directions URL from coordinates
 * Returns null if coordinates are invalid
 */
export function getDirectionsUrl(coordinatesJson: string): string | null {
  const coords = parseCoordinates(coordinatesJson);
  
  if (!coords) {
    return null;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
}

/**
 * Safely parse coordinates JSON string and return Google Maps directions URL
 * Returns null if parsing fails
 * @deprecated Use parseCoordinates and getDirectionsUrl separately for better type safety
 */
export function parseGoogleMapsCoordinates(coordinatesJson: string): string | null {
  return getDirectionsUrl(coordinatesJson);
}
