import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Layers,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { generateSlug } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export default function AdminSeasons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    number: '',
    title: '',
    slug: '',
    poster: '',
    year: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [contentRes, seasonsRes] = await Promise.all([
        adminApi.getContent(id),
        adminApi.getSeasons(id),
      ]);
      setContent(contentRes.data);
      setSeasons(seasonsRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
      navigate('/admin/contenidos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (season = null) => {
    if (season) {
      setEditingSeason(season);
      setFormData({
        number: season.number.toString(),
        title: season.title || '',
        slug: season.slug,
        poster: season.poster || '',
        year: season.year?.toString() || '',
        status: season.status,
      });
    } else {
      setEditingSeason(null);
      const nextNumber = seasons.length + 1;
      setFormData({
        number: nextNumber.toString(),
        title: '',
        slug: nextNumber.toString(),
        poster: '',
        year: '',
        status: 'pending',
      });
    }
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'number' && !editingSeason) {
      setFormData((prev) => ({
        ...prev,
        slug: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.number || !formData.slug) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      const dataToSend = {
        ...formData,
        number: parseInt(formData.number),
        year: formData.year ? parseInt(formData.year) : null,
      };

      if (editingSeason) {
        await adminApi.updateSeason(editingSeason.id, dataToSend);
        toast.success('Temporada actualizada');
      } else {
        await adminApi.createSeason(id, dataToSend);
        toast.success('Temporada creada');
      }
      
      setShowForm(false);
      fetchData();
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al guardar';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="admin-seasons-page">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/contenidos')}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Temporadas</h1>
          <p className="text-slate-400 text-sm mt-1">{content?.title}</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva temporada
        </button>
      </div>

      {/* Seasons List */}
      {seasons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasons.map((season) => (
            <div key={season.id} className="admin-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Temporada {season.number}
                  </h3>
                  {season.title && (
                    <p className="text-slate-400 text-sm">{season.title}</p>
                  )}
                </div>
                <span className={`badge ${season.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                  {season.status === 'published' ? 'Publicada' : 'Pendiente'}
                </span>
              </div>

              <div className="text-sm text-slate-400 space-y-1 mb-4">
                <p>Episodios: {season.episode_count || 0}</p>
                {season.year && <p>Año: {season.year}</p>}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/temporadas/${season.id}/episodios`}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                >
                  <Layers className="w-4 h-4" />
                  Episodios
                </Link>
                <button
                  onClick={() => handleOpenForm(season)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-slate-400" />
                </button>
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
          <p className="text-slate-400 mb-4">No hay temporadas aún</p>
          <button
            onClick={() => handleOpenForm()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar primera temporada
          </button>
        </div>
      )}

      {/* Season Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingSeason ? 'Editar temporada' : 'Nueva temporada'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Número *</label>
                <input
                  type="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="1"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Año</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Título (opcional)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="Título de la temporada"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="form-input"
                placeholder="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Portada (URL)</label>
              <input
                type="url"
                name="poster"
                value={formData.poster}
                onChange={handleChange}
                className="form-input"
                placeholder="URL de la portada"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
              >
                <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="published">Publicada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
