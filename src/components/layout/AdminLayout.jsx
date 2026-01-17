import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  Image,
  ChevronRight,
  Layers,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Contenidos', path: '/admin/contenidos', icon: Film },
  { name: 'Temporadas', path: '/admin/temporadas', icon: Layers },
  { name: 'Episodios', path: '/admin/episodios', icon: Play },
  { name: 'Carrusel', path: '/admin/carrusel', icon: Image },
  { name: 'Estadísticas', path: '/admin/estadisticas', icon: BarChart3 },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('moonlightbl_token');
    toast.success('Sesión cerrada');
    navigate('/admin/login');
  };

  const isActiveLink = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex">
      {/* Sidebar - Desktop */}
      <aside
        className="hidden lg:flex flex-col w-64 admin-sidebar fixed h-screen"
        data-testid="admin-sidebar"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link to="/admin" className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              MoonlightBL
            </h1>
          </Link>
          <p className="text-xs text-slate-500 mt-2">Panel Administrativo</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActiveLink(link.path)
                    ? 'bg-violet-500/20 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
                data-testid={`admin-nav-${link.name.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.name}</span>
                {isActiveLink(link.path) && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            Ver sitio público
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 transition-colors w-full text-sm"
            data-testid="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass py-3 px-4" data-testid="admin-mobile-header">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              MoonlightBL
            </h1>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            data-testid="admin-mobile-menu-toggle"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-40 transition-all duration-300',
          isSidebarOpen ? 'visible' : 'invisible'
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-black/60 transition-opacity duration-300',
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={cn(
            'absolute left-0 top-0 bottom-0 w-64 admin-sidebar transition-transform duration-300',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="p-6 border-b border-white/5">
            <Link to="/admin" className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                MoonlightBL
              </h1>
            </Link>
            <p className="text-xs text-slate-500 mt-2">Panel Administrativo</p>
          </div>

          <nav className="p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActiveLink(link.path)
                      ? 'bg-violet-500/20 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Ver sitio público
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 transition-colors w-full text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen admin-content">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
