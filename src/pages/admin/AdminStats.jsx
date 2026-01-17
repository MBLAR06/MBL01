import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Calendar,
  Loader2,
  Download
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [topContents, setTopContents] = useState([]);
  const [viewsData, setViewsData] = useState([]);
  const [period, setPeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, topRes, viewsRes] = await Promise.all([
        adminApi.getStatsOverview(),
        adminApi.getTopContents({ period, limit: 10 }),
        adminApi.getViewsByPeriod({ period }),
      ]);
      setStats(statsRes.data);
      setTopContents(topRes.data);
      setViewsData(viewsRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      overview: stats,
      topContents,
      viewsByPeriod: viewsData,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moonlightbl-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  // Calculate max views for chart scaling
  const maxViews = Math.max(...viewsData.map(d => d.views), 1);

  return (
    <div data-testid="admin-stats-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Estadísticas</h1>
          <p className="text-slate-400 mt-1">Análisis de rendimiento del catálogo</p>
        </div>
        <button
          onClick={exportData}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Exportar
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="admin-card">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-3xl font-bold text-white">{formatNumber(stats?.total_views || 0)}</p>
          <p className="text-slate-400 text-sm">Vistas totales</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats?.total_contents || 0}</p>
          <p className="text-slate-400 text-sm">Contenidos totales</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats?.published_contents || 0}</p>
          <p className="text-slate-400 text-sm">Publicados</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats?.total_episodes || 0}</p>
          <p className="text-slate-400 text-sm">Episodios totales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Vistas por período</h2>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 bg-slate-800 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="day">Hoy</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-2">
            {viewsData.length > 0 ? (
              viewsData.slice(-14).map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 flex-shrink-0">
                    {new Date(item.date).toLocaleDateString('es-ES', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex-1 h-6 bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded transition-all duration-500"
                      style={{ width: `${(item.views / maxViews) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400 w-12 text-right">
                    {item.views}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Top Contents */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-white mb-6">
            Top 10 - {period === 'day' ? 'Hoy' : period === 'week' ? 'Esta semana' : 'Este mes'}
          </h2>

          {topContents.length > 0 ? (
            <div className="space-y-3">
              {topContents.map((content, index) => (
                <div key={content.id} className="flex items-center gap-3">
                  <span className={`
                    w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-slate-400/20 text-slate-300' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-slate-700 text-slate-400'}
                  `}>
                    {index + 1}
                  </span>
                  <img
                    src={content.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=50&h=75&fit=crop'}
                    alt={content.title}
                    className="w-10 h-14 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{content.title}</p>
                    <p className="text-slate-400 text-xs">{content.content_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatNumber(content.views)}</p>
                    <p className="text-slate-500 text-xs">vistas</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Content Breakdown */}
      <div className="admin-card mt-6">
        <h2 className="text-lg font-semibold text-white mb-6">Desglose por tipo</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-violet-500/10 rounded-lg text-center">
            <p className="text-3xl font-bold text-violet-400">{stats?.series_count || 0}</p>
            <p className="text-slate-400 text-sm">Series</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg text-center">
            <p className="text-3xl font-bold text-blue-400">{stats?.miniseries_count || 0}</p>
            <p className="text-slate-400 text-sm">Miniseries</p>
          </div>
          <div className="p-4 bg-pink-500/10 rounded-lg text-center">
            <p className="text-3xl font-bold text-pink-400">{stats?.movies_count || 0}</p>
            <p className="text-slate-400 text-sm">Películas</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg text-center">
            <p className="text-3xl font-bold text-green-400">{stats?.anime_count || 0}</p>
            <p className="text-slate-400 text-sm">Anime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
