import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Search, 
  Edit, 
  Trash2, 
  Play,
  Loader2,
  Film,
  Server,
  Eye
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

export default function AdminAllEpisodes() {
  const [episodes, setEpisodes] = useState([]);
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [episodesRes, contentsRes] = await Promise.all([
        adminApi.getAllEpisodes({
          search: searchQuery || undefined,
          content_id: selectedContent !== 'all' ? selectedContent : undefined,
          limit: 100,
        }),
        adminApi.getContents({ limit: 200 }),
      ]);
      setEpisodes(episodesRes.data);
      setContents(contentsRes.data.filter(c => c.content_type !== 'pelicula'));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar episodios');
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
      await adminApi.deleteEpisode(deleteId);
      toast.success('Episodio eliminado');
      setEpisodes(episodes.filter(e => e.id !== deleteId));
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div data-testid="admin-all-episodes-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Episodios</h1>
          <p className="text-slate-400 mt-1">{episodes.length} episodios encontrados</p>
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

      {/* Episodes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : episodes.length > 0 ? (
        <div className="space-y-3">
          {episodes.map((episode) => (
            <div key={episode.id} className="admin-card flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-32 h-20 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                {episode.poster || episode.thumbnail ? (
                  <img 
                    src={episode.poster || episode.thumbnail} 
                    alt={episode.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-slate-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-violet-400 text-sm font-medium">
                    T{episode.season_number} E{episode.number}
                  </span>
                  <span className={`badge text-xs ${episode.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                    {episode.status === 'published' ? 'Publicado' : 'Pendiente'}
                  </span>
                </div>
                <h3 className="text-white font-medium truncate">{episode.title}</h3>
                <p className="text-slate-400 text-sm truncate">
                  <Film className="w-3 h-3 inline mr-1" />
                  {episode.content_title}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                  <span>
                    <Server className="w-3 h-3 inline mr-1" />
                    {episode.servers?.length || 0} fuentes
                  </span>
                  {episode.duration && <span>{episode.duration} min</span>}
                  <span>
                    <Eye className="w-3 h-3 inline mr-1" />
                    {episode.views || 0} vistas
                  </span>
                </div>
                {(episode.tmdb_id || episode.imdb_id) && (
                  <p className="text-slate-600 text-xs mt-1">
                    {episode.tmdb_id && `TMDB: ${episode.tmdb_id}`}
                    {episode.tmdb_id && episode.imdb_id && ' • '}
                    {episode.imdb_id && `IMDb: ${episode.imdb_id}`}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/episodios/${episode.id}/editar`}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Link>
                <button
                  onClick={() => setDeleteId(episode.id)}
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
          <Play className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No hay episodios</p>
          <p className="text-slate-500 text-sm">
            Los episodios se crean desde la página de cada temporada
          </p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar episodio?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta acción no se puede deshacer.
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
