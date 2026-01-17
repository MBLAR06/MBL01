import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Loader2,
  Save,
  X,
  Server
} from 'lucide-react';
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

export default function AdminEpisodes() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const [season, setSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    number: '',
    title: '',
    slug: '',
    synopsis: '',
    duration: '',
    poster: '',
    status: 'pending',
    servers: [],
  });

  const [newServer, setNewServer] = useState({ 
    name: '', 
    url: '', 
    subtitles: '', 
    audio: '', 
    quality: '' 
  });

  useEffect(() => {
    fetchData();
  }, [seasonId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const episodesRes = await adminApi.getEpisodes(seasonId);
      setEpisodes(episodesRes.data);
    } catch (error) {
      toast.error('Error al cargar episodios');
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (episode = null) => {
    if (episode) {
      setEditingEpisode(episode);
      setFormData({
        number: episode.number.toString(),
        title: episode.title,
        slug: episode.slug,
        synopsis: episode.synopsis || '',
        duration: episode.duration?.toString() || '',
        poster: episode.poster || '',
        status: episode.status,
        servers: episode.servers || [],
      });
    } else {
      setEditingEpisode(null);
      const nextNumber = episodes.length + 1;
      setFormData({
        number: nextNumber.toString(),
        title: `Episodio ${nextNumber}`,
        slug: nextNumber.toString(),
        synopsis: '',
        duration: '',
        poster: '',
        status: 'pending',
        servers: [],
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

    if (name === 'number' && !editingEpisode) {
      setFormData((prev) => ({
        ...prev,
        slug: value,
        title: `Episodio ${value}`,
      }));
    }
  };

  const addServer = () => {
    if (newServer.name.trim() && newServer.url.trim()) {
      setFormData((prev) => ({
        ...prev,
        servers: [...prev.servers, { ...newServer, is_active: true }],
      }));
      setNewServer({ name: '', url: '', subtitles: '', audio: '', quality: '' });
    }
  };

  const removeServer = (index) => {
    setFormData((prev) => ({
      ...prev,
      servers: prev.servers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.number || !formData.title || !formData.slug) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      const dataToSend = {
        ...formData,
        number: parseInt(formData.number),
        duration: formData.duration ? parseInt(formData.duration) : null,
      };

      if (editingEpisode) {
        await adminApi.updateEpisode(editingEpisode.id, dataToSend);
        toast.success('Episodio actualizado');
      } else {
        await adminApi.createEpisode(seasonId, dataToSend);
        toast.success('Episodio creado');
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
      await adminApi.deleteEpisode(deleteId);
      toast.success('Episodio eliminado');
      setEpisodes(episodes.filter(e => e.id !== deleteId));
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
    <div data-testid="admin-episodes-page">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Episodios</h1>
          <p className="text-slate-400 text-sm mt-1">{episodes.length} episodios</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo episodio
        </button>
      </div>

      {/* Episodes List */}
      {episodes.length > 0 ? (
        <div className="space-y-3">
          {episodes.map((episode) => (
            <div key={episode.id} className="admin-card flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                {episode.poster ? (
                  <img
                    src={episode.poster}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-violet-400 text-sm">Ep. {episode.number}</span>
                  <span className={`badge text-xs ${episode.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                    {episode.status === 'published' ? 'Publicado' : 'Pendiente'}
                  </span>
                </div>
                <h3 className="text-white font-medium truncate">{episode.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                  {episode.duration && <span>{episode.duration} min</span>}
                  <span>{episode.servers?.length || 0} servidores</span>
                  <span>{episode.views || 0} vistas</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenForm(episode)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-slate-400" />
                </button>
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
          <p className="text-slate-400 mb-4">No hay episodios aún</p>
          <button
            onClick={() => handleOpenForm()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar primer episodio
          </button>
        </div>
      )}

      {/* Episode Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingEpisode ? 'Editar episodio' : 'Nuevo episodio'}
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
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Duración (min)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="45"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Título *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="Título del episodio"
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
              <label className="form-label">Sinopsis</label>
              <textarea
                name="synopsis"
                value={formData.synopsis}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Descripción del episodio..."
                rows={3}
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
                placeholder="URL de la miniatura"
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
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Servers Section */}
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Server className="w-4 h-4" />
                Servidores de reproducción
              </label>
              
              {/* Current Servers */}
              {formData.servers.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.servers.map((server, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{server.name}</p>
                        <p className="text-slate-400 text-xs truncate">{server.url}</p>
                        <div className="flex gap-2 mt-1 text-xs text-slate-500">
                          {server.subtitles && <span>Sub: {server.subtitles}</span>}
                          {server.audio && <span>Audio: {server.audio}</span>}
                          {server.quality && <span>{server.quality}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeServer(index)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Server Form */}
              <div className="space-y-2 p-3 bg-slate-800/30 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newServer.name}
                    onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                    className="form-input text-sm"
                    placeholder="Nombre (ej: ok.ru)"
                  />
                  <input
                    type="text"
                    value={newServer.quality}
                    onChange={(e) => setNewServer({ ...newServer, quality: e.target.value })}
                    className="form-input text-sm"
                    placeholder="Calidad (HD, 1080p)"
                  />
                </div>
                <input
                  type="text"
                  value={newServer.url}
                  onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                  className="form-input text-sm"
                  placeholder="URL o código embed"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newServer.subtitles}
                    onChange={(e) => setNewServer({ ...newServer, subtitles: e.target.value })}
                    className="form-input text-sm"
                    placeholder="Subtítulos (Español)"
                  />
                  <input
                    type="text"
                    value={newServer.audio}
                    onChange={(e) => setNewServer({ ...newServer, audio: e.target.value })}
                    className="form-input text-sm"
                    placeholder="Audio (Latino)"
                  />
                </div>
                <button
                  type="button"
                  onClick={addServer}
                  className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar servidor
                </button>
              </div>
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
            <AlertDialogTitle className="text-white">¿Eliminar episodio?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta acción no se puede deshacer.
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
