import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '@/lib/api';
import { 
  Play, 
  Star, 
  Calendar, 
  Globe, 
  Film, 
  Users,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn, getContentTypeSlug, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP } from '@/lib/utils';

export default function ContentPage() {
  const { type, slug, seasonSlug } = useParams();
  const [content, setContent] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const contentRes = await publicApi.getContentBySlug(slug);
        setContent(contentRes.data);

        // Fetch seasons for series/anime
        if (['serie', 'miniserie', 'anime'].includes(contentRes.data.content_type)) {
          const seasonsRes = await publicApi.getContentSeasons(slug);
          setSeasons(seasonsRes.data);

          // Select season based on URL or first season
          if (seasonSlug) {
            const season = seasonsRes.data.find(s => s.slug === seasonSlug);
            setSelectedSeason(season || seasonsRes.data[0]);
          } else if (seasonsRes.data.length > 0) {
            setSelectedSeason(seasonsRes.data[0]);
          }
        }

        // Record view
        publicApi.recordView(contentRes.data.id);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [slug, seasonSlug]);

  // Fetch episodes when season changes
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedSeason || !content) return;

      try {
        const episodesRes = await publicApi.getSeasonEpisodes(slug, selectedSeason.slug);
        setEpisodes(episodesRes.data);
      } catch (error) {
        console.error('Error fetching episodes:', error);
      }
    };

    fetchEpisodes();
  }, [selectedSeason, slug, content]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Contenido no encontrado</h1>
          <p className="text-slate-400">El contenido que buscas no existe o no está disponible.</p>
          <Link to="/" className="btn-primary mt-4 inline-block">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const typeSlug = getContentTypeSlug(content.content_type);
  const isMovie = content.content_type === 'pelicula';

  return (
    <div data-testid="content-page">
      {/* Backdrop */}
      <div 
        className="relative h-[60vh] md:h-[70vh] bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${content.backdrop || content.poster || PLACEHOLDER_BACKDROP})` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-[#020617]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 via-transparent to-transparent" />
      </div>

      {/* Content Info */}
      <div className="relative z-10 -mt-48 md:-mt-64 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={content.poster || PLACEHOLDER_POSTER}
                alt={content.title}
                className="w-48 md:w-64 rounded-xl shadow-2xl mx-auto md:mx-0"
                data-testid="content-poster"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {content.is_trending && (
                  <span className="badge badge-violet">Tendencia</span>
                )}
                {content.is_popular && (
                  <span className="badge badge-violet">Popular</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" data-testid="content-title">
                {content.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-slate-300 mb-6">
                {content.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{content.rating.toFixed(1)}</span>
                  </div>
                )}
                {content.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{content.year}</span>
                  </div>
                )}
                {content.country && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{content.country}</span>
                  </div>
                )}
                {seasons.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Film className="w-4 h-4" />
                    <span>{seasons.length} temporada{seasons.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {content.genres && content.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {content.genres.map((genre, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-sm text-slate-300">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {content.synopsis && (
                <p className="text-slate-300 leading-relaxed mb-8 max-w-3xl" data-testid="content-synopsis">
                  {content.synopsis}
                </p>
              )}

              {/* Action Buttons for Movies */}
              {isMovie && content.servers && content.servers.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-8">
                  <Link 
                    to={`/${typeSlug}/${content.slug}/ver`}
                    className="btn-primary inline-flex items-center gap-2"
                    data-testid="watch-movie-btn"
                  >
                    <Play className="w-5 h-5" />
                    Ver película
                  </Link>
                </div>
              )}

              {/* Cast */}
              {content.cast && content.cast.length > 0 && (
                <div className="mb-8">
                  <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
                    <Users className="w-4 h-4" />
                    Reparto
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {content.cast.map((actor, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-sm text-slate-400">
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Production Info */}
              {(content.production_company || content.producer) && (
                <div className="text-sm text-slate-400">
                  {content.production_company && (
                    <p>Productora: <span className="text-slate-300">{content.production_company}</span></p>
                  )}
                  {content.producer && (
                    <p>Productor: <span className="text-slate-300">{content.producer}</span></p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seasons & Episodes */}
          {!isMovie && seasons.length > 0 && (
            <div className="mt-12">
              {/* Season Tabs */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {seasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => setSelectedSeason(season)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                      selectedSeason?.id === season.id
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    )}
                    data-testid={`season-tab-${season.number}`}
                  >
                    Temporada {season.number}
                  </button>
                ))}
              </div>

              {/* Episodes List */}
              <div className="space-y-3">
                {episodes.length > 0 ? (
                  episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      to={`/${typeSlug}/${slug}/temporada/${selectedSeason.slug}/episodio/${episode.slug}`}
                      className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl hover:bg-slate-800/50 transition-colors group"
                      data-testid={`episode-${episode.number}`}
                    >
                      {/* Episode Thumbnail */}
                      <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                        <img
                          src={episode.poster || content.poster || PLACEHOLDER_POSTER}
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Episode Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-violet-400 mb-1">
                          Episodio {episode.number}
                        </p>
                        <h4 className="text-white font-medium truncate group-hover:text-violet-300 transition-colors">
                          {episode.title}
                        </h4>
                        {episode.synopsis && (
                          <p className="text-slate-400 text-sm line-clamp-2 mt-1">
                            {episode.synopsis}
                          </p>
                        )}
                        {episode.duration && (
                          <p className="text-slate-500 text-xs mt-2">
                            {episode.duration} min
                          </p>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors flex-shrink-0" />
                    </Link>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No hay episodios disponibles para esta temporada.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Gallery */}
          {content.gallery && content.gallery.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-white mb-6">Galería</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {content.gallery.map((image, i) => (
                  <img
                    key={i}
                    src={image}
                    alt={`${content.title} - ${i + 1}`}
                    className="w-full aspect-video object-cover rounded-lg"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
