import React from 'react';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Vista Previa</h3>
        <p className="text-sm text-muted-foreground">
          Así se verá la información en la página de contacto
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        {/* Store Name */}
        <div>
          <h4 className="text-xl font-bold text-foreground">{formData.name || 'Nombre de la tienda'}</h4>
        </div>

        {/* Description */}
        {formData.description && (
          <div>
            <p className="text-sm text-muted-foreground">{formData.description}</p>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Dirección</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {formData.address || 'Dirección no especificada'}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Email</p>
            <p className="text-sm text-muted-foreground">
              {formData.email || 'email@ejemplo.com'}
            </p>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">WhatsApp</p>
            <p className="text-sm text-muted-foreground">
              {formData.phone || '+34 600 000 000'}
            </p>
          </div>
        </div>

        {/* Store Hours */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-2">Horario</p>
            <div className="space-y-1">
              {formattedHours.map((item) => (
                <div key={item.day} className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{item.day}:</span>
                  <span className="text-muted-foreground">{item.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
