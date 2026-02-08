/**
 * Formats store hours for display
 */

export interface StoreHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface FormattedStoreHours {
  day: string;
  hours: string;
}

const DAY_LABELS: Record<keyof StoreHours, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

/**
 * Formats store hours as a list for display
 */
export function formatStoreHoursForDisplay(storeHours: StoreHours): FormattedStoreHours[] {
  const days: Array<keyof StoreHours> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  return days.map((day) => ({
    day: DAY_LABELS[day],
    hours: storeHours[day] || 'Cerrado',
  }));
}

/**
 * Gets Spanish day label
 */
export function getDayLabel(day: keyof StoreHours): string {
  return DAY_LABELS[day];
}
