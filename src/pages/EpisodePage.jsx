import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicApi } from '@/lib/api';
import { 
  ChevronLeft, 
  ChevronRight,
  Server,
  Subtitles,
  Volume2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn, getContentTypeSlug } from '@/lib/utils';

export default function EpisodePage() {
  const { type, slug, seasonSlug, episodeSlug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [season, setSeason] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [contentRes, seasonRes, episodeRes, episodesRes] = await Promise.all([
          publicApi.getContentBySlug(slug),
          publicApi.getSeasonBySlug(slug, seasonSlug),
          publicApi.getEpisodeBySlug(slug, seasonSlug, episodeSlug),
          publicApi.getSeasonEpisodes(slug, seasonSlug),
        ]);

        setContent(contentRes.data);
        setSeason(seasonRes.data);
        setEpisode(episodeRes.data);
        setEpisodes(episodesRes.data);

        // Set default server
        if (episodeRes.data.servers && episodeRes.data.servers.length > 0) {
          const activeServer = episodeRes.data.servers.find(s => s.is_active);
          setSelectedServer(activeServer || episodeRes.data.servers[0]);
        }
      } catch (error) {
        console.error('Error fetching episode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, seasonSlug, episodeSlug]);

  const currentEpisodeIndex = episodes.findIndex(e => e.slug === episodeSlug);
  const prevEpisode = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
  const nextEpisode = currentEpisodeIndex < episodes.length - 1 ? episodes[currentEpisodeIndex + 1] : null;

  const goToEpisode = (ep) => {
    if (!ep || !content) return;
    const typeSlug = getContentTypeSlug(content.content_type);
    navigate(`/${typeSlug}/${slug}/temporada/${seasonSlug}/episodio/${ep.slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!episode || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Episodio no encontrado</h1>
          <p className="text-slate-400">El episodio que buscas no existe o no está disponible.</p>
          <Link to="/" className="btn-primary mt-4 inline-block">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const typeSlug = getContentTypeSlug(content.content_type);
  const servers = episode.servers?.filter(s => s.is_active) || [];

  return (
    <div className="min-h-screen bg-black" data-testid="episode-page">
      {/* Player Section */}
      <div className="pt-16">
        {/* Video Player */}
        <div className="aspect-video bg-black max-w-7xl mx-auto">
          {selectedServer ? (
            <div className="player-container w-full h-full">
              {selectedServer.url.includes('<iframe') || selectedServer.url.includes('<embed') ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedServer.url }}
                  className="w-full h-full"
                  data-testid="video-player"
                />
              ) : (
                <iframe
                  src={selectedServer.url}
                  title={episode.title}
                  allowFullScreen
                  className="w-full h-full"
                  data-testid="video-player"
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No hay servidores disponibles para este episodio.</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Server Selection */}
          {servers.length > 0 && (
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-white font-medium mb-3">
                <Server className="w-4 h-4" />
                Servidores
              </h3>
              <div className="flex flex-wrap gap-2">
                {servers.map((server, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedServer(server)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      selectedServer?.url === server.url
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    )}
                    data-testid={`server-btn-${index}`}
                  >
                    {server.name || `Servidor ${index + 1}`}
                    {server.quality && (
                      <span className="ml-2 text-xs opacity-70">{server.quality}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Server Info */}
              {selectedServer && (selectedServer.subtitles || selectedServer.audio) && (
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                  {selectedServer.subtitles && (
                    <span className="flex items-center gap-1">
                      <Subtitles className="w-4 h-4" />
                      {selectedServer.subtitles}
                    </span>
                  )}
                  {selectedServer.audio && (
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-4 h-4" />
                      {selectedServer.audio}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Episode Navigation */}
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <button
              onClick={() => goToEpisode(prevEpisode)}
              disabled={!prevEpisode}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                prevEpisode
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
              )}
              data-testid="prev-episode-btn"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Episodio anterior</span>
            </button>

            <Link
              to={`/${typeSlug}/${slug}`}
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Ver todos los episodios
            </Link>

            <button
              onClick={() => goToEpisode(nextEpisode)}
              disabled={!nextEpisode}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                nextEpisode
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
              )}
              data-testid="next-episode-btn"
            >
              <span className="hidden sm:inline">Episodio siguiente</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Episode Info */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <Link to={`/${typeSlug}/${slug}`} className="hover:text-white transition-colors">
                {content.title}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span>Temporada {season?.number}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Episodio {episode.number}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" data-testid="episode-title">
              {episode.title}
            </h1>

            {episode.synopsis && (
              <p className="text-slate-300 leading-relaxed mt-4">
                {episode.synopsis}
              </p>
            )}

            {episode.duration && (
              <p className="text-slate-500 text-sm mt-4">
                Duración: {episode.duration} minutos
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Episode List */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-t border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">
          Más episodios de la Temporada {season?.number}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {episodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => goToEpisode(ep)}
              className={cn(
                'p-3 rounded-lg text-left transition-all',
                ep.slug === episodeSlug
                  ? 'bg-violet-500/20 border border-violet-500'
                  : 'bg-slate-800/50 hover:bg-slate-700/50'
              )}
            >
              <p className="text-sm text-violet-400">Ep. {ep.number}</p>
              <p className="text-white font-medium truncate text-sm mt-1">{ep.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
