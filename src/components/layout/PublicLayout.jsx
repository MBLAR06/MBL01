import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';

const navLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Series', path: '/series' },
  { name: 'Miniseries', path: '/miniseries' },
  { name: 'Películas', path: '/peliculas' },
  { name: 'Anime', path: '/anime' },
];

export default function PublicLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Navbar */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'glass py-3' : 'bg-transparent py-4'
        )}
        data-testid="main-navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo - Sin fondo */}
            <Link to="/" className="flex items-center" data-testid="logo-link">
              <Logo size="default" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'nav-link text-sm font-medium',
                    location.pathname === link.path && 'active'
                  )}
                  data-testid={`nav-link-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Search & Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <form
                onSubmit={handleSearch}
                className={cn(
                  'hidden md:flex items-center transition-all duration-300',
                  isSearchExpanded ? 'w-64' : 'w-10'
                )}
              >
                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchExpanded(true)}
                    onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                    className={cn(
                      'input-search transition-all duration-300',
                      isSearchExpanded ? 'w-full pl-10 opacity-100' : 'w-0 opacity-0 p-0'
                    )}
                    data-testid="search-input"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className="absolute left-0 p-2 text-slate-400 hover:text-white transition-colors"
                    data-testid="search-toggle"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                data-testid="mobile-menu-toggle"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
          data-testid="mobile-menu"
        >
          <div className="glass mt-2 mx-4 rounded-lg p-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-search w-full pl-10"
                  data-testid="mobile-search-input"
                />
              </div>
            </form>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'px-4 py-2 rounded-lg transition-colors',
                    location.pathname === link.path
                      ? 'bg-violet-500/20 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  )}
                  data-testid={`mobile-nav-link-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-white/5 py-12 mt-16" data-testid="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand - Logo más grande sin fondo */}
            <div className="col-span-1 md:col-span-2">
              <Logo size="large" className="mb-4" />
              <p className="text-slate-400 text-sm max-w-md">
                Tu plataforma de series BL, miniseries, películas y anime LGBT. 
                Disfruta del mejor contenido asiático subtitulado en español.
              </p>
            </div>

            {/* Links - Explorar */}
            <div>
              <h4 className="text-white font-semibold mb-4">Explorar</h4>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/aviso-legal" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Aviso Legal
                </Link>
                <Link to="/privacidad" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Política de Privacidad
                </Link>
                <Link to="/contacto" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Contacto
                </Link>
              </nav>
            </div>
          </div>

          <div className="border-t border-white/5 mt-8 pt-8">
            <p className="text-slate-500 text-xs text-center">
              MoonlightBL no aloja ningún archivo en sus servidores. Todo el contenido es 
              proporcionado por terceros no afiliados. Este sitio es solo un catálogo de enlaces.
            </p>
            <p className="text-slate-600 text-xs text-center mt-2">
              © {new Date().getFullYear()} MoonlightBL. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
