import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Layers,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { getContentTypeName, getStatusLabel, getStatusBadgeClass, formatDate } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function AdminContents() {
  const [searchParams] = useSearchParams();
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState(searchParams.get('type') || '');
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchContents = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getContents({
        search: searchQuery || undefined,
        content_type: contentType || undefined,
        status: status || undefined,
        limit: 100,
      });
      setContents(res.data);
    } catch (error) {
      console.error('Error fetching contents:', error);
      toast.error('Error al cargar contenidos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [contentType, status]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== '') {
        fetchContents();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await adminApi.deleteContent(deleteId);
      toast.success('Contenido eliminado');
      setContents(contents.filter(c => c.id !== deleteId));
    } catch (error) {
      toast.error('Error al eliminar el contenido');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div data-testid="admin-contents-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Contenidos</h1>
          <p className="text-slate-400 mt-1">{contents.length} contenidos encontrados</p>
        </div>
        <Link to="/admin/contenidos/nuevo" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Agregar contenido
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, TMDB ID o IMDb ID..."
            className="form-input pl-10"
            data-testid="search-contents"
          />
        </div>

        {/* Type Filter */}
        <Select value={contentType || 'all'} onValueChange={(v) => setContentType(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40 bg-slate-800 border-white/10 text-white" data-testid="filter-type">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="serie">Series</SelectItem>
            <SelectItem value="miniserie">Miniseries</SelectItem>
            <SelectItem value="pelicula">Películas</SelectItem>
            <SelectItem value="anime">Anime</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40 bg-slate-800 border-white/10 text-white" data-testid="filter-status">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contents Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : contents.length > 0 ? (
        <div className="admin-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Contenido</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Vistas</th>
                  <th>Fecha</th>
                  <th className="w-20">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((content) => (
                  <tr key={content.id} data-testid={`content-row-${content.id}`}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={content.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=50&h=75&fit=crop'}
                          alt={content.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                        <div>
                          <p className="text-white font-medium">{content.title}</p>
                          <p className="text-slate-500 text-xs">{content.year || 'Sin año'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-slate-300 text-sm">
                        {getContentTypeName(content.content_type)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(content.status)}`}>
                        {getStatusLabel(content.status)}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-300">{content.views || 0}</span>
                    </td>
                    <td>
                      <span className="text-slate-400 text-sm">
                        {formatDate(content.created_at)}
                      </span>
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-white/10">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/contenidos/${content.id}`} className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          {content.content_type !== 'pelicula' && (
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/contenidos/${content.id}/temporadas`} className="flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Temporadas
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <a 
                              href={`/${content.content_type === 'pelicula' ? 'peliculas' : content.content_type === 'serie' ? 'series' : content.content_type === 'miniserie' ? 'miniseries' : 'anime'}/${content.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Ver en público
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(content.id)}
                            className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No se encontraron contenidos</p>
          <Link to="/admin/contenidos/nuevo" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar contenido
          </Link>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar contenido?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta acción no se puede deshacer. Se eliminarán también todas las temporadas y episodios asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-white/10 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
