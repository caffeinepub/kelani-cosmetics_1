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
  const handleStoreHourChange = (dayIndex: number, value: string) => {
    const newStoreHours = [...formData.storeHours];
    newStoreHours[dayIndex] = [newStoreHours[dayIndex][0], value];
    onChange('storeHours', newStoreHours);
  };

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Información Básica</h3>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Nombre de la Tienda *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Nombre de la tienda"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Dirección *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Dirección completa"
              rows={3}
              className={errors.address ? 'border-destructive' : ''}
            />
            {errors.address && <p className="mt-1 text-sm text-destructive">{errors.address}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="email@ejemplo.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="+34 123 456 789"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
          </div>

          {/* WhatsApp */}
          <div>
            <Label htmlFor="whatsapp">
              WhatsApp {formData.storeId === 1 ? '(Para pedidos)' : '(Para pedidos)'} *
            </Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => onChange('whatsapp', e.target.value)}
              placeholder="+34 123 456 789"
              className={errors.whatsapp ? 'border-destructive' : ''}
            />
            {errors.whatsapp && <p className="mt-1 text-sm text-destructive">{errors.whatsapp}</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Redes Sociales</h3>
        <div className="space-y-4">
          {/* Facebook */}
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={formData.facebook || ''}
              onChange={(e) => onChange('facebook', e.target.value || undefined)}
              placeholder="https://facebook.com/..."
            />
          </div>

          {/* Instagram */}
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.instagram || ''}
              onChange={(e) => onChange('instagram', e.target.value || undefined)}
              placeholder="https://instagram.com/..."
            />
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="website">Sitio Web</Label>
            <Input
              id="website"
              value={formData.website || ''}
              onChange={(e) => onChange('website', e.target.value || undefined)}
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Ubicación</h3>
        <div className="space-y-4">
          {/* Latitude */}
          <div>
            <Label htmlFor="latitude">Latitud *</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => onChange('latitude', parseFloat(e.target.value) || 0)}
              placeholder="41.625415"
              className={errors.latitude ? 'border-destructive' : ''}
            />
            {errors.latitude && <p className="mt-1 text-sm text-destructive">{errors.latitude}</p>}
          </div>

          {/* Longitude */}
          <div>
            <Label htmlFor="longitude">Longitud *</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => onChange('longitude', parseFloat(e.target.value) || 0)}
              placeholder="2.656324"
              className={errors.longitude ? 'border-destructive' : ''}
            />
            {errors.longitude && <p className="mt-1 text-sm text-destructive">{errors.longitude}</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Horario de Atención</h3>
        <div className="space-y-3">
          {daysOfWeek.map((day, index) => (
            <div key={day} className="flex items-center gap-3">
              <Label className="w-24 text-sm">{day}</Label>
              <Input
                value={formData.storeHours[index]?.[1] || ''}
                onChange={(e) => handleStoreHourChange(index, e.target.value)}
                placeholder="9:00-20:00 o Closed"
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
