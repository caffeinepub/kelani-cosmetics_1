import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { StoreDetails } from '../../../hooks/useStoreDetailsQueries';

interface StoreDetailsFormProps {
  formData: StoreDetails;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export default function StoreDetailsForm({ formData, onChange, errors }: StoreDetailsFormProps) {
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
            <Label htmlFor="whatsapp">Número de WhatsApp *</Label>
            <Input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => onChange('whatsapp', e.target.value)}
              placeholder={formData.storeId === 1 ? "+34 600 111 111" : "+34 600 222 222"}
            />
            {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp}</p>}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Ej: Calle Principal 123, Madrid"
              rows={3}
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Descripción de la tienda"
              rows={3}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
        </div>
      </div>

      {/* Coordinates */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Coordenadas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitud *</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => onChange('latitude', parseFloat(e.target.value) || 0)}
              placeholder="Ej: 40.4168"
            />
            {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitud *</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => onChange('longitude', parseFloat(e.target.value) || 0)}
              placeholder="Ej: -3.7038"
            />
            {errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}
          </div>
        </div>
      </div>

      {/* Store Hours */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Horario de Atención</h3>
        <div className="space-y-3">
          {[
            { key: 'monday', label: 'Lunes' },
            { key: 'tuesday', label: 'Martes' },
            { key: 'wednesday', label: 'Miércoles' },
            { key: 'thursday', label: 'Jueves' },
            { key: 'friday', label: 'Viernes' },
            { key: 'saturday', label: 'Sábado' },
            { key: 'sunday', label: 'Domingo' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={formData.storeHours[key as keyof typeof formData.storeHours]}
                onChange={(e) =>
                  onChange('storeHours', {
                    ...formData.storeHours,
                    [key]: e.target.value,
                  })
                }
                placeholder="Ej: 9:00 AM - 9:00 PM o Cerrado"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
