import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { StoreDetails } from '../../../hooks/useStoreDetailsQueries';
import { translateDayToSpanish } from '../../../utils/storeHoursFormat';

interface StoreDetailsPreviewProps {
  formData: StoreDetails;
}

export default function StoreDetailsPreview({ formData }: StoreDetailsPreviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Vista Previa</h3>
        <p className="text-sm text-muted-foreground">
          Así se verá la información en la página de contacto
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-6">
        {/* Store Name */}
        <div>
          <h4 className="text-xl font-bold text-foreground">{formData.name}</h4>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
          <p className="text-sm text-foreground">{formData.address}</p>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
          <p className="text-sm text-foreground">{formData.phone}</p>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
          <p className="text-sm text-foreground">{formData.email}</p>
        </div>

        {/* Store Hours */}
        <div className="flex items-start gap-3">
          <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
          <div className="flex-1 space-y-1">
            {formData.storeHours.map(([day, hours]) => (
              <div key={day} className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{translateDayToSpanish(day)}:</span>
                <span className="text-muted-foreground">{hours}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coordinates */}
        <div className="mt-4 rounded border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">
            Coordenadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
}
