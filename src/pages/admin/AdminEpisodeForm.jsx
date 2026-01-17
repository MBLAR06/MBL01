import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  X, 
  Server,
  Play,
  GripVertical
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminEpisodeForm() {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    slug: '',
    custom_url: '',
    synopsis: '',
    duration: '',
    poster: '',
    thumbnail: '',
    tmdb_id: '',
    imdb_id: '',
    air_date: '',
    status: 'pending',
    servers: [],
  });

  const [episodeInfo, setEpisodeInfo] = useState({
    content_title: '',
    content_type: '',
    season_number: 0,
  });

  const [newServer, setNewServer] = useState({
    name: '',
    url: '',
    embed_type: 'iframe',
    subtitles: '',
    audio: '',
    quality: '',
    is_active: true,
    order: 0,
  });

  useEffect(() => {
    fetchEpisode();
  }, [episodeId]);

  const fetchEpisode = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getEpisode(episodeId);
      const episode = res.data;
      
      setFormData({
        number: episode.number?.toString() || '',
        title: episode.title || '',
        slug: episode.slug || '',
        custom_url: episode.custom_url || '',
        synopsis: episode.synopsis || '',
        duration: episode.duration?.toString() || '',
        poster: episode.poster || '',
        thumbnail: episode.thumbnail || '',
        tmdb_id: episode.tmdb_id || '',
        imdb_id: episode.imdb_id || '',
        air_date: episode.air_date || '',
        status: episode.status || 'pending',
        servers: episode.servers || [],
      });

      setEpisodeInfo({
        content_title: episode.content_title || '',
        content_type: episode.content_type || '',
        season_number: episode.season_number || 0,
        content_slug: episode.content_slug || '',
        season_slug: episode.season_slug || '',
      });
    } catch (error) {
      toast.error('Error al cargar el episodio');
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addServer = () => {
    if (!newServer.name.trim() || !newServer.url.trim()) {
      toast.error('Nombre y URL/Código son requeridos');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      servers: [...prev.servers, { ...newServer, order: prev.servers.length }],
    }));

    setNewServer({
      name: '',
      url: '',
      embed_type: 'iframe',
      subtitles: '',
      audio: '',
      quality: '',
      is_active: true,
      order: 0,
    });
  };

  const removeServer = (index) => {
    setFormData((prev) => ({
      ...prev,
      servers: prev.servers.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })),
    }));
  };

  const toggleServerActive = (index) => {
    setFormData((prev) => ({
      ...prev,
      servers: prev.servers.map((s, i) => 
        i === index ? { ...s, is_active: !s.is_active } : s
      ),
    }));
  };

  const moveServer = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.servers.length) return;

    const newServers = [...formData.servers];
    [newServers[index], newServers[newIndex]] = [newServers[newIndex], newServers[index]];
    setFormData((prev) => ({
      ...prev,
      servers: newServers.map((s, i) => ({ ...s, order: i })),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      toast.error('Título y slug son requeridos');
      return;
    }

    setIsSaving(true);
    try {
      await adminApi.updateEpisode(episodeId, {
        ...formData,
        number: formData.number ? parseInt(formData.number) : undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
      });
      toast.success('Episodio actualizado');
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
    <div data-testid="admin-episode-form">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Editar Episodio</h1>
          <p className="text-slate-400 text-sm">
            {episodeInfo.content_title} • T{episodeInfo.season_number} E{formData.number}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">Información del Episodio</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Número de Episodio *</label>
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
                  <label className="form-label">Duración (minutos)</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Slug (URL) *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="episodio-1"
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
                    placeholder="/mi-serie/t1/ep1-titulo"
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
                  placeholder="Descripción del episodio..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Emisión</label>
                <input
                  type="date"
                  name="air_date"
                  value={formData.air_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Video Sources */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5" />
                Fuentes de Video
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                Añade los servidores donde está alojado el episodio. El usuario podrá elegir entre ellos.
              </p>

              {/* Existing Servers */}
              {formData.servers.length > 0 && (
                <div className="space-y-3 mb-6">
                  {formData.servers.map((server, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${server.is_active ? 'bg-slate-800/50 border-white/10' : 'bg-slate-900/50 border-white/5 opacity-60'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => moveServer(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                          >
                            <GripVertical className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-medium">{server.name}</span>
                            <span className="badge badge-violet text-xs">{server.embed_type}</span>
                            {server.quality && (
                              <span className="text-xs text-slate-400">{server.quality}</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs truncate mb-2">{server.url}</p>
                          <div className="flex gap-3 text-xs text-slate-400">
                            {server.subtitles && <span>Sub: {server.subtitles}</span>}
                            {server.audio && <span>Audio: {server.audio}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleServerActive(index)}
                            className={`px-2 py-1 rounded text-xs ${server.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}
                          >
                            {server.is_active ? 'Activo' : 'Inactivo'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeServer(index)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Server */}
              <div className="p-4 bg-slate-800/30 rounded-lg border border-dashed border-white/10">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Fuente de Video
                </h4>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={newServer.name}
                    onChange={(e) => setNewServer(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input text-sm"
                    placeholder="Nombre (ej: ok.ru, Streamtape)"
                  />
                  <Select
                    value={newServer.embed_type}
                    onValueChange={(v) => setNewServer(prev => ({ ...prev, embed_type: v }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-white/10 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10">
                      <SelectItem value="iframe">iFrame URL</SelectItem>
                      <SelectItem value="embed">Código Embed HTML</SelectItem>
                      <SelectItem value="mp4">URL MP4 Directa</SelectItem>
                      <SelectItem value="shortcode">Código Corto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <textarea
                  value={newServer.url}
                  onChange={(e) => setNewServer(prev => ({ ...prev, url: e.target.value }))}
                  className="form-textarea text-sm mb-3"
                  rows={2}
                  placeholder={
                    newServer.embed_type === 'embed' 
                      ? '<iframe src="..." allowfullscreen></iframe>' 
                      : newServer.embed_type === 'shortcode'
                      ? 'Código corto del servidor (ej: abc123xyz)'
                      : 'https://ejemplo.com/embed/video123'
                  }
                />

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    value={newServer.quality}
                    onChange={(e) => setNewServer(prev => ({ ...prev, quality: e.target.value }))}
                    className="form-input text-sm"
                    placeholder="Calidad (720p, 1080p)"
                  />
                  <input
                    type="text"
                    value={newServer.subtitles}
                    onChange={(e) => setNewServer(prev => ({ ...prev, subtitles: e.target.value }))}
                    className="form-input text-sm"
                    placeholder="Subtítulos (Español)"
                  />
                  <input
                    type="text"
                    value={newServer.audio}
                    onChange={(e) => setNewServer(prev => ({ ...prev, audio: e.target.value }))}
                    className="form-input text-sm"
                    placeholder="Audio (Original, Latino)"
                  />
                </div>

                <button
                  type="button"
                  onClick={addServer}
                  className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Fuente
                </button>
              </div>
            </div>

            {/* IDs */}
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-white mb-4">IDs Externos (TMDB/IMDb)</h2>
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
                {formData.poster && (
                  <img src={formData.poster} alt="Poster" className="w-full aspect-video object-cover rounded-lg mb-2" />
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
                <label className="form-label">Miniatura</label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="form-input text-sm"
                  placeholder="URL de la miniatura"
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
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Preview Link */}
            {episodeInfo.content_slug && (
              <div className="admin-card">
                <h3 className="text-sm font-medium text-white mb-2">Vista Previa</h3>
                <p className="text-slate-400 text-xs break-all">
                  /{episodeInfo.content_type === 'serie' ? 'series' : episodeInfo.content_type === 'anime' ? 'anime' : 'miniseries'}/{episodeInfo.content_slug}/temporada/{episodeInfo.season_slug}/episodio/{formData.slug}
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
