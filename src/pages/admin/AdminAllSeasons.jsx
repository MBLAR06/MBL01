import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Layers,
  Play,
  Loader2,
  Film,
  Calendar
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminAllSeasons() {
  const [seasons, setSeasons] = useState([]);
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [seasonsRes, contentsRes] = await Promise.all([
        adminApi.getAllSeasons({
          search: searchQuery || undefined,
          content_id: selectedContent !== 'all' ? selectedContent : undefined,
          limit: 100,
        }),
        adminApi.getContents({ limit: 200 }),
      ]);
      setSeasons(seasonsRes.data);
      setContents(contentsRes.data.filter(c => c.content_type !== 'pelicula'));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar temporadas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedContent]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== '') fetchData();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteSeason(deleteId);
      toast.success('Temporada eliminada');
      setSeasons(seasons.filter(s => s.id !== deleteId));
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div data-testid="admin-all-seasons-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Temporadas</h1>
          <p className="text-slate-400 mt-1">{seasons.length} temporadas encontradas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, TMDB ID o IMDb ID..."
            className="form-input pl-10"
          />
        </div>

        <Select value={selectedContent} onValueChange={setSelectedContent}>
          <SelectTrigger className="w-64 bg-slate-800 border-white/10 text-white">
            <SelectValue placeholder="Filtrar por contenido" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10 max-h-64">
            <SelectItem value="all">Todos los contenidos</SelectItem>
            {contents.map((content) => (
              <SelectItem key={content.id} value={content.id}>
                {content.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Seasons Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : seasons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasons.map((season) => (
            <div key={season.id} className="admin-card">
              <div className="flex items-start gap-4">
                {/* Poster */}
                <div className="w-20 h-28 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                  {season.poster ? (
                    <img src={season.poster} alt={season.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Layers className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-xs ${season.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                      {season.status === 'published' ? 'Publicada' : 'Pendiente'}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold">
                    Temporada {season.number}
                    {season.title && `: ${season.title}`}
                  </h3>
                  <p className="text-slate-400 text-sm truncate">{season.content_title}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    <Film className="w-3 h-3 inline mr-1" />
                    {season.content_type} • {season.episode_count || 0} episodios
                  </p>
                  {season.year && (
                    <p className="text-slate-500 text-xs">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {season.year}
                    </p>
                  )}
                  {(season.tmdb_id || season.imdb_id) && (
                    <p className="text-slate-600 text-xs mt-1">
                      {season.tmdb_id && `TMDB: ${season.tmdb_id}`}
                      {season.tmdb_id && season.imdb_id && ' • '}
                      {season.imdb_id && `IMDb: ${season.imdb_id}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <Link
                  to={`/admin/temporadas/${season.id}/episodios`}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4" />
                  Episodios
                </Link>
                <Link
                  to={`/admin/temporadas/${season.id}/editar`}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-slate-400" />
                </Link>
                <button
                  onClick={() => setDeleteId(season.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 admin-card">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No hay temporadas</p>
          <p className="text-slate-500 text-sm">
            Las temporadas se crean desde la página de cada contenido (Serie, Miniserie o Anime)
          </p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar temporada?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta acción eliminará también todos los episodios de esta temporada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-white/10 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
