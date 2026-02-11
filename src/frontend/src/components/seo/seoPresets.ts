import { SeoMetaTags } from './SeoHead';

const PRODUCTION_DOMAIN = 'https://kelanicosmetics.es';

export const homePageSeo: SeoMetaTags = {
  title: 'Kelani Cosmetics | Cosmética y cuidado capilar en Valencia y Málaga',
  description: 'Kelani Cosmetics, tu tienda especializada en productos de belleza, cuidado capilar y de la piel. Pelucas naturales y sintéticas. Tiendas en C/ de Bailèn, 34, València y P.º de los Tilos, 26, Málaga.',
  keywords: 'Kelani Cosmetics, cosmética Valencia, cuidado capilar Málaga, tienda cosmética València, tienda cosmética Málaga, productos de belleza, pelucas naturales, pelucas sintéticas, pelo natural, cuidado de la piel, aceites capilares, cremas faciales, champús profesionales, C/ de Bailèn 34 València, Pº de los Tilos 26 Málaga, Extramurs Valencia, Cruz de Humilladero Málaga',
  robots: 'index, follow',
  canonical: `${PRODUCTION_DOMAIN}/`,
  ogTitle: 'Kelani Cosmetics | Cosmética y cuidado capilar en Valencia y Málaga',
  ogDescription: 'Descubre Kelani Cosmetics: productos de belleza, cuidado capilar y pelucas de alta calidad. Tiendas físicas en València y Málaga. Visítanos en C/ de Bailèn, 34 o en P.º de los Tilos, 26.',
  ogUrl: `${PRODUCTION_DOMAIN}/`,
  ogType: 'website',
  ogLocale: 'es_ES',
  ogSiteName: 'Kelani Cosmetics',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Kelani Cosmetics | Cosmética y cuidado capilar',
  twitterDescription: 'Tienda especializada en cosmética, cuidado del cabello y la piel. Pelucas naturales y sintéticas. Valencia y Málaga.',
};

export const contactoPageSeo: SeoMetaTags = {
  title: 'Contacto | Kelani Cosmetics Valencia y Málaga',
  description: 'Visita nuestras tiendas Kelani Cosmetics. Valencia: C/ de Bailèn, 34, Extramurs, 46007. Málaga: P.º de los Tilos, 26, Cruz de Humilladero, 29006. Horarios, teléfono y WhatsApp.',
  keywords: 'contacto Kelani Cosmetics, tienda cosmética Valencia, tienda cosmética Málaga, C/ de Bailèn 34 València, Pº de los Tilos 26 Málaga, Extramurs Valencia, Cruz de Humilladero Málaga, horario Valencia, horario Málaga, dirección Valencia, dirección Málaga',
  robots: 'index, follow',
  canonical: `${PRODUCTION_DOMAIN}/contacto`,
  ogTitle: 'Contacto | Kelani Cosmetics Valencia y Málaga',
  ogDescription: 'Visita nuestras tiendas en València y Málaga. Direcciones, horarios y teléfono de contacto. Te esperamos con los mejores productos de cosmética y cuidado capilar.',
  ogUrl: `${PRODUCTION_DOMAIN}/contacto`,
  ogType: 'website',
  ogLocale: 'es_ES',
  ogSiteName: 'Kelani Cosmetics',
};

export const privacyPageSeo: SeoMetaTags = {
  title: 'Política de Privacidad | Kelani Cosmetics',
  description: 'Política de privacidad de Kelani Cosmetics. Información sobre el tratamiento de tus datos personales y tu privacidad en nuestras tiendas de Valencia y Málaga y en nuestra web.',
  keywords: 'política de privacidad Kelani Cosmetics, protección datos Valencia, protección datos Málaga',
  robots: 'noindex, follow',
  canonical: `${PRODUCTION_DOMAIN}/privacy`,
  ogTitle: 'Política de Privacidad | Kelani Cosmetics',
  ogDescription: 'Conoce cómo protegemos y utilizamos tu información en Kelani Cosmetics.',
  ogUrl: `${PRODUCTION_DOMAIN}/privacy`,
  ogType: 'website',
  ogLocale: 'es_ES',
};
