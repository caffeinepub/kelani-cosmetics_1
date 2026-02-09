import { useState, useEffect } from 'react';
import { Loader2, MapPin, Phone, Mail, Navigation, MessageCircle } from 'lucide-react';
import { SiFacebook, SiInstagram } from 'react-icons/si';
import { Globe } from 'lucide-react';
import { useActor } from '../../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { translateDayToSpanish } from '../../utils/storeHoursFormat';
import { formatWhatsAppApiNumber } from '../../utils/phoneFormat';
import type { StoreDetails } from '../../backend';

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
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = useState<typeof rawActor>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Stabilize actor reference
  useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  const {
    data: storeDetailsData,
    isLoading,
    error,
    refetch,
  } = useQuery<StoreDetails[]>({
    queryKey: ['both-store-details'],
    queryFn: async () => {
      if (!stableActor) throw new Error('Actor not available');
      const bothStores = await stableActor.getBothStoreDetails();
      return bothStores.map(([_storeId, details]) => details);
    },
    enabled: !!stableActor,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });

  // Set initial loading to false when query settles
  useEffect(() => {
    if (!isLoading && (storeDetailsData !== undefined || error)) {
      setIsInitialLoading(false);
    }
  }, [isLoading, storeDetailsData, error]);

  // Show loading spinner during initial load
  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando información de contacto...</p>
      </div>
    );
  }

  // Show error state
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

  // Filter active stores
  const activeStores = storeDetailsData?.filter((store) => store.isActive) || [];

  // Show empty state if no stores
  if (activeStores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No hay información de tiendas disponible en este momento
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Page Header */}
      <div className="text-center py-8 space-y-3">
        <h1 className="text-4xl font-bold text-foreground">
          Contacto - Variety Discount Store
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Visítanos en nuestras tiendas o contáctanos directamente
        </p>
      </div>

      {/* Two-Store Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {activeStores.map((store, index) => {
          const coords = parseCoordinates(store.coordinates);
          const whatsappNumber = formatWhatsAppApiNumber(store.whatsapp);

          return (
            <div
              key={store.storeId.toString()}
              className="border border-border rounded-lg p-6 space-y-6 bg-card"
            >
              {/* Store Header */}
              <div className="border-b border-border pb-4">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {store.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tienda {index + 1}
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {coords ? (
                      <a
                        href={getDirectionsUrl(coords)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {store.address}
                      </a>
                    ) : (
                      <span className="text-foreground">{store.address}</span>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <a
                    href={`tel:${store.phone}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {store.phone}
                  </a>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {store.whatsapp}
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <a
                    href={`mailto:${store.email}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {store.email}
                  </a>
                </div>

                {/* Social Media Links */}
                <div className="flex items-center gap-4 pt-2">
                  {store.facebook && (
                    <a
                      href={
                        store.facebook.startsWith('http')
                          ? store.facebook
                          : `https://facebook.com${store.facebook}`
                      }
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
                      href={
                        store.instagram.startsWith('http')
                          ? store.instagram
                          : `https://instagram.com/${store.instagram.replace('@', '')}`
                      }
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
                      href={
                        store.website.startsWith('http')
                          ? store.website
                          : `https://${store.website}`
                      }
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

              {/* Store Hours */}
              {store.storeHours && store.storeHours.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground">
                    Horario de Apertura
                  </h3>
                  <div className="space-y-2">
                    {store.storeHours.map(([day, hours]) => (
                      <div key={day} className="space-y-0.5">
                        <div className="font-medium text-foreground">
                          {translateDayToSpanish(day)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {hours}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Section */}
              {coords ? (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground">
                    Nuestra Ubicación
                  </h3>
                  <div className="space-y-3">
                    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-border">
                      <iframe
                        src={getMapEmbedUrl(coords)}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Mapa de ${store.name}`}
                      />
                    </div>
                    <Button
                      asChild
                      className="w-full"
                    >
                      <a
                        href={getDirectionsUrl(coords)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Obtener Direcciones
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Información de ubicación no disponible
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Partial Data Message */}
      {activeStores.length === 1 && storeDetailsData && storeDetailsData.length > 1 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Una de nuestras tiendas no está disponible temporalmente
          </p>
        </div>
      )}
    </div>
  );
}
