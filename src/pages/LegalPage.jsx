import { Link } from 'react-router-dom';

export default function LegalPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen" data-testid="legal-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Aviso Legal</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">1. Información General</h2>
            <p className="text-slate-300 leading-relaxed">
              MoonlightBL es una plataforma web dedicada al catálogo y visualización de series BL (Boys' Love), 
              miniseries, películas y anime LGBT. Nuestro objetivo es proporcionar a los fans hispanohablantes 
              un lugar centralizado donde puedan descubrir y acceder a contenido de calidad.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              Esta plataforma opera como un servicio de directorio y catálogo, proporcionando información 
              sobre contenidos audiovisuales y enlaces a servidores externos donde se alojan los mismos.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">2. Naturaleza del Servicio</h2>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">MoonlightBL NO aloja ningún archivo de video en sus servidores.</strong> 
              Todo el contenido audiovisual es proporcionado por terceros no afiliados a través de servicios 
              de streaming externos como ok.ru, streamtape y otros proveedores similares.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              Actuamos únicamente como un catálogo de enlaces, similar a un motor de búsqueda especializado, 
              facilitando el acceso a contenidos que ya están disponibles públicamente en internet.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">3. Propiedad Intelectual</h2>
            <p className="text-slate-300 leading-relaxed">
              Las marcas, logotipos, imágenes y contenidos mostrados en esta web pertenecen a sus respectivos 
              propietarios. MoonlightBL utiliza esta información con fines meramente informativos y de catálogo.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              Si eres titular de derechos de autor y consideras que algún contenido infringe tus derechos, 
              por favor <Link to="/contacto" className="text-violet-400 hover:text-violet-300">contáctanos</Link> y 
              procederemos a revisar y, en su caso, eliminar el enlace correspondiente.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">4. Responsabilidad</h2>
            <p className="text-slate-300 leading-relaxed">
              MoonlightBL no se hace responsable de:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>El contenido alojado en servidores de terceros</li>
              <li>La disponibilidad o calidad de los enlaces externos</li>
              <li>El uso que los usuarios hagan del contenido accedido</li>
              <li>Los posibles daños derivados del acceso a sitios externos</li>
              <li>La veracidad de la información proporcionada por fuentes externas</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">5. Uso del Sitio</h2>
            <p className="text-slate-300 leading-relaxed">
              Al utilizar MoonlightBL, aceptas:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>Utilizar el servicio de forma legal y respetuosa</li>
              <li>No intentar acceder de forma no autorizada al sistema</li>
              <li>No reproducir o distribuir el contenido del catálogo sin autorización</li>
              <li>Respetar los derechos de propiedad intelectual de terceros</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">6. Modificaciones</h2>
            <p className="text-slate-300 leading-relaxed">
              MoonlightBL se reserva el derecho de modificar este aviso legal en cualquier momento. 
              Las modificaciones entrarán en vigor desde su publicación en esta página. 
              Te recomendamos revisar periódicamente esta sección.
            </p>
          </section>

          <section className="admin-card">
            <h2 className="text-xl font-semibold text-white mb-4">7. Contacto</h2>
            <p className="text-slate-300 leading-relaxed">
              Para cualquier consulta relacionada con este aviso legal, puedes contactarnos a través de 
              nuestro <Link to="/contacto" className="text-violet-400 hover:text-violet-300">formulario de contacto</Link> o 
              enviando un correo electrónico a <a href="mailto:moonlightbl@protonmail.com" className="text-violet-400 hover:text-violet-300">moonlightbl@protonmail.com</a>.
            </p>
          </section>

          <p className="text-slate-500 text-sm text-center pt-8">
            Última actualización: Enero 2026
          </p>
        </div>
      </div>
    </div>
  );
}
