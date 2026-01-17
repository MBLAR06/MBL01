import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Save, Trash2, GripVertical, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminCarousel() {
  const [config, setConfig] = useState(null);
  const [contents, setContents] = useState([]);
  const [selectedContents, setSelectedContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [configRes, contentsRes] = await Promise.all([
        adminApi.getCarouselConfig(),
        adminApi.getContents({ status: 'published', limit: 100 }),
      ]);
      setConfig(configRes.data);
      setContents(contentsRes.data);

      // Map selected contents
      if (configRes.data.items && configRes.data.items.length > 0) {
        const selected = configRes.data.items
          .map(item => {
            const content = contentsRes.data.find(c => c.id === item.content_id);
            return content ? { ...content, order: item.order } : null;
          })
          .filter(Boolean)
          .sort((a, b) => a.order - b.order);
        setSelectedContents(selected);
      }
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoPopulate = (checked) => {
    setConfig(prev => ({ ...prev, auto_populate: checked }));
  };

  const handleAutoTypeChange = (value) => {
    setConfig(prev => ({ ...prev, auto_type: value }));
  };

  const addContent = (contentId) => {
    const content = contents.find(c => c.id === contentId);
    if (content && !selectedContents.find(c => c.id === contentId)) {
      setSelectedContents(prev => [
        ...prev,
        { ...content, order: prev.length }
      ]);
    }
  };

  const removeContent = (contentId) => {
    setSelectedContents(prev => 
      prev.filter(c => c.id !== contentId).map((c, i) => ({ ...c, order: i }))
    );
  };

  const moveContent = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedContents.length) return;

    const newSelected = [...selectedContents];
    [newSelected[index], newSelected[newIndex]] = [newSelected[newIndex], newSelected[index]];
    setSelectedContents(newSelected.map((c, i) => ({ ...c, order: i })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const items = selectedContents.map((c, i) => ({
        content_id: c.id,
        order: i,
      }));

      await adminApi.updateCarouselConfig({
        ...config,
        items,
      });
      toast.success('Carrusel guardado');
    } catch (error) {
      toast.error('Error al guardar');
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

  const availableContents = contents.filter(
    c => !selectedContents.find(s => s.id === c.id)
  );

  return (
    <div data-testid="admin-carousel-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Carrusel de inicio</h1>
          <p className="text-slate-400 mt-1">Configura los contenidos destacados en la página principal</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary inline-flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Guardar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-white mb-4">Configuración</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Poblado automático</p>
                <p className="text-slate-400 text-sm">
                  Si no hay contenidos seleccionados, usar automáticamente
                </p>
              </div>
              <Switch
                checked={config?.auto_populate}
                onCheckedChange={handleToggleAutoPopulate}
              />
            </div>

            {config?.auto_populate && (
              <div className="form-group">
                <label className="form-label">Tipo de auto-poblado</label>
                <Select
                  value={config?.auto_type || 'popular'}
                  onValueChange={handleAutoTypeChange}
                >
                  <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="popular">Más populares</SelectItem>
                    <SelectItem value="trending">Tendencias</SelectItem>
                    <SelectItem value="latest">Más recientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Add Content */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-white mb-4">Agregar contenido</h2>

            <Select onValueChange={addContent} value="placeholder">
              <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                <SelectValue placeholder="Selecciona un contenido..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10 max-h-64">
                {availableContents.map((content) => (
                  <SelectItem key={content.id} value={content.id}>
                    {content.title} ({content.year || 'Sin año'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          <p className="text-slate-500 text-sm mt-2">
            Máximo 10 contenidos recomendados
          </p>
        </div>
      </div>

      {/* Selected Contents */}
      <div className="admin-card mt-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Contenidos seleccionados ({selectedContents.length}/10)
        </h2>

        {selectedContents.length > 0 ? (
          <div className="space-y-2">
            {selectedContents.map((content, index) => (
              <div
                key={content.id}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveContent(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <span className="w-8 h-8 flex items-center justify-center bg-violet-500/20 rounded-full text-violet-400 font-bold text-sm">
                  {index + 1}
                </span>

                <img
                  src={content.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=50&h=75&fit=crop'}
                  alt={content.title}
                  className="w-12 h-16 object-cover rounded"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{content.title}</p>
                  <p className="text-slate-400 text-sm">
                    {content.content_type} • {content.year || 'Sin año'}
                  </p>
                </div>

                <button
                  onClick={() => removeContent(content.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
            <Plus className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">
              No hay contenidos seleccionados
            </p>
            <p className="text-slate-500 text-sm">
              {config?.auto_populate 
                ? `Se mostrarán automáticamente los más ${config.auto_type === 'popular' ? 'populares' : config.auto_type === 'trending' ? 'tendencia' : 'recientes'}`
                : 'Selecciona contenidos para mostrar en el carrusel'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
