import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen" data-testid="privacy-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Política de Privacidad</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">1. Introducción</h2>
            <p className="text-slate-300 leading-relaxed">
              En MoonlightBL nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política 
              describe cómo recopilamos, utilizamos y protegemos la información que nos proporcionas 
              al utilizar nuestra plataforma de catálogo de series BL, miniseries, películas y anime LGBT.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">2. Información que Recopilamos</h2>
            
            <h3 className="text-lg font-medium text-white mt-4 mb-2">2.1 Información proporcionada voluntariamente</h3>
            <p className="text-slate-300 leading-relaxed">
              Cuando utilizas nuestro formulario de contacto, recopilamos:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1">
              <li>Nombre</li>
              <li>Dirección de correo electrónico</li>
              <li>Asunto y contenido del mensaje</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">2.2 Información recopilada automáticamente</h3>
            <p className="text-slate-300 leading-relaxed">
              Al navegar por nuestra web, podemos recopilar automáticamente:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1">
              <li>Estadísticas de visualización de contenidos (anónimas)</li>
              <li>Información técnica del navegador para optimizar la experiencia</li>
              <li>Páginas visitadas y tiempo de permanencia (datos agregados)</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">3. Uso de la Información</h2>
            <p className="text-slate-300 leading-relaxed">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>Responder a tus consultas y mensajes de contacto</li>
              <li>Mejorar nuestro catálogo y servicios</li>
              <li>Generar estadísticas sobre el contenido más popular</li>
              <li>Detectar y prevenir actividades fraudulentas</li>
              <li>Cumplir con obligaciones legales cuando sea necesario</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">4. Cookies y Tecnologías Similares</h2>
            <p className="text-slate-300 leading-relaxed">
              MoonlightBL utiliza cookies técnicas necesarias para:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>Mantener tu sesión activa (si eres administrador)</li>
              <li>Recordar tus preferencias de navegación</li>
              <li>Mejorar el rendimiento del sitio</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              No utilizamos cookies de seguimiento publicitario ni compartimos información con 
              redes publicitarias.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">5. Compartición de Datos</h2>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">No vendemos, alquilamos ni compartimos tu información personal</strong> con 
              terceros, excepto en los siguientes casos:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>Cuando sea requerido por ley o autoridades competentes</li>
              <li>Para proteger nuestros derechos legales</li>
              <li>Con proveedores de servicios que nos ayudan a operar la web (bajo estrictos acuerdos de confidencialidad)</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">6. Seguridad de los Datos</h2>
            <p className="text-slate-300 leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>Conexiones cifradas mediante HTTPS</li>
              <li>Almacenamiento seguro de datos</li>
              <li>Acceso restringido a la información personal</li>
              <li>Monitorización de actividades sospechosas</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">7. Tus Derechos</h2>
            <p className="text-slate-300 leading-relaxed">
              Como usuario, tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li><strong className="text-white">Acceso:</strong> Solicitar información sobre los datos que tenemos sobre ti</li>
              <li><strong className="text-white">Rectificación:</strong> Corregir datos inexactos</li>
              <li><strong className="text-white">Supresión:</strong> Solicitar la eliminación de tus datos</li>
              <li><strong className="text-white">Oposición:</strong> Oponerte al tratamiento de tus datos</li>
              <li><strong className="text-white">Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Para ejercer estos derechos, <Link to="/contacto" className="text-violet-400 hover:text-violet-300">contáctanos</Link>.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">8. Retención de Datos</h2>
            <p className="text-slate-300 leading-relaxed">
              Conservamos tu información personal durante el tiempo necesario para cumplir con los 
              fines descritos en esta política, o según lo requiera la ley. Los mensajes de contacto 
              se conservan durante un máximo de 2 años.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">9. Menores de Edad</h2>
            <p className="text-slate-300 leading-relaxed">
              MoonlightBL no está dirigido a menores de 18 años. No recopilamos intencionadamente 
              información de menores. Si eres padre o tutor y crees que tu hijo nos ha proporcionado 
              información personal, por favor contáctanos.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">10. Cambios en esta Política</h2>
            <p className="text-slate-300 leading-relaxed">
              Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos cualquier 
              cambio significativo publicando la nueva política en esta página con una fecha de 
              actualización revisada.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">11. Contacto</h2>
            <p className="text-slate-300 leading-relaxed">
              Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos, 
              puedes contactarnos:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>Email: <a href="mailto:moonlightbl@protonmail.com" className="text-violet-400 hover:text-violet-300">moonlightbl@protonmail.com</a></li>
              <li>Formulario: <Link to="/contacto" className="text-violet-400 hover:text-violet-300">Página de contacto</Link></li>
            </ul>
          </section>

          <p className="text-slate-500 text-sm text-center pt-8">
            Última actualización: Enero 2026
          </p>
        </div>
      </div>
    </div>
  );
}
