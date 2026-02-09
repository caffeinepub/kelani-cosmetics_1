import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { StoreDetails } from '../../../hooks/useStoreDetailsQueries';

interface StoreDetailsPreviewProps {
  formData: StoreDetails;
}

export default function StoreDetailsPreview({ formData }: StoreDetailsPreviewProps) {
  // Convert storeHours array to display format
  const daysInSpanish: Record<string, string> = {
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado',
    'Sunday': 'Domingo',
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Vista Previa</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Así se verá la información en la página de contacto
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        {/* Store Name */}
        <div>
          <h4 className="text-xl font-bold text-foreground">{formData.name}</h4>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Dirección</p>
            <p className="text-sm text-muted-foreground">{formData.address}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Teléfono</p>
            <p className="text-sm text-muted-foreground">{formData.phone}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Email</p>
            <p className="text-sm text-muted-foreground">{formData.email}</p>
          </div>
        </div>

        {/* Store Hours */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-2">Horarios</p>
            <div className="space-y-1">
              {formData.storeHours.map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{daysInSpanish[day] || day}:</span>
                  <span className="text-foreground font-medium">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media */}
        {(formData.facebook || formData.instagram || formData.website) && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-2">Redes Sociales</p>
            <div className="space-y-1">
              {formData.facebook && (
                <p className="text-sm text-muted-foreground">Facebook: {formData.facebook}</p>
              )}
              {formData.instagram && (
                <p className="text-sm text-muted-foreground">Instagram: {formData.instagram}</p>
              )}
              {formData.website && (
                <p className="text-sm text-muted-foreground">Web: {formData.website}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
