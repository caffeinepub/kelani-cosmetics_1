import { Link } from '@tanstack/react-router';
import { MapPin, Phone, MessageCircle, Clock, Loader2 } from 'lucide-react';
import { useBothStoreDetails } from '../../hooks/useBothStoreDetails';
import { parseGoogleMapsCoordinates } from '../../utils/googleMaps';
import { formatSpanishPhoneDisplay, formatWhatsAppApiNumber } from '../../utils/phoneFormat';
import { translateDayToSpanish } from '../../utils/storeHoursFormat';

export default function PublicFooter() {
  const { data: stores, isLoading, isError } = useBothStoreDetails();

  return (
    <footer className="w-full border-t bg-muted/30 mt-auto">
      {/* Top Banner */}
      <div className="w-full bg-primary/5 border-b">
        <div className="mx-auto max-w-[1200px] px-4 py-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Kelani Cosmetics
          </h2>
          <p className="text-lg text-muted-foreground">
            Cosmética y belleza premium
          </p>
        </div>
      </div>

      {/* Store Information */}
      {isLoading && (
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Cargando información de tienda...
            </span>
          </div>
        </div>
      )}

      {isError && (
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <div className="text-center text-muted-foreground">
            Error al cargar la información de las tiendas
          </div>
        </div>
      )}

      {!isLoading && !isError && stores && stores.length > 0 && (
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          {/* Desktop: 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {stores.map((store) => (
              <StoreColumn key={store.storeId} store={store} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Row: Links & Copyright */}
      <div className="border-t">
        <div className="mx-auto max-w-[1200px] px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link
                to="/contacto"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contacto
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Política de Privacidad
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Kelani Cosmetics. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface StoreColumnProps {
  store: {
    storeId: bigint;
    name: string;
    address: string;
    phone: string;
    whatsapp: string;
    coordinates: string;
    storeHours: Array<[string, string]>;
  };
}

function StoreColumn({ store }: StoreColumnProps) {
  const mapsLink = parseGoogleMapsCoordinates(store.coordinates);

  return (
    <div className="space-y-4">
      {/* Store Name */}
      <h3 className="text-xl font-semibold text-foreground mb-4">
        {store.name}
      </h3>

      {/* Address */}
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          {mapsLink ? (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground hover:text-primary transition-colors whitespace-pre-line"
            >
              {store.address}
            </a>
          ) : (
            <p className="text-sm text-foreground whitespace-pre-line">
              {store.address}
            </p>
          )}
        </div>
      </div>

      {/* WhatsApp */}
      <div className="flex items-center gap-3">
        <MessageCircle className="h-5 w-5 text-primary flex-shrink-0" />
        <a
          href={`https://wa.me/${formatWhatsAppApiNumber(store.whatsapp)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-foreground hover:text-primary transition-colors"
        >
          {formatSpanishPhoneDisplay(store.whatsapp)} (Para pedidos)
        </a>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-3">
        <Phone className="h-5 w-5 text-primary flex-shrink-0" />
        <a
          href={`tel:${store.phone}`}
          className="text-sm text-foreground hover:text-primary transition-colors"
        >
          {formatSpanishPhoneDisplay(store.phone)}
        </a>
      </div>

      {/* Store Hours */}
      {store.storeHours && store.storeHours.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              HORARIO DE APERTURA
            </h4>
          </div>
          <div className="space-y-1 pl-7">
            {store.storeHours.map(([day, hours]) => (
              <div key={day} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {translateDayToSpanish(day)}:
                </span>{' '}
                {hours}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
