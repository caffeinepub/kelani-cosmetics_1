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
import SeoHead from '../../components/seo/SeoHead';
import { contactoPageSeo } from '../../components/seo/seoPresets';

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

  // Fetch store details using shared hook with stable actor pattern
  const { data: storeDetailsArray, isInitialLoading, isFetched, error, refetch } = useBothStoreDetails();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['store-details'] });
    };
  }, [queryClient]);

  // Show loading spinner during initial actor initialization and first fetch
  if (isInitialLoading || !isFetched) {
    return (
      <>
        <SeoHead meta={contactoPageSeo} />
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando información de contacto...</p>
        </div>
      </>
    );
  }

  // Only show error after initial loading completes
  if (error) {
    return (
      <>
        <SeoHead meta={contactoPageSeo} />
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <p className="text-lg text-destructive">Error al cargar la información de contacto</p>
          <Button onClick={() => refetch()} variant="outline">
            Reintentar
          </Button>
        </div>
      </>
    );
  }

  // Only show empty state after initial loading completes
  if (!storeDetailsArray || storeDetailsArray.length === 0) {
    return (
      <>
        <SeoHead meta={contactoPageSeo} />
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-lg text-muted-foreground">No hay información de contacto disponible</p>
        </div>
      </>
    );
  }

  const handleAcceptCookies = () => {
    setConsent('accepted');
    setShowMaps(true);
    window.dispatchEvent(new Event('cookie-consent-changed'));
  };

  return (
    <>
      <SeoHead meta={contactoPageSeo} />

      <div className="space-y-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Contacto</h1>
          <p className="text-muted-foreground">Visítanos en nuestras tiendas o contáctanos</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {storeDetailsArray.map((store, index) => {
            const storeNumber = index + 1;
            const coords = parseCoordinates(store.coordinates);

            return (
              <div key={store.storeId.toString()} className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Tienda {storeNumber}
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Dirección</p>
                        <p className="text-sm text-muted-foreground">{store.address}</p>
                        {coords && (
                          <a
                            href={getDirectionsUrl(coords)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                          >
                            <Navigation className="h-4 w-4" />
                            Cómo llegar
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Teléfono</p>
                        <a
                          href={`tel:${store.phone}`}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {store.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">WhatsApp (Para pedidos)</p>
                        <a
                          href={`https://wa.me/${formatWhatsAppApiNumber(store.whatsapp)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {store.whatsapp}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <a
                          href={`mailto:${store.email}`}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {store.email}
                        </a>
                      </div>
                    </div>

                    {store.storeHours && store.storeHours.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <p className="font-medium text-foreground mb-2">Horario</p>
                        <div className="space-y-1">
                          {store.storeHours.map(([day, hours]) => (
                            <div key={day} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {translateDayToSpanish(day)}:
                              </span>
                              <span className="text-foreground font-medium">{hours}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(store.facebook || store.instagram || store.website) && (
                      <div className="pt-2 border-t border-border">
                        <p className="font-medium text-foreground mb-2">Redes Sociales</p>
                        <div className="flex gap-3">
                          {store.facebook && (
                            <a
                              href={store.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              aria-label="Facebook"
                            >
                              <SiFacebook className="h-5 w-5" />
                            </a>
                          )}
                          {store.instagram && (
                            <a
                              href={store.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              aria-label="Instagram"
                            >
                              <SiInstagram className="h-5 w-5" />
                            </a>
                          )}
                          {store.website && (
                            <a
                              href={store.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              aria-label="Sitio web"
                            >
                              <Globe className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {coords && (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {showMaps ? (
                      <iframe
                        title={`Mapa de Tienda ${storeNumber}`}
                        src={getMapEmbedUrl(coords)}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="h-[300px] flex flex-col items-center justify-center gap-4 p-6 text-center">
                        <MapIcon className="h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Para ver el mapa, necesitamos tu consentimiento para usar Google Maps
                        </p>
                        <Button onClick={handleAcceptCookies} size="sm">
                          Aceptar y mostrar mapa
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
