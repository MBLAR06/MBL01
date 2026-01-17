import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Image } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminSeasonForm() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    slug: '',
    custom_url: '',
    poster: '',
    backdrop: '',
    year: '',
    synopsis: '',
    tmdb_id: '',
    imdb_id: '',
    air_date: '',
    status: 'pending',
  });

  const [seasonInfo, setSeasonInfo] = useState({
    content_title: '',
    content_type: '',
    content_slug: '',
    episode_count: 0,
  });

  useEffect(() => {
    fetchSeason();
  }, [seasonId]);

  const fetchSeason = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSeason(seasonId);
      const season = res.data;
      
      setFormData({
        number: season.number?.toString() || '',
        title: season.title || '',
        slug: season.slug || '',
        custom_url: season.custom_url || '',
        poster: season.poster || '',
        backdrop: season.backdrop || '',
        year: season.year?.toString() || '',
        synopsis: season.synopsis || '',
        tmdb_id: season.tmdb_id || '',
        imdb_id: season.imdb_id || '',
        air_date: season.air_date || '',
        status: season.status || 'pending',
      });

      setSeasonInfo({
        content_title: season.content_title || '',
        content_type: season.content_type || '',
        content_slug: season.content_slug || '',
        episode_count: season.episode_count || 0,
      });
    } catch (error) {
      toast.error('Error al cargar la temporada');
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.number || !formData.slug) {
      toast.error('Número y slug son requeridos');
      return;
    }

    setIsSaving(true);
    try {
      await adminApi.updateSeason(seasonId, {
        ...formData,
        number: formData.number ? parseInt(formData.number) : undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
      });
      toast.success('Temporada actualizada');
      navigate(-1);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar');
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
    <div data-testid="admin-season-form">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Editar Temporada</h1>
          <p className="text-slate-400 text-sm">
            {seasonInfo.content_title} • Temporada {formData.number}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">Información de la Temporada</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Número de Temporada *</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Slug (URL) *</label>
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
                  <label className="form-label">URL Personalizada</label>
                  <input
                    type="text"
                    name="custom_url"
                    value={formData.custom_url}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="/mi-serie/temporada-1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sinopsis</label>
                <textarea
                  name="synopsis"
                  value={formData.synopsis}
                  onChange={handleChange}
                  className="form-textarea"
                  rows={3}
                  placeholder="Descripción de la temporada..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Estreno</label>
                <input
                  type="date"
                  name="air_date"
                  value={formData.air_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* IDs */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">IDs Externos (TMDB/IMDb)</h2>
              <p className="text-slate-400 text-sm mb-4">
                Estos IDs permiten identificar la temporada en bases de datos externas para importar información.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">TMDB ID</label>
                  <input
                    type="text"
                    name="tmdb_id"
                    value={formData.tmdb_id}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="123456"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IMDb ID</label>
                  <input
                    type="text"
                    name="imdb_id"
                    value={formData.imdb_id}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="tt1234567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">Imágenes</h2>

              <div className="form-group">
                <label className="form-label">Portada</label>
                {formData.poster ? (
                  <img src={formData.poster} alt="Poster" className="w-full aspect-[2/3] object-cover rounded-lg mb-2" />
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
                  className="form-input text-sm"
                  placeholder="URL de la portada"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fondo (backdrop)</label>
                <input
                  type="url"
                  name="backdrop"
                  value={formData.backdrop}
                  onChange={handleChange}
                  className="form-input text-sm"
                  placeholder="URL del fondo"
                />
              </div>
            </div>

            {/* Status */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">Estado</h2>
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
              
              <p className="text-slate-500 text-xs mt-2">
                {seasonInfo.episode_count} episodios en esta temporada
              </p>
            </div>

            {/* Save */}
            <div className="admin-card">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Guardar Cambios
              </button>
            </div>

            {/* Preview URL */}
            {seasonInfo.content_slug && (
              <div className="admin-card">
                <h3 className="text-sm font-medium text-white mb-2">URL de la Temporada</h3>
                <p className="text-slate-400 text-xs break-all">
                  /{seasonInfo.content_type === 'serie' ? 'series' : seasonInfo.content_type === 'anime' ? 'anime' : 'miniseries'}/{seasonInfo.content_slug}/temporada/{formData.slug}
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
