import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { Save, ArrowLeft, Loader2, Plus, X, Image } from 'lucide-react';
import { generateSlug } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function AdminContentForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    content_type: searchParams.get('type') || 'serie',
    title: '',
    slug: '',
    year: '',
    synopsis: '',
    genres: [],
    tags: [],
    rating: '',
    production_company: '',
    producer: '',
    cast: [],
    poster: '',
    backdrop: '',
    gallery: [],
    trailer_url: '',
    tmdb_id: '',
    imdb_id: '',
    country: '',
    status: 'pending',
    is_featured: false,
    is_trending: false,
    is_popular: false,
    servers: [],
  });

  const [newGenre, setNewGenre] = useState('');
  const [newCast, setNewCast] = useState('');
  const [newServer, setNewServer] = useState({ name: '', url: '', subtitles: '', audio: '', quality: '' });

  useEffect(() => {
    if (isEditing) {
      fetchContent();
    }
  }, [id]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getContent(id);
      setFormData({
        ...res.data,
        year: res.data.year?.toString() || '',
        rating: res.data.rating?.toString() || '',
        genres: res.data.genres || [],
        tags: res.data.tags || [],
        cast: res.data.cast || [],
        gallery: res.data.gallery || [],
        servers: res.data.servers || [],
      });
    } catch (error) {
      toast.error('Error al cargar el contenido');
      navigate('/admin/contenidos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title
    if (name === 'title' && !isEditing) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const addGenre = () => {
    if (newGenre.trim() && !formData.genres.includes(newGenre.trim())) {
      setFormData((prev) => ({
        ...prev,
        genres: [...prev.genres, newGenre.trim()],
      }));
      setNewGenre('');
    }
  };

  const removeGenre = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.filter((g) => g !== genre),
    }));
  };

  const addCast = () => {
    if (newCast.trim() && !formData.cast.includes(newCast.trim())) {
      setFormData((prev) => ({
        ...prev,
        cast: [...prev.cast, newCast.trim()],
      }));
      setNewCast('');
    }
  };

  const removeCast = (actor) => {
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast.filter((c) => c !== actor),
    }));
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

    if (!formData.title || !formData.slug || !formData.content_type) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      const dataToSend = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
      };

      if (isEditing) {
        await adminApi.updateContent(id, dataToSend);
        toast.success('Contenido actualizado');
      } else {
        await adminApi.createContent(dataToSend);
        toast.success('Contenido creado');
      }
      navigate('/admin/contenidos');
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al guardar';
      toast.error(message);
    } finally {
      setIsSaving(false);
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
    <div data-testid="admin-content-form">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/contenidos')}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Editar contenido' : 'Nuevo contenido'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isEditing ? 'Modifica los datos del contenido' : 'Completa los datos para crear un nuevo contenido'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">Información básica</h2>

              {/* Content Type */}
              <div className="form-group">
                <label className="form-label">Tipo de contenido *</label>
                <Select
                  value={formData.content_type}
                  onValueChange={(v) => handleSelectChange('content_type', v)}
                >
                  <SelectTrigger className="bg-slate-800 border-white/10 text-white" data-testid="input-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="serie">Serie</SelectItem>
                    <SelectItem value="miniserie">Miniserie</SelectItem>
                    <SelectItem value="pelicula">Película</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">Título *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Título del contenido"
                  data-testid="input-title"
                />
              </div>

              {/* Slug */}
              <div className="form-group">
                <label htmlFor="slug" className="form-label">Slug (URL) *</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="titulo-del-contenido"
                  data-testid="input-slug"
                />
              </div>

              {/* Year & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="year" className="form-label">Año</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="2024"
                    data-testid="input-year"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rating" className="form-label">Calificación</label>
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="8.5"
                    step="0.1"
                    min="0"
                    max="10"
                    data-testid="input-rating"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="form-group">
                <label htmlFor="country" className="form-label">País</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Tailandia, Corea del Sur..."
                  data-testid="input-country"
                />
              </div>

              {/* Synopsis */}
              <div className="form-group">
                <label htmlFor="synopsis" className="form-label">Sinopsis</label>
                <textarea
                  id="synopsis"
                  name="synopsis"
                  value={formData.synopsis}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Descripción del contenido..."
                  rows={4}
                  data-testid="input-synopsis"
                />
              </div>

              {/* Genres */}
              <div className="form-group">
                <label className="form-label">Géneros</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                    className="form-input flex-1"
                    placeholder="Agregar género..."
                    data-testid="input-genre"
                  />
                  <button
                    type="button"
                    onClick={addGenre}
                    className="btn-secondary px-4"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.genres.map((genre) => (
                    <span key={genre} className="badge badge-violet flex items-center gap-1">
                      {genre}
                      <button type="button" onClick={() => removeGenre(genre)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Cast */}
              <div className="form-group">
                <label className="form-label">Reparto</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCast}
                    onChange={(e) => setNewCast(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCast())}
                    className="form-input flex-1"
                    placeholder="Agregar actor..."
                    data-testid="input-cast"
                  />
                  <button
                    type="button"
                    onClick={addCast}
                    className="btn-secondary px-4"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.cast.map((actor) => (
                    <span key={actor} className="badge badge-violet flex items-center gap-1">
                      {actor}
                      <button type="button" onClick={() => removeCast(actor)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Production Info */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">Producción</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="production_company" className="form-label">Productora</label>
                  <input
                    type="text"
                    id="production_company"
                    name="production_company"
                    value={formData.production_company}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Nombre de la productora"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="producer" className="form-label">Productor</label>
                  <input
                    type="text"
                    id="producer"
                    name="producer"
                    value={formData.producer}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Nombre del productor"
                  />
                </div>
              </div>
            </div>

            {/* IDs */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">IDs externos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="tmdb_id" className="form-label">TMDB ID</label>
                  <input
                    type="text"
                    id="tmdb_id"
                    name="tmdb_id"
                    value={formData.tmdb_id}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="123456"
                    data-testid="input-tmdb"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imdb_id" className="form-label">IMDb ID</label>
                  <input
                    type="text"
                    id="imdb_id"
                    name="imdb_id"
                    value={formData.imdb_id}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="tt1234567"
                    data-testid="input-imdb"
                  />
                </div>
              </div>
            </div>

            {/* Servers (for movies) */}
            {formData.content_type === 'pelicula' && (
              <div className="admin-card">
                <h2 className="text-lg font-semibold text-white mb-4">Servidores de reproducción</h2>
                
                <div className="space-y-3 mb-4">
                  {formData.servers.map((server, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{server.name}</p>
                        <p className="text-slate-400 text-sm truncate">{server.url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeServer(index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newServer.name}
                      onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                      className="form-input"
                      placeholder="Nombre del servidor"
                    />
                    <input
                      type="text"
                      value={newServer.quality}
                      onChange={(e) => setNewServer({ ...newServer, quality: e.target.value })}
                      className="form-input"
                      placeholder="Calidad (HD, 1080p...)"
                    />
                  </div>
                  <input
                    type="text"
                    value={newServer.url}
                    onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                    className="form-input"
                    placeholder="URL o código embed del servidor"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newServer.subtitles}
                      onChange={(e) => setNewServer({ ...newServer, subtitles: e.target.value })}
                      className="form-input"
                      placeholder="Subtítulos (Español...)"
                    />
                    <input
                      type="text"
                      value={newServer.audio}
                      onChange={(e) => setNewServer({ ...newServer, audio: e.target.value })}
                      className="form-input"
                      placeholder="Audio (Latino, Original...)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addServer}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar servidor
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">Imágenes</h2>

              {/* Poster Preview */}
              <div className="mb-4">
                <label className="form-label">Portada</label>
                {formData.poster ? (
                  <img
                    src={formData.poster}
                    alt="Poster"
                    className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-slate-800 rounded-lg flex items-center justify-center mb-2">
                    <Image className="w-12 h-12 text-slate-600" />
                  </div>
                )}
                <input
                  type="url"
                  name="poster"
                  value={formData.poster}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="URL de la portada"
                  data-testid="input-poster"
                />
              </div>

              {/* Backdrop */}
              <div className="form-group">
                <label className="form-label">Fondo (backdrop)</label>
                <input
                  type="url"
                  name="backdrop"
                  value={formData.backdrop}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="URL del fondo"
                  data-testid="input-backdrop"
                />
              </div>

              {/* Trailer */}
              <div className="form-group">
                <label className="form-label">Tráiler (URL)</label>
                <input
                  type="url"
                  name="trailer_url"
                  value={formData.trailer_url}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="URL del tráiler"
                />
              </div>
            </div>

            {/* Status & Visibility */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">Estado y visibilidad</h2>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Estado</label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => handleSelectChange('status', v)}
                >
                  <SelectTrigger className="bg-slate-800 border-white/10 text-white" data-testid="input-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggles */}
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300">Destacado</label>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(v) => handleSwitchChange('is_featured', v)}
                    data-testid="toggle-featured"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300">Tendencia</label>
                  <Switch
                    checked={formData.is_trending}
                    onCheckedChange={(v) => handleSwitchChange('is_trending', v)}
                    data-testid="toggle-trending"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300">Popular</label>
                  <Switch
                    checked={formData.is_popular}
                    onCheckedChange={(v) => handleSwitchChange('is_popular', v)}
                    data-testid="toggle-popular"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="admin-card">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary w-full flex items-center justify-center gap-2"
                data-testid="submit-content"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditing ? 'Guardar cambios' : 'Crear contenido'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
