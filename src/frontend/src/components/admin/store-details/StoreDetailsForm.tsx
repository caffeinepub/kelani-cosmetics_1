import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { StoreDetails } from '../../../hooks/useStoreDetailsQueries';
import { getDayLabel } from '../../../utils/storeHoursFormat';

interface StoreDetailsFormProps {
  formData: StoreDetails;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export default function StoreDetailsForm({ formData, onChange, errors }: StoreDetailsFormProps) {
  const handleStoreHoursChange = (day: string, value: string) => {
    onChange('storeHours', {
      ...formData.storeHours,
      [day]: value,
    });
  };

  const days: Array<keyof typeof formData.storeHours> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  return (
    <div className="space-y-6">
      {/* Store Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Información de la Tienda</h3>

        {/* Store Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nombre de la Tienda <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Kelani Cosmetics - Tienda 1"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email de la Tienda <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="tienda1@kelani.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            WhatsApp <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+34 600 111 111"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Dirección <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Calle Principal, 123&#10;28001 Madrid, España"
            rows={3}
            className={errors.address ? 'border-destructive' : ''}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Descripción de la Tienda <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Tienda especializada en cosmética y productos de belleza."
            rows={3}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        {/* Coordinates */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Coordenadas del Mapa</Label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-sm text-muted-foreground">
                Latitud
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => onChange('latitude', e.target.value)}
                placeholder="36.69699092702079"
                className={errors.latitude ? 'border-destructive' : ''}
              />
              {errors.latitude && (
                <p className="text-sm text-destructive">{errors.latitude}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-sm text-muted-foreground">
                Longitud
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => onChange('longitude', e.target.value)}
                placeholder="-4.447439687321973"
                className={errors.longitude ? 'border-destructive' : ''}
              />
              {errors.longitude && (
                <p className="text-sm text-destructive">{errors.longitude}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Store Hours Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Horario de Apertura</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Formato: 9:30 am–10 pm (horas continuas) o 9:30 am–2 pm, 5–10 pm (con pausa)
          </p>
        </div>

        <div className="space-y-3">
          {days.map((day) => (
            <div key={day} className="space-y-2">
              <Label htmlFor={`hours-${day}`} className="text-sm font-medium">
                {getDayLabel(day)}
              </Label>
              <Input
                id={`hours-${day}`}
                value={formData.storeHours[day]}
                onChange={(e) => handleStoreHoursChange(day, e.target.value)}
                placeholder="9:30 am–10 pm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
