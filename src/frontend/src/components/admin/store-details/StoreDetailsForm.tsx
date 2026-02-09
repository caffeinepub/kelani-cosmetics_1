import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { StoreDetails } from '../../../hooks/useStoreDetailsQueries';

interface StoreDetailsFormProps {
  formData: StoreDetails;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export default function StoreDetailsForm({ formData, onChange, errors }: StoreDetailsFormProps) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const daysInSpanish = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Convert storeHours array to object for easier access
  const storeHoursMap = new Map(formData.storeHours);

  const handleStoreHourChange = (day: string, value: string) => {
    const newStoreHours = formData.storeHours.map(([d, h]) => 
      d === day ? [d, value] as [string, string] : [d, h] as [string, string]
    );
    onChange('storeHours', newStoreHours);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Información General</h3>
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Tienda *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Ej: Kelani Cosmetics"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="Ej: contacto@kelani.com"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="Ej: +34 123 456 789"
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => onChange('whatsapp', e.target.value)}
              placeholder={
                formData.storeId === 1
                  ? 'Ej: +34 600 111 111'
                  : 'Ej: +34 600 222 222'
              }
            />
            {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp}</p>}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Ej: Calle Principal 123, Madrid"
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Redes Sociales (Opcional)</h3>
        <div className="space-y-4">
          {/* Facebook */}
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={formData.facebook ?? ''}
              onChange={(e) => onChange('facebook', e.target.value || undefined)}
              placeholder="Ej: /KelaniCosmetics"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.instagram ?? ''}
              onChange={(e) => onChange('instagram', e.target.value || undefined)}
              placeholder="Ej: @kelanicosmetics"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Sitio Web</Label>
            <Input
              id="website"
              type="url"
              value={formData.website ?? ''}
              onChange={(e) => onChange('website', e.target.value || undefined)}
              placeholder="Ej: https://kelani.com"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Coordenadas *</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Latitude */}
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitud</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={formData.latitude}
              onChange={(e) => onChange('latitude', e.target.value)}
              placeholder="Ej: 40.416775"
            />
            {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
          </div>

          {/* Longitude */}
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitud</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={formData.longitude}
              onChange={(e) => onChange('longitude', e.target.value)}
              placeholder="Ej: -3.703790"
            />
            {errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Horarios de Atención *</h3>
        <div className="space-y-3">
          {daysOfWeek.map((day, index) => (
            <div key={day} className="grid grid-cols-[120px_1fr] gap-4 items-center">
              <Label htmlFor={`hours-${day}`} className="text-sm">
                {daysInSpanish[index]}
              </Label>
              <Input
                id={`hours-${day}`}
                value={storeHoursMap.get(day) || ''}
                onChange={(e) => handleStoreHourChange(day, e.target.value)}
                placeholder="Ej: 9:00 AM - 9:00 PM"
              />
            </div>
          ))}
          {errors.storeHours && <p className="text-sm text-destructive">{errors.storeHours}</p>}
        </div>
      </div>
    </div>
  );
}
