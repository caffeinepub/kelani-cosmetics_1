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
        </section>

        {/* Cookies Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            3. Uso de Cookies
          </h2>
          <p className="text-foreground leading-relaxed">
            Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web. Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio.
          </p>
          <h3 className="text-xl font-semibold text-foreground">
            3.1 Tipos de Cookies que Utilizamos
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
            <li><strong>Cookies de Rendimiento:</strong> Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio</li>
            <li><strong>Cookies de Funcionalidad:</strong> Permiten recordar tus preferencias</li>
            <li><strong>Cookies de Terceros:</strong> Utilizadas para servicios como Google Maps y análisis</li>
          </ul>
          <p className="text-foreground leading-relaxed">
            Puedes gestionar tus preferencias de cookies en cualquier momento a través del banner de consentimiento que aparece en tu primera visita.
          </p>
        </section>

        {/* Data Usage Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            4. Cómo Utilizamos tu Información
          </h2>
          <p className="text-foreground leading-relaxed">
            Utilizamos la información recopilada para los siguientes propósitos:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Proporcionar y mantener nuestros servicios</li>
            <li>Responder a tus consultas y solicitudes</li>
            <li>Mejorar nuestro sitio web y experiencia de usuario</li>
            <li>Enviar comunicaciones relacionadas con nuestros productos y servicios</li>
            <li>Cumplir con obligaciones legales y regulatorias</li>
            <li>Prevenir fraudes y garantizar la seguridad</li>
          </ul>
        </section>

        {/* Data Sharing Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            5. Compartir Información
          </h2>
          <p className="text-foreground leading-relaxed">
            No vendemos tu información personal a terceros. Podemos compartir tu información en las siguientes circunstancias:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li><strong>Proveedores de Servicios:</strong> Con empresas que nos ayudan a operar nuestro sitio web (hosting, análisis, etc.)</li>
            <li><strong>Requisitos Legales:</strong> Cuando sea necesario para cumplir con la ley o proteger nuestros derechos</li>
            <li><strong>Transferencias Comerciales:</strong> En caso de fusión, adquisición o venta de activos</li>
          </ul>
          <p className="text-foreground leading-relaxed">
            Todos los terceros con los que compartimos información están obligados a proteger tus datos de acuerdo con esta política y las leyes aplicables.
          </p>
        </section>

        {/* User Rights Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            6. Tus Derechos
          </h2>
          <p className="text-foreground leading-relaxed">
            Bajo el GDPR y otras leyes de protección de datos, tienes los siguientes derechos:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li><strong>Derecho de Acceso:</strong> Solicitar una copia de tus datos personales</li>
            <li><strong>Derecho de Rectificación:</strong> Corregir información inexacta o incompleta</li>
            <li><strong>Derecho de Supresión:</strong> Solicitar la eliminación de tus datos</li>
            <li><strong>Derecho de Limitación:</strong> Restringir el procesamiento de tus datos</li>
            <li><strong>Derecho de Portabilidad:</strong> Recibir tus datos en un formato estructurado</li>
            <li><strong>Derecho de Oposición:</strong> Oponerte al procesamiento de tus datos</li>
            <li><strong>Derecho a Retirar el Consentimiento:</strong> En cualquier momento</li>
          </ul>
          <p className="text-foreground leading-relaxed">
            Para ejercer cualquiera de estos derechos, contáctanos a través de la información proporcionada al final de esta política.
          </p>
        </section>

        {/* Data Security Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            7. Seguridad de los Datos
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
            Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. Aunque nos esforzamos por proteger tu información, no podemos garantizar su seguridad absoluta.
          </p>
        </section>

        {/* Data Retention Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            8. Retención de Datos
          </h2>
          <p className="text-foreground leading-relaxed">
            Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
          </p>
          <p className="text-foreground leading-relaxed">
            Los criterios utilizados para determinar nuestros períodos de retención incluyen:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>El tiempo que mantienes una relación con nosotros</li>
            <li>Si existe una obligación legal a la que estamos sujetos</li>
            <li>Si la retención es aconsejable en función de nuestra posición legal</li>
          </ul>
        </section>

        {/* Children's Privacy Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            9. Privacidad de Menores
          </h2>
          <p className="text-foreground leading-relaxed">
            Nuestros servicios no están dirigidos a menores de 16 años. No recopilamos intencionalmente información personal de menores de 16 años. Si descubrimos que hemos recopilado información de un menor sin el consentimiento parental verificable, tomaremos medidas para eliminar esa información de nuestros servidores.
          </p>
        </section>

        {/* International Transfers Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            10. Transferencias Internacionales
          </h2>
          <p className="text-foreground leading-relaxed">
            Tu información puede ser transferida y mantenida en servidores ubicados fuera de tu país de residencia, donde las leyes de protección de datos pueden diferir. Al usar nuestros servicios, consientes estas transferencias.
          </p>
          <p className="text-foreground leading-relaxed">
            Cuando transferimos datos fuera del Espacio Económico Europeo (EEE), implementamos salvaguardas apropiadas, como cláusulas contractuales estándar aprobadas por la Comisión Europea.
          </p>
        </section>

        {/* Changes to Policy Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            11. Cambios a esta Política
          </h2>
          <p className="text-foreground leading-relaxed">
            Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por razones operativas, legales o regulatorias. Te notificaremos sobre cualquier cambio material publicando la nueva política en esta página y actualizando la fecha de "Última actualización".
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
            Si tienes preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o nuestras prácticas de datos, contáctanos:
          </p>
          <div className="bg-muted p-6 rounded-lg space-y-3">
            <p className="text-foreground">
              <strong>Kelani Cosmetics</strong>
            </p>
            <p className="text-foreground">
              Email: <a href="mailto:variety.discount.store@example.com" className="text-primary hover:underline">variety.discount.store@example.com</a>
            </p>
            <p className="text-foreground">
              Teléfono: <a href="tel:+14102886792" className="text-primary hover:underline">(410) 288-6792</a>
            </p>
            <p className="text-foreground">
              Dirección: 1460 Merritt Blvd, Dundalk, MD 21222
            </p>
          </div>
          <p className="text-foreground leading-relaxed">
            También puedes visitar nuestra <Link to="/contacto" className="text-primary hover:underline">página de contacto</Link> para más opciones de comunicación.
          </p>
        </section>

        {/* GDPR Compliance Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            13. Cumplimiento del GDPR
          </h2>
          <p className="text-foreground leading-relaxed">
            Kelani Cosmetics cumple con el Reglamento General de Protección de Datos (GDPR) de la Unión Europea. Si resides en el EEE, tienes derechos adicionales bajo el GDPR, incluyendo el derecho a presentar una queja ante tu autoridad de protección de datos local.
          </p>
          <p className="text-foreground leading-relaxed">
            Nuestra base legal para procesar tu información personal incluye:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Tu consentimiento</li>
            <li>Ejecución de un contrato</li>
            <li>Cumplimiento de obligaciones legales</li>
            <li>Intereses legítimos (cuando no prevalezcan tus derechos fundamentales)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
