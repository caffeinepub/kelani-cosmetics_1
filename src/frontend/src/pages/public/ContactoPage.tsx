import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, MapPin, Phone, Mail, Navigation, MessageCircle, Map as MapIcon } from 'lucide-react';
import { SiFacebook, SiInstagram } from 'react-icons/si';
import { Globe } from 'lucide-react';
import { useBothStoreDetails } from '../../hooks/useBothStoreDetails';
import { Button } from '../../components/ui/button';
import { translateDayToSpanish } from '../../utils/storeHoursFormat';
import { formatWhatsAppApiNumber } from '../../utils/phoneFormat';
import { isConsentAccepted, setConsent } from '../../utils/cookieUtils';

interface ParsedCoordinates {
  lat: number;
  lng: number;
}

function parseCoordinates(coordinatesJson: string): ParsedCoordinates | null {
  try {
    const coords = JSON.parse(coordinatesJson);
    if (
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      !isNaN(coords.lat) &&
      !isNaN(coords.lng)
    ) {
      return coords;
    }
    return null;
  } catch {
    return null;
  }
}

function getDirectionsUrl(coords: ParsedCoordinates): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
}

function getMapEmbedUrl(coords: ParsedCoordinates): string {
  return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${coords.lat},${coords.lng}&zoom=15`;
}

export default function ContactoPage() {
  const queryClient = useQueryClient();
  const [showMaps, setShowMaps] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check consent status on mount and listen for changes
  useEffect(() => {
    const checkConsent = () => {
      setShowMaps(isConsentAccepted());
    };

    checkConsent();

    // Listen for consent changes
    const handleConsentChange = () => {
      checkConsent();
    };

    window.addEventListener('cookie-consent-changed', handleConsentChange);

    return () => {
      window.removeEventListener('cookie-consent-changed', handleConsentChange);
    };
  }, []);

  // Fetch store details using shared hook
  const { data: storeDetailsData, isLoading, error, refetch } = useBothStoreDetails();

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['store-details'], exact: false });
    };
  }, [queryClient]);

  const handleEnableMaps = () => {
    setConsent('accepted');
    setShowMaps(true);
  };

  // Show loading spinner during initial load
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando información de contacto...</p>
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive">Error al cargar la información de contacto</p>
        <Button onClick={() => refetch()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  // Empty state
  if (!storeDetailsData || storeDetailsData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay información de contacto disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Contacto</h1>
        <p className="text-lg text-muted-foreground">
          Visítanos en cualquiera de nuestras dos tiendas
        </p>
      </div>

      {/* Store Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {storeDetailsData.map((store) => {
          const coords = parseCoordinates(store.coordinates);
          const directionsUrl = coords ? getDirectionsUrl(coords) : null;
          const mapEmbedUrl = coords ? getMapEmbedUrl(coords) : null;

          return (
            <div
              key={store.storeId}
              className="bg-card border border-border rounded-lg p-6 space-y-6"
            >
              {/* Store Name */}
              <h2 className="text-2xl font-bold text-foreground">{store.name}</h2>

              {/* Contact Information */}
              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Dirección</p>
                    <p className="text-muted-foreground">{store.address}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Teléfono</p>
                    <a
                      href={`tel:${store.phone}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {store.phone}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">WhatsApp</p>
                    <a
                      href={`https://wa.me/${formatWhatsAppApiNumber(store.whatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {store.whatsapp}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a
                      href={`mailto:${store.email}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {store.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Store Hours */}
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3">Horario</h3>
                <div className="space-y-2">
                  {store.storeHours.map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{translateDayToSpanish(day)}</span>
                      <span className="text-foreground font-medium">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              {(store.facebook || store.instagram || store.website) && (
                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-3">Redes Sociales</h3>
                  <div className="flex gap-3">
                    {store.facebook && (
                      <a
                        href={`https://facebook.com${store.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Facebook"
                      >
                        <SiFacebook className="h-6 w-6" />
                      </a>
                    )}
                    {store.instagram && (
                      <a
                        href={`https://instagram.com/${store.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Instagram"
                      >
                        <SiInstagram className="h-6 w-6" />
                      </a>
                    )}
                    {store.website && (
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Sitio Web"
                      >
                        <Globe className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Map Section - Conditional Rendering */}
              {mapEmbedUrl && (
                <div className="pt-4 border-t border-border space-y-3">
                  <h3 className="font-semibold text-foreground">Ubicación</h3>

                  {showMaps ? (
                    <>
                      <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                        <iframe
                          src={mapEmbedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Mapa de ${store.name}`}
                        />
                      </div>
                      {directionsUrl && (
                        <Button asChild variant="outline" className="w-full">
                          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                            <Navigation className="h-4 w-4 mr-2" />
                            Cómo llegar
                          </a>
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="bg-muted rounded-lg p-6 space-y-4 text-center">
                      <MapIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Los mapas requieren cookies para funcionar.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Acepta las cookies para ver el mapa integrado.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button onClick={handleEnableMaps} size="sm" variant="default">
                          Aceptar cookies
                        </Button>
                        {directionsUrl && (
                          <Button asChild size="sm" variant="outline">
                            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                              <Navigation className="h-4 w-4 mr-2" />
                              Ver en Google Maps
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
