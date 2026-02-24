import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useActor } from '../../hooks/useActor';
import SeoHead from '../../components/seo/SeoHead';
import { privacyPageSeo } from '../../components/seo/seoPresets';

export default function PrivacyPage() {
  const { actor: rawActor } = useActor();
  const [stableActor, setStableActor] = useState<typeof rawActor>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Stabilize actor reference
  useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  // Simulate initial data fetch (privacy policy is static, but we follow the pattern)
  useEffect(() => {
    if (stableActor) {
      // Simulate a brief loading period for consistency with other pages
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stableActor]);

  // Show loading spinner during initial load
  if (isInitialLoading) {
    return (
      <>
        <SeoHead meta={privacyPageSeo} />
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando política de privacidad...</p>
        </div>
      </>
    );
  }

  // Show error state if any
  if (error) {
    return (
      <>
        <SeoHead meta={privacyPageSeo} />
        <div className="text-center py-12 space-y-4">
          <p className="text-destructive">Error al cargar la política de privacidad</p>
        </div>
      </>
    );
  }

  // Get current date for "Last Updated"
  const currentDate = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <>
      <SeoHead meta={privacyPageSeo} />
      <div className="space-y-8 pb-12">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground">
            Política de Privacidad
          </h1>
          <p className="text-lg text-muted-foreground">
            Cómo protegemos y utilizamos tu información
          </p>
          <p className="text-sm text-muted-foreground">
            Última actualización: {currentDate}
          </p>
        </div>

        {/* Privacy Policy Content */}
        <div className="prose prose-slate max-w-none space-y-8">
          {/* Introduction Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              1. Introducción
            </h2>
            <p className="text-foreground leading-relaxed">
              En Kelani Cosmetics, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tu información personal. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos tu información cuando visitas nuestro sitio web y utilizas nuestros servicios.
            </p>
            <p className="text-foreground leading-relaxed">
              Esta política se aplica a todos los usuarios de nuestro sitio web y servicios, incluyendo visitantes, clientes y cualquier persona que interactúe con nuestra plataforma.
            </p>
          </section>

          {/* Data Collection Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              2. Recopilación de Datos
            </h2>
            <h3 className="text-xl font-semibold text-foreground">
              2.1 Información que Proporcionas
            </h3>
            <p className="text-foreground leading-relaxed">
              Recopilamos información que nos proporcionas directamente cuando:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Completas formularios de contacto en nuestro sitio web</li>
              <li>Te comunicas con nosotros por correo electrónico, teléfono o WhatsApp</li>
              <li>Realizas consultas sobre productos o servicios</li>
              <li>Visitas nuestras tiendas físicas en Valencia o Málaga</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground">
              2.2 Información Recopilada Automáticamente
            </h3>
            <p className="text-foreground leading-relaxed">
              Cuando visitas nuestro sitio web, podemos recopilar automáticamente cierta información sobre tu dispositivo y tu uso del sitio, incluyendo:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Dirección IP</li>
              <li>Tipo de navegador y versión</li>
              <li>Sistema operativo</li>
              <li>Páginas visitadas y tiempo de permanencia</li>
              <li>Fuente de referencia (cómo llegaste a nuestro sitio)</li>
            </ul>
          </section>

          {/* Use of Data Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              3. Uso de la Información
            </h2>
            <p className="text-foreground leading-relaxed">
              Utilizamos la información recopilada para los siguientes propósitos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Responder a tus consultas y solicitudes</li>
              <li>Proporcionar información sobre nuestros productos y servicios</li>
              <li>Mejorar nuestro sitio web y la experiencia del usuario</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Proteger nuestros derechos y prevenir fraudes</li>
              <li>Enviar comunicaciones de marketing (solo con tu consentimiento)</li>
            </ul>
          </section>

          {/* Cookies Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              4. Cookies y Tecnologías Similares
            </h2>
            <p className="text-foreground leading-relaxed">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web. Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio.
            </p>
            <h3 className="text-xl font-semibold text-foreground">
              4.1 Tipos de Cookies que Utilizamos
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
              <li><strong>Cookies de Rendimiento:</strong> Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio</li>
              <li><strong>Cookies de Funcionalidad:</strong> Permiten recordar tus preferencias</li>
              <li><strong>Cookies de Terceros:</strong> Utilizadas para servicios como Google Maps</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              Puedes gestionar tus preferencias de cookies a través del banner de consentimiento que aparece en tu primera visita. También puedes configurar tu navegador para rechazar todas las cookies, aunque esto puede afectar la funcionalidad del sitio.
            </p>
          </section>

          {/* Data Sharing Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              5. Compartir Información
            </h2>
            <p className="text-foreground leading-relaxed">
              No vendemos, alquilamos ni compartimos tu información personal con terceros para fines de marketing sin tu consentimiento explícito. Podemos compartir tu información en las siguientes circunstancias:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li><strong>Proveedores de Servicios:</strong> Compartimos información con proveedores que nos ayudan a operar nuestro sitio web y negocio</li>
              <li><strong>Cumplimiento Legal:</strong> Cuando sea requerido por ley o para proteger nuestros derechos legales</li>
              <li><strong>Transferencias Comerciales:</strong> En caso de fusión, adquisición o venta de activos</li>
            </ul>
          </section>

          {/* Data Security Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              6. Seguridad de los Datos
            </h2>
            <p className="text-foreground leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Cifrado de datos en tránsito y en reposo</li>
              <li>Controles de acceso estrictos</li>
              <li>Auditorías de seguridad regulares</li>
              <li>Capacitación del personal en protección de datos</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. Aunque nos esforzamos por proteger tu información personal, no podemos garantizar su seguridad absoluta.
            </p>
          </section>

          {/* User Rights Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              7. Tus Derechos
            </h2>
            <p className="text-foreground leading-relaxed">
              Bajo el Reglamento General de Protección de Datos (GDPR) y la legislación española de protección de datos, tienes los siguientes derechos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li><strong>Derecho de Acceso:</strong> Solicitar una copia de tu información personal</li>
              <li><strong>Derecho de Rectificación:</strong> Corregir información inexacta o incompleta</li>
              <li><strong>Derecho de Supresión:</strong> Solicitar la eliminación de tu información personal</li>
              <li><strong>Derecho de Limitación:</strong> Restringir el procesamiento de tu información</li>
              <li><strong>Derecho de Portabilidad:</strong> Recibir tu información en un formato estructurado</li>
              <li><strong>Derecho de Oposición:</strong> Oponerte al procesamiento de tu información</li>
              <li><strong>Derecho a Retirar el Consentimiento:</strong> En cualquier momento, sin afectar la legalidad del procesamiento previo</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              Para ejercer cualquiera de estos derechos, por favor contáctanos utilizando la información proporcionada en la sección de contacto.
            </p>
          </section>

          {/* Data Retention Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              8. Retención de Datos
            </h2>
            <p className="text-foreground leading-relaxed">
              Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos para los que fue recopilada, incluyendo cualquier requisito legal, contable o de informes. Los períodos de retención varían según el tipo de información y el propósito del procesamiento.
            </p>
          </section>

          {/* Children's Privacy Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              9. Privacidad de Menores
            </h2>
            <p className="text-foreground leading-relaxed">
              Nuestro sitio web no está dirigido a menores de 16 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado información de un menor sin el consentimiento parental apropiado, tomaremos medidas para eliminar esa información de nuestros sistemas.
            </p>
          </section>

          {/* International Transfers Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              10. Transferencias Internacionales
            </h2>
            <p className="text-foreground leading-relaxed">
              Tu información puede ser transferida y procesada en países fuera del Espacio Económico Europeo (EEE). En tales casos, nos aseguramos de que existan salvaguardias apropiadas para proteger tu información de acuerdo con esta política de privacidad y las leyes aplicables.
            </p>
          </section>

          {/* Policy Changes Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              11. Cambios a esta Política
            </h2>
            <p className="text-foreground leading-relaxed">
              Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por razones legales, operativas o regulatorias. Te notificaremos sobre cualquier cambio significativo publicando la nueva política en esta página y actualizando la fecha de "Última actualización" en la parte superior.
            </p>
            <p className="text-foreground leading-relaxed">
              Te recomendamos revisar esta política periódicamente para estar informado sobre cómo protegemos tu información.
            </p>
          </section>

          {/* Contact Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              12. Contacto
            </h2>
            <p className="text-foreground leading-relaxed">
              Si tienes preguntas, comentarios o inquietudes sobre esta Política de Privacidad o nuestras prácticas de privacidad, o si deseas ejercer tus derechos de protección de datos, por favor contáctanos:
            </p>
            <div className="bg-muted rounded-lg p-6 space-y-3">
              <p className="text-foreground">
                <strong>Kelani Cosmetics Spain S.L.</strong>
              </p>
              <p className="text-foreground leading-relaxed">
                Para consultas sobre privacidad y protección de datos, visita nuestra{' '}
                <Link to="/contacto" className="text-primary hover:underline">
                  página de contacto
                </Link>{' '}
                donde encontrarás la información de nuestras dos tiendas en Valencia y Málaga, incluyendo direcciones, teléfonos, WhatsApp y correo electrónico.
              </p>
            </div>
            <p className="text-foreground leading-relaxed">
              También tienes derecho a presentar una queja ante la Agencia Española de Protección de Datos (AEPD) si consideras que el tratamiento de tus datos personales infringe la normativa aplicable.
            </p>
          </section>

          {/* Final Note */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              13. Consentimiento
            </h2>
            <p className="text-foreground leading-relaxed">
              Al utilizar nuestro sitio web y servicios, consientes el procesamiento de tu información personal según se describe en esta Política de Privacidad. Si no estás de acuerdo con esta política, por favor no utilices nuestro sitio web.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
