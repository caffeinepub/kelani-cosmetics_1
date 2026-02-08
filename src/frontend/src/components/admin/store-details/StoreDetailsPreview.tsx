import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { StoreDetails } from '../../../hooks/useStoreDetailsQueries';
import { formatStoreHoursForDisplay } from '../../../utils/storeHoursFormat';

interface StoreDetailsPreviewProps {
  formData: StoreDetails;
}

export default function StoreDetailsPreview({ formData }: StoreDetailsPreviewProps) {
  const formattedHours = formatStoreHoursForDisplay(formData.storeHours);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Vista Previa</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Así se verá la información en la página de contacto
        </p>
      </div>

      {/* Store Name */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">{formData.name || 'Nombre de la Tienda'}</h2>
        {formData.description && (
          <p className="mt-2 text-muted-foreground">{formData.description}</p>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-foreground">{formData.address || 'Dirección no especificada'}</p>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-foreground">{formData.phone || 'Teléfono no especificado'}</p>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-foreground">{formData.email || 'Email no especificado'}</p>
        </div>
      </div>

      {/* Store Hours */}
      {formattedHours.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Horario de Atención</h3>
          </div>
          <div className="space-y-2 pl-7">
            {formattedHours.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.day}:</span>
                <span className="text-foreground font-medium">{item.hours}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coordinates */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Coordenadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
        </p>
      </div>
    </div>
  );
}
