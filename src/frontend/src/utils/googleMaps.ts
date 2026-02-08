/**
 * Utility for parsing store coordinates and generating Google Maps links
 */

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Safely parse coordinates JSON string and return Google Maps directions URL
 * Returns null if parsing fails
 */
export function parseGoogleMapsCoordinates(coordinatesJson: string): string | null {
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

    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  } catch (error) {
    // Invalid JSON or missing properties
    return null;
  }
}
