import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { 
  Film, 
  Tv, 
  Clapperboard, 
  PlayCircle,
  Eye,
  TrendingUp,
  Clock,
  Plus,
  Loader2
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [topContents, setTopContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, topRes] = await Promise.all([
          adminApi.getStatsOverview(),
          adminApi.getTopContents({ period: 'week', limit: 5 }),
        ]);
        setStats(statsRes.data);
        setTopContents(topRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Series', value: stats?.series_count || 0, icon: Tv, color: 'violet' },
    { label: 'Miniseries', value: stats?.miniseries_count || 0, icon: Film, color: 'blue' },
    { label: 'Películas', value: stats?.movies_count || 0, icon: Clapperboard, color: 'pink' },
    { label: 'Anime', value: stats?.anime_count || 0, icon: PlayCircle, color: 'green' },
  ];

  return (
    <div data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Bienvenido al panel de administración</p>
        </div>
        <Link to="/admin/contenidos/nuevo" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Agregar contenido
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="admin-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="admin-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/20">
            <Eye className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{formatNumber(stats?.total_views || 0)}</p>
            <p className="text-slate-400 text-sm">Vistas totales</p>
          </div>
        </div>

        <div className="admin-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-yellow-500/20">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats?.published_contents || 0}</p>
            <p className="text-slate-400 text-sm">Publicados</p>
          </div>
        </div>

        <div className="admin-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-orange-500/20">
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats?.pending_contents || 0}</p>
            <p className="text-slate-400 text-sm">Pendientes</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contents */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-white mb-4">Más vistos esta semana</h2>
          {topContents.length > 0 ? (
            <div className="space-y-3">
              {topContents.map((content, index) => (
                <div key={content.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-2xl font-bold text-slate-600 w-8">{index + 1}</span>
                  <img
                    src={content.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=50&h=75&fit=crop'}
                    alt={content.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{content.title}</p>
                    <p className="text-slate-400 text-sm">{formatNumber(content.views)} vistas</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No hay datos disponibles</p>
          )}
          <Link
            to="/admin/estadisticas"
            className="block text-center text-violet-400 hover:text-violet-300 text-sm mt-4 pt-4 border-t border-white/5"
          >
            Ver todas las estadísticas
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/contenidos/nuevo"
              className="p-4 bg-violet-500/10 rounded-lg hover:bg-violet-500/20 transition-colors text-center"
            >
              <Plus className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Nueva Serie</p>
            </Link>
            <Link
              to="/admin/contenidos/nuevo?type=pelicula"
              className="p-4 bg-pink-500/10 rounded-lg hover:bg-pink-500/20 transition-colors text-center"
            >
              <Clapperboard className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Nueva Película</p>
            </Link>
            <Link
              to="/admin/contenidos/nuevo?type=anime"
              className="p-4 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors text-center"
            >
              <PlayCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Nuevo Anime</p>
            </Link>
            <Link
              to="/admin/carrusel"
              className="p-4 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors text-center"
            >
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Carrusel</p>
            </Link>
          </div>

          {/* System Info */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <h3 className="text-slate-400 text-sm mb-3">Resumen del sistema</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total contenidos</span>
                <span className="text-white">{stats?.total_contents || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Temporadas</span>
                <span className="text-white">{stats?.total_seasons || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Episodios</span>
                <span className="text-white">{stats?.total_episodes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
