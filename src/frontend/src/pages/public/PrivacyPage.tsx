import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useActor } from '../../hooks/useActor';

export default function PrivacyPage() {
  const { actor: rawActor } = useActor();
  const [stableActor, setStableActor] = useState<typeof rawActor>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO: Set page title and meta description
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute('content') || '';

    document.title = 'Política de Privacidad - Kelani Cosmetics';
    
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Política de privacidad de Kelani Cosmetics. Información sobre cómo protegemos y utilizamos tus datos personales, cookies, y tus derechos bajo GDPR.'
      );
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = 'Política de privacidad de Kelani Cosmetics. Información sobre cómo protegemos y utilizamos tus datos personales, cookies, y tus derechos bajo GDPR.';
      document.head.appendChild(newMeta);
    }

    return () => {
      document.title = originalTitle;
      if (metaDescription) {
        metaDescription.setAttribute('content', originalDescription);
      }
    };
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
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando política de privacidad...</p>
      </div>
    );
  }

  // Show error state if any
  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive">Error al cargar la política de privacidad</p>
      </div>
    );
  }

  // Get current date for "Last Updated"
  const currentDate = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link */}
      <div className="pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="space-y-3 pt-4">
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
            <li>Participas en promociones o encuestas</li>
          </ul>
          <p className="text-foreground leading-relaxed">
            Esta información puede incluir: nombre, dirección de correo electrónico, número de teléfono, y cualquier otra información que decidas compartir con nosotros.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">
            2.2 Datos Recopilados Automáticamente
          </h3>
          <p className="text-foreground leading-relaxed">
            Cuando visitas nuestro sitio web, recopilamos automáticamente cierta información sobre tu dispositivo y tu interacción con nuestro sitio, incluyendo:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Dirección IP y ubicación geográfica aproximada</li>
            <li>Tipo de navegador y sistema operativo</li>
            <li>Páginas visitadas y tiempo de permanencia</li>
            <li>Fuente de referencia (cómo llegaste a nuestro sitio)</li>
            <li>Información de cookies y tecnologías similares</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">
            2.3 Integración de Google Maps
          </h3>
          <p className="text-foreground leading-relaxed">
            Utilizamos Google Maps para mostrar la ubicación de nuestras tiendas y proporcionar direcciones. Cuando interactúas con los mapas integrados, Google puede recopilar información según su propia política de privacidad.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">
            2.4 Finalidad de la Recopilación
          </h3>
          <p className="text-foreground leading-relaxed">
            Recopilamos esta información para:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Proporcionar y mejorar nuestros servicios</li>
            <li>Responder a tus consultas y solicitudes</li>
            <li>Personalizar tu experiencia en nuestro sitio web</li>
            <li>Analizar el uso del sitio y optimizar su rendimiento</li>
            <li>Cumplir con obligaciones legales y regulatorias</li>
          </ul>
        </section>

        {/* Cookie Policy Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            3. Política de Cookies
          </h2>
          <h3 className="text-xl font-semibold text-foreground">
            3.1 ¿Qué son las Cookies?
          </h3>
          <p className="text-foreground leading-relaxed">
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. Nos ayudan a mejorar tu experiencia al recordar tus preferencias y analizar cómo utilizas nuestro sitio.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">
            3.2 Tipos de Cookies que Utilizamos
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                Cookies Esenciales/Funcionales
              </h4>
              <p className="text-foreground leading-relaxed">
                Estas cookies son necesarias para el funcionamiento básico del sitio web. Permiten la navegación y el uso de funciones esenciales como el acceso a áreas seguras. El sitio web no puede funcionar correctamente sin estas cookies.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                Cookies de Análisis
              </h4>
              <p className="text-foreground leading-relaxed">
                Utilizamos herramientas como Google Analytics para recopilar información sobre cómo los visitantes utilizan nuestro sitio. Esto nos ayuda a mejorar la funcionalidad y el contenido del sitio. Estas cookies recopilan información de forma anónima.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                Cookies de Terceros
              </h4>
              <p className="text-foreground leading-relaxed">
                Nuestro sitio web integra servicios de terceros como Google Maps, que pueden establecer sus propias cookies. Estos terceros tienen sus propias políticas de privacidad que rigen el uso de estas cookies.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-foreground mt-6">
            3.3 Gestión de Cookies
          </h3>
          <p className="text-foreground leading-relaxed">
            Puedes controlar y gestionar las cookies a través de la configuración de tu navegador. La mayoría de los navegadores te permiten:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Ver qué cookies están almacenadas y eliminarlas individualmente</li>
            <li>Bloquear cookies de terceros</li>
            <li>Bloquear todas las cookies de todos los sitios</li>
            <li>Eliminar todas las cookies al cerrar el navegador</li>
          </ul>
          <p className="text-foreground leading-relaxed mt-4">
            Ten en cuenta que si bloqueas o eliminas las cookies, es posible que algunas funciones del sitio web no funcionen correctamente.
          </p>
        </section>

        {/* Data Usage Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            4. Uso de Datos
          </h2>
          <p className="text-foreground leading-relaxed">
            Utilizamos la información recopilada para los siguientes propósitos:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <strong>Proporcionar y mejorar servicios:</strong> Para operar nuestro sitio web, procesar tus solicitudes y mejorar continuamente nuestros productos y servicios.
            </li>
            <li>
              <strong>Comunicación con clientes:</strong> Para responder a tus consultas, enviarte información sobre productos y servicios, y proporcionarte asistencia al cliente.
            </li>
            <li>
              <strong>Análisis y optimización:</strong> Para analizar el uso del sitio web, identificar tendencias, y optimizar el rendimiento y la experiencia del usuario.
            </li>
            <li>
              <strong>Funcionalidad de Google Maps:</strong> Para mostrar la ubicación de nuestras tiendas y proporcionar direcciones precisas a nuestros clientes.
            </li>
            <li>
              <strong>Cumplimiento legal:</strong> Para cumplir con obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.
            </li>
          </ul>
        </section>

        {/* Data Sharing Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            5. Compartición de Datos
          </h2>
          <h3 className="text-xl font-semibold text-foreground">
            5.1 Servicios de Terceros
          </h3>
          <p className="text-foreground leading-relaxed">
            Compartimos información con proveedores de servicios de terceros que nos ayudan a operar nuestro sitio web y proporcionar nuestros servicios, incluyendo:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <strong>Google Maps:</strong> Para servicios de mapas y geolocalización
            </li>
            <li>
              <strong>Google Analytics:</strong> Para análisis web y estadísticas de uso
            </li>
            <li>
              <strong>Proveedores de hosting:</strong> Para alojar nuestro sitio web y almacenar datos
            </li>
          </ul>
          <p className="text-foreground leading-relaxed mt-4">
            Estos proveedores tienen acceso a tu información personal solo en la medida necesaria para realizar sus funciones y están obligados a no divulgarla ni utilizarla para otros fines.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">
            5.2 Requisitos Legales
          </h3>
          <p className="text-foreground leading-relaxed">
            Podemos divulgar tu información personal si estamos obligados a hacerlo por ley o en respuesta a solicitudes válidas de autoridades públicas (por ejemplo, un tribunal o una agencia gubernamental).
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">
            5.3 Transferencias Empresariales
          </h3>
          <p className="text-foreground leading-relaxed">
            En caso de fusión, adquisición o venta de activos, tu información personal puede ser transferida. Te notificaremos antes de que tu información personal sea transferida y quede sujeta a una política de privacidad diferente.
          </p>
        </section>

        {/* User Rights Section (GDPR) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            6. Tus Derechos (GDPR)
          </h2>
          <p className="text-foreground leading-relaxed">
            Bajo el Reglamento General de Protección de Datos (GDPR), tienes los siguientes derechos:
          </p>
          <ul className="list-disc pl-6 space-y-3 text-foreground">
            <li>
              <strong>Derecho de acceso:</strong> Puedes solicitar una copia de los datos personales que tenemos sobre ti.
            </li>
            <li>
              <strong>Derecho de rectificación:</strong> Puedes solicitar que corrijamos cualquier información inexacta o incompleta.
            </li>
            <li>
              <strong>Derecho de supresión:</strong> Puedes solicitar que eliminemos tus datos personales en determinadas circunstancias.
            </li>
            <li>
              <strong>Derecho a la limitación del tratamiento:</strong> Puedes solicitar que limitemos el procesamiento de tus datos personales en determinadas circunstancias.
            </li>
            <li>
              <strong>Derecho a la portabilidad de datos:</strong> Puedes solicitar recibir tus datos personales en un formato estructurado, de uso común y legible por máquina.
            </li>
            <li>
              <strong>Derecho de oposición:</strong> Puedes oponerte al procesamiento de tus datos personales en determinadas circunstancias.
            </li>
          </ul>
          <p className="text-foreground leading-relaxed mt-4">
            Para ejercer cualquiera de estos derechos, por favor contáctanos utilizando la información de contacto proporcionada al final de esta política.
          </p>
        </section>

        {/* Data Security Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            7. Seguridad de Datos
          </h2>
          <p className="text-foreground leading-relaxed">
            Tomamos la seguridad de tu información personal muy en serio. Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos contra el acceso no autorizado, la alteración, divulgación o destrucción, incluyendo:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Cifrado de datos en tránsito y en reposo</li>
            <li>Controles de acceso estrictos y autenticación</li>
            <li>Monitoreo regular de seguridad y auditorías</li>
            <li>Capacitación del personal en prácticas de seguridad de datos</li>
          </ul>
          <p className="text-foreground leading-relaxed mt-4">
            <strong>Retención de datos:</strong> Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
          </p>
        </section>

        {/* International Data Transfers */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            8. Transferencias Internacionales de Datos
          </h2>
          <p className="text-foreground leading-relaxed">
            Tu información puede ser transferida y almacenada en servidores ubicados fuera de tu país de residencia, donde las leyes de protección de datos pueden ser diferentes. Al utilizar nuestro sitio web, consientes estas transferencias.
          </p>
          <p className="text-foreground leading-relaxed">
            Cuando transferimos datos personales fuera del Espacio Económico Europeo (EEE), nos aseguramos de que se implementen salvaguardias adecuadas, como cláusulas contractuales estándar aprobadas por la Comisión Europea.
          </p>
        </section>

        {/* Children's Privacy */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            9. Privacidad de Menores
          </h2>
          <p className="text-foreground leading-relaxed">
            Nuestro sitio web no está dirigido a menores de 16 años. No recopilamos intencionalmente información personal de menores de 16 años. Si descubrimos que hemos recopilado información personal de un menor de 16 años sin el consentimiento parental verificable, tomaremos medidas para eliminar esa información de nuestros servidores.
          </p>
          <p className="text-foreground leading-relaxed">
            Si eres padre o tutor y crees que tu hijo nos ha proporcionado información personal, por favor contáctanos para que podamos tomar las medidas necesarias.
          </p>
        </section>

        {/* Policy Changes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            10. Cambios en la Política de Privacidad
          </h2>
          <p className="text-foreground leading-relaxed">
            Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por razones operativas, legales o regulatorias. Te notificaremos sobre cualquier cambio material publicando la nueva política en esta página y actualizando la fecha de "Última actualización" en la parte superior.
          </p>
          <p className="text-foreground leading-relaxed">
            Te recomendamos que revises esta política periódicamente para estar informado sobre cómo protegemos tu información. El uso continuado de nuestro sitio web después de la publicación de cambios constituye tu aceptación de dichos cambios.
          </p>
        </section>

        {/* Contact Information */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            11. Información de Contacto
          </h2>
          <p className="text-foreground leading-relaxed">
            Si tienes preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o el tratamiento de tus datos personales, por favor contáctanos:
          </p>
          <div className="bg-muted/30 p-6 rounded-lg space-y-3 mt-4">
            <p className="text-foreground">
              <strong>Kelani Cosmetics</strong>
            </p>
            <p className="text-foreground">
              <strong>Tienda 1:</strong><br />
              1460 Merritt Blvd, Dundalk, MD 21222<br />
              Teléfono: (410) 288-6792<br />
              WhatsApp: +34 600 111 111
            </p>
            <p className="text-foreground">
              <strong>Tienda 2:</strong><br />
              5850 Hollins Ferry Road, Baltimore, MD 21227<br />
              Teléfono: (443) 234-0005<br />
              WhatsApp: +34 600 222 222
            </p>
            <p className="text-foreground">
              <strong>Email:</strong> variety.discount.store@example.com
            </p>
            <p className="text-muted-foreground text-sm mt-4">
              [POR DEFINIR: Delegado de Protección de Datos (DPO) si aplica según GDPR]
            </p>
          </div>
          <p className="text-foreground leading-relaxed mt-4">
            Nos esforzamos por responder a todas las solicitudes legítimas dentro de un mes. Ocasionalmente, puede tomarnos más de un mes si tu solicitud es particularmente compleja o si has realizado varias solicitudes.
          </p>
        </section>
      </div>
    </div>
  );
}
